import { BodySection, ContentBlock, ParsedBlog } from '../../utils/blogParser'
import {
  KeywordRule,
  escapeHtml,
  getParagraphClassByBlogType,
  highlightTextHtml,
} from '../../utils/keywordHighlighter'

interface BlogPreviewProps {
  parsed: ParsedBlog
  rules: KeywordRule[]
}

function sectionClass(type: string): string {
  return type ? `section-${type}` : ''
}

function renderBlock(block: ContentBlock, rules: KeywordRule[], blogType: ParsedBlog['blogType'], key: number) {
  if (typeof block === 'string') {
    const cls = getParagraphClassByBlogType(block, blogType)
    return (
      <p
        key={key}
        className={`blog-preview-paragraph ${cls}`}
        dangerouslySetInnerHTML={{ __html: highlightTextHtml(block, rules) }}
      />
    )
  }
  if (block.type === 'ordered-list') {
    return (
      <ol key={key} className="blog-preview-ordered-list">
        {block.items.map((item, i) => (
          <li
            key={i}
            dangerouslySetInnerHTML={{ __html: highlightTextHtml(item, rules) }}
          />
        ))}
      </ol>
    )
  }
  if (block.type === 'quote') {
    return (
      <div
        key={key}
        className="blog-preview-quote"
        dangerouslySetInnerHTML={{ __html: highlightTextHtml(block.content, rules) }}
      />
    )
  }
  return null
}

function renderSection(
  section: BodySection,
  rules: KeywordRule[],
  blogType: ParsedBlog['blogType'],
) {
  return (
    <div key={section.id} className={`blog-preview-section ${sectionClass(section.type)}`}>
      <h2 className="blog-preview-section-title">{section.heading}</h2>
      {section.paragraphs.map((p, idx) => renderBlock(p, rules, blogType, idx))}
      {section.children.map((child) => (
        <div key={child.id} className="blog-preview-subsection">
          <h3 className="blog-preview-subsection-title">{child.heading}</h3>
          {child.paragraphs.map((p, idx) => renderBlock(p, rules, blogType, idx))}
        </div>
      ))}
    </div>
  )
}

export default function BlogPreview({ parsed, rules }: BlogPreviewProps): React.JSX.Element {
  const blogType = parsed.blogType
  return (
    <div className="blog-editor-card">
      <h2 className="blog-editor-card-title">3. 미리보기</h2>
      <p className="blog-editor-card-hint">
        HTML 형식 복사가 정상 적용되지 않으면, 오른쪽 미리보기 영역을 마우스로 드래그해서 직접 복사한 뒤 네이버 블로그에 붙여넣으세요.
      </p>
      <div
        id="blog-preview-copy-area"
        className={`blog-preview blog-preview-${blogType}`}
      >
        {parsed.selectedTitle && (
          <h1 className="blog-preview-title">{parsed.selectedTitle}</h1>
        )}
        {parsed.analysisDate && (
          <p className="blog-preview-date">분석 날짜: {parsed.analysisDate}</p>
        )}
        {parsed.selectedIntro && (
          <div
            className="blog-preview-intro"
            dangerouslySetInnerHTML={{
              __html: highlightTextHtml(parsed.selectedIntro, rules).replace(/\n/g, '<br/>'),
            }}
          />
        )}
        {parsed.introQuote && (
          <div
            className="blog-preview-quote"
            dangerouslySetInnerHTML={{
              __html: highlightTextHtml(parsed.introQuote, rules).replace(/\n/g, '<br/>'),
            }}
          />
        )}

        {parsed.bodySections.map((section) => renderSection(section, rules, blogType))}

        {parsed.disclaimer && (
          <div className="blog-disclaimer-box">
            <strong>⚠️ 투자 주의문구</strong>
            <div
              dangerouslySetInnerHTML={{
                __html: escapeHtml(parsed.disclaimer).replace(/\n/g, '<br/>'),
              }}
            />
          </div>
        )}

        {parsed.hashtags && <p className="blog-hashtags">{parsed.hashtags}</p>}
      </div>
    </div>
  )
}
