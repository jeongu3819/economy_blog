import { HighlightClassName, HIGHLIGHT_INLINE_STYLES } from './blogTheme'
import { BlogType } from './blogTypeDetector'

export interface KeywordRule {
  keyword: string
  className: HighlightClassName
}

export const STOCK_KEYWORD_RULES: KeywordRule[] = [
  // 강한 긍정
  { keyword: '급등', className: 'highlight-strong-positive' },
  { keyword: '순이익 급증', className: 'highlight-strong-positive' },
  { keyword: '순이익 증가', className: 'highlight-strong-positive' },
  { keyword: 'EPS', className: 'highlight-strong-positive' },
  { keyword: '숏커버', className: 'highlight-strong-positive' },
  { keyword: '숏스퀴즈', className: 'highlight-strong-positive' },

  // 긍정
  { keyword: '긍정', className: 'highlight-positive' },
  { keyword: '호재', className: 'highlight-positive' },
  { keyword: '모멘텀', className: 'highlight-positive' },
  { keyword: '테마', className: 'highlight-positive' },
  { keyword: '양자컴퓨팅', className: 'highlight-positive' },
  { keyword: 'AI', className: 'highlight-positive' },
  { keyword: '블록체인', className: 'highlight-positive' },
  { keyword: '파일럿', className: 'highlight-positive' },
  { keyword: 'JV', className: 'highlight-positive' },
  { keyword: '라이선스 계약', className: 'highlight-positive' },
  { keyword: '납품 계약', className: 'highlight-positive' },
  { keyword: '고객 PoC', className: 'highlight-positive' },

  // 부정
  { keyword: '부정', className: 'highlight-negative' },
  { keyword: '매출 감소', className: 'highlight-negative' },
  { keyword: '비용 절감 중심', className: 'highlight-negative' },
  { keyword: '상업화 여부가 확인되지 않았', className: 'highlight-negative' },
  { keyword: '확인되지 않았', className: 'highlight-negative' },
  { keyword: '외부 검증', className: 'highlight-negative' },
  { keyword: '부족합니다', className: 'highlight-negative' },

  // 리스크
  { keyword: '리스크', className: 'highlight-risk' },
  { keyword: '희석', className: 'highlight-risk' },
  { keyword: '희석 리스크', className: 'highlight-risk' },
  { keyword: '전환사채', className: 'highlight-risk' },
  { keyword: '우선주', className: 'highlight-risk' },
  { keyword: '워런트', className: 'highlight-risk' },
  { keyword: '역분할', className: 'highlight-risk' },
  { keyword: '자본구조 변경', className: 'highlight-risk' },
  { keyword: '상장요건 미달', className: 'highlight-risk' },
  { keyword: '상장 유지 리스크', className: 'highlight-risk' },
  { keyword: '채무 유예', className: 'highlight-risk' },
  { keyword: '유상증자', className: 'highlight-risk' },
  { keyword: '신주 발행', className: 'highlight-risk' },

  // 중립 / 확인 필요
  { keyword: '중립', className: 'highlight-neutral' },
  { keyword: 'LOI', className: 'highlight-neutral' },
  { keyword: 'MOU', className: 'highlight-neutral' },
  { keyword: '기술 발표', className: 'highlight-neutral' },
  { keyword: '기술 PR', className: 'highlight-neutral' },
  { keyword: '보도자료', className: 'highlight-neutral' },
  { keyword: '확인 필요', className: 'highlight-neutral' },
  { keyword: '구분해서 봐야', className: 'highlight-neutral' },
  { keyword: '단정하기보다는', className: 'highlight-neutral' },
]

export const PROJECT_KEYWORD_RULES: KeywordRule[] = [
  // 핵심 컨셉
  { keyword: '편집 자동화', className: 'highlight-project-core' },
  { keyword: '블로그 초안 생성', className: 'highlight-project-core' },
  { keyword: '초안 생성', className: 'highlight-project-core' },
  { keyword: '자동화', className: 'highlight-project-core' },
  { keyword: '미리보기', className: 'highlight-project-core' },
  { keyword: '자동 분석', className: 'highlight-project-core' },

  // 기술 스택
  { keyword: 'FastAPI', className: 'highlight-tech' },
  { keyword: 'MySQL', className: 'highlight-tech' },
  { keyword: 'React', className: 'highlight-tech' },
  { keyword: 'Vite', className: 'highlight-tech' },
  { keyword: '프론트엔드', className: 'highlight-tech' },
  { keyword: '백엔드', className: 'highlight-tech' },
  { keyword: '데이터베이스', className: 'highlight-tech' },
  { keyword: 'API', className: 'highlight-tech' },

  // 장점 / 가치
  { keyword: '시간을 줄이는', className: 'highlight-benefit' },
  { keyword: '유지보수가 쉬운', className: 'highlight-benefit' },
  { keyword: '확장할 수 있습니다', className: 'highlight-benefit' },
  { keyword: '유용합니다', className: 'highlight-benefit' },
  { keyword: '가장 큰 장점', className: 'highlight-benefit' },
  { keyword: '반복되는 작업을 줄이는', className: 'highlight-benefit' },
  { keyword: '더 빠르게 판단하고 편집', className: 'highlight-benefit' },

  // 주의 / 한계
  { keyword: '완성형 서비스라기보다는', className: 'highlight-caution' },
  { keyword: '실험적인 자동화 도구', className: 'highlight-caution' },
  { keyword: 'API 토큰', className: 'highlight-caution' },
  { keyword: '토큰 비용', className: 'highlight-caution' },
  { keyword: '계속 소모하지 않아도', className: 'highlight-caution' },
]

export const GENERAL_KEYWORD_RULES: KeywordRule[] = []

// Backwards compatibility: previous code imported DEFAULT_KEYWORD_RULES.
export const DEFAULT_KEYWORD_RULES: KeywordRule[] = STOCK_KEYWORD_RULES

export function getKeywordRulesByBlogType(
  blogType: BlogType,
  userRules: KeywordRule[] = [],
): KeywordRule[] {
  const baseRules =
    blogType === 'project-introduction'
      ? PROJECT_KEYWORD_RULES
      : blogType === 'stock-analysis'
        ? STOCK_KEYWORD_RULES
        : GENERAL_KEYWORD_RULES
  return [...baseRules, ...userRules]
}

// ─── Paragraph triggers ────────────────────────────────────────────────────────

const STOCK_RISK_TRIGGERS = [
  '리스크',
  '희석',
  '전환사채',
  '상장요건 미달',
  '채무 유예',
  '매출 감소',
  '확인되지 않았',
  '외부 검증',
  '상업화 여부',
  '자본구조 변경',
  '역분할',
]

const STOCK_POSITIVE_TRIGGERS = [
  '긍정',
  '호재',
  '순이익 증가',
  '급등',
  '숏커버',
  '모멘텀',
  '거래량',
  'AI',
  '양자컴퓨팅',
  '블록체인',
]

const STOCK_NEUTRAL_TRIGGERS = [
  '기술 발표',
  '보도자료',
  '기술 PR',
  '확인 필요',
  '구분해서 봐야',
  '단정하기보다는',
]

const PROJECT_CORE_PATTERNS = [
  '핵심은',
  '핵심 흐름',
  '가장 중요하게 생각한 부분',
  '이 플랫폼의 핵심',
  '즉, 핵심 흐름은',
]

const PROJECT_BENEFIT_PATTERNS = [
  '시간을 줄이는',
  '훨씬 직관적으로',
  '유용합니다',
  '도움이 됩니다',
  '장점입니다',
  '쉽게 확장',
  '유지보수가 쉬운',
]

const PROJECT_CAUTION_PATTERNS = [
  '완성형 서비스라기보다는',
  '실험적인 자동화 도구',
  '비용이 발생합니다',
  '토큰 비용',
  '복잡한 구조보다는',
]

export type ParagraphClass =
  | 'paragraph-risk'
  | 'paragraph-positive'
  | 'paragraph-neutral'
  | 'paragraph-project-core'
  | 'paragraph-benefit'
  | 'paragraph-caution'
  | ''

export function getStockParagraphClass(text: string): ParagraphClass {
  if (!text) return ''
  if (STOCK_RISK_TRIGGERS.some((t) => text.includes(t))) return 'paragraph-risk'
  if (STOCK_POSITIVE_TRIGGERS.some((t) => text.includes(t))) return 'paragraph-positive'
  if (STOCK_NEUTRAL_TRIGGERS.some((t) => text.includes(t))) return 'paragraph-neutral'
  return ''
}

export function getProjectParagraphClass(text: string): ParagraphClass {
  if (!text) return ''
  if (PROJECT_CORE_PATTERNS.some((k) => text.includes(k))) return 'paragraph-project-core'
  if (PROJECT_BENEFIT_PATTERNS.some((k) => text.includes(k))) return 'paragraph-benefit'
  if (PROJECT_CAUTION_PATTERNS.some((k) => text.includes(k))) return 'paragraph-caution'
  return ''
}

export function getParagraphClassByBlogType(text: string, blogType: BlogType): ParagraphClass {
  if (blogType === 'project-introduction') return getProjectParagraphClass(text)
  if (blogType === 'stock-analysis') return getStockParagraphClass(text)
  return ''
}

// Backwards-compat default (stock).
export function getParagraphClass(text: string, _rules?: KeywordRule[]): ParagraphClass {
  return getStockParagraphClass(text)
}

export function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

interface CompiledRules {
  regex: RegExp | null
  byKeyword: Map<string, KeywordRule>
}

function compileRules(rules: KeywordRule[]): CompiledRules {
  const valid = rules.filter((r) => r.keyword && r.keyword.length > 0)
  if (valid.length === 0) return { regex: null, byKeyword: new Map() }

  const sorted = [...valid].sort((a, b) => b.keyword.length - a.keyword.length)
  const byKeyword = new Map<string, KeywordRule>()
  for (const rule of sorted) {
    if (!byKeyword.has(rule.keyword)) byKeyword.set(rule.keyword, rule)
  }
  const pattern = Array.from(byKeyword.keys()).map(escapeRegex).join('|')
  return { regex: new RegExp(`(${pattern})`, 'g'), byKeyword }
}

export function highlightTextHtml(text: string, rules: KeywordRule[]): string {
  const escaped = escapeHtml(text)
  const { regex, byKeyword } = compileRules(rules)
  if (!regex) return escaped
  return escaped.replace(regex, (match) => {
    const rule = byKeyword.get(match)
    if (!rule) return match
    return `<span class="${rule.className}">${match}</span>`
  })
}

export function highlightTextInline(text: string, rules: KeywordRule[]): string {
  const escaped = escapeHtml(text)
  const { regex, byKeyword } = compileRules(rules)
  if (!regex) return escaped
  return escaped.replace(regex, (match) => {
    const rule = byKeyword.get(match)
    if (!rule) return match
    const style = HIGHLIGHT_INLINE_STYLES[rule.className]
    return `<span style="${style}">${match}</span>`
  })
}
