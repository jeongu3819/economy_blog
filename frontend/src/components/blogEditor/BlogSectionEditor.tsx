import { ParsedBlog, BodySection, ContentBlock } from '../../utils/blogParser'

interface BlogSectionEditorProps {
  parsed: ParsedBlog
  onChange: (next: ParsedBlog) => void
  suggestedHashtags?: string[]
}

type SectionPath =
  | { kind: 'top'; topId: string }
  | { kind: 'child'; topId: string; childId: string }

function updateSectionByPath(
  sections: BodySection[],
  path: SectionPath,
  patch: (s: BodySection) => BodySection,
): BodySection[] {
  return sections.map((s) => {
    if (s.id !== path.topId) return s
    if (path.kind === 'top') return patch(s)
    return {
      ...s,
      children: s.children.map((c) => (c.id === path.childId ? patch(c) : c)),
    }
  })
}

function removeSectionByPath(sections: BodySection[], path: SectionPath): BodySection[] {
  if (path.kind === 'top') return sections.filter((s) => s.id !== path.topId)
  return sections.map((s) =>
    s.id === path.topId
      ? { ...s, children: s.children.filter((c) => c.id !== path.childId) }
      : s,
  )
}

function paragraphSummary(block: ContentBlock): string {
  if (typeof block === 'string') return block
  if (block.type === 'ordered-list') return block.items.join('\n')
  return block.content
}

interface SectionBlockProps {
  section: BodySection
  path: SectionPath
  isChild: boolean
  onHeadingChange: (path: SectionPath, value: string) => void
  onParagraphChange: (path: SectionPath, idx: number, value: string) => void
  onListItemChange: (path: SectionPath, paraIdx: number, itemIdx: number, value: string) => void
  onAddParagraph: (path: SectionPath) => void
  onRemoveParagraph: (path: SectionPath, idx: number) => void
  onRemoveSection: (path: SectionPath) => void
  children?: React.ReactNode
}

function SectionBlock({
  section,
  path,
  isChild,
  onHeadingChange,
  onParagraphChange,
  onListItemChange,
  onAddParagraph,
  onRemoveParagraph,
  onRemoveSection,
  children,
}: SectionBlockProps): React.JSX.Element {
  return (
    <div
      className={`blog-editor-section-block${isChild ? ' blog-editor-subsection-block' : ''}`}
    >
      <div className="blog-editor-section-header">
        <input
          className="blog-section-input"
          value={section.heading}
          onChange={(e) => onHeadingChange(path, e.target.value)}
          placeholder={isChild ? '하위 섹션 제목' : '섹션 제목'}
        />
        <button
          className="blog-editor-button danger"
          onClick={() => onRemoveSection(path)}
          title={isChild ? '하위 섹션 삭제' : '섹션 삭제'}
        >
          {isChild ? '하위 삭제' : '섹션 삭제'}
        </button>
      </div>
      {section.paragraphs.map((block, idx) => {
        if (typeof block === 'string') {
          return (
            <div key={idx} className="blog-editor-paragraph-row">
              <textarea
                className="blog-section-textarea"
                value={block}
                onChange={(e) => onParagraphChange(path, idx, e.target.value)}
              />
              <button
                className="blog-editor-button danger"
                onClick={() => onRemoveParagraph(path, idx)}
              >
                ×
              </button>
            </div>
          )
        }
        if (block.type === 'ordered-list') {
          return (
            <div key={idx} className="blog-editor-paragraph-row blog-editor-list-row">
              <div className="blog-editor-list-edit">
                <span className="blog-editor-block-tag">번호 목록</span>
                {block.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="blog-editor-list-item">
                    <span className="blog-editor-list-index">{itemIdx + 1}.</span>
                    <input
                      className="blog-editor-input"
                      value={item}
                      onChange={(e) =>
                        onListItemChange(path, idx, itemIdx, e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                className="blog-editor-button danger"
                onClick={() => onRemoveParagraph(path, idx)}
              >
                ×
              </button>
            </div>
          )
        }
        // quote
        return (
          <div key={idx} className="blog-editor-paragraph-row">
            <div className="blog-editor-quote-edit">
              <span className="blog-editor-block-tag">인용</span>
              <textarea
                className="blog-section-textarea"
                value={block.content}
                onChange={(e) => onParagraphChange(path, idx, e.target.value)}
              />
            </div>
            <button
              className="blog-editor-button danger"
              onClick={() => onRemoveParagraph(path, idx)}
            >
              ×
            </button>
          </div>
        )
      })}
      <button
        className="blog-editor-button secondary"
        onClick={() => onAddParagraph(path)}
      >
        + 문단 추가
      </button>
      {children}
    </div>
  )
}

export default function BlogSectionEditor({
  parsed,
  onChange,
  suggestedHashtags = [],
}: BlogSectionEditorProps): React.JSX.Element {
  const update = (patch: Partial<ParsedBlog>) => onChange({ ...parsed, ...patch })

  const appendHashtag = (tag: string) => {
    const current = (parsed.hashtags || '').trim()
    const existing = new Set(
      current
        .split(/\s+/)
        .map((t) => t.toLowerCase())
        .filter(Boolean),
    )
    if (existing.has(tag.toLowerCase())) return
    const next = current ? `${current} ${tag}` : tag
    update({ hashtags: next })
  }

  const setSections = (next: BodySection[]) => update({ bodySections: next })

  const handleHeadingChange = (path: SectionPath, value: string) => {
    setSections(
      updateSectionByPath(parsed.bodySections, path, (s) => ({ ...s, heading: value })),
    )
  }

  const handleParagraphChange = (path: SectionPath, idx: number, value: string) => {
    setSections(
      updateSectionByPath(parsed.bodySections, path, (s) => ({
        ...s,
        paragraphs: s.paragraphs.map((p, i) => {
          if (i !== idx) return p
          if (typeof p === 'string') return value
          if (p.type === 'quote') return { ...p, content: value }
          return p
        }),
      })),
    )
  }

  const handleListItemChange = (
    path: SectionPath,
    paraIdx: number,
    itemIdx: number,
    value: string,
  ) => {
    setSections(
      updateSectionByPath(parsed.bodySections, path, (s) => ({
        ...s,
        paragraphs: s.paragraphs.map((p, i) => {
          if (i !== paraIdx) return p
          if (typeof p === 'string' || p.type !== 'ordered-list') return p
          return {
            ...p,
            items: p.items.map((item, j) => (j === itemIdx ? value : item)),
          }
        }),
      })),
    )
  }

  const handleAddParagraph = (path: SectionPath) => {
    setSections(
      updateSectionByPath(parsed.bodySections, path, (s) => ({
        ...s,
        paragraphs: [...s.paragraphs, ''],
      })),
    )
  }

  const handleRemoveParagraph = (path: SectionPath, idx: number) => {
    setSections(
      updateSectionByPath(parsed.bodySections, path, (s) => ({
        ...s,
        paragraphs: s.paragraphs.filter((_, i) => i !== idx),
      })),
    )
  }

  const handleRemoveSection = (path: SectionPath) => {
    setSections(removeSectionByPath(parsed.bodySections, path))
  }

  const renderProps = {
    onHeadingChange: handleHeadingChange,
    onParagraphChange: handleParagraphChange,
    onListItemChange: handleListItemChange,
    onAddParagraph: handleAddParagraph,
    onRemoveParagraph: handleRemoveParagraph,
    onRemoveSection: handleRemoveSection,
  }

  // Suppress unused warning for utility function in narrow case
  void paragraphSummary

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

      {parsed.introQuote && (
        <div className="blog-editor-field">
          <label className="blog-editor-label">도입부 인용문</label>
          <textarea
            className="blog-section-textarea"
            value={parsed.introQuote}
            onChange={(e) => update({ introQuote: e.target.value })}
          />
        </div>
      )}

      {parsed.bodySections.map((section) => (
        <SectionBlock
          key={section.id}
          section={section}
          path={{ kind: 'top', topId: section.id }}
          isChild={false}
          {...renderProps}
        >
          {section.children.map((child) => (
            <SectionBlock
              key={child.id}
              section={child}
              path={{ kind: 'child', topId: section.id, childId: child.id }}
              isChild={true}
              {...renderProps}
            />
          ))}
        </SectionBlock>
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
        <p className="blog-editor-card-hint">
          해시태그는 제목, 소제목, 본문에서 실제로 언급된 핵심 키워드를 우선 추출합니다.
          부족한 경우에만 글 유형별 추천 태그를 보충합니다.
          검색 노출을 위해 10~18개 정도를 권장합니다.
        </p>
        <textarea
          className="blog-section-textarea"
          value={parsed.hashtags}
          onChange={(e) => update({ hashtags: e.target.value })}
        />
        {suggestedHashtags.length > 0 && (
          <div className="hashtag-suggested">
            <span className="hashtag-suggested-label">추천 태그</span>
            <div className="hashtag-suggested-chips">
              {suggestedHashtags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="hashtag-chip"
                  onClick={() => appendHashtag(tag)}
                  title="클릭하면 적용 태그에 추가됩니다"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
