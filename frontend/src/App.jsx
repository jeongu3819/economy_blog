import { useState, useEffect, useRef, useCallback } from 'react';
import TickerForm from './components/TickerForm';
import SessionStatusCard from './components/SessionStatusCard';
import LoadingOverlay from './components/LoadingOverlay';
import ResultViewer from './components/ResultViewer';
import LogViewer from './components/LogViewer';
import { stockApi } from './api/stockApi';
import './App.css';

const STEPS = [
  'StockTitan 데이터 수집', 
  'ChatGPT / newstock 접속', 
  'AI 응답 생성 대기', 
  '블로그 형태 글 작성'
];

function App() {
  const [ticker, setTicker] = useState('');
  const [sessionStatus, setSessionStatus] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const eventSourceRef = useRef(null);

  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('ko-KR', { hour12: false });
    setLogs(prev => [...prev, { timestamp, message, type }]);
  }, []);

  // Set up SSE
  useEffect(() => {
    const es = new EventSource('/api/logs');
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addLog(data.message, data.type || 'info');
        
        // Pseudo logic to advance steps based on log messages
        if (data.message.includes('StockTitan 데이터 수집 중')) setCurrentStep(0);
        if (data.message.includes('newstock GPT 분석 중')) setCurrentStep(1);
        if (data.message.includes('AI 응답 대기 중')) setCurrentStep(2);
        if (data.message.includes('블로그 글 생성 중')) setCurrentStep(3);
        
      } catch {
        addLog(event.data);
      }
    };
    es.onerror = () => {
      // Reconnects automatically
    };
    eventSourceRef.current = es;
    return () => es.close();
  }, [addLog]);

  // Check session on mount
  useEffect(() => {
    handleCheckSession();
  }, []);

  const handleCheckSession = async () => {
    setIsCheckingSession(true);
    addLog('세션 상태를 점검합니다...', 'system');
    try {
      const status = await stockApi.checkSession();
      setSessionStatus(status);
      addLog(`세션 점검 완료: ${status.message}`, status.chatgpt_accessible ? 'success' : 'error');
    } catch (err) {
      addLog(`세션 점검 실패: ${err.message}`, 'error');
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleStart = async (tickerValue) => {
    setTicker(tickerValue);
    setIsRunning(true);
    setResult(null);
    setLogs([]);
    setCurrentStep(0);
    
    try {
      const responseData = await stockApi.generateBlog(tickerValue);
      setResult(responseData);
      setCurrentStep(4); // All done
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        // Validation format from FastAPI
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          addLog(`[에러] ${detail}`, 'error');
        } else if (detail.error) {
           addLog(`[에러] ${detail.error}`, 'error');
        } else {
           addLog(`[에러] ${JSON.stringify(detail)}`, 'error');
        }
      } else {
        addLog(`[에러] ${err.message}`, 'error');
      }
      setCurrentStep(-1);
    } finally {
      setIsRunning(false);
    }
  };

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
          <p className="header-subtitle">자동화된 종목 분석 & 블로그 포스팅 엔진</p>
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-layout">
        {/* Left Column (Controls & Status) */}
        <div className="left-column">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <SessionStatusCard 
              status={sessionStatus} 
              isChecking={isCheckingSession}
              onCheck={handleCheckSession}
            />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <TickerForm onSubmit={handleStart} isRunning={isRunning} />
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <LoadingOverlay steps={STEPS} currentStep={currentStep} />
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <LogViewer logs={logs} />
          </div>
        </div>

        {/* Right Column (Results) */}
        <div className="right-column">
          <div className="animate-slide-up" style={{ animationDelay: '0.2s', height: '100%' }}>
            <ResultViewer result={result} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
