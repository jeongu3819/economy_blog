import { useState } from 'react';

export default function TickerForm({ onSubmit, isRunning }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim().toUpperCase();
    if (trimmed && !isRunning) {
      onSubmit(trimmed);
    }
  };

  return (
    <div className="panel glass">
      <div className="panel-title">
        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
        </svg>
        종목 티커 입력
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            id="ticker-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="예: AAPL, TSLA, NVDA"
            disabled={isRunning}
            style={{
              width: '100%',
              padding: '14px 18px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              color: 'var(--color-text-primary)',
              fontSize: '1rem',
              fontWeight: 500,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
        <button
          id="analyze-btn"
          type="submit"
          className="btn-primary"
          disabled={!value.trim() || isRunning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          {isRunning ? (
            <>
              <span className="spinner" />
              분석 중...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              분석 시작
            </>
          )}
        </button>
      </form>

      <style>{`
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
