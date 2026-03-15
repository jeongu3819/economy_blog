import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import scrapeRouter from './routes/scrape.js'
import analyzeRouter from './routes/analyze.js'
import publishRouter from './routes/publish.js'
import { addClient, broadcast } from './utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env from project root
dotenv.config({ path: join(__dirname, '..', '.env') })

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// SSE Endpoint for real-time logs
app.get('/api/logs', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  // Send initial connection message
  const data = JSON.stringify({ message: '로그 스트림 연결됨', type: 'system' })
  res.write(`data: ${data}\n\n`)

  addClient(res)
})

// Environment status check
app.get('/api/env-status', (req, res) => {
  res.json({
    naver: !!(process.env.NAVER_ID && process.env.NAVER_PW),
    tistory: !!(process.env.TISTORY_ID && process.env.TISTORY_PW),
  })
})

// API Routes
app.use('/api/scrape', scrapeRouter)
app.use('/api/analyze', analyzeRouter)
app.use('/api/publish', publishRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log('')
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║       🚀 StockBlog AI Server is Running!        ║')
  console.log('╠══════════════════════════════════════════════════╣')
  console.log(`║  Local:     http://localhost:${PORT}                ║`)
  console.log('║  API Docs:  /api/health                         ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log('')
  console.log('Environment Status:')
  console.log(`  Naver:   ${process.env.NAVER_ID ? '✅ configured' : '❌ not set'}`)
  console.log(`  Tistory: ${process.env.TISTORY_ID ? '✅ configured' : '❌ not set'}`)
  console.log('')
})
