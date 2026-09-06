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
    `  "index": 0~${hints.length - 1},                 // 보기 중 사진의 인상과 가장 가까운 번호`,
    '  "card": {                     // 사진을 보고 직접 쓴 결과. found가 false면 null',
    '    "brandType": "<6~10자 별명>",',
    '    "title": "<인상을 한 문장으로. 25자 내외>",',
    '    "keywords": ["<3~5자>", "<3~5자>", "<3~5자>"],',
    '    "description": "<두 문장. 70자 내외>",',
    '    "score": <80~97 사이 정수. 인상에 따라 다르게>,',
    '    "insights": [',
    '      "<처음 보는 사람에게 어떻게 보이는지. 40자 내외>",',
    '      "<가까워지면 달리 보이는 점. 40자 내외>",',
    '      "<조심하면 좋은 점. 반드시 아쉬운 쪽 이야기. 40자 내외>"',
    '    ]',
    '  }',
    '}',
    '',
    'card 를 쓸 때 지킬 것:',
    '- 재미로 보는 인상 이야기다. 따뜻하고 가볍게 쓴다.',
    '- **외모를 품평하지 마라.** 이목구비·체형·피부·나이·인종·성별을 말하지 마라.',
    '- 분위기와 표정에서 받은 느낌만 쓴다. 사실을 단정하지 말고 "~해 보여요" 처럼 쓴다.',
    '- 건강·성격·능력을 진단하지 마라.',
    `- ${target}이(가) 여럿이어도 **subject 한 명만** 두고 쓴다. "두 사람은" 처럼 쓰지 마라.`,
    '- brandType 은 흔한 말 대신 이 사진에서만 나올 만한 별명으로 짓는다.',
    '- 위 예시 형식의 <> 안은 설명이다. 그 말을 그대로 옮겨 쓰지 마라.',
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

const POSITIONS = ['왼쪽', '오른쪽', '가운데', '가운데쪽', '앞쪽', '뒤쪽', '위쪽', '아래쪽']

// 위치를 문장으로 지시해도 모델은 두 명뿐인 사진에 "가운데"라고 답하곤 한다.
// 틀린 위치를 알려주느니 위치를 빼는 편이 낫다 — 화면은 "그중 한 명"으로 받는다.
function cleanSubject(value, count) {
  if (!(count > 1)) return ''
  const raw = String(value ?? '').trim().slice(0, 20)
  const hit = POSITIONS.find((p) => raw.includes(p))
  if (!hit) return ''
  if (count === 2 && hit.startsWith('가운데')) return ''
  return hit
}

// 모델이 쓴 결과 카드를 검사한다. 한 군데라도 어긋나면 통째로 버린다 —
// 반쯤 비어 있는 카드를 화면에 올리느니 준비된 카드를 쓰고 그렇다고 밝히는 편이 낫다.
function str(v, max) {
  const s = String(v ?? '').trim().replace(/\s+/g, ' ')
  return s.length > 0 && s.length <= max ? s : null
}

function cleanCard(raw) {
  if (!raw || typeof raw !== 'object') return null
  const brandType = str(raw.brandType, 14)
  const title = str(raw.title, 40)
  const description = str(raw.description, 120)
  const score = Number.isFinite(raw.score) ? Math.round(raw.score) : null
  const keywords = Array.isArray(raw.keywords)
    ? raw.keywords.map((k) => str(k, 10)).filter(Boolean)
    : []
  const insights = Array.isArray(raw.insights)
    ? raw.insights.map((t) => str(t, 70)).filter(Boolean)
    : []
  if (!brandType || !title || !description || score === null) return null
  if (keywords.length !== 3 || insights.length !== 3) return null
  return {
    brandType,
    title,
    description,
    keywords,
    insights,
    score: Math.max(80, Math.min(97, score)),
  }
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
        max_tokens: 900,
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
        subject: cleanSubject(parsed.subject, count),
        index: ((raw % hints.length) + hints.length) % hints.length,
        card: parsed.found === false ? null : cleanCard(parsed.card),
      },
    }
  } catch (err) {
    console.error('[analyze] 실패:', err?.message ?? err)
    return { status: 504, json: { error: 'timeout_or_network' } }
  } finally {
    clearTimeout(timer)
  }
}
