import { useRef, useState } from 'react'

const SPECIES_OPTIONS = [
  { value: 'human', emoji: '🧑', label: '사람' },
  { value: 'cat',   emoji: '🐱', label: '고양이' },
  { value: 'dog',   emoji: '🐶', label: '강아지' },
]

const GUIDE_TEXT = {
  human: '정면 얼굴 사진을 올리면 더 자연스러운 결과가 나와요',
  cat: '고양이 얼굴이 잘 보이는 사진을 올려주세요',
  dog: '강아지 얼굴이 잘 보이는 사진을 올려주세요',
}

export default function UploadScreen({ onAnalyze }) {
  const [preview, setPreview] = useState(null)
  const [species, setSpecies] = useState('human')
  const inputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-6 pt-14 pb-10 bg-slate-900">
      <h2 className="text-2xl font-bold text-white mb-6">사진 업로드</h2>

      {/* Species selector */}
      <div className="flex gap-2 mb-6">
        {SPECIES_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSpecies(opt.value)}
            className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
              species === opt.value
                ? 'bg-violet-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            <span className="text-xl">{opt.emoji}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <p className="text-slate-400 text-sm text-center mb-8">{GUIDE_TEXT[species]}</p>

      <button
        onClick={() => inputRef.current.click()}
        className="w-48 h-48 rounded-full border-2 border-dashed border-slate-600 flex flex-col items-center justify-center text-slate-400 hover:border-violet-500 hover:text-violet-400 transition-colors overflow-hidden mb-8"
      >
        {preview ? (
          <img src={preview} alt="미리보기" className="w-full h-full object-cover" />
        ) : (
          <>
            <span className="text-4xl mb-2">📷</span>
            <span className="text-sm">사진 선택</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        onClick={() => preview && onAnalyze(preview, species)}
        disabled={!preview}
        className="w-full max-w-xs h-14 bg-violet-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-lg font-semibold rounded-2xl transition-colors"
      >
        분석 시작
      </button>
    </div>
  )
}
