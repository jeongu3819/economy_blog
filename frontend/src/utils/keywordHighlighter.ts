import { HighlightClassName, HIGHLIGHT_INLINE_STYLES } from './blogTheme'

export interface KeywordRule {
  keyword: string
  className: HighlightClassName
}

export const DEFAULT_KEYWORD_RULES: KeywordRule[] = [
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

const RISK_TRIGGERS = [
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

const POSITIVE_TRIGGERS = [
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

const NEUTRAL_TRIGGERS = [
  '기술 발표',
  '보도자료',
  '기술 PR',
  '확인 필요',
  '구분해서 봐야',
  '단정하기보다는',
]

export type ParagraphClass = 'paragraph-risk' | 'paragraph-positive' | 'paragraph-neutral' | ''

export function getParagraphClass(text: string, _rules?: KeywordRule[]): ParagraphClass {
  if (!text) return ''
  if (RISK_TRIGGERS.some((t) => text.includes(t))) return 'paragraph-risk'
  if (POSITIVE_TRIGGERS.some((t) => text.includes(t))) return 'paragraph-positive'
  if (NEUTRAL_TRIGGERS.some((t) => text.includes(t))) return 'paragraph-neutral'
  return ''
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

  // Sort by length desc so longer matches win when patterns overlap
  const sorted = [...valid].sort((a, b) => b.keyword.length - a.keyword.length)
  const byKeyword = new Map<string, KeywordRule>()
  for (const rule of sorted) {
    if (!byKeyword.has(rule.keyword)) byKeyword.set(rule.keyword, rule)
  }
  const pattern = Array.from(byKeyword.keys()).map(escapeRegex).join('|')
  return { regex: new RegExp(`(${pattern})`, 'g'), byKeyword }
}

/**
 * Returns escaped HTML where matched keywords are wrapped in <span class="...">.
 * Safe for dangerouslySetInnerHTML.
 */
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

/**
 * Same as highlightTextHtml but emits inline styles instead of class names.
 * Used for HTML export so styling survives paste into Naver blog.
 */
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
