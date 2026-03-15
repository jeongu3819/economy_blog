export default function ProgressStepper({ steps, currentStep, stepStatus }) {
  const getStepState = (index) => {
    const status = stepStatus[index]
    if (status === 'done') return 'done'
    if (status === 'loading') return 'loading'
    if (status === 'error') return 'error'
    return 'idle'
  }

  const colors = {
    done: { bg: '#10b981', border: '#10b981', text: '#10b981' },
    loading: { bg: '#6366f1', border: '#6366f1', text: '#818cf8' },
    error: { bg: '#f43f5e', border: '#f43f5e', text: '#f43f5e' },
    idle: { bg: 'transparent', border: '#475569', text: '#64748b' },
  }

  return (
    <div className="panel glass">
      <div className="panel-title">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        작업 진행 상태
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {steps.map((step, i) => {
          const state = getStepState(i)
          const color = colors[state]
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {/* Connector + Circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '36px' }}>
                {/* Circle */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: `2px solid ${color.border}`,
                  background: state === 'done' || state === 'loading' ? color.bg : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.4s ease',
                  boxShadow: state === 'loading' ? `0 0 12px ${color.bg}60` : 'none',
                }}>
                  {state === 'done' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {state === 'loading' && (
                    <div style={{
                      width: '16px', height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                  )}
                  {state === 'error' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
                      <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
                    </svg>
                  )}
                  {state === 'idle' && (
                    <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>{i + 1}</span>
                  )}
                </div>
                {/* Line */}
                {i < steps.length - 1 && (
                  <div style={{
                    width: '2px',
                    height: '24px',
                    background: state === 'done' ? '#10b981' : '#334155',
                    transition: 'background 0.4s ease',
                  }} />
                )}
              </div>

              {/* Step Label */}
              <div style={{
                paddingTop: '6px',
                paddingBottom: i < steps.length - 1 ? '24px' : '0',
              }}>
                <span style={{
                  color: color.text,
                  fontSize: '0.95rem',
                  fontWeight: state === 'loading' ? 600 : 500,
                  transition: 'all 0.3s ease',
                }}>
                  {step}
                  {state === 'loading' && (
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '0.8rem', 
                      color: '#818cf8',
                      animation: 'glow-pulse 1.5s ease-in-out infinite',
                    }}>
                      진행 중...
                    </span>
                  )}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
