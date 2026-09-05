const SPECIES_LABEL = { human: '사람을', cat: '고양이를', dog: '강아지를' }

export default function NotFoundScreen({ photo, species, observed, failed, onRetry, onRestart }) {
  const label = SPECIES_LABEL[species] ?? '사람을'

  return (
    <div className="flex flex-col items-center min-h-screen px-6 pt-16 pb-10 bg-slate-900">
      <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-slate-700 mb-8 grayscale opacity-60">
        {photo && <img src={photo} alt="" className="w-full h-full object-cover" />}
      </div>

      <h2 className="text-2xl font-bold text-white text-center mb-3">
        {failed ? '분석을 못 했어요' : `${label} 못 찾았어요`}
      </h2>
      <p className="text-slate-400 text-sm text-center mb-6">
        {failed
          ? '연결이 불안정하거나 사진이 너무 큰 것 같아요. 다시 해볼까요?'
          : '이 사진으로는 관상을 볼 수 없어요'}
      </p>

      {observed && (
        <div className="w-full max-w-xs bg-slate-800 rounded-2xl px-5 py-4 mb-10">
          <p className="text-slate-500 text-xs mb-1">AI가 본 것</p>
          <p className="text-violet-300 text-base leading-relaxed">{observed}</p>
        </div>
      )}

      <button
        onClick={onRetry}
        className="w-full max-w-xs h-14 bg-violet-600 hover:bg-violet-500 text-white text-lg font-semibold rounded-2xl transition-colors mb-3"
      >
        다른 사진으로
      </button>
      <button
        onClick={onRestart}
        className="w-full max-w-xs h-12 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors"
      >
        처음으로
      </button>
    </div>
  )
}
