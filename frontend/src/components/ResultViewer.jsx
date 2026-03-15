import { useState } from 'react';

export default function ResultViewer({ result }) {
  const [viewMode, setViewMode] = useState('blog'); // 'blog' | 'raw'
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="panel glass" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        <div className="panel-title">
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          분석 결과 (블로그 / 원문)
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
          <p style={{ fontSize: '0.95rem' }}>티커를 입력하면 결과가 여기에 표시됩니다.</p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    const textToCopy = viewMode === 'blog' ? result.blog_content : result.raw_response;
    // Strip HTML for copying if it's blog
    const plainText = viewMode === 'blog' 
      ? textToCopy.replace(/<[^>]+>/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
      : textToCopy.replace(/<[^>]+>/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      
    navigator.clipboard.writeText(plainText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };

  return (
    <div className="panel glass" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="panel-title" style={{ marginBottom: 0 }}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          분석 결과 <span style={{ color: 'var(--color-primary-light)', fontWeight: 700 }}>— {result.ticker}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setViewMode(viewMode === 'blog' ? 'raw' : 'blog')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'rgba(51, 65, 85, 0.4)',
              color: 'var(--color-text-primary)',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {viewMode === 'blog' ? '원문 보기' : '블로그 보기'}
          </button>
          
          <button
            onClick={handleCopy}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid var(--color-primary)',
              background: 'var(--color-primary)',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                복사완료
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                텍스트 복사
              </>
            )}
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        borderRadius: '12px',
        overflow: 'auto',
        background: 'rgba(15, 23, 42, 0.5)',
        border: '1px solid rgba(51, 65, 85, 0.5)',
        padding: '24px',
      }}>
        {viewMode === 'blog' ? (
          <div className="blog-content-wrapper" dangerouslySetInnerHTML={{ __html: result.blog_content }} />
        ) : (
          <div style={{ 
            color: 'var(--color-text-primary)', 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            lineHeight: '1.7'
          }}>
            <strong style={{ color: 'var(--color-primary-light)', display: 'block', marginBottom: '16px' }}>
              사용된 프롬프트:<br/>
              <span style={{ fontWeight: 'normal', color: 'var(--color-text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>{result.prompt_used}</span>
            </strong>
            <hr style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)', marginBottom: '16px' }}/>
            <div dangerouslySetInnerHTML={{ __html: result.raw_response }} />
          </div>
        )}
      </div>

      {/* 스타일은 인라인으로 직접 처리하거나 App.css에 위임 */}
      <style>{`
        .blog-content-wrapper h1 { font-size: 1.6rem; font-weight: 800; margin-bottom: 8px; color: var(--color-primary-light); }
        .blog-content-wrapper .blog-date { font-size: 0.85rem; color: var(--color-text-secondary); margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(51,65,85,0.4); }
        .blog-content-wrapper h2 { font-size: 1.2rem; font-weight: 700; margin: 24px 0 12px; color: #f1f5f9; display: flex; align-items: center; gap: 8px; }
        .blog-content-wrapper p { font-size: 0.95rem; line-height: 1.7; color: #cbd5e1; margin-bottom: 16px; }
        .blog-content-wrapper ul { margin-left: 20px; margin-bottom: 16px; color: #cbd5e1; font-size: 0.95rem; line-height: 1.7; }
        .blog-content-wrapper li { margin-bottom: 8px; }
        .blog-content-wrapper .blog-disclaimer { margin-top: 32px; padding: 16px; background: rgba(245,158,11,0.1); border-left: 4px solid var(--color-accent-amber); border-radius: 4px; }
        .blog-content-wrapper .blog-disclaimer p { margin: 0; font-size: 0.85rem; color: #d97706; }
      `}</style>
    </div>
  );
}
