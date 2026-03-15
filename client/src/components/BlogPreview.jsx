import { useState } from 'react'

export default function BlogPreview({ content, onContentChange, ticker }) {
  const [isEditing, setIsEditing] = useState(false)

  if (!content && !ticker) {
    return (
      <div className="panel glass" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div className="panel-title">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          블로그 미리보기
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          gap: '16px',
        }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ opacity: 0.3 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          <p style={{ fontSize: '0.9rem' }}>티커를 입력하고 분석을 시작하면<br />여기에 블로그 원고가 표시됩니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="panel glass" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="panel-title" style={{ marginBottom: 0 }}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          블로그 미리보기 {ticker && <span style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>— {ticker}</span>}
        </div>
        {content && (
          <button
            id="toggle-edit-btn"
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: isEditing ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: isEditing ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {isEditing ? '✓ 미리보기' : '✎ 편집'}
          </button>
        )}
      </div>

      <div style={{
        flex: 1,
        borderRadius: '12px',
        overflow: 'auto',
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(51, 65, 85, 0.5)',
      }}>
        {!content ? (
          <div style={{
            padding: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-secondary)',
            height: '100%',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.9rem',
            }}>
              <div style={{
                width: '20px', height: '20px',
                border: '2px solid var(--color-primary)',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              AI가 원고를 생성 중입니다...
            </div>
          </div>
        ) : isEditing ? (
          <textarea
            id="blog-editor"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              minHeight: '350px',
              padding: '20px',
              background: 'transparent',
              color: 'var(--color-text-primary)',
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              fontSize: '0.92rem',
              lineHeight: '1.7',
              fontFamily: 'var(--font-sans)',
            }}
          />
        ) : (
          <div
            style={{
              padding: '24px',
              fontSize: '0.92rem',
              lineHeight: '1.8',
              color: 'var(--color-text-primary)',
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
