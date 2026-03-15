export default function LoadingOverlay({ steps, currentStep }) {
  return (
    <div className="panel glass">
      <div className="panel-title">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        진행 상태
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {steps.map((step, i) => {
          const isDone = i < currentStep;
          const isLoading = i === currentStep;
          const isIdle = i > currentStep;
          
          let colorBg = 'transparent';
          let colorBorder = '#475569';
          let colorText = '#64748b';
          
          if (isDone) {
            colorBg = '#10b981'; colorBorder = '#10b981'; colorText = '#10b981';
          } else if (isLoading) {
            colorBg = '#6366f1'; colorBorder = '#6366f1'; colorText = '#818cf8';
          }

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {/* Connector + Circle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '36px' }}>
                {/* Circle */}
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  border: `2px solid ${colorBorder}`,
                  background: isDone || isLoading ? colorBg : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  transition: 'all 0.4s ease',
                  boxShadow: isLoading ? `0 0 12px ${colorBg}60` : 'none',
                }}>
                  {isDone && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {isLoading && (
                    <div style={{
                      width: '16px', height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }} />
                  )}
                  {isIdle && (
                    <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>{i + 1}</span>
                  )}
                </div>
                {/* Line */}
                {i < steps.length - 1 && (
                  <div style={{
                    width: '2px', height: '24px',
                    background: isDone ? '#10b981' : '#334155',
                    transition: 'background 0.4s ease',
                  }} />
                )}
              </div>

              {/* Step Label */}
              <div style={{ paddingTop: '8px', paddingBottom: i < steps.length - 1 ? '24px' : '0' }}>
                <span style={{
                  color: colorText,
                  fontSize: '0.95rem',
                  fontWeight: isLoading ? 600 : 500,
                  transition: 'all 0.3s ease',
                }}>
                  {step}
                  {isLoading && (
                    <span style={{ 
                      marginLeft: '8px', fontSize: '0.8rem', color: '#818cf8',
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
    </div>
  );
}
