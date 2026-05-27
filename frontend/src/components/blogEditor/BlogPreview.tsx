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
    const html = highlightWithBreaks(formatted, rules)
    return (
      <p
        key={key}
        className={`blog-preview-paragraph ${boxCls}`.trim()}
        dangerouslySetInnerHTML={{ __html: html }}
      />
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

function renderSectionHeading(
  heading: string,
  blogType: ParsedBlog['blogType'],
  mobileFormat: MobileFormatOptions,
): React.ReactNode {
  const formatted = formatText(heading, blogType, 'section-title', mobileFormat)
  const escaped = escapeHtml(formatted)
  return (
    <>
      <span dangerouslySetInnerHTML={{ __html: escaped.replace(/\n/g, '<br/>') }} />
      <span className="blog-preview-section-title-accent" aria-hidden="true" />
    </>
  )
}

function renderSubsectionHeading(
  heading: string,
  blogType: ParsedBlog['blogType'],
  mobileFormat: MobileFormatOptions,
): React.ReactNode {
  const formatted = formatText(heading, blogType, 'subsection-title', mobileFormat)
  const escaped = escapeHtml(formatted)
  return <span dangerouslySetInnerHTML={{ __html: escaped.replace(/\n/g, '<br/>') }} />
}

function renderSection(
  section: BodySection,
  rules: KeywordRule[],
  blogType: ParsedBlog['blogType'],
  mobileFormat: MobileFormatOptions,
) {
  return (
    <div key={section.id} className={`blog-preview-section ${sectionClass(section.type)}`}>
      <h2 className="blog-preview-section-title">
        {renderSectionHeading(section.heading, blogType, mobileFormat)}
      </h2>
      {section.paragraphs.map((p, idx) =>
        renderBlock(p, rules, blogType, section.heading, idx, mobileFormat, idx),
      )}
      {section.children.map((child) => (
        <div key={child.id} className="blog-preview-subsection">
          <h3 className="blog-preview-subsection-title">
            {renderSubsectionHeading(child.heading, blogType, mobileFormat)}
          </h3>
          {child.paragraphs.map((p, idx) =>
            renderBlock(p, rules, blogType, child.heading, idx, mobileFormat, idx),
          )}
        </div>
      ))}
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
            <h1
              className="blog-preview-title"
              dangerouslySetInnerHTML={{
                __html: escapeHtml(titleFormatted).replace(/\n/g, '<br/>'),
              }}
            />
          )}
          {parsed.analysisDate && (
            <p className="blog-preview-date">분석 날짜: {parsed.analysisDate}</p>
          )}
          {introFormatted && (
            <div
              className="blog-preview-intro"
              dangerouslySetInnerHTML={{
                __html: highlightWithBreaks(introFormatted, rules),
              }}
            />
          )}
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
                  __html: escapeHtml(disclaimerFormatted).replace(/\n/g, '<br/>'),
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
