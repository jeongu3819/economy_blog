import { ParsedBlog } from '../../utils/blogParser'
import {
  KeywordRule,
  escapeHtml,
  getParagraphClass,
  highlightTextHtml,
} from '../../utils/keywordHighlighter'

interface BlogPreviewProps {
  parsed: ParsedBlog
  rules: KeywordRule[]
}

function sectionClass(type: string): string {
  return type ? `section-${type}` : ''
}

export default function BlogPreview({ parsed, rules }: BlogPreviewProps): React.JSX.Element {
  return (
    <div className="blog-editor-card">
      <h2 className="blog-editor-card-title">3. 미리보기</h2>
      <div className="blog-preview">
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

        {parsed.bodySections.map((section) => (
          <div key={section.id} className={`blog-preview-section ${sectionClass(section.type)}`}>
            <h2 className="blog-preview-section-title">{section.heading}</h2>
            {section.paragraphs.map((paragraph, idx) => {
              const cls = getParagraphClass(paragraph)
              return (
                <p
                  key={idx}
                  className={`blog-preview-paragraph ${cls}`}
                  dangerouslySetInnerHTML={{ __html: highlightTextHtml(paragraph, rules) }}
                />
              )
            })}
          </div>
        ))}

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
