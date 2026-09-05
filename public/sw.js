// 최소한의 서비스워커.
// 목적은 오프라인 캐싱보다 "폰에 설치되게 하는 것"과, 껍데기를 캐시해서 두 번째 실행을 빠르게 하는 것.
//
// 분석 요청(/api/analyze)은 절대 캐시하지 않는다. 매번 서버로 가야 한다.

const VERSION = 'v1'
const SHELL = `shell-${VERSION}`
const SHELL_FILES = ['/', '/index.html', '/manifest.webmanifest', '/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // GET 이 아니거나 우리 API면 손대지 않는다
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) return
  if (url.origin !== self.location.origin) return

  // 화면 이동은 네트워크 우선, 끊기면 캐시된 껍데기
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL).then((c) => c.put('/index.html', copy))
          return res
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // 정적 파일(해시가 붙어 있어 바뀌면 이름도 바뀐다)은 캐시 우선
  event.respondWith(
    caches.match(request).then((hit) => {
      if (hit) return hit
      return fetch(request).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone()
          caches.open(SHELL).then((c) => c.put(request, copy))
        }
        return res
      })
    })
  )
})
