import { useState } from 'react'
import LandingScreen from './components/LandingScreen'
import UploadScreen from './components/UploadScreen'
import LoadingScreen from './components/LoadingScreen'
import ResultScreen from './components/ResultScreen'
import NotFoundScreen from './components/NotFoundScreen'
import { getResultBySpeciesIndex } from './data/mockResults'
import { generateAnalysisSummary } from './utils/analyzeImage'

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

    setResult(getResultBySpeciesIndex(species, summary._index))
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
