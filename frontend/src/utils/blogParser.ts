export interface IntroCandidate {
  label: string
  content: string
}

export interface BodySection {
  id: string
  heading: string
  type: string
  paragraphs: string[]
}

export interface ParsedBlog {
  titleCandidates: string[]
  selectedTitle: string
  introCandidates: IntroCandidate[]
  selectedIntro: string
  analysisDate: string
  bodyTitle: string
  bodySections: BodySection[]
  disclaimer: string
  hashtags: string
}

const DISCLAIMER_KEYWORDS = [
  '투자 권유',
  '투자 판단',
  '투자 책임',
  '정보 제공 목적',
  '매수 추천',
  '참고용',
  '책임은 투자자 본인',
  '상장 유지 리스크',
]

function emptyParsed(): ParsedBlog {
  return {
    titleCandidates: [],
    selectedTitle: '',
    introCandidates: [],
    selectedIntro: '',
    analysisDate: '',
    bodyTitle: '',
    bodySections: [],
    disclaimer: '',
    hashtags: '',
  }
}

interface TopBlock {
  heading: string
  body: string
}

function splitTopLevel(rawText: string): TopBlock[] {
  const lines = rawText.split('\n')
  const blocks: TopBlock[] = []
  let current: { heading: string; body: string[] } | null = null

  for (const line of lines) {
    const trimmed = line.trimStart()
    // single # only (not ##)
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      if (current) {
        blocks.push({ heading: current.heading, body: current.body.join('\n') })
      }
      current = { heading: trimmed.slice(2).trim(), body: [] }
    } else {
      if (current) current.body.push(line)
    }
  }
  if (current) {
    blocks.push({ heading: current.heading, body: current.body.join('\n') })
  }
  return blocks
}

function parseNumberedList(body: string): string[] {
  const result: string[] = []
  for (const line of body.split('\n')) {
    const m = /^\s*\d+\.\s+(.+)$/.exec(line)
    if (m) result.push(m[1].trim())
  }
  return result
}

function parseIntroBlocks(body: string): IntroCandidate[] {
  const lines = body.split('\n')
  const result: IntroCandidate[] = []
  let current: { label: string; content: string[] } | null = null

  const flush = () => {
    if (!current) return
    const content = current.content.join('\n').replace(/^\n+|\n+$/g, '').trim()
    result.push({ label: current.label, content })
    current = null
  }

  for (const line of lines) {
    const trimmed = line.trim()
    const m = /^##\s+(.+)$/.exec(trimmed)
    if (m) {
      flush()
      current = { label: m[1].trim(), content: [] }
    } else {
      if (current && trimmed !== '---') {
        current.content.push(line)
      }
    }
  }
  flush()
  return result
}

function isDisclaimerHeading(heading: string): boolean {
  return heading.includes('주의문구') || heading.includes('주의 문구') || heading.includes('Disclaimer')
}

function looksLikeDisclaimerText(text: string): boolean {
  return DISCLAIMER_KEYWORDS.some((k) => text.includes(k))
}

export function getSectionType(heading: string): string {
  if (heading.includes('핵심')) return 'summary'
  if (heading.includes('기업 개요')) return 'company'
  if (heading.includes('공시')) return 'filing'
  if (heading.includes('공매도')) return 'short'
  if (heading.includes('트레이더')) return 'trader'
  if (heading.includes('긍정')) return 'positive'
  if (heading.includes('리스크')) return 'risk'
  if (heading.includes('종합') || heading.includes('정리')) return 'final'
  if (heading.includes('뉴스')) return 'news'
  return ''
}

interface ParsedBody {
  analysisDate: string
  sections: BodySection[]
  disclaimer: string
}

function parseBody(bodyText: string): ParsedBody {
  const lines = bodyText.split('\n')
  const sections: BodySection[] = []
  let analysisDate = ''
  let disclaimer = ''

  let currentSection: BodySection | null = null
  let currentParagraphLines: string[] = []
  let sectionCounter = 0

  const flushParagraph = () => {
    if (currentParagraphLines.length === 0) return
    const p = currentParagraphLines.join(' ').trim()
    if (p && currentSection) currentSection.paragraphs.push(p)
    currentParagraphLines = []
  }

  const flushSection = () => {
    flushParagraph()
    if (!currentSection) return
    const headingDisclaimer = isDisclaimerHeading(currentSection.heading)
    const bodyDisclaimer =
      currentSection.paragraphs.length > 0 &&
      currentSection.paragraphs.every(looksLikeDisclaimerText)
    if (headingDisclaimer || bodyDisclaimer) {
      const text = currentSection.paragraphs.join('\n\n').trim()
      disclaimer = disclaimer ? `${disclaimer}\n\n${text}` : text
    } else {
      sections.push(currentSection)
    }
    currentSection = null
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === '---') {
      flushParagraph()
      continue
    }

    const dateMatch = /^분석\s*날짜\s*[:：]\s*(.+)$/.exec(trimmed)
    if (dateMatch && !currentSection) {
      analysisDate = dateMatch[1].trim()
      continue
    }

    const headingMatch = /^##\s+(.+)$/.exec(trimmed)
    if (headingMatch) {
      flushSection()
      sectionCounter += 1
      const heading = headingMatch[1].trim()
      currentSection = {
        id: `section-${sectionCounter}`,
        heading,
        type: getSectionType(heading),
        paragraphs: [],
      }
      continue
    }

    if (trimmed === '') {
      flushParagraph()
    } else {
      currentParagraphLines.push(trimmed)
    }
  }
  flushSection()

  return { analysisDate, sections, disclaimer }
}

function extractHashtags(body: string): string {
  const collected: string[] = []
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed === '---') continue
    if (trimmed.includes('#')) {
      const tags = trimmed.match(/#[^\s#]+/g)
      if (tags) collected.push(...tags)
    }
  }
  return collected.join(' ')
}

export function parseBlogDraft(rawText: string): ParsedBlog {
  if (!rawText || !rawText.trim()) return emptyParsed()

  const blocks = splitTopLevel(rawText)
  const result = emptyParsed()

  let bodyAnchorIndex = -1

  for (let i = 0; i < blocks.length; i++) {
    const { heading, body } = blocks[i]

    if (heading.includes('제목 후보')) {
      result.titleCandidates = parseNumberedList(body)
      continue
    }

    if (heading.includes('도입부 후보')) {
      result.introCandidates = parseIntroBlocks(body)
      continue
    }

    if (heading.includes('본문 초안') || heading.includes('네이버 블로그 본문')) {
      bodyAnchorIndex = i
      // body of the "본문 초안" block itself may be empty (the real body title is the next block).
      // But if it isn't empty, parse it too.
      if (body.trim()) {
        const parsed = parseBody(body)
        if (parsed.analysisDate) result.analysisDate = parsed.analysisDate
        if (parsed.disclaimer) result.disclaimer = parsed.disclaimer
        if (parsed.sections.length) result.bodySections = parsed.sections
      }
      continue
    }

    if (heading.includes('해시태그')) {
      result.hashtags = extractHashtags(body)
      continue
    }

    // First # block right after "본문 초안" with another heading is the body title.
    if (bodyAnchorIndex >= 0 && i === bodyAnchorIndex + 1 && !result.bodyTitle) {
      result.bodyTitle = heading
      const parsed = parseBody(body)
      result.analysisDate = parsed.analysisDate || result.analysisDate
      result.disclaimer = parsed.disclaimer || result.disclaimer
      if (parsed.sections.length) result.bodySections = parsed.sections
    }
  }

  result.selectedTitle = result.titleCandidates[0] || result.bodyTitle || ''
  result.selectedIntro = result.introCandidates[0]?.content || ''

  return result
}
