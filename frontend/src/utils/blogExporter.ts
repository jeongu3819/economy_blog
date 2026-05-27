import { ParsedBlog, BodySection, ContentBlock } from './blogParser'
import { BlogType } from './blogTypeDetector'
import {
  KeywordRule,
  escapeHtml,
  getParagraphClassByBlogType,
  highlightTextInline,
} from './keywordHighlighter'
import {
  BLOG_WRAPPER_INLINE_STYLE,
  DATE_INLINE_STYLE,
  DISCLAIMER_INLINE_STYLE,
  HASHTAG_INLINE_STYLE,
  HEADING_HIGHLIGHT_INLINE_STYLE,
  INTRO_INLINE_STYLES,
  ORDERED_LIST_INLINE_STYLE,
  ORDERED_LIST_ITEM_INLINE_STYLE,
  PARAGRAPH_INLINE_STYLES,
  PARAGRAPH_SOFT_CAUTION_INLINE_STYLE,
  PARAGRAPH_SOFT_NOTE_INLINE_STYLE,
  QUOTE_INLINE_STYLE,
  SECTION_TITLE_INLINE_STYLES,
  SUBSECTION_TITLE_INLINE_STYLES,
  TITLE_INLINE_STYLES,
} from './blogTheme'
import {
  formatTextForMobileCenter,
  getMobileLineBreakOptions,
  isClosingSection,
  shouldUseParagraphBox,
} from './mobileLineBreaker'

export interface ExportHtmlOptions {
  mobileFormat?: boolean
  maxCharsPerLine?: number
}

function paragraphStyle(text: string, blogType: BlogType, sectionHeading: string, indexInSection: number): string {
  const cls = getParagraphClassByBlogType(text, blogType)
  if (isClosingSection(sectionHeading)) return PARAGRAPH_INLINE_STYLES.base
  if (!shouldUseParagraphBox(text, sectionHeading, indexInSection)) {
    return PARAGRAPH_INLINE_STYLES.base
  }
  if (cls === 'paragraph-risk' || cls === 'paragraph-caution') {
    return PARAGRAPH_SOFT_CAUTION_INLINE_STYLE
  }
  return PARAGRAPH_SOFT_NOTE_INLINE_STYLE
}

function sectionTitleStyle(type: string): string {
  return SECTION_TITLE_INLINE_STYLES[type] || SECTION_TITLE_INLINE_STYLES.base
}

function subsectionTitleStyle(blogType: BlogType): string {
  return SUBSECTION_TITLE_INLINE_STYLES[blogType] || SUBSECTION_TITLE_INLINE_STYLES.base
}

function titleStyle(blogType: BlogType): string {
  return TITLE_INLINE_STYLES[blogType] || TITLE_INLINE_STYLES.base
}

function introStyle(blogType: BlogType): string {
  return INTRO_INLINE_STYLES[blogType] || INTRO_INLINE_STYLES.base
}

function applyMobileFormat(
  text: string,
  blogType: BlogType,
  blockType: Parameters<typeof getMobileLineBreakOptions>[1],
  options: ExportHtmlOptions,
): string {
  if (!options.mobileFormat) return text
  const opts = getMobileLineBreakOptions(blogType, blockType)
  const max = options.maxCharsPerLine
    ? Math.min(opts.maxCharsPerLine, options.maxCharsPerLine)
    : opts.maxCharsPerLine
  return formatTextForMobileCenter(text, {
    maxCharsPerLine: max,
    maxLinesPerParagraph: opts.maxLinesPerParagraph,
  })
}

function inlineHighlightWithBreaks(
  text: string,
  rules: KeywordRule[],
): string {
  const segments = text.split('\n')
  return segments
    .map((segment) => highlightTextInline(segment, rules))
    .join('<br/>')
}

function renderHeadingHtml(formatted: string): string {
  const inner = escapeHtml(formatted).replace(/\n/g, '<br/>')
  return `<span style="${HEADING_HIGHLIGHT_INLINE_STYLE}">${inner}</span>`
}

function renderMultiParagraphHtml(
  formatted: string,
  rules: KeywordRule[],
  paragraphStyleStr: string,
): string {
  const paragraphs = formatted.split(/\n{2,}/)
  return paragraphs
    .map((p) => {
      const html = inlineHighlightWithBreaks(p, rules)
      return `<p style="${paragraphStyleStr}">${html}</p>`
    })
    .join('\n')
}

function renderContentBlock(
  block: ContentBlock,
  rules: KeywordRule[],
  blogType: BlogType,
  sectionHeading: string,
  indexInSection: number,
  options: ExportHtmlOptions,
): string {
  if (typeof block === 'string') {
    const formatted = applyMobileFormat(block, blogType, 'paragraph', options)
    const styleStr = paragraphStyle(block, blogType, sectionHeading, indexInSection)
    return renderMultiParagraphHtml(formatted, rules, styleStr)
  }
  if (block.type === 'ordered-list') {
    const items = block.items
      .map((item) => {
        const formatted = applyMobileFormat(item, blogType, 'list-item', options)
        const html = inlineHighlightWithBreaks(formatted, rules)
        return `<li style="${ORDERED_LIST_ITEM_INLINE_STYLE}">${html}</li>`
      })
      .join('')
    return `<ol style="${ORDERED_LIST_INLINE_STYLE}">${items}</ol>`
  }
  if (block.type === 'quote') {
    const formatted = applyMobileFormat(block.content, blogType, 'quote', options)
    const html = inlineHighlightWithBreaks(formatted, rules)
    return `<div style="${QUOTE_INLINE_STYLE}">${html}</div>`
  }
  return ''
}

function renderSection(
  section: BodySection,
  rules: KeywordRule[],
  blogType: BlogType,
  options: ExportHtmlOptions,
): string {
  const headingFormatted = applyMobileFormat(section.heading, blogType, 'section-title', options)
  const titleHtml = `<h2 style="${sectionTitleStyle(section.type)}">${renderHeadingHtml(headingFormatted)}</h2>`
  const paragraphsHtml = section.paragraphs
    .map((p, idx) => renderContentBlock(p, rules, blogType, section.heading, idx, options))
    .join('\n')
  const childrenHtml = section.children
    .map((child) => renderSubsection(child, rules, blogType, options))
    .join('\n')
  const parts = [titleHtml]
  if (paragraphsHtml) parts.push(paragraphsHtml)
  if (childrenHtml) parts.push(childrenHtml)
  return parts.join('\n')
}

function renderSubsection(
  section: BodySection,
  rules: KeywordRule[],
  blogType: BlogType,
  options: ExportHtmlOptions,
): string {
  const headingFormatted = applyMobileFormat(section.heading, blogType, 'subsection-title', options)
  const titleHtml = `<h3 style="${subsectionTitleStyle(blogType)}">${renderHeadingHtml(headingFormatted)}</h3>`
  const paragraphsHtml = section.paragraphs
    .map((p, idx) => renderContentBlock(p, rules, blogType, section.heading, idx, options))
    .join('\n')
  return paragraphsHtml ? `${titleHtml}\n${paragraphsHtml}` : titleHtml
}

export function exportToHtml(
  parsed: ParsedBlog,
  rules: KeywordRule[],
  options: ExportHtmlOptions = { mobileFormat: true },
): string {
  const blogType = parsed.blogType
  const parts: string[] = []
  parts.push(`<div class="naver-blog-post" style="${BLOG_WRAPPER_INLINE_STYLE}">`)

  if (parsed.selectedTitle) {
    const formatted = applyMobileFormat(parsed.selectedTitle, blogType, 'title', options)
    parts.push(`  <h1 style="${titleStyle(blogType)}">${renderHeadingHtml(formatted)}</h1>`)
  }
  if (parsed.analysisDate) {
    parts.push(`  <p style="${DATE_INLINE_STYLE}">분석 날짜: ${escapeHtml(parsed.analysisDate)}</p>`)
  }
  if (parsed.selectedIntro) {
    const formatted = applyMobileFormat(parsed.selectedIntro, blogType, 'intro', options)
    const inner = renderMultiParagraphHtml(formatted, rules, introStyle(blogType))
    parts.push(`  ${inner}`)
  }
  if (parsed.introQuote) {
    const formatted = applyMobileFormat(parsed.introQuote, blogType, 'quote', options)
    const html = inlineHighlightWithBreaks(formatted, rules)
    parts.push(`  <div style="${QUOTE_INLINE_STYLE}">${html}</div>`)
  }

  for (const section of parsed.bodySections) {
    parts.push('  ' + renderSection(section, rules, blogType, options).split('\n').join('\n  '))
  }

  if (parsed.disclaimer) {
    const formatted = applyMobileFormat(parsed.disclaimer, blogType, 'disclaimer', options)
    const text = escapeHtml(formatted)
      .split(/\n{2,}/)
      .map((p) => p.replace(/\n/g, '<br/>'))
      .join('<br/><br/>')
    parts.push(
      `  <div style="${DISCLAIMER_INLINE_STYLE}"><strong>⚠️ 투자 주의문구</strong><br/>${text}</div>`,
    )
  }

  if (parsed.hashtags) {
    const formatted = applyMobileFormat(parsed.hashtags, blogType, 'hashtag', options)
    const html = escapeHtml(formatted).replace(/\n/g, '<br/>')
    parts.push(`  <p style="${HASHTAG_INLINE_STYLE}">${html}</p>`)
  }

  parts.push('</div>')
  return parts.join('\n')
}

function contentBlockToMarkdown(block: ContentBlock): string {
  if (typeof block === 'string') return block
  if (block.type === 'ordered-list') {
    return block.items.map((item, idx) => `${idx + 1}. ${item}`).join('\n')
  }
  if (block.type === 'quote') return `> ${block.content}`
  return ''
}

function contentBlockToPlainText(block: ContentBlock): string {
  if (typeof block === 'string') return block
  if (block.type === 'ordered-list') {
    return block.items.map((item, idx) => `${idx + 1}. ${item}`).join('\n')
  }
  if (block.type === 'quote') return block.content
  return ''
}

export function exportToMarkdown(parsed: ParsedBlog): string {
  const lines: string[] = []
  if (parsed.selectedTitle) lines.push(`# ${parsed.selectedTitle}`, '')
  if (parsed.analysisDate) lines.push(`분석 날짜: ${parsed.analysisDate}`, '')
  if (parsed.selectedIntro) lines.push(parsed.selectedIntro, '')
  if (parsed.introQuote) lines.push(`> ${parsed.introQuote}`, '')
  for (const section of parsed.bodySections) {
    lines.push(`## ${section.heading}`, '')
    for (const p of section.paragraphs) {
      lines.push(contentBlockToMarkdown(p), '')
    }
    for (const child of section.children) {
      lines.push(`### ${child.heading}`, '')
      for (const p of child.paragraphs) {
        lines.push(contentBlockToMarkdown(p), '')
      }
    }
  }
  if (parsed.disclaimer) {
    const quoted = parsed.disclaimer
      .split('\n')
      .map((l) => (l.trim() ? `> ${l}` : '>'))
      .join('\n')
    lines.push(quoted, '')
  }
  if (parsed.hashtags) lines.push(parsed.hashtags, '')
  return lines.join('\n').trim() + '\n'
}

export function exportToPlainText(parsed: ParsedBlog): string {
  const lines: string[] = []
  if (parsed.selectedTitle) lines.push(parsed.selectedTitle, '')
  if (parsed.analysisDate) lines.push(`분석 날짜: ${parsed.analysisDate}`, '')
  if (parsed.selectedIntro) lines.push(parsed.selectedIntro, '')
  if (parsed.introQuote) lines.push(parsed.introQuote, '')
  for (const section of parsed.bodySections) {
    lines.push(`[${section.heading}]`, '')
    for (const p of section.paragraphs) {
      lines.push(contentBlockToPlainText(p), '')
    }
    for (const child of section.children) {
      lines.push(`<${child.heading}>`, '')
      for (const p of child.paragraphs) {
        lines.push(contentBlockToPlainText(p), '')
      }
    }
  }
  if (parsed.disclaimer) {
    lines.push('※ 투자 주의문구', parsed.disclaimer, '')
  }
  if (parsed.hashtags) lines.push(parsed.hashtags)
  return lines.join('\n').trim() + '\n'
}
