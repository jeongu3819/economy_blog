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

export function splitSentenceByLength(
  sentence: string,
  maxCharsPerLine = 22,
): string[] {
  const value = String(sentence || '').trim()
  if (!value) return []
  if (value.length <= maxCharsPerLine) return [value]

  const words = value.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word

    if (next.length > maxCharsPerLine && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  return lines
}

export function formatTextForMobileCenter(
  text: string,
  options: MobileLineBreakOptions = {},
): string {
  const { maxCharsPerLine = 22, maxLinesPerParagraph = 5 } = options

  if (!text) return ''

  const normalized = String(text).replace(/\s+/g, ' ').trim()
  if (!normalized) return ''

  const sentences = splitKoreanSentences(normalized)
  const lines: string[] = []

  for (const sentence of sentences) {
    const chunks = splitSentenceByLength(sentence, maxCharsPerLine)
    lines.push(...chunks)
  }

  if (lines.length === 0) return normalized

  if (maxLinesPerParagraph > 0 && lines.length > maxLinesPerParagraph) {
    return lines.slice(0, maxLinesPerParagraph).join('\n')
  }

  return lines.join('\n')
}

export function getMobileLineBreakOptions(
  blogType: BlogType,
  blockType: MobileBlockType = 'paragraph',
): Required<MobileLineBreakOptions> {
  if (blockType === 'title') {
    return { maxCharsPerLine: 15, maxLinesPerParagraph: 3 }
  }
  if (blockType === 'section-title') {
    return { maxCharsPerLine: 13, maxLinesPerParagraph: 3 }
  }
  if (blockType === 'subsection-title') {
    return { maxCharsPerLine: 14, maxLinesPerParagraph: 3 }
  }
  if (blockType === 'quote') {
    return { maxCharsPerLine: 18, maxLinesPerParagraph: 5 }
  }
  if (blockType === 'intro') {
    return { maxCharsPerLine: 20, maxLinesPerParagraph: 6 }
  }
  if (blockType === 'list-item') {
    return { maxCharsPerLine: 22, maxLinesPerParagraph: 4 }
  }
  if (blockType === 'hashtag') {
    return { maxCharsPerLine: 28, maxLinesPerParagraph: 4 }
  }
  if (blockType === 'disclaimer') {
    return { maxCharsPerLine: 22, maxLinesPerParagraph: 6 }
  }

  if (blogType === 'stock-analysis') {
    return { maxCharsPerLine: 24, maxLinesPerParagraph: 5 }
  }
  if (blogType === 'project-introduction') {
    return { maxCharsPerLine: 22, maxLinesPerParagraph: 5 }
  }
  return { maxCharsPerLine: 22, maxLinesPerParagraph: 5 }
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
