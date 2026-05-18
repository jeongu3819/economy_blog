import { BodySection, ContentBlock, ParsedBlog } from './blogParser'
import { BlogType } from './blogTypeDetector'

export interface HashtagBundle {
  applied: string[]
  suggested: string[]
}

const KOREAN_STOPWORDS = new Set([
  '그리고',
  '하지만',
  '그래서',
  '이번',
  '글에서는',
  '부분',
  '사용자',
  '정도',
  '생각',
  '방식',
  '구조',
  '기능',
  '내용',
  '화면',
  '과정',
  '중요',
  '필요',
  '가능',
  '사용',
  '진행',
  '직접',
  '조금',
  '계속',
  '하나',
  '정리',
])

const BLOCKED_TAGS = new Set([
  '#이번',
  '#그냥',
  '#사용',
  '#구조',
  '#기능',
  '#화면',
  '#내용',
  '#정리',
  '#생각',
  '#부분',
  '#가능',
  '#중요',
  '#필요',
])

const TECH_KEYWORDS = [
  'FastAPI',
  'MySQL',
  'PostgreSQL',
  'SQLite',
  'React',
  'Vite',
  'Next.js',
  'Vue',
  'Svelte',
  'Python',
  'JavaScript',
  'TypeScript',
  'Node.js',
  'HTML',
  'CSS',
  'Markdown',
  'GitHub',
  'Docker',
  'AWS',
  'Tailwind',
]

const AI_TOOL_KEYWORDS = [
  'GPTs',
  'GPT',
  'ChatGPT',
  'Claude',
  '클로드',
  'Gemini',
  '제미나이',
  'AI',
]

const PHRASE_CANDIDATES: string[] = [
  '블로그 자동화',
  '블로그 만들기',
  '블로그 편집기',
  '블로그 초안',
  '초안 생성',
  '자동 분석',
  '편집 자동화',
  '자동화 플랫폼',
  '업무 자동화',
  '경제 블로그',
  '주식 블로그',
  '사이드 프로젝트',
  '개인 프로젝트',
  '개발 후기',
  '서비스 소개',
  '제품 리뷰',
  '뉴스 요약',
  'API 토큰',
  '토큰 비용',
  '기술 스택',
]

const TITLE_RULES: Array<{ test: RegExp | string; tags: string[] }> = [
  { test: '블로그', tags: ['#블로그만들기', '#블로그자동화'] },
  { test: '자동화', tags: ['#자동화', '#자동화플랫폼'] },
  { test: '플랫폼', tags: ['#플랫폼'] },
  { test: '직접 구현', tags: ['#개발후기', '#사이드프로젝트'] },
  { test: '편집기', tags: ['#블로그편집기'] },
  { test: '구현해봤', tags: ['#개발후기', '#사이드프로젝트'] },
]

const HEADING_RULES: Array<{ test: string; tags: string[] }> = [
  { test: '기술 스택', tags: ['#기술스택', '#개발후기'] },
  { test: '자동 생성', tags: ['#AI블로그', '#블로그초안'] },
  { test: '편집 자동화', tags: ['#편집자동화', '#블로그편집기'] },
  { test: '사용 화면', tags: ['#UI구성', '#서비스소개'] },
  { test: '글쓰기 방향', tags: ['#블로그운영', '#콘텐츠자동화'] },
  { test: '자동화 플랫폼', tags: ['#자동화플랫폼', '#업무자동화'] },
  { test: '왜 만들었나', tags: ['#개발동기'] },
  { test: '마무리', tags: [] },
]

const BODY_HINT_RULES: Array<{ test: string; tags: string[] }> = [
  { test: '경제 블로그', tags: ['#경제블로그'] },
  { test: '경제', tags: ['#경제블로그'] },
  { test: '주식', tags: ['#주식블로그'] },
  { test: 'ETF', tags: ['#ETF'] },
  { test: '사이드 프로젝트', tags: ['#사이드프로젝트'] },
  { test: '개인 프로젝트', tags: ['#개인프로젝트'] },
  { test: '개발 후기', tags: ['#개발후기'] },
  { test: '제품 리뷰', tags: ['#제품리뷰'] },
  { test: '뉴스 요약', tags: ['#뉴스요약'] },
  { test: '서비스 소개', tags: ['#서비스소개'] },
]

const SUGGESTED_BY_TYPE: Record<BlogType, string[]> = {
  'project-introduction': [
    '#GPTs',
    '#ChatGPT',
    '#Claude',
    '#클로드',
    '#제미나이',
    '#콘텐츠자동화',
    '#네이버블로그',
    '#티스토리',
    '#개인프로젝트',
    '#서비스소개',
  ],
  'stock-analysis': [
    '#나스닥',
    '#미국주식',
    '#개별주분석',
    '#투자공부',
    '#경제뉴스',
    '#주식정보',
  ],
  'general-blog': ['#블로그', '#정보공유', '#일상기록'],
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function toHashtag(value: string): string {
  if (!value) return ''
  let tag = String(value)
    .trim()
    .replace(/\*\*/g, '')
    .replace(/[“”"']/g, '')
    .replace(/[.,!?;:()[\]{}]/g, '')
    .replace(/[+/]/g, '')
    .replace(/\s+/g, '')
  if (!tag) return ''
  if (!tag.startsWith('#')) tag = `#${tag}`
  return tag
}

function normalizeHashtag(tag: string): string {
  const t = String(tag || '').trim()
  if (!t) return ''
  return t.startsWith('#') ? t : `#${t}`
}

export function isValidHashtag(tag: string): boolean {
  const value = normalizeHashtag(tag)
  if (!value) return false
  if (value.length < 3) return false
  if (value.length > 30) return false
  const withoutHash = value.replace('#', '')
  if (/^\d+$/.test(withoutHash)) return false
  if (BLOCKED_TAGS.has(value)) return false
  if (KOREAN_STOPWORDS.has(withoutHash)) return false
  return true
}

export function dedupeHashtags(tags: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of tags) {
    const tag = normalizeHashtag(raw)
    if (!isValidHashtag(tag)) continue
    const key = tag.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(tag)
  }
  return out
}

export function extractExistingHashtags(text: string): string[] {
  const value = String(text || '')
  const matches = value.match(/#[^\s#,]+/g) || []
  return matches.map((m) => m.replace(/[.,!?;:()[\]{}]$/g, ''))
}

export function extractTitleHashtags(title: string): string[] {
  const text = String(title || '')
  if (!text) return []
  const tags: string[] = []
  for (const rule of TITLE_RULES) {
    const hit =
      typeof rule.test === 'string' ? text.includes(rule.test) : rule.test.test(text)
    if (hit) tags.push(...rule.tags)
  }
  return tags
}

function collectAllHeadings(sections: BodySection[]): string[] {
  const out: string[] = []
  for (const s of sections) {
    if (s.heading) out.push(s.heading)
    for (const c of s.children || []) {
      if (c.heading) out.push(c.heading)
    }
  }
  return out
}

export function extractHeadingHashtags(sections: BodySection[]): string[] {
  const text = collectAllHeadings(sections).join('\n')
  if (!text) return []
  const tags: string[] = []
  for (const rule of HEADING_RULES) {
    if (text.includes(rule.test)) tags.push(...rule.tags)
  }
  return tags
}

function normalizeForPhraseMatch(text: string): string {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function blockToText(block: ContentBlock): string {
  if (typeof block === 'string') return block
  if (block.type === 'ordered-list') return block.items.join('\n')
  return block.content
}

function parsedBlogToFullText(rawText: string, parsed?: ParsedBlog): string {
  const parts: string[] = [String(rawText || '')]
  if (parsed) {
    if (parsed.selectedTitle) parts.push(parsed.selectedTitle)
    if (parsed.selectedIntro) parts.push(parsed.selectedIntro)
    if (parsed.introQuote) parts.push(parsed.introQuote)
    for (const s of parsed.bodySections) {
      if (s.heading) parts.push(s.heading)
      for (const p of s.paragraphs) parts.push(blockToText(p))
      for (const c of s.children || []) {
        if (c.heading) parts.push(c.heading)
        for (const p of c.paragraphs) parts.push(blockToText(p))
      }
    }
  }
  return parts.join('\n')
}

export function extractBodyKeywordHashtags(
  rawText: string,
  parsed?: ParsedBlog,
): string[] {
  const full = normalizeForPhraseMatch(parsedBlogToFullText(rawText, parsed))
  if (!full) return []
  const compact = full.replace(/\s+/g, '')
  const tags: string[] = []

  for (const phrase of PHRASE_CANDIDATES) {
    if (full.includes(phrase) || compact.includes(phrase.replace(/\s+/g, ''))) {
      tags.push(toHashtag(phrase))
    }
  }

  for (const rule of BODY_HINT_RULES) {
    if (full.includes(rule.test)) tags.push(...rule.tags)
  }

  return tags
}

export function extractTechStackHashtags(text: string): string[] {
  const value = String(text || '')
  if (!value) return []
  const tags: string[] = []
  for (const keyword of [...TECH_KEYWORDS, ...AI_TOOL_KEYWORDS]) {
    const word = escapeRegExp(keyword)
    // Word-boundary match for ASCII; for non-ASCII fall back to plain includes.
    const isAscii = /^[\x20-\x7E]+$/.test(keyword)
    const re = isAscii ? new RegExp(`(?:^|[^A-Za-z0-9])${word}(?![A-Za-z0-9])`, 'i') : null
    const hit = re ? re.test(value) : value.includes(keyword)
    if (hit) tags.push(toHashtag(keyword))
  }
  return tags
}

export function extractServiceNameHashtags(text: string): string[] {
  const value = String(text || '')
  if (!value) return []
  const tags: string[] = []
  const re = /([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,4})/g
  const blocked = new Set([
    'Backend',
    'Frontend',
    'Markdown',
    'Read Me',
    'Pull Request',
  ])
  const matches = value.match(re) || []
  for (const match of matches) {
    const cleaned = match.replace(/\s+/g, '')
    if (cleaned.length < 4 || cleaned.length > 30) continue
    if (blocked.has(match) || blocked.has(cleaned)) continue
    tags.push(`#${cleaned}`)
  }
  return tags
}

export function getFallbackHashtagsByBlogType(blogType: BlogType): string[] {
  if (blogType === 'project-introduction') {
    return [
      '#블로그자동화',
      '#AI블로그',
      '#블로그편집기',
      '#자동화플랫폼',
      '#개발후기',
      '#사이드프로젝트',
      '#업무자동화',
    ]
  }
  if (blogType === 'stock-analysis') {
    return ['#주식분석', '#기업분석', '#공시분석', '#미국주식', '#투자정보']
  }
  return ['#블로그', '#정보공유']
}

export function getSuggestedHashtagsByBlogType(blogType: BlogType): string[] {
  return SUGGESTED_BY_TYPE[blogType] ?? SUGGESTED_BY_TYPE['general-blog']
}

export function getMaxHashtagCount(_blogType: BlogType): number {
  return 18
}

export function generateHashtagBundle(
  rawText: string,
  parsed: ParsedBlog | null | undefined,
  blogType: BlogType,
): HashtagBundle {
  const existing = extractExistingHashtags(
    `${rawText || ''}\n${parsed?.hashtags || ''}`,
  )
  const titleTags = extractTitleHashtags(parsed?.selectedTitle || '')
  const headingTags = extractHeadingHashtags(parsed?.bodySections || [])
  const bodyTags = extractBodyKeywordHashtags(rawText, parsed ?? undefined)
  const techTags = extractTechStackHashtags(
    `${rawText || ''}\n${parsedBlogToFullText('', parsed ?? undefined)}`,
  )
  const serviceTags = extractServiceNameHashtags(
    `${rawText || ''}\n${parsedBlogToFullText('', parsed ?? undefined)}`,
  )

  const primary = dedupeHashtags([
    ...existing,
    ...titleTags,
    ...headingTags,
    ...bodyTags,
    ...techTags,
    ...serviceTags,
  ])

  let applied = primary
  const fallback = getFallbackHashtagsByBlogType(blogType)
  if (applied.length < 10) {
    applied = dedupeHashtags([...applied, ...fallback])
  }

  const max = getMaxHashtagCount(blogType)
  applied = applied.slice(0, max)

  const appliedSet = new Set(applied.map((t) => t.toLowerCase()))
  const suggestedPool = dedupeHashtags([
    ...getSuggestedHashtagsByBlogType(blogType),
    ...fallback,
  ])
  const suggested = suggestedPool.filter((t) => !appliedSet.has(t.toLowerCase()))

  return { applied, suggested }
}

export function generateHashtags(
  rawText: string,
  parsed: ParsedBlog | null | undefined,
  blogType: BlogType,
): string {
  return generateHashtagBundle(rawText, parsed, blogType).applied.join(' ')
}
