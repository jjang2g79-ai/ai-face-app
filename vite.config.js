import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { analyze } from './api/_core.js'

// 개발 서버에서도 /api/analyze 가 돌게 한다.
// 배포(Vercel)에서는 api/analyze.js 가 같은 _core.js 를 쓴다 — 로직이 한 곳에만 있다.
function apiProxy(env) {
  return {
    name: 'analyze-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/analyze', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'method_not_allowed' }))
        }
        const chunks = []
        for await (const c of req) chunks.push(c)
        let body = {}
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        } catch {
          res.statusCode = 400
          return res.end(JSON.stringify({ error: 'bad_json' }))
        }
        const { status, json } = await analyze({
          body,
          ip: req.socket?.remoteAddress ?? 'local',
          apiKey: env.OPENAI_API_KEY ?? process.env.OPENAI_API_KEY,
        })
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(json))
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // VITE_ 없는 변수까지 읽되, 서버 쪽에서만 쓴다
  const env = loadEnv(mode, process.cwd(), '')
  return { plugins: [react(), apiProxy(env)] }
})
