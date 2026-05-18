import { BlogType, detectBlogType } from './blogTypeDetector'

export type SourceFormat = 'candidate-based' | 'markdown-article' | 'plain-text'

export interface IntroCandidate {
  label: string
  content: string
}

export interface OrderedListBlock {
  type: 'ordered-list'
  items: string[]
}

export interface QuoteBlock {
  type: 'quote'
  content: string
}

export type ContentBlock = string | OrderedListBlock | QuoteBlock

export interface BodySection {
  id: string
  heading: string
  level: number
  type: string
  paragraphs: ContentBlock[]
  children: BodySection[]
}

export interface ParsedBlog {
  blogType: BlogType
  sourceFormat: SourceFormat
  titleCandidates: string[]
  selectedTitle: string
  introCandidates: IntroCandidate[]
  selectedIntro: string
  introQuote: string
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

export function emptyParsed(): ParsedBlog {
  return {
    blogType: 'general-blog',
    sourceFormat: 'plain-text',
    titleCandidates: [],
    selectedTitle: '',
    introCandidates: [],
    selectedIntro: '',
    introQuote: '',
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

export function getStockSectionType(heading: string): string {
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

export function getProjectSectionType(heading: string): string {
  const v = String(heading || '')
  if (v.includes('왜 만들었나')) return 'problem'
  if (v.includes('전체 구조')) return 'structure'
  if (v.includes('사용 화면')) return 'ui'
  if (v.includes('기술 스택')) return 'tech'
  if (v.includes('핵심')) return 'core'
  if (v.includes('마무리')) return 'project-final'
  return 'project-default'
}

export function getSectionType(heading: string): string {
  return getStockSectionType(heading)
}

export function getSectionTypeByBlogType(heading: string, blogType: BlogType): string {
  if (blogType === 'project-introduction') return getProjectSectionType(heading)
  if (blogType === 'stock-analysis') return getStockSectionType(heading)
  return ''
}

interface ParsedBody {
  analysisDate: string
  sections: BodySection[]
  disclaimer: string
}

function parseCandidateBody(bodyText: string): ParsedBody {
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
      currentSection.paragraphs.every(
        (p) => typeof p === 'string' && looksLikeDisclaimerText(p),
      )
    if (headingDisclaimer || bodyDisclaimer) {
      const text = currentSection.paragraphs
        .filter((p): p is string => typeof p === 'string')
        .join('\n\n')
        .trim()
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
        level: 2,
        type: getStockSectionType(heading),
        paragraphs: [],
        children: [],
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

function parseCandidateBased(rawText: string): ParsedBlog {
  const blocks = splitTopLevel(rawText)
  const result = emptyParsed()
  result.sourceFormat = 'candidate-based'

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
      if (body.trim()) {
        const parsed = parseCandidateBody(body)
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

    if (bodyAnchorIndex >= 0 && i === bodyAnchorIndex + 1 && !result.bodyTitle) {
      result.bodyTitle = heading
      const parsed = parseCandidateBody(body)
      result.analysisDate = parsed.analysisDate || result.analysisDate
      result.disclaimer = parsed.disclaimer || result.disclaimer
      if (parsed.sections.length) result.bodySections = parsed.sections
    }
  }

  result.selectedTitle = result.titleCandidates[0] || result.bodyTitle || ''
  result.selectedIntro = result.introCandidates[0]?.content || ''

  return result
}

function parseSectionBody(bodyLines: string[]): ContentBlock[] {
  const blocks: ContentBlock[] = []
  let buffer: string[] = []
  let listItems: string[] = []

  const flushParagraph = () => {
    if (buffer.length === 0) return
    const text = buffer.join(' ').trim()
    if (text) blocks.push(text)
    buffer = []
  }

  const flushList = () => {
    if (listItems.length === 0) return
    blocks.push({ type: 'ordered-list', items: [...listItems] })
    listItems = []
  }

  for (const raw of bodyLines) {
    const trimmed = raw.trim()
    if (trimmed === '---' || trimmed === '') {
      flushParagraph()
      flushList()
      continue
    }

    const ol = /^(\d+)\.\s+(.+)$/.exec(trimmed)
    if (ol) {
      flushParagraph()
      listItems.push(ol[2].trim())
      continue
    } else if (listItems.length > 0) {
      flushList()
    }

    const q = /^>\s*(.+)$/.exec(trimmed)
    if (q) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'quote', content: q[1].trim() })
      continue
    }

    buffer.push(trimmed)
  }
  flushParagraph()
  flushList()
  return blocks
}

function detectSourceFormat(text: string): SourceFormat {
  if (
    /^#\s+제목 후보/m.test(text) ||
    /^#\s+도입부 후보/m.test(text) ||
    /^#\s+(?:네이버 블로그 )?본문 초안/m.test(text) ||
    /^#\s+해시태그/m.test(text)
  ) {
    return 'candidate-based'
  }
  if (/^#\s+[^\n]+/m.test(text) && /^##\s+/m.test(text)) {
    return 'markdown-article'
  }
  return 'plain-text'
}

function parseMarkdownArticle(rawText: string): ParsedBlog {
  const lines = rawText.split('\n')
  const result = emptyParsed()
  result.sourceFormat = 'markdown-article'

  let titleIdx = -1
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trimStart()
    if (t.startsWith('# ') && !t.startsWith('## ')) {
      titleIdx = i
      result.selectedTitle = t.slice(2).trim()
      break
    }
  }

  if (titleIdx === -1) return result

  let firstSectionIdx = lines.length
  for (let i = titleIdx + 1; i < lines.length; i++) {
    const t = lines[i].trimStart()
    if (t.startsWith('## ') && !t.startsWith('### ')) {
      firstSectionIdx = i
      break
    }
  }

  // Intro
  const introLines = lines.slice(titleIdx + 1, firstSectionIdx)
  const introParas: string[] = []
  const introQuoteParts: string[] = []
  let buffer: string[] = []
  const flushIntro = () => {
    if (buffer.length === 0) return
    const text = buffer.join(' ').trim()
    if (text) introParas.push(text)
    buffer = []
  }
  for (const raw of introLines) {
    const t = raw.trim()
    if (t === '---' || t === '') {
      flushIntro()
      continue
    }
    const q = /^>\s*(.+)$/.exec(t)
    if (q) {
      flushIntro()
      introQuoteParts.push(q[1].trim())
      continue
    }
    buffer.push(t)
  }
  flushIntro()
  result.selectedIntro = introParas.join('\n\n')
  result.introQuote = introQuoteParts.join('\n\n')

  // Sections
  let sectionCounter = 0
  let i = firstSectionIdx
  while (i < lines.length) {
    const t = lines[i].trimStart()
    if (t.startsWith('## ') && !t.startsWith('### ')) {
      sectionCounter += 1
      const heading = t.slice(3).trim()
      const section: BodySection = {
        id: `section-${sectionCounter}`,
        heading,
        level: 2,
        type: '',
        paragraphs: [],
        children: [],
      }

      let j = i + 1
      const sectionLines: string[] = []
      while (j < lines.length) {
        const tt = lines[j].trimStart()
        if (tt.startsWith('## ') && !tt.startsWith('### ')) break
        sectionLines.push(lines[j])
        j += 1
      }

      const preChildLines: string[] = []
      let inChild = false
      let childHeading = ''
      let childLines: string[] = []
      let childCounter = 0

      const flushChild = () => {
        if (!childHeading) return
        childCounter += 1
        section.children.push({
          id: `${section.id}-${childCounter}`,
          heading: childHeading,
          level: 3,
          type: '',
          paragraphs: parseSectionBody(childLines),
          children: [],
        })
        childLines = []
        childHeading = ''
      }

      for (const raw of sectionLines) {
        const tt = raw.trimStart()
        const h3 = /^###\s+(.+)$/.exec(tt)
        if (h3) {
          if (inChild) flushChild()
          inChild = true
          childHeading = h3[1].trim()
          continue
        }
        if (inChild) childLines.push(raw)
        else preChildLines.push(raw)
      }
      if (inChild) flushChild()
      section.paragraphs = parseSectionBody(preChildLines)
      result.bodySections.push(section)
      i = j
    } else {
      i += 1
    }
  }

  // Trailing hashtag-only lines → hashtags
  const hashtagLineRe = /^(#[^\s#]+\s*)+$/
  const tags: string[] = []
  for (let k = lines.length - 1; k >= 0; k--) {
    const t = lines[k].trim()
    if (!t) continue
    if (hashtagLineRe.test(t)) {
      const matches = t.match(/#[^\s#]+/g)
      if (matches) tags.unshift(...matches)
      continue
    }
    break
  }
  if (tags.length > 0) {
    result.hashtags = tags.join(' ')
  }

  return result
}

export function parseBlogDraft(rawText: string, blogType?: BlogType): ParsedBlog {
  if (!rawText || !rawText.trim()) return emptyParsed()

  const sourceFormat = detectSourceFormat(rawText)
  const detectedType: BlogType = blogType ?? detectBlogType(rawText)

  const result =
    sourceFormat === 'markdown-article'
      ? parseMarkdownArticle(rawText)
      : parseCandidateBased(rawText)

  result.blogType = detectedType
  result.sourceFormat = sourceFormat

  if (detectedType === 'project-introduction') {
    for (const s of result.bodySections) {
      s.type = getProjectSectionType(s.heading)
      for (const c of s.children) {
        c.type = getProjectSectionType(c.heading)
      }
    }
  } else if (detectedType === 'stock-analysis') {
    for (const s of result.bodySections) {
      if (!s.type) s.type = getStockSectionType(s.heading)
      for (const c of s.children) {
        if (!c.type) c.type = getStockSectionType(c.heading)
      }
    }
  }

  return result
}
