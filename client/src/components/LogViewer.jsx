import { useEffect, useRef } from 'react'

export default function LogViewer({ logs }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const typeColors = {
    info: '#94a3b8',
    success: '#10b981',
    error: '#f43f5e',
    system: '#06b6d4',
    warn: '#f59e0b',
  }

  return (
    <div className="panel glass">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="panel-title" style={{ marginBottom: 0 }}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="19" x2="20" y2="19" strokeLinecap="round"/>
          </svg>
          실시간 로그
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: 'var(--color-text-secondary)',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10b981',
            animation: 'glow-pulse 2s ease-in-out infinite',
          }} />
          LIVE
        </div>
      </div>

      <div
        id="log-viewer"
        style={{
          marginTop: '12px',
          background: 'rgba(2, 6, 23, 0.8)',
          borderRadius: '10px',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          padding: '14px',
          maxHeight: '240px',
          minHeight: '120px',
          overflowY: 'auto',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '0.78rem',
          lineHeight: '1.8',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: '#475569', fontStyle: 'italic' }}>
            대기 중... 분석을 시작하면 로그가 여기에 표시됩니다.
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px' }}>
              <span style={{ color: '#475569', flexShrink: 0 }}>{log.timestamp}</span>
              <span style={{ color: typeColors[log.type] || typeColors.info }}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}
