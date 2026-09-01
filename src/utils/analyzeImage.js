// Fallback only: used when the Vision API is unreachable, so the result screen
// never renders empty. Same photo always yields the same entry.
function imageHash(dataUrl) {
  let hash = 0
  const sample = dataUrl.slice(22, 222)
  for (let i = 0; i < sample.length; i++) {
    hash = (hash * 31 + sample.charCodeAt(i)) & 0x0fffffff
  }
  return hash
}

const MOOD_POOLS = {
  human: [
    { keywords: ['신뢰감', '차분함', '은근한 매력'],      hint: '차분하고 신뢰감 있는 첫인상' },
    { keywords: ['호감', '밝은 에너지', '친근함'],         hint: '밝고 긍정적인 에너지가 느껴지는 인상' },
    { keywords: ['도도함', '독립적', '미스터리'],           hint: '쉽게 다가오지 않는 듯한 분위기' },
    { keywords: ['따뜻함', '공감 능력', '포용력'],          hint: '다가가고 싶은 따뜻한 분위기' },
    { keywords: ['존재감', '자기 확신', '묵직한 카리스마'], hint: '말 없이도 눈길이 가는 존재감' },
    { keywords: ['감성', '독특한 분위기', '예술적 감각'],   hint: '뭔가 사연이 있어 보이는 분위기' },
  ],
  cat: [
    { keywords: ['도도함', '품위', '카리스마'],              hint: '왕족 같은 품위가 느껴지는 냥상' },
    { keywords: ['끈질김', '표현력', '귀여운 고집'],         hint: '원하는 게 분명한 귀여운 고집' },
    { keywords: ['눈빛', '존재감', '무언의 지배력'],         hint: '눈빛으로 다 말하는 강한 존재감' },
    { keywords: ['여유', '관조', '느긋한 카리스마'],         hint: '모든 걸 지켜보는 여유로운 냥상' },
    { keywords: ['예측불가', '폭발적 에너지', '자유로운 영혼'], hint: '언제 달릴지 모르는 자유로운 에너지' },
    { keywords: ['관찰력', '집착 아닌 관심', '충성심'],     hint: '집사를 철저히 감시하는 충성스러운 냥상' },
  ],
  dog: [
    { keywords: ['친화력', '사교성', '밝은 에너지'],        hint: '누구에게나 먼저 달려가는 밝은 에너지' },
    { keywords: ['열정', '긍정 에너지', '추진력'],           hint: '세상 모든 것이 신나는 폭발적인 에너지' },
    { keywords: ['집중력', '충성심', '솔직한 욕망'],         hint: '원하는 게 있을 때 눈에 불꽃이 튀는 집중력' },
    { keywords: ['애교', '사랑스러움', '눈빛 공격'],         hint: '눈 한 번으로 마음을 녹이는 애교' },
    { keywords: ['경계심', '충성심', '책임감'],              hint: '가족을 지키는 진지한 책임감' },
    { keywords: ['순수함', '밝음', '무한 긍정'],             hint: '세상 모든 것이 좋아 보이는 해맑은 에너지' },
  ],
}

const SPECIES_KO = { human: '사람', cat: '고양이', dog: '강아지' }

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const MODEL = 'gpt-4o-mini'
const TIMEOUT_MS = 20000

function buildPrompt(species, pool) {
  const target = SPECIES_KO[species] ?? '사람'
  const options = pool.map((e, i) => `${i}: ${e.hint}`).join('\n')
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
    '  "index": 0~5                  // 보기 중 사진의 인상과 가장 가까운 번호',
    '}',
    '',
    `observed에는 사진이 없다고 쓰지 말고, 화면에 실제로 보이는 것을 적어라.`,
    `${target}이(가) 없으면 found를 false로 하고 observed에는 대신 무엇이 보이는지 적어라.`,
    '(예: "회색 배경만 있고 아무것도 없음", "키보드와 책상만 보임")',
  ].join('\n')
}

async function askVision(species, dataUrl, pool) {
  if (!API_KEY) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        response_format: { type: 'json_object' },
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: buildPrompt(species, pool) },
            { type: 'image_url', image_url: { url: dataUrl, detail: 'low' } },
          ],
        }],
      }),
    })
    if (!res.ok) {
      console.error('[vision] HTTP', res.status, (await res.text()).slice(0, 200))
      return null
    }
    const json = await res.json()
    const parsed = JSON.parse(json.choices[0].message.content)
    const index = Number.isInteger(parsed.index) ? parsed.index : 0
    return {
      found: parsed.found !== false,
      observed: String(parsed.observed ?? '').trim(),
      index: ((index % pool.length) + pool.length) % pool.length,
    }
  } catch (err) {
    console.error('[vision] 실패:', err?.message ?? err)
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function generateAnalysisSummary(species = 'human', dataUrl = '') {
  const pool = MOOD_POOLS[species] ?? MOOD_POOLS.human
  const vision = await askVision(species, dataUrl, pool)

  if (vision) {
    const entry = pool[vision.index]
    return {
      species,
      moodKeywords: entry.keywords,
      visualHint: vision.observed || entry.hint,
      _index: vision.index,
      found: vision.found,
      analyzed: true,
    }
  }

  const index = imageHash(dataUrl) % pool.length
  const entry = pool[index]
  return {
    species,
    moodKeywords: entry.keywords,
    visualHint: entry.hint,
    _index: index,
    found: true,
    analyzed: false,
  }
}
