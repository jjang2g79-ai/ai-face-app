import { useRef, useState } from 'react'
import ResultCard from './ResultCard'
import { saveAsImage } from '../utils/saveAsImage'

export default function ResultScreen({ photo, result, analysisSummary, onRestart }) {
  const cardRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSave() {
    if (!cardRef.current) return
    setSaving(true)
    await saveAsImage(cardRef.current)
    setSaving(false)
  }

  function handleShare() {
    navigator.clipboard.writeText('AI가 보는 내 첫인상 테스트 해봤어요!')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 pt-10 pb-10 bg-slate-900">
      <h2 className="text-white text-xl font-bold mb-6">내 첫인상 결과</h2>

      <ResultCard photo={photo} result={result} analysisSummary={analysisSummary} cardRef={cardRef} />

      <div className="w-full max-w-sm mt-6 space-y-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-base font-semibold rounded-2xl transition-colors"
        >
          {saving ? '저장 중…' : '이미지로 저장하기'}
        </button>

        <div className="flex gap-3">
          <button
            onClick={onRestart}
            className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-2xl transition-colors"
          >
            다시 분석하기
          </button>
          <button
            onClick={handleShare}
            className="flex-1 h-12 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-2xl transition-colors"
          >
            {copied ? '복사됨 ✓' : '친구에게 공유하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
