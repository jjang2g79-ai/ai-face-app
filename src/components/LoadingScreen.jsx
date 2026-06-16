import { useEffect, useState } from 'react'

const MESSAGES = {
  human: [
    '인상을 분석하고 있어요…',
    '첫인상 키워드를 찾는 중이에요…',
    '결과 카드를 만들고 있어요…',
  ],
  cat: [
    '냥상을 분석하고 있어요…',
    '냥이의 개성을 찾는 중이에요…',
    '냥상 카드를 만들고 있어요…',
  ],
  dog: [
    '멍상을 분석하고 있어요…',
    '댕이의 특징을 찾는 중이에요…',
    '멍상 카드를 만들고 있어요…',
  ],
}

export default function LoadingScreen({ photo, species = 'human', onDone }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const messages = MESSAGES[species] ?? MESSAGES.human

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length)
    }, 650)

    const timer = setTimeout(() => {
      clearInterval(interval)
      onDone()
    }, 2200)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [onDone, messages.length])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-slate-900">
      <div className="relative mb-10">
        <img
          src={photo}
          alt="분석 중"
          className="w-40 h-40 rounded-full object-cover"
        />
        <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>

      <p className="text-violet-300 text-base font-medium text-center min-h-[28px]">
        {messages[msgIndex]}
      </p>
    </div>
  )
}
