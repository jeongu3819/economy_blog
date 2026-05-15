interface BlogInputBoxProps {
  value: string
  onChange: (value: string) => void
  onParse: () => void
  onClear: () => void
  onLoadSample: () => void
}

export default function BlogInputBox({
  value,
  onChange,
  onParse,
  onClear,
  onLoadSample,
}: BlogInputBoxProps): React.JSX.Element {
  return (
    <div className="blog-editor-card">
      <h2 className="blog-editor-card-title">1. 원문 붙여넣기</h2>
      <p className="blog-editor-card-hint">
        GPTs에서 생성한 블로그 초안을 그대로 붙여넣고 <strong>자동 분석</strong>을 누르세요.
      </p>
      <textarea
        className="blog-editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="# 제목 후보 3개&#10;1. ...&#10;2. ...&#10;&#10;# 도입부 후보 2개&#10;## 도입부 1&#10;...&#10;&#10;# 네이버 블로그 본문 초안&#10;..."
        spellCheck={false}
      />
      <div className="blog-editor-actions">
        <button className="blog-editor-button" onClick={onParse}>
          자동 분석
        </button>
        <button className="blog-editor-button secondary" onClick={onLoadSample}>
          샘플 불러오기
        </button>
        <button className="blog-editor-button danger" onClick={onClear}>
          비우기
        </button>
      </div>
    </div>
  )
}
