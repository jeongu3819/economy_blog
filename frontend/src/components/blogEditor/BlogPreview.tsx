import React from 'react'
import { BodySection, ContentBlock, ParsedBlog } from '../../utils/blogParser'
import {
  KeywordRule,
  escapeHtml,
  getParagraphClassByBlogType,
  highlightTextHtml,
} from '../../utils/keywordHighlighter'
import {
  formatTextForMobileCenter,
  getMobileLineBreakOptions,
  isClosingSection,
  shouldUseParagraphBox,
  MobileBlockType,
} from '../../utils/mobileLineBreaker'

export interface MobileFormatOptions {
  enabled: boolean
  maxCharsPerLine?: number
}

interface BlogPreviewProps {
  parsed: ParsedBlog
  rules: KeywordRule[]
  mobileFormat?: MobileFormatOptions
}

function sectionClass(type: string): string {
  return type ? `section-${type}` : ''
}

function paragraphBoxClass(
  text: string,
  blogType: ParsedBlog['blogType'],
  sectionHeading: string,
  indexInSection: number,
): string {
  if (isClosingSection(sectionHeading)) return ''
  if (!shouldUseParagraphBox(text, sectionHeading, indexInSection)) return ''
  const cls = getParagraphClassByBlogType(text, blogType)
  if (cls === 'paragraph-risk' || cls === 'paragraph-caution') {
    return 'paragraph-soft-caution'
  }
  return 'paragraph-soft-note'
}

function formatText(
  text: string,
  blogType: ParsedBlog['blogType'],
  blockType: MobileBlockType,
  mobileFormat: MobileFormatOptions,
): string {
  if (!mobileFormat.enabled) return text
  const opts = getMobileLineBreakOptions(blogType, blockType)
  const max = mobileFormat.maxCharsPerLine
    ? Math.min(opts.maxCharsPerLine, mobileFormat.maxCharsPerLine)
    : opts.maxCharsPerLine
  return formatTextForMobileCenter(text, {
    maxCharsPerLine: max,
    maxLinesPerParagraph: opts.maxLinesPerParagraph,
  })
}

function highlightWithBreaks(text: string, rules: KeywordRule[]): string {
  return text
    .split('\n')
    .map((segment) => highlightTextHtml(segment, rules))
    .join('<br/>')
}

function splitParagraphs(formatted: string): string[] {
  return formatted.split(/\n{2,}/).filter((p) => p.length > 0)
}

function renderParagraphElements(
  formatted: string,
  rules: KeywordRule[],
  className: string,
  keyPrefix: string,
): React.ReactNode[] {
  const paragraphs = splitParagraphs(formatted)
  return paragraphs.map((p, i) => (
    <p
      key={`${keyPrefix}-${i}`}
      className={className}
      dangerouslySetInnerHTML={{ __html: highlightWithBreaks(p, rules) }}
    />
  ))
}

function renderBlock(
  block: ContentBlock,
  rules: KeywordRule[],
  blogType: ParsedBlog['blogType'],
  sectionHeading: string,
  indexInSection: number,
  mobileFormat: MobileFormatOptions,
  key: number,
) {
  if (typeof block === 'string') {
    const boxCls = paragraphBoxClass(block, blogType, sectionHeading, indexInSection)
    const formatted = formatText(block, blogType, 'paragraph', mobileFormat)
    const className = `blog-preview-paragraph ${boxCls}`.trim()
    const paragraphs = splitParagraphs(formatted)
    return (
      <React.Fragment key={key}>
        {paragraphs.map((p, i) => (
          <p
            key={`${key}-${i}`}
            className={className}
            dangerouslySetInnerHTML={{ __html: highlightWithBreaks(p, rules) }}
          />
        ))}
      </React.Fragment>
    )
  }
  if (block.type === 'ordered-list') {
    return (
      <ol key={key} className="blog-preview-ordered-list">
        {block.items.map((item, i) => {
          const formatted = formatText(item, blogType, 'list-item', mobileFormat)
          const html = highlightWithBreaks(formatted, rules)
          return <li key={i} dangerouslySetInnerHTML={{ __html: html }} />
        })}
      </ol>
    )
  }
  if (block.type === 'quote') {
    const formatted = formatText(block.content, blogType, 'quote', mobileFormat)
    const html = highlightWithBreaks(formatted, rules)
    return (
      <div
        key={key}
        className="blog-preview-quote"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }
  return null
}

function renderHeadingHighlight(formatted: string): React.ReactNode {
  const escaped = escapeHtml(formatted).replace(/\n/g, '<br/>')
  return (
    <span
      className="blog-highlight-heading"
      dangerouslySetInnerHTML={{ __html: escaped }}
    />
  )
}

function renderSection(
  section: BodySection,
  rules: KeywordRule[],
  blogType: ParsedBlog['blogType'],
  mobileFormat: MobileFormatOptions,
) {
  const headingFormatted = formatText(
    section.heading,
    blogType,
    'section-title',
    mobileFormat,
  )
  return (
    <div key={section.id} className={`blog-preview-section ${sectionClass(section.type)}`}>
      <h2 className="blog-preview-section-title">
        {renderHeadingHighlight(headingFormatted)}
      </h2>
      {section.paragraphs.map((p, idx) =>
        renderBlock(p, rules, blogType, section.heading, idx, mobileFormat, idx),
      )}
      {section.children.map((child) => {
        const childHeadingFormatted = formatText(
          child.heading,
          blogType,
          'subsection-title',
          mobileFormat,
        )
        return (
          <div key={child.id} className="blog-preview-subsection">
            <h3 className="blog-preview-subsection-title">
              {renderHeadingHighlight(childHeadingFormatted)}
            </h3>
            {child.paragraphs.map((p, idx) =>
              renderBlock(p, rules, blogType, child.heading, idx, mobileFormat, idx),
            )}
          </div>
        )
      })}
    </div>
  )
}

const DEFAULT_MOBILE_FORMAT: MobileFormatOptions = { enabled: true }

export default function BlogPreview({
  parsed,
  rules,
  mobileFormat = DEFAULT_MOBILE_FORMAT,
}: BlogPreviewProps): React.JSX.Element {
  const blogType = parsed.blogType
  const titleFormatted = parsed.selectedTitle
    ? formatText(parsed.selectedTitle, blogType, 'title', mobileFormat)
    : ''
  const introFormatted = parsed.selectedIntro
    ? formatText(parsed.selectedIntro, blogType, 'intro', mobileFormat)
    : ''
  const introQuoteFormatted = parsed.introQuote
    ? formatText(parsed.introQuote, blogType, 'quote', mobileFormat)
    : ''
  const hashtagFormatted = parsed.hashtags
    ? formatText(parsed.hashtags, blogType, 'hashtag', mobileFormat)
    : ''
  const disclaimerFormatted = parsed.disclaimer
    ? formatText(parsed.disclaimer, blogType, 'disclaimer', mobileFormat)
    : ''

  return (
    <div className="blog-editor-card">
      <h2 className="blog-editor-card-title">3. 미리보기</h2>
      <p className="blog-editor-card-hint">
        HTML 형식 복사가 정상 적용되지 않으면, 오른쪽 미리보기 영역을 마우스로 드래그해서 직접 복사한 뒤 네이버 블로그에 붙여넣으세요.
      </p>
      <div className="blog-preview-shell">
        <div
          id="blog-preview-copy-area"
          className={`blog-preview blog-preview-${blogType}`}
        >
          {titleFormatted && (
            <h1 className="blog-preview-title">
              {renderHeadingHighlight(titleFormatted)}
            </h1>
          )}
          {parsed.analysisDate && (
            <p className="blog-preview-date">분석 날짜: {parsed.analysisDate}</p>
          )}
          {introFormatted &&
            renderParagraphElements(introFormatted, rules, 'blog-preview-intro', 'intro')}
          {introQuoteFormatted && (
            <div
              className="blog-preview-quote"
              dangerouslySetInnerHTML={{
                __html: highlightWithBreaks(introQuoteFormatted, rules),
              }}
            />
          )}

          {parsed.bodySections.map((section) => renderSection(section, rules, blogType, mobileFormat))}

          {disclaimerFormatted && (
            <div className="blog-disclaimer-box">
              <strong>⚠️ 투자 주의문구</strong>
              <div
                dangerouslySetInnerHTML={{
                  __html: escapeHtml(disclaimerFormatted)
                    .split(/\n{2,}/)
                    .map((p) => p.replace(/\n/g, '<br/>'))
                    .join('<br/><br/>'),
                }}
              />
            </div>
          )}

          {hashtagFormatted && (
            <p
              className="blog-hashtags"
              dangerouslySetInnerHTML={{
                __html: escapeHtml(hashtagFormatted).replace(/\n/g, '<br/>'),
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
