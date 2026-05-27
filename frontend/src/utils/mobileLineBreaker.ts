import { BlogType } from './blogTypeDetector'

export interface MobileLineBreakOptions {
  maxCharsPerLine?: number
  maxLinesPerParagraph?: number
}

export type MobileBlockType =
  | 'paragraph'
  | 'title'
  | 'section-title'
  | 'subsection-title'
  | 'quote'
  | 'intro'
  | 'list-item'
  | 'hashtag'
  | 'disclaimer'

const SENTENCE_SPLIT_REGEX =
  /(?<=[.!?。]|습니다\.|입니다\.|됩니다\.|합니다\.|했습니다\.|있습니다\.|없습니다\.)\s+/

export function splitKoreanSentences(text: string): string[] {
  return String(text || '')
    .split(SENTENCE_SPLIT_REGEX)
    .map((line) => line.trim())
    .filter(Boolean)
}

function buildSafeTokens(text: string): string[] {
  const raw = text.split(/\s+/).filter(Boolean)
  const tokens: string[] = []
  for (let i = 0; i < raw.length; i++) {
    const cur = raw[i]
    const next = raw[i + 1]
    // Glue "ALPHA NUMERIC" pairs together (e.g. "TRACER 1000")
    if (next && /^[A-Za-z]/.test(cur) && /^\d/.test(next)) {
      tokens.push(`${cur} ${next}`)
      i += 1
      continue
    }
    tokens.push(cur)
  }
  return tokens
}

export function splitSentenceByLength(
  sentence: string,
  maxCharsPerLine = 22,
): string[] {
  const value = String(sentence || '').trim()
  if (!value) return []
  if (value.length <= maxCharsPerLine) return [value]

  const tokens = buildSafeTokens(value)
  const lines: string[] = []
  let current = ''

  for (const token of tokens) {
    const next = current ? `${current} ${token}` : token

    if (next.length > maxCharsPerLine && current) {
      lines.push(current)
      current = token
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines
}

function formatParagraphLines(
  paragraph: string,
  maxCharsPerLine: number,
): string[] {
  const trimmed = paragraph.replace(/[ \t]+/g, ' ').trim()
  if (!trimmed) return []

  // 1. If the user already put manual line breaks inside the paragraph, keep them.
  if (trimmed.includes('\n')) {
    const userLines = trimmed
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    const result: string[] = []
    for (const userLine of userLines) {
      const chunks = splitSentenceByLength(userLine, maxCharsPerLine)
      result.push(...chunks)
    }
    return result
  }

  // 2. Otherwise split into Korean sentences, then split each sentence by length.
  const sentences = splitKoreanSentences(trimmed)
  const result: string[] = []
  for (const sentence of sentences) {
    const chunks = splitSentenceByLength(sentence, maxCharsPerLine)
    result.push(...chunks)
  }
  return result
}

export function formatTextForMobileCenter(
  text: string,
  options: MobileLineBreakOptions = {},
): string {
  const { maxCharsPerLine = 22, maxLinesPerParagraph = 0 } = options

  if (!text) return ''

  // Split input into paragraphs by blank lines so user-provided paragraph
  // breaks are preserved.
  const paragraphs = String(text)
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) return ''

  const formatted = paragraphs.map((p) => {
    const lines = formatParagraphLines(p, maxCharsPerLine)
    const capped =
      maxLinesPerParagraph > 0 && lines.length > maxLinesPerParagraph
        ? lines.slice(0, maxLinesPerParagraph)
        : lines
    return capped.join('\n')
  })

  return formatted.join('\n\n')
}

export function preserveAndFormatTextForMobile(
  text: string,
  options: MobileLineBreakOptions = {},
): string {
  return formatTextForMobileCenter(text, options)
}

export function getMobileLineBreakOptions(
  blogType: BlogType,
  blockType: MobileBlockType = 'paragraph',
): Required<MobileLineBreakOptions> {
  if (blockType === 'title') {
    return { maxCharsPerLine: 15, maxLinesPerParagraph: 0 }
  }
  if (blockType === 'section-title') {
    return { maxCharsPerLine: 14, maxLinesPerParagraph: 0 }
  }
  if (blockType === 'subsection-title') {
    return { maxCharsPerLine: 14, maxLinesPerParagraph: 0 }
  }
  if (blockType === 'quote') {
    return { maxCharsPerLine: 18, maxLinesPerParagraph: 0 }
  }
  if (blockType === 'intro') {
    return { maxCharsPerLine: 20, maxLinesPerParagraph: 0 }
  }
  if (blockType === 'list-item') {
    return { maxCharsPerLine: 22, maxLinesPerParagraph: 0 }
  }
  if (blockType === 'hashtag') {
    return { maxCharsPerLine: 28, maxLinesPerParagraph: 0 }
  }
  if (blockType === 'disclaimer') {
    return { maxCharsPerLine: 22, maxLinesPerParagraph: 0 }
  }

  if (blogType === 'stock-analysis') {
    return { maxCharsPerLine: 22, maxLinesPerParagraph: 0 }
  }
  if (blogType === 'project-introduction') {
    return { maxCharsPerLine: 22, maxLinesPerParagraph: 0 }
  }
  return { maxCharsPerLine: 22, maxLinesPerParagraph: 0 }
}

const CLOSING_HEADINGS = ['종합정리', '종합 정리', '마무리', '결론']

export function isClosingSection(heading: string | undefined | null): boolean {
  const value = String(heading || '')
  return CLOSING_HEADINGS.some((keyword) => value.includes(keyword))
}

const KEY_PARAGRAPH_PATTERNS = [
  '가장 중요한 최신 뉴스는',
  '핵심은',
  '중요한 점은',
]

export function shouldUseParagraphBox(
  text: string,
  sectionHeading: string,
  indexInSection: number,
): boolean {
  const value = String(text || '')
  const heading = String(sectionHeading || '')

  if (isClosingSection(heading)) return false

  if (heading.includes('오늘의 핵심') && indexInSection === 0) return true

  return KEY_PARAGRAPH_PATTERNS.some((keyword) => value.includes(keyword))
}
