export type BlogType = 'project-introduction' | 'stock-analysis' | 'general-blog'

const STOCK_KEYWORDS = [
  '기업개요',
  '기업 개요',
  '공매도',
  '공시',
  '트레이더',
  '투자 주의문구',
  '희석',
  '전환사채',
  '상장요건',
  '매출 감소',
  '순이익',
  'EPS',
  '나스닥',
  'ETF',
  '티커',
]

const PROJECT_KEYWORDS = [
  '직접 구현',
  '플랫폼',
  '프로젝트',
  '개발',
  '기술 스택',
  'FastAPI',
  'MySQL',
  'React',
  'Vite',
  '대시보드',
  '편집기',
  '자동화',
  '초안 생성',
  '미리보기',
  'API 토큰',
  '사용 화면',
  '왜 만들었나',
  '전체 구조',
  '마무리',
]

export function detectBlogType(rawText: string): BlogType {
  const text = String(rawText || '')

  const stockScore = STOCK_KEYWORDS.filter((k) => text.includes(k)).length
  const projectScore = PROJECT_KEYWORDS.filter((k) => text.includes(k)).length

  if (projectScore >= stockScore && projectScore >= 3) {
    return 'project-introduction'
  }
  if (stockScore >= 3) {
    return 'stock-analysis'
  }
  return 'general-blog'
}
