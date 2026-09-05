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

  // 폰 사진은 원본이 3~8MB라 그대로 보내면 서버가 거절한다.
  // 분석은 저해상도로 하므로 긴 변 1024px, JPEG 로 줄여서 보낸다 (보통 100~200KB).
  const MAX_SIDE = 1024

  function shrink(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('파일을 읽지 못했습니다'))
      reader.onload = (ev) => {
        const img = new Image()
        img.onerror = () => reject(new Error('이미지를 열지 못했습니다'))
        img.onload = () => {
          const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
          const w = Math.round(img.width * scale)
          const h = Math.round(img.height * scale)
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          canvas.getContext('2d').drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.src = ev.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      setPreview(await shrink(file))
    } catch (err) {
      console.error('[upload]', err?.message ?? err)
      alert('사진을 불러오지 못했어요. 다른 사진으로 해보세요.')
    }
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
