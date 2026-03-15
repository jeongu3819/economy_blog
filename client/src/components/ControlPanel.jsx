export default function ControlPanel({ onPublish, isRunning, hasContent, envStatus }) {
  const StatusDot = ({ connected }) => (
    <span style={{
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: connected ? '#10b981' : '#f43f5e',
      boxShadow: connected ? '0 0 6px rgba(16, 185, 129, 0.5)' : '0 0 6px rgba(244, 63, 94, 0.5)',
      marginRight: '8px',
    }} />
  )

  return (
    <div className="panel glass">
      <div className="panel-title">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
        </svg>
        제어 패널
      </div>

      {/* Env Status */}
      <div style={{
        padding: '14px 16px',
        borderRadius: '10px',
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(51, 65, 85, 0.4)',
        marginBottom: '16px',
        fontSize: '0.85rem',
      }}>
        <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
          환경 설정 상태
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
            <StatusDot connected={envStatus?.naver} />
            <span style={{ color: envStatus?.naver ? '#10b981' : '#f43f5e' }}>
              네이버: {envStatus?.naver ? '연결됨' : '미설정'}
            </span>
          </div>
          <div>
            <StatusDot connected={envStatus?.tistory} />
            <span style={{ color: envStatus?.tistory ? '#10b981' : '#f43f5e' }}>
              티스토리: {envStatus?.tistory ? '연결됨' : '미설정'}
            </span>
          </div>
        </div>
      </div>

      {/* Publish Buttons */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          id="publish-naver-btn"
          className="btn-success"
          onClick={() => onPublish('naver')}
          disabled={!hasContent || isRunning}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" strokeLinecap="round"/>
            <polyline points="16 6 12 2 8 6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round"/>
          </svg>
          네이버 발행
        </button>
        <button
          id="publish-tistory-btn"
          className="btn-success"
          onClick={() => onPublish('tistory')}
          disabled={!hasContent || isRunning}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" strokeLinecap="round"/>
            <polyline points="16 6 12 2 8 6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="2" x2="12" y2="15" strokeLinecap="round"/>
          </svg>
          티스토리 발행
        </button>
      </div>
    </div>
  )
}
