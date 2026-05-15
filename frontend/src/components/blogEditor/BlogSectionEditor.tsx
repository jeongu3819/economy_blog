import { ParsedBlog, BodySection } from '../../utils/blogParser'

interface BlogSectionEditorProps {
  parsed: ParsedBlog
  onChange: (next: ParsedBlog) => void
}

export default function BlogSectionEditor({
  parsed,
  onChange,
}: BlogSectionEditorProps): React.JSX.Element {
  const update = (patch: Partial<ParsedBlog>) => onChange({ ...parsed, ...patch })

  const updateSection = (id: string, patch: Partial<BodySection>) => {
    update({
      bodySections: parsed.bodySections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })
  }

  const updateParagraph = (sectionId: string, idx: number, value: string) => {
    update({
      bodySections: parsed.bodySections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              paragraphs: s.paragraphs.map((p, i) => (i === idx ? value : p)),
            }
          : s,
      ),
    })
  }

  const addParagraph = (sectionId: string) => {
    update({
      bodySections: parsed.bodySections.map((s) =>
        s.id === sectionId ? { ...s, paragraphs: [...s.paragraphs, ''] } : s,
      ),
    })
  }

  const removeParagraph = (sectionId: string, idx: number) => {
    update({
      bodySections: parsed.bodySections.map((s) =>
        s.id === sectionId
          ? { ...s, paragraphs: s.paragraphs.filter((_, i) => i !== idx) }
          : s,
      ),
    })
  }

  const removeSection = (sectionId: string) => {
    update({ bodySections: parsed.bodySections.filter((s) => s.id !== sectionId) })
  }

  return (
    <div className="blog-editor-card">
      <h2 className="blog-editor-card-title">2. 섹션 편집</h2>

      {parsed.titleCandidates.length > 0 && (
        <div className="blog-editor-field">
          <label className="blog-editor-label">제목 후보 선택</label>
          <div className="blog-editor-radio-list">
            {parsed.titleCandidates.map((title, i) => (
              <label key={i} className="blog-editor-radio-row">
                <input
                  type="radio"
                  name="titleCandidate"
                  checked={parsed.selectedTitle === title}
                  onChange={() => update({ selectedTitle: title })}
                />
                <span>{title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="blog-editor-field">
        <label className="blog-editor-label">최종 제목</label>
        <input
          className="blog-editor-input"
          value={parsed.selectedTitle}
          onChange={(e) => update({ selectedTitle: e.target.value })}
        />
      </div>

      <div className="blog-editor-field">
        <label className="blog-editor-label">분석 날짜</label>
        <input
          className="blog-editor-input"
          value={parsed.analysisDate}
          onChange={(e) => update({ analysisDate: e.target.value })}
        />
      </div>

      {parsed.introCandidates.length > 0 && (
        <div className="blog-editor-field">
          <label className="blog-editor-label">도입부 후보 선택</label>
          <div className="blog-editor-radio-list">
            {parsed.introCandidates.map((intro, i) => (
              <label key={i} className="blog-editor-radio-row">
                <input
                  type="radio"
                  name="introCandidate"
                  checked={parsed.selectedIntro === intro.content}
                  onChange={() => update({ selectedIntro: intro.content })}
                />
                <span>
                  <strong>{intro.label}</strong> — {intro.content.slice(0, 60)}
                  {intro.content.length > 60 ? '…' : ''}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="blog-editor-field">
        <label className="blog-editor-label">최종 도입부</label>
        <textarea
          className="blog-section-textarea"
          value={parsed.selectedIntro}
          onChange={(e) => update({ selectedIntro: e.target.value })}
        />
      </div>

      {parsed.bodySections.map((section) => (
        <div key={section.id} className="blog-editor-section-block">
          <div className="blog-editor-section-header">
            <input
              className="blog-section-input"
              value={section.heading}
              onChange={(e) => updateSection(section.id, { heading: e.target.value })}
            />
            <button
              className="blog-editor-button danger"
              onClick={() => removeSection(section.id)}
              title="섹션 삭제"
            >
              섹션 삭제
            </button>
          </div>
          {section.paragraphs.map((paragraph, idx) => (
            <div key={idx} className="blog-editor-paragraph-row">
              <textarea
                className="blog-section-textarea"
                value={paragraph}
                onChange={(e) => updateParagraph(section.id, idx, e.target.value)}
              />
              <button
                className="blog-editor-button danger"
                onClick={() => removeParagraph(section.id, idx)}
              >
                ×
              </button>
            </div>
          ))}
          <button
            className="blog-editor-button secondary"
            onClick={() => addParagraph(section.id)}
          >
            + 문단 추가
          </button>
        </div>
      ))}

      <div className="blog-editor-field">
        <label className="blog-editor-label">투자 주의문구</label>
        <textarea
          className="blog-section-textarea"
          value={parsed.disclaimer}
          onChange={(e) => update({ disclaimer: e.target.value })}
        />
      </div>

      <div className="blog-editor-field">
        <label className="blog-editor-label">해시태그</label>
        <textarea
          className="blog-section-textarea"
          value={parsed.hashtags}
          onChange={(e) => update({ hashtags: e.target.value })}
        />
      </div>
    </div>
  )
}
