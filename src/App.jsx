import { useState } from 'react'
import LandingScreen from './components/LandingScreen'
import UploadScreen from './components/UploadScreen'
import LoadingScreen from './components/LoadingScreen'
import ResultScreen from './components/ResultScreen'
import NotFoundScreen from './components/NotFoundScreen'
import { getResultBySpeciesIndex } from './data/mockResults'
import { generateAnalysisSummary } from './utils/analyzeImage'

// insight 의 제목은 화면 구조라 고정이고, 내용만 Vision 이 쓴다
const INSIGHT_LABELS = {
  human: ['사람들이 보는 나', '가까워지면 보이는 나', '조심하면 좋은 점'],
  cat: ['집사에게 보이는 모습', '혼자 있을 때 보이는 모습', '이럴 때 조심'],
  dog: ['보호자에게 보이는 모습', '놀 때 보이는 모습', '이럴 때 조심'],
}

// Vision 이 결과를 써 보냈으면 그걸 쓰고, 아니면 준비된 카드로 물러난다.
// 어느 쪽이었는지는 analysisSummary.source 에 남아 결과 화면이 그대로 밝힌다.
function buildResult(species, summary) {
  const card = summary.card
  if (!card) return getResultBySpeciesIndex(species, summary._index)

  const labels = INSIGHT_LABELS[species] ?? INSIGHT_LABELS.human
  return {
    species,
    brandType: card.brandType,
    title: card.title,
    description: card.description,
    keywords: card.keywords,
    score: card.score,
    insights: card.insights.map((text, i) => ({ label: labels[i], text })),
  }
}

const SCREENS = {
  LANDING: 'landing',
  UPLOAD: 'upload',
  LOADING: 'loading',
  RESULT: 'result',
  NOT_FOUND: 'notFound',
}

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LANDING)
  const [photo, setPhoto] = useState(null)
  const [species, setSpecies] = useState('human')
  const [result, setResult] = useState(null)
  const [analysisSummary, setAnalysisSummary] = useState(null)

  function handleAnalyze(dataUrl, selectedSpecies = 'human') {
    setPhoto(dataUrl)
    setSpecies(selectedSpecies)
    setScreen(SCREENS.LOADING)
  }

  async function handleLoadingDone() {
    const summary = await generateAnalysisSummary(species, photo)
    setAnalysisSummary(summary)

    if (summary.found === false) {
      setScreen(SCREENS.NOT_FOUND)
      return
    }

    setResult(buildResult(species, summary))
    setScreen(SCREENS.RESULT)
  }

  function handleRestart() {
    setPhoto(null)
    setResult(null)
    setAnalysisSummary(null)
    setSpecies('human')
    setScreen(SCREENS.LANDING)
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen">
      {screen === SCREENS.LANDING && (
        <LandingScreen onStart={() => setScreen(SCREENS.UPLOAD)} />
      )}
      {screen === SCREENS.UPLOAD && (
        <UploadScreen onAnalyze={handleAnalyze} />
      )}
      {screen === SCREENS.LOADING && (
        <LoadingScreen photo={photo} species={species} onDone={handleLoadingDone} />
      )}
      {screen === SCREENS.NOT_FOUND && (
        <NotFoundScreen
          photo={photo}
          species={species}
          observed={analysisSummary?.visualHint}
          failed={analysisSummary?.failed}
          onRetry={() => setScreen(SCREENS.UPLOAD)}
          onRestart={handleRestart}
        />
      )}
      {screen === SCREENS.RESULT && (
        <ResultScreen
          photo={photo}
          result={result}
          analysisSummary={analysisSummary}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
