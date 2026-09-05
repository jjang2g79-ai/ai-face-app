import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// 폰에 설치되게 하는 서비스워커. 개발 중에는 캐시가 헷갈리므로 프로덕션에서만.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[sw] 등록 실패:', err?.message ?? err)
    })
  })
}
