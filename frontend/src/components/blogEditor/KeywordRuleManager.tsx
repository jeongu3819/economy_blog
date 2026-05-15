import { useState } from 'react'
import { KeywordRule } from '../../utils/keywordHighlighter'
import { HIGHLIGHT_CLASS_OPTIONS, HighlightClassName } from '../../utils/blogTheme'

interface KeywordRuleManagerProps {
  rules: KeywordRule[]
  onChange: (rules: KeywordRule[]) => void
  onReset: () => void
}

export default function KeywordRuleManager({
  rules,
  onChange,
  onReset,
}: KeywordRuleManagerProps): React.JSX.Element {
  const [newKeyword, setNewKeyword] = useState('')
  const [newClass, setNewClass] = useState<HighlightClassName>('highlight-risk')

  const addRule = () => {
    const keyword = newKeyword.trim()
    if (!keyword) return
    if (rules.some((r) => r.keyword === keyword)) {
      setNewKeyword('')
      return
    }
    onChange([...rules, { keyword, className: newClass }])
    setNewKeyword('')
  }

  const removeRule = (idx: number) => {
    onChange(rules.filter((_, i) => i !== idx))
  }

  const updateClassName = (idx: number, className: HighlightClassName) => {
    onChange(rules.map((r, i) => (i === idx ? { ...r, className } : r)))
  }

  return (
    <div className="blog-editor-card">
      <h2 className="blog-editor-card-title">키워드 강조 규칙</h2>
      <p className="blog-editor-card-hint">
        추가/삭제한 규칙은 브라우저(localStorage)에 저장됩니다.
      </p>

      <div className="keyword-rule-row keyword-rule-add">
        <input
          className="blog-editor-input"
          placeholder="새 키워드 (예: 상장폐지)"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addRule()
          }}
        />
        <select
          className="blog-editor-input"
          value={newClass}
          onChange={(e) => setNewClass(e.target.value as HighlightClassName)}
        >
          {HIGHLIGHT_CLASS_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button className="blog-editor-button" onClick={addRule}>
          추가
        </button>
      </div>

      <div className="keyword-rule-list">
        {rules.map((rule, idx) => (
          <div className="keyword-rule-row" key={`${rule.keyword}-${idx}`}>
            <span className={`keyword-rule-chip ${rule.className}`}>{rule.keyword}</span>
            <select
              className="blog-editor-input"
              value={rule.className}
              onChange={(e) => updateClassName(idx, e.target.value as HighlightClassName)}
            >
              {HIGHLIGHT_CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button className="blog-editor-button danger" onClick={() => removeRule(idx)}>
              삭제
            </button>
          </div>
        ))}
      </div>

      <div className="blog-editor-actions">
        <button className="blog-editor-button secondary" onClick={onReset}>
          기본 규칙으로 되돌리기
        </button>
      </div>
    </div>
  )
}
