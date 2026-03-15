import { useState } from 'react';

export default function SessionStatusCard({ status, isChecking, onCheck }) {
  const getStatusColor = (isOk) => isOk ? '#10b981' : '#f43f5e';
  
  return (
    <div className="panel glass">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="panel-title" style={{ marginBottom: 0 }}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          ChatGPT 세션 상태
        </div>
        <button
          onClick={onCheck}
          disabled={isChecking}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'rgba(51, 65, 85, 0.4)',
            color: 'var(--color-text-primary)',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: isChecking ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isChecking ? (
            <span style={{
              width: '12px', height: '12px',
              border: '2px solid var(--color-text-secondary)',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
               <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l5.25 5.25"/>
            </svg>
          )}
          상태 확인
        </button>
      </div>

      <div style={{
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '10px',
        padding: '16px',
        border: '1px solid rgba(51, 65, 85, 0.4)',
      }}>
        {!status ? (
          <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', padding: '10px 0' }}>
            우측 상단 '상태 확인' 버튼을 눌러 점검하세요.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusDot color={getStatusColor(status.chatgpt_accessible)} />
              <span>ChatGPT 접속: {status.chatgpt_accessible ? '정상' : '실패'}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusDot color={getStatusColor(status.logged_in)} />
              <span>로그인 상태: {status.logged_in ? '로그인됨' : '로그인 필요'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusDot color={getStatusColor(status.newstock_direct_access || status.newstock_sidebar_access)} />
              <span>newstock 진입: {
                status.newstock_direct_access ? '직접 연결됨' :
                status.newstock_sidebar_access ? '사이드바 연결됨' : '실패'
              }</span>
            </div>

            {status.message && (
              <div style={{ 
                marginTop: '8px', 
                padding: '10px', 
                background: 'rgba(15, 23, 42, 0.8)', 
                borderRadius: '6px',
                borderLeft: `3px solid ${status.logged_in && (status.newstock_direct_access || status.newstock_sidebar_access) ? '#10b981' : '#f59e0b'}`,
                color: 'var(--color-text-secondary)',
                fontSize: '0.85rem'
              }}>
                {status.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusDot({ color }) {
  return (
    <span style={{
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 8px ${color}80`,
    }} />
  );
}
