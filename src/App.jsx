import { useState } from 'react'
import LandingScreen from './components/LandingScreen'
import UploadScreen from './components/UploadScreen'
import LoadingScreen from './components/LoadingScreen'
import ResultScreen from './components/ResultScreen'
import { getResultBySpeciesIndex } from './data/mockResults'
import { generateAnalysisSummary } from './utils/analyzeImage'

const SCREENS = {
  LANDING: 'landing',
  UPLOAD: 'upload',
  LOADING: 'loading',
  RESULT: 'result',
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

  function handleLoadingDone() {
    const summary = generateAnalysisSummary(species, photo)
    const picked = getResultBySpeciesIndex(species, summary._index)
    setAnalysisSummary(summary)
    setResult(picked)
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
