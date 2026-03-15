import { useState, useEffect, useRef, useCallback } from 'react'
import TickerInput from './components/TickerInput'
import ProgressStepper from './components/ProgressStepper'
import BlogPreview from './components/BlogPreview'
import ControlPanel from './components/ControlPanel'
import LogViewer from './components/LogViewer'
import './App.css'

const STEPS = ['데이터 수집', 'AI 분석', '원고 생성', '발행 준비']

function App() {
  const [ticker, setTicker] = useState('')
  const [currentStep, setCurrentStep] = useState(-1)
  const [stepStatus, setStepStatus] = useState({}) // { 0: 'done', 1: 'loading', 2: 'idle' ... }
  const [content, setContent] = useState('')
  const [logs, setLogs] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [envStatus, setEnvStatus] = useState(null)
  const eventSourceRef = useRef(null)

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('ko-KR', { hour12: false })
    setLogs(prev => [...prev, { timestamp, message, type }])
  }, [])

  // SSE log connection
  useEffect(() => {
    const es = new EventSource('/api/logs')
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        addLog(data.message, data.type || 'info')
      } catch {
        addLog(event.data)
      }
    }
    es.onerror = () => {
      // Will auto-reconnect
    }
    eventSourceRef.current = es
    return () => es.close()
  }, [addLog])

  // Check env status on mount
  useEffect(() => {
    fetch('/api/env-status')
      .then(res => res.json())
      .then(data => setEnvStatus(data))
      .catch(() => setEnvStatus(null))
  }, [])

  const handleStart = async (tickerValue) => {
    setTicker(tickerValue)
    setIsRunning(true)
    setContent('')
    setLogs([])
    setCurrentStep(0)
    setStepStatus({ 0: 'loading', 1: 'idle', 2: 'idle', 3: 'idle' })
    addLog(`[시작] 티커 "${tickerValue}" 분석을 시작합니다...`, 'system')

    try {
      // Step 1: Scrape
      addLog('[Step 1] StockTitan 데이터 수집 중...', 'info')
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: tickerValue })
      })
      const scrapeData = await scrapeRes.json()
      
      if (!scrapeRes.ok) {
        throw new Error(scrapeData.error || '데이터 수집 실패')
      }
      setStepStatus(prev => ({ ...prev, 0: 'done', 1: 'loading' }))
      setCurrentStep(1)
      addLog(`[Step 1 완료] ${scrapeData.message || '데이터 수집 성공'}`, 'success')

      // Step 2: Analyze
      addLog('[Step 2] AI 분석 중...', 'info')
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: tickerValue, scrapeData: scrapeData.data })
      })
      const analyzeData = await analyzeRes.json()

      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'AI 분석 실패')
      }
      setStepStatus(prev => ({ ...prev, 1: 'done', 2: 'loading' }))
      setCurrentStep(2)
      addLog('[Step 2 완료] AI 분석이 완료되었습니다.', 'success')

      // Step 3: Content generated
      setContent(analyzeData.content || '')
      setStepStatus(prev => ({ ...prev, 2: 'done', 3: 'idle' }))
      setCurrentStep(3)
      addLog('[Step 3 완료] 블로그 원고가 생성되었습니다. 검토 후 발행해주세요.', 'success')
      setIsRunning(false)

    } catch (err) {
      addLog(`[에러] ${err.message}`, 'error')
      setStepStatus(prev => {
        const updated = { ...prev }
        for (const key in updated) {
          if (updated[key] === 'loading') updated[key] = 'error'
        }
        return updated
      })
      setIsRunning(false)
    }
  }

  const handlePublish = async (platform) => {
    setIsRunning(true)
    setStepStatus(prev => ({ ...prev, 3: 'loading' }))
    addLog(`[Step 4] ${platform} 포스팅 진행 중...`, 'info')

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, content, ticker })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || '발행 실패')
      
      setStepStatus(prev => ({ ...prev, 3: 'done' }))
      addLog(`[Step 4 완료] ${platform} 발행 성공!`, 'success')
    } catch (err) {
      addLog(`[에러] ${err.message}`, 'error')
      setStepStatus(prev => ({ ...prev, 3: 'error' }))
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-glow" />
        <div className="header-content">
          <div className="logo-area">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 20h20" strokeLinecap="round"/>
                <path d="M5 20V8l4 4 4-8 4 6 3-2v12" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="gradient-text">StockBlog AI</h1>
          </div>
          <p className="header-subtitle">주식 분석 & 자동 블로깅 플랫폼</p>
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-layout">
        {/* Left Column */}
        <div className="left-column">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <TickerInput onSubmit={handleStart} isRunning={isRunning} />
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <ProgressStepper 
              steps={STEPS} 
              currentStep={currentStep} 
              stepStatus={stepStatus} 
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <ControlPanel 
              onPublish={handlePublish} 
              isRunning={isRunning} 
              hasContent={!!content}
              envStatus={envStatus}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <BlogPreview 
              content={content} 
              onContentChange={setContent} 
              ticker={ticker}
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <LogViewer logs={logs} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
