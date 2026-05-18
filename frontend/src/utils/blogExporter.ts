import { ParsedBlog, BodySection, ContentBlock } from './blogParser'
import { BlogType } from './blogTypeDetector'
import {
  KeywordRule,
  escapeHtml,
  getParagraphClassByBlogType,
  highlightTextInline,
} from './keywordHighlighter'
import {
  DATE_INLINE_STYLE,
  DISCLAIMER_INLINE_STYLE,
  HASHTAG_INLINE_STYLE,
  INTRO_INLINE_STYLES,
  ORDERED_LIST_INLINE_STYLE,
  ORDERED_LIST_ITEM_INLINE_STYLE,
  PARAGRAPH_INLINE_STYLES,
  QUOTE_INLINE_STYLE,
  SECTION_TITLE_INLINE_STYLES,
  SUBSECTION_TITLE_INLINE_STYLES,
  TITLE_INLINE_STYLES,
} from './blogTheme'

function paragraphStyle(text: string, blogType: BlogType): string {
  const cls = getParagraphClassByBlogType(text, blogType)
  if (cls && PARAGRAPH_INLINE_STYLES[cls]) {
    return `${PARAGRAPH_INLINE_STYLES.base}${PARAGRAPH_INLINE_STYLES[cls]}`
  }
  return PARAGRAPH_INLINE_STYLES.base
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

function renderContentBlock(
  block: ContentBlock,
  rules: KeywordRule[],
  blogType: BlogType,
): string {
  if (typeof block === 'string') {
    return `<p style="${paragraphStyle(block, blogType)}">${highlightTextInline(block, rules)}</p>`
  }
  if (block.type === 'ordered-list') {
    const items = block.items
      .map(
        (item) =>
          `<li style="${ORDERED_LIST_ITEM_INLINE_STYLE}">${highlightTextInline(item, rules)}</li>`,
      )
      .join('')
    return `<ol style="${ORDERED_LIST_INLINE_STYLE}">${items}</ol>`
  }
  if (block.type === 'quote') {
    return `<div style="${QUOTE_INLINE_STYLE}">${highlightTextInline(block.content, rules)}</div>`
  }
  return ''
}

function renderSection(
  section: BodySection,
  rules: KeywordRule[],
  blogType: BlogType,
): string {
  const titleHtml = `<h2 style="${sectionTitleStyle(section.type)}">${escapeHtml(section.heading)}</h2>`
  const paragraphsHtml = section.paragraphs.map((p) => renderContentBlock(p, rules, blogType)).join('\n')
  const childrenHtml = section.children
    .map((child) => renderSubsection(child, rules, blogType))
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
): string {
  const titleHtml = `<h3 style="${subsectionTitleStyle(blogType)}">${escapeHtml(section.heading)}</h3>`
  const paragraphsHtml = section.paragraphs.map((p) => renderContentBlock(p, rules, blogType)).join('\n')
  return paragraphsHtml ? `${titleHtml}\n${paragraphsHtml}` : titleHtml
}

export function exportToHtml(parsed: ParsedBlog, rules: KeywordRule[]): string {
  const blogType = parsed.blogType
  const parts: string[] = []
  parts.push(
    '<div class="naver-blog-post" style="font-family:\'Apple SD Gothic Neo\',\'Malgun Gothic\',sans-serif;color:#1f2937;line-height:1.82;">',
  )

  if (parsed.selectedTitle) {
    parts.push(`  <h1 style="${titleStyle(blogType)}">${escapeHtml(parsed.selectedTitle)}</h1>`)
  }
  if (parsed.analysisDate) {
    parts.push(`  <p style="${DATE_INLINE_STYLE}">분석 날짜: ${escapeHtml(parsed.analysisDate)}</p>`)
  }
  if (parsed.selectedIntro) {
    const introHtml = highlightTextInline(parsed.selectedIntro, rules).replace(/\n+/g, '<br/>')
    parts.push(`  <div style="${introStyle(blogType)}">${introHtml}</div>`)
  }
  if (parsed.introQuote) {
    const quoteHtml = highlightTextInline(parsed.introQuote, rules).replace(/\n+/g, '<br/>')
    parts.push(`  <div style="${QUOTE_INLINE_STYLE}">${quoteHtml}</div>`)
  }

  for (const section of parsed.bodySections) {
    parts.push('  ' + renderSection(section, rules, blogType).split('\n').join('\n  '))
  }

  if (parsed.disclaimer) {
    const text = escapeHtml(parsed.disclaimer).replace(/\n+/g, '<br/>')
    parts.push(
      `  <div style="${DISCLAIMER_INLINE_STYLE}"><strong>⚠️ 투자 주의문구</strong><br/>${text}</div>`,
    )
  }

  if (parsed.hashtags) {
    parts.push(`  <p style="${HASHTAG_INLINE_STYLE}">${escapeHtml(parsed.hashtags)}</p>`)
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
