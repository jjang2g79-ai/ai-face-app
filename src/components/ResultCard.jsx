import { useMemo } from 'react'

const SPECIES_LABEL = {
  human: 'AI 인상 테스트 결과',
  cat: 'AI 냥상 테스트 결과',
  dog: 'AI 멍상 테스트 결과',
}

const SCORE_LABEL = {
  human: '인상 매력도',
  cat: '냥상 매력도',
  dog: '멍상 매력도',
}

const FALLBACK_HINTS = {
  human: '인상에서 특별한 분위기가 느껴져요',
  cat: '독특한 매력이 느껴지는 냥상',
  dog: '밝고 친근한 에너지가 느껴지는 멍상',
}

const SUBJECT_UNIT = { human: ['명', '이'], cat: ['마리', '가'], dog: ['마리', '가'] }
const SUBJECT_NOUN = { human: '사람', cat: '고양이', dog: '강아지' }

// 여럿이 찍힌 사진은 그중 하나만 본다. 예전에는 그 사실을 맨 아래 회색 글씨로만
// 적어두고 한 명짜리 사진에도 똑같이 띄웠다 — 아무도 읽지 않았고, 누구 결과인지도 몰랐다.
function multiNotice(species, count, subject) {
  if (!(count > 1)) return null
  const [unit, particle] = SUBJECT_UNIT[species] ?? SUBJECT_UNIT.human
  const noun = SUBJECT_NOUN[species] ?? SUBJECT_NOUN.human
  const who = subject ? `${subject} ${noun}` : `그중 한 ${unit}`
  return `이 사진에는 ${count}${unit}${particle} 있어요. ${who} 기준으로 봤습니다.`
}

// Deterministic hash from a string — same input always yields same number
function strHash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffff
  return h
}

function pickFrom(pool, seed) {
  return pool[seed % pool.length]
}

export default function ResultCard({ photo, result, analysisSummary, cardRef }) {
  const species = result.species ?? 'human'
  const brandType = result.brandType ?? result.title
  const label = SPECIES_LABEL[species] ?? SPECIES_LABEL.human
  const scoreLabel = SCORE_LABEL[species] ?? '매력도'
  const barWidth = `${result.score}%`
  const showMbti = species === 'human' && result.mbtiCompare
  const notice = multiNotice(species, analysisSummary?.count, analysisSummary?.subject)

  // All derived text computed once per result — stable for save/share/PNG
  const { displayDescription, visualHint } = useMemo(() => {
    // Combine brandType hash with image-hash index for variety across uploads
    const typeSeed = strHash(result.brandType ?? '')
    const imgSeed = analysisSummary?._index ?? 0
    const seed = (typeSeed ^ (imgSeed * 7919)) & 0xffff

    // ── Description ──────────────────────────────────────────
    const prefix =
      species === 'cat' ? '이 냥상은요…' :
      species === 'dog' ? '이 멍상은요…' : null

    let desc = result.description ?? ''
    if (
      prefix &&
      result.vibePool?.length &&
      result.personalityPool?.length &&
      result.charmPool?.length
    ) {
      const vibe        = pickFrom(result.vibePool,        seed)
      const personality = pickFrom(result.personalityPool, (seed >> 4) + 1)
      const charm       = pickFrom(result.charmPool,       (seed >> 8) + 2)
      desc = `${prefix}\n${vibe}\n\n${personality}\n${charm}`
    }

    // ── "AI가 본 첫 느낌" ────────────────────────────────────
    // A real observation from the Vision API always wins over the canned pool
    let hint
    if (analysisSummary?.analyzed && analysisSummary.visualHint) {
      hint = analysisSummary.visualHint
    } else if (species !== 'human' && result.analysisPool?.length) {
      hint = pickFrom(result.analysisPool, (seed >> 2))
    } else {
      hint = analysisSummary?.visualHint ?? FALLBACK_HINTS[species] ?? FALLBACK_HINTS.human
    }

    return { displayDescription: desc, visualHint: hint }
  }, [
    result.brandType,
    result.vibePool,
    result.personalityPool,
    result.charmPool,
    result.analysisPool,
    result.description,
    analysisSummary?._index,
    analysisSummary?.visualHint,
    analysisSummary?.analyzed,
    species,
  ])

  return (
    <div
      ref={cardRef}
      className="w-full max-w-sm mx-auto bg-slate-800 rounded-3xl overflow-hidden"
    >
      {/* Photo + small label */}
      <div className="flex flex-col items-center pt-8 pb-4 bg-gradient-to-b from-slate-700 to-slate-800">
        <img
          src={photo}
          alt="분석 사진"
          className="w-28 h-28 rounded-full object-cover border-4 border-violet-500 mb-4"
          crossOrigin="anonymous"
        />
        <span className="text-violet-400 text-xs font-semibold tracking-widest uppercase">
          {label}
        </span>
      </div>

      {/* Brand type — hero */}
      <div className="text-center px-6 pt-4 pb-1">
        <div className="inline-block bg-violet-600/20 border border-violet-500/40 rounded-2xl px-5 py-2 mb-3">
          <span className="text-violet-200 text-3xl font-extrabold tracking-tight">
            {brandType}
          </span>
        </div>
        <h2 className="text-slate-300 text-base font-semibold leading-snug">
          "{result.title}"
        </h2>
        {/* AI 첫 느낌 — immediately below punch line */}
        <p className="text-slate-500 text-xs mt-2">
          AI가 본 첫 느낌: <span className="text-violet-400">{visualHint}</span>
        </p>
        {notice && (
          <p className="mt-3 bg-amber-500/15 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 text-xs leading-relaxed">
            {notice}
          </p>
        )}
      </div>

      {/* Description — pool-assembled for cat/dog, fallback for human */}
      <div className="mx-5 my-4 border-l-4 border-violet-500 bg-slate-700/60 rounded-r-2xl pl-4 pr-5 py-4">
        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
          {displayDescription}
        </p>
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap justify-center gap-2 px-5 mb-4">
        {result.keywords.map((kw) => (
          <span
            key={kw}
            className="bg-violet-600/30 text-violet-300 text-xs font-medium px-3 py-1 rounded-full"
          >
            # {kw}
          </span>
        ))}
      </div>

      {/* Score */}
      <div className="mx-5 mb-2 bg-slate-700 rounded-2xl px-5 py-4">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-slate-400 text-xs">{scoreLabel}</span>
          <span className="text-violet-300 text-lg font-bold">{result.score}점</span>
        </div>
        <div className="w-full h-2 bg-slate-600 rounded-full overflow-hidden">
          <div className="h-full bg-violet-500 rounded-full" style={{ width: barWidth }} />
        </div>
      </div>

      {/* MBTI comparison — human only, secondary */}
      {showMbti && (
        <p className="text-center text-slate-500 text-xs px-6 pt-2 pb-3 leading-relaxed">
          {result.mbtiCompare.text}
        </p>
      )}

      {/* Insights */}
      <div className="mx-5 mb-5 space-y-2" style={{ marginTop: showMbti ? 0 : '0.5rem' }}>
        {result.insights.map((item, i) => (
          <InsightCard key={i} label={item.label} text={item.text} index={i} />
        ))}
      </div>

      {/* Footer */}
      <div className="text-center px-5 pb-6 space-y-1">
        <p className="text-slate-400 text-xs">
          재미로 보는 AI 분석 테스트 · 저장해서 친구에게 보여줘도 좋아요
        </p>
        <p className="text-slate-600 text-xs">※ 재미로 보는 AI 분석 결과입니다.</p>
      </div>
    </div>
  )
}

const insightColors = [
  { border: 'border-emerald-500', label: 'text-emerald-400' },
  { border: 'border-sky-500',     label: 'text-sky-400' },
  { border: 'border-amber-500',   label: 'text-amber-400' },
]

function InsightCard({ label, text, index }) {
  const color = insightColors[index] ?? insightColors[0]
  return (
    <div className={`bg-slate-700/60 rounded-2xl px-4 py-3 border-t-2 ${color.border}`}>
      <p className={`text-xs font-semibold mb-1 ${color.label}`}>{label}</p>
      <p className="text-slate-300 text-sm leading-snug whitespace-pre-line">{text}</p>
    </div>
  )
}
