export default function LandingScreen({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-slate-900">
      <div className="mb-10">
        <div className="text-5xl mb-6">✨</div>
        <h1 className="text-3xl font-bold text-white leading-tight mb-4">
          AI가 보는<br />내 첫인상
        </h1>
        <p className="text-slate-400 text-base leading-relaxed">
          사진 한 장으로 나의 분위기를<br />분석해보세요
        </p>
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-xs h-14 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white text-lg font-semibold rounded-2xl transition-colors"
      >
        지금 분석하기
      </button>

      <p className="mt-6 text-slate-500 text-sm">
        계정 불필요 · 결과는 3초 안에
      </p>
    </div>
  )
}
