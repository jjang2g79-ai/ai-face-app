// 관상 분석 프록시의 알맹이. 프레임워크에 안 묶이도록 순수 함수로 두고,
// Vercel(api/analyze.js)과 로컬 개발 서버(vite.config.js)가 각각 얇게 감싼다.
//
// 키는 여기서만 읽는다. 브라우저 번들에는 들어가지 않는다.

const MODEL = 'gpt-4o-mini'
const TIMEOUT_MS = 20000
const MAX_DATAURL = 4 * 1024 * 1024 // 4MB — 서버리스 본문 한도 안쪽
const MAX_HINTS = 12

const SPECIES_KO = { human: '사람', cat: '고양이', dog: '강아지' }

// 인스턴스 단위 호출 제한. 완벽하진 않지만 방치된 데모가 털리는 건 막는다.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 20
const hits = new Map()

function rateLimited(ip) {
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 500) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k)
  }
  return list.length > MAX_PER_WINDOW
}

function buildPrompt(species, hints) {
  const target = SPECIES_KO[species] ?? '사람'
  const options = hints.map((h, i) => `${i}: ${h}`).join('\n')
  return [
    `이 사진을 보고 아래를 판단해줘. 사용자는 "${target}"의 관상을 요청했다.`,
    '',
    '보기:',
    options,
    '',
    '다음 JSON만 출력해라. 설명 금지.',
    '{',
    `  "found": true/false,          // 사진에 ${target}이(가) 실제로 있으면 true`,
    '  "observed": "사진에 보이는 것을 한국어 한 문장으로. 20자 내외",',
    `  "count": 1,                   // 사진에 보이는 ${target}의 수. 없으면 0`,
    '  "subject": "",                // count가 2 이상일 때, 관상을 판단한 대상의 위치를 한국어로',
    `  "index": 0~${hints.length - 1}                  // 보기 중 사진의 인상과 가장 가까운 번호`,
    '}',
    '',
    `${target}이(가) 여럿이면 가장 크게·정면으로 나온 하나를 골라 index를 매기고,`,
    'subject에는 그게 누구인지 사진에서 실제로 보이는 위치를 적어라.',
    '둘이면 "왼쪽"이나 "오른쪽", 셋 이상일 때만 "가운데"를 쓸 수 있다.',
    'count가 1이면 subject는 빈 문자열로 둔다.',
    '',
    'observed에는 사진이 없다고 쓰지 말고, 화면에 실제로 보이는 것을 적어라.',
    `${target}이(가) 없으면 found를 false로 하고 observed에는 대신 무엇이 보이는지 적어라.`,
    '(예: "회색 배경만 있고 아무것도 없음", "키보드와 책상만 보임")',
  ].join('\n')
}

/**
 * @param {{ body: any, ip: string, apiKey: string|undefined }} input
 * @returns {Promise<{ status: number, json: object }>}
 */
export async function analyze({ body, ip, apiKey }) {
  if (!apiKey) return { status: 500, json: { error: 'server_key_missing' } }
  if (rateLimited(ip)) return { status: 429, json: { error: 'too_many_requests' } }

  const { species = 'human', dataUrl = '', hints = [] } = body ?? {}

  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return { status: 400, json: { error: 'bad_image' } }
  }
  if (dataUrl.length > MAX_DATAURL) {
    return { status: 413, json: { error: 'image_too_large' } }
  }
  if (!Array.isArray(hints) || hints.length === 0 || hints.length > MAX_HINTS) {
    return { status: 400, json: { error: 'bad_hints' } }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: buildPrompt(species, hints.map(String)) },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
          ],
        }],
      }),
    })
    if (!res.ok) {
      // 상세 사유는 서버 로그에만. 브라우저로는 상태만 보낸다.
      console.error('[analyze] upstream', res.status, (await res.text()).slice(0, 200))
      return { status: 502, json: { error: 'upstream_failed' } }
    }
    const json = await res.json()
    const parsed = JSON.parse(json.choices[0].message.content)
    const raw = Number.isInteger(parsed.index) ? parsed.index : 0
    const count = Number.isInteger(parsed.count) ? Math.max(0, Math.min(parsed.count, 20)) : 1
    return {
      status: 200,
      json: {
        found: parsed.found !== false,
        observed: String(parsed.observed ?? '').trim().slice(0, 60),
        count,
        subject: count > 1 ? String(parsed.subject ?? '').trim().slice(0, 20) : '',
        index: ((raw % hints.length) + hints.length) % hints.length,
      },
    }
  } catch (err) {
    console.error('[analyze] 실패:', err?.message ?? err)
    return { status: 504, json: { error: 'timeout_or_network' } }
  } finally {
    clearTimeout(timer)
  }
}
