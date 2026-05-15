import { ParsedBlog, BodySection } from './blogParser'
import { KeywordRule, escapeHtml, getParagraphClass, highlightTextInline } from './keywordHighlighter'
import {
  DATE_INLINE_STYLE,
  DISCLAIMER_INLINE_STYLE,
  HASHTAG_INLINE_STYLE,
  INTRO_INLINE_STYLE,
  PARAGRAPH_INLINE_STYLES,
  SECTION_TITLE_INLINE_STYLES,
  TITLE_INLINE_STYLE,
} from './blogTheme'

function paragraphStyle(text: string): string {
  const cls = getParagraphClass(text)
  if (cls && PARAGRAPH_INLINE_STYLES[cls]) {
    return `${PARAGRAPH_INLINE_STYLES.base}${PARAGRAPH_INLINE_STYLES[cls]}`
  }
  return PARAGRAPH_INLINE_STYLES.base
}

function sectionTitleStyle(type: string): string {
  return SECTION_TITLE_INLINE_STYLES[type] || SECTION_TITLE_INLINE_STYLES.base
}

function renderParagraph(text: string, rules: KeywordRule[]): string {
  const inner = highlightTextInline(text, rules)
  return `<p style="${paragraphStyle(text)}">${inner}</p>`
}

function renderSection(section: BodySection, rules: KeywordRule[]): string {
  const titleHtml = `<h2 style="${sectionTitleStyle(section.type)}">${escapeHtml(section.heading)}</h2>`
  const paragraphsHtml = section.paragraphs.map((p) => renderParagraph(p, rules)).join('\n')
  return `${titleHtml}\n${paragraphsHtml}`
}

export function exportToHtml(parsed: ParsedBlog, rules: KeywordRule[]): string {
  const parts: string[] = []
  parts.push('<div class="naver-blog-post" style="font-family:\'Apple SD Gothic Neo\',\'Malgun Gothic\',sans-serif;color:#1f2937;line-height:1.82;">')

  if (parsed.selectedTitle) {
    parts.push(`  <h1 style="${TITLE_INLINE_STYLE}">${escapeHtml(parsed.selectedTitle)}</h1>`)
  }
  if (parsed.analysisDate) {
    parts.push(`  <p style="${DATE_INLINE_STYLE}">분석 날짜: ${escapeHtml(parsed.analysisDate)}</p>`)
  }
  if (parsed.selectedIntro) {
    const introHtml = highlightTextInline(parsed.selectedIntro, rules).replace(/\n+/g, '<br/>')
    parts.push(`  <div style="${INTRO_INLINE_STYLE}">${introHtml}</div>`)
  }

  for (const section of parsed.bodySections) {
    parts.push('  ' + renderSection(section, rules).split('\n').join('\n  '))
  }

  if (parsed.disclaimer) {
    const text = escapeHtml(parsed.disclaimer).replace(/\n+/g, '<br/>')
    parts.push(`  <div style="${DISCLAIMER_INLINE_STYLE}"><strong>⚠️ 투자 주의문구</strong><br/>${text}</div>`)
  }

  if (parsed.hashtags) {
    parts.push(`  <p style="${HASHTAG_INLINE_STYLE}">${escapeHtml(parsed.hashtags)}</p>`)
  }

  parts.push('</div>')
  return parts.join('\n')
}

export function exportToMarkdown(parsed: ParsedBlog): string {
  const lines: string[] = []
  if (parsed.selectedTitle) lines.push(`# ${parsed.selectedTitle}`, '')
  if (parsed.analysisDate) lines.push(`분석 날짜: ${parsed.analysisDate}`, '')
  if (parsed.selectedIntro) {
    lines.push(parsed.selectedIntro, '')
  }
  for (const section of parsed.bodySections) {
    lines.push(`## ${section.heading}`, '')
    for (const p of section.paragraphs) {
      lines.push(p, '')
    }
  }
  if (parsed.disclaimer) {
    const quoted = parsed.disclaimer
      .split('\n')
      .map((l) => (l.trim() ? `> ${l}` : '>'))
      .join('\n')
    lines.push(quoted, '')
  }
  if (parsed.hashtags) {
    lines.push(parsed.hashtags, '')
  }
  return lines.join('\n').trim() + '\n'
}

export function exportToPlainText(parsed: ParsedBlog): string {
  const lines: string[] = []
  if (parsed.selectedTitle) lines.push(parsed.selectedTitle, '')
  if (parsed.analysisDate) lines.push(`분석 날짜: ${parsed.analysisDate}`, '')
  if (parsed.selectedIntro) lines.push(parsed.selectedIntro, '')
  for (const section of parsed.bodySections) {
    lines.push(`[${section.heading}]`, '')
    for (const p of section.paragraphs) {
      lines.push(p, '')
    }
  }
  if (parsed.disclaimer) {
    lines.push('※ 투자 주의문구', parsed.disclaimer, '')
  }
  if (parsed.hashtags) lines.push(parsed.hashtags)
  return lines.join('\n').trim() + '\n'
}
