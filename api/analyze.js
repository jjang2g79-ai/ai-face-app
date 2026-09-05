// Vercel 서버리스 함수. 실제 로직은 _core.js 에 있다.
// 환경변수 이름은 OPENAI_API_KEY — VITE_ 접두사가 없어야 번들에 안 들어간다.
import { analyze } from './_core.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed' })
  }
  const ip =
    (req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() ||
    req.socket?.remoteAddress ||
    'unknown'

  const { status, json } = await analyze({
    body: req.body,
    ip,
    apiKey: process.env.OPENAI_API_KEY,
  })
  res.status(status).json(json)
}
