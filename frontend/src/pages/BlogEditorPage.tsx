import { useEffect, useMemo, useState } from 'react'
import BlogInputBox from '../components/blogEditor/BlogInputBox'
import BlogSectionEditor from '../components/blogEditor/BlogSectionEditor'
import BlogPreview from '../components/blogEditor/BlogPreview'
import BlogTemplatePreview from '../components/blogEditor/BlogTemplatePreview'
import KeywordRuleManager from '../components/blogEditor/KeywordRuleManager'
import CopyButtons from '../components/blogEditor/CopyButtons'
import { ParsedBlog, emptyParsed, parseBlogDraft } from '../utils/blogParser'
import {
  DEFAULT_KEYWORD_RULES,
  KeywordRule,
  getKeywordRulesByBlogType,
} from '../utils/keywordHighlighter'
import {
  exportToHtml,
  exportToMarkdown,
  exportToPlainText,
} from '../utils/blogExporter'
import { generateHashtagBundle } from '../utils/hashtagGenerator'
import '../styles/BlogEditorPage.css'

const STORAGE_KEY = 'blogEditorKeywordRules'

const SAMPLE_TEXT = `# 제목 후보 3개

1. MLGO 양자 알고리즘 뉴스, 숏스퀴즈 재료일까 기술 PR일까?
2. MLGO 주가 변동성 체크: 양자컴퓨팅 뉴스와 공매도 87%의 의미
3. MicroAlgo(MLGO) 최신 뉴스 정리, 호재보다 먼저 봐야 할 리스크

---

# 도입부 후보 2개

## 도입부 1

MLGO가 최근 양자 알고리즘, QAS, 양자 블록체인 관련 보도자료를 연속으로 내면서 시장의 관심을 받고 있습니다.

## 도입부 2

MicroAlgo, 티커 MLGO는 양자컴퓨팅과 AI 알고리즘 테마를 타고 변동성이 커질 수 있는 종목입니다.

---

# 네이버 블로그 본문 초안

# MLGO 분석: 양자 알고리즘 뉴스, 진짜 호재일까?

분석 날짜: 2026년 05월 15일

---

## 오늘의 핵심 포인트

MLGO는 최근 양자 알고리즘, QAS, 양자 블록체인 관련 기술성 뉴스를 연속으로 발표했습니다.

공매도 비율은 MarketBeat 기준 유통주식 대비 87.10%로 매우 높게 표시되지만, 다른 데이터 제공처와 차이가 있어 해석에 주의가 필요합니다.

또한 과거 전환사채, 역분할, 자본구조 변경 이력이 언급되어 있어 급등 구간에서는 희석 리스크도 함께 봐야 합니다.

---

## 긍정 포인트

MLGO의 가장 큰 긍정 포인트는 테마성입니다.

AI, 양자컴퓨팅, 양자 알고리즘, 양자 블록체인이라는 키워드는 시장이 민감하게 반응할 수 있는 분야입니다.

---

## 리스크 포인트

가장 큰 리스크는 최근 뉴스가 실제 매출 계약이 아니라는 점입니다.

제공된 자료 기준으로는 실제 사용 기업, 고객 PoC, 라이선스 매출, 납품 계약이 확인되지 않았습니다.

---

## 투자 주의문구

본 글은 투자 권유가 아닌 정보 제공 목적의 글입니다.

투자 판단과 책임은 투자자 본인에게 있습니다.

---

# 해시태그

#MLGO #MicroAlgo #미국주식 #나스닥 #양자컴퓨팅 #AI관련주
`

function loadStoredRules(): KeywordRule[] {
  if (typeof window === 'undefined') return DEFAULT_KEYWORD_RULES
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_KEYWORD_RULES
    const parsed = JSON.parse(raw) as KeywordRule[]
    if (!Array.isArray(parsed)) return DEFAULT_KEYWORD_RULES
    return parsed.filter((r) => r && typeof r.keyword === 'string' && typeof r.className === 'string')
  } catch {
    return DEFAULT_KEYWORD_RULES
  }
}

export default function BlogEditorPage(): React.JSX.Element {
  const [rawText, setRawText] = useState('')
  const [parsed, setParsed] = useState<ParsedBlog>(emptyParsed())
  const [rules, setRules] = useState<KeywordRule[]>(() => loadStoredRules())
  const [parseMessage, setParseMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
    } catch {
      // ignore quota errors
    }
  }, [rules])

  const handleParse = () => {
    if (!rawText.trim()) {
      setParseMessage({ text: '텍스트를 먼저 붙여넣어 주세요.', ok: false })
      return
    }
    try {
      const result = parseBlogDraft(rawText)
      if (!result.hashtags) {
        const bundle = generateHashtagBundle(rawText, result, result.blogType)
        result.hashtags = bundle.applied.join(' ')
      }
      setParsed(result)
      const sectionCount = result.bodySections.length
      const hasAny =
        result.selectedTitle || sectionCount > 0 || result.selectedIntro || result.hashtags
      if (hasAny) {
        const typeLabel =
          result.blogType === 'project-introduction'
            ? '프로젝트 소개형'
            : result.blogType === 'stock-analysis'
              ? '주식 분석형'
              : '일반 블로그형'
        setParseMessage({
          text: `분석 완료 — ${typeLabel} · 섹션 ${sectionCount}개`,
          ok: true,
        })
      } else {
        setParseMessage({
          text: '내용을 인식하지 못했습니다. 형식을 확인하거나 샘플을 참고하세요.',
          ok: false,
        })
      }
    } catch {
      setParseMessage({ text: '분석 중 오류가 발생했습니다.', ok: false })
    }
  }

  const handleClear = () => {
    setRawText('')
    setParsed(emptyParsed())
    setParseMessage(null)
  }

  const handleLoadSample = () => {
    setRawText(SAMPLE_TEXT)
    const sample = parseBlogDraft(SAMPLE_TEXT)
    if (!sample.hashtags) {
      const bundle = generateHashtagBundle(SAMPLE_TEXT, sample, sample.blogType)
      sample.hashtags = bundle.applied.join(' ')
    }
    setParsed(sample)
  }

  const hashtagBundle = useMemo(
    () => generateHashtagBundle(rawText, parsed, parsed.blogType),
    [rawText, parsed],
  )

  const effectiveRules = useMemo(
    () => getKeywordRulesByBlogType(parsed.blogType, rules),
    [parsed.blogType, rules],
  )

  const htmlContent = useMemo(
    () => exportToHtml(parsed, effectiveRules),
    [parsed, effectiveRules],
  )
  const markdownContent = useMemo(() => exportToMarkdown(parsed), [parsed])
  const textContent = useMemo(() => exportToPlainText(parsed), [parsed])

  const hasContent =
    parsed.selectedTitle ||
    parsed.bodySections.length > 0 ||
    parsed.selectedIntro ||
    parsed.disclaimer ||
    parsed.hashtags

  return (
    <div className="blog-editor-page">
      <header className="blog-editor-header">
        <h1 className="blog-editor-title">블로그 편집기</h1>
        <p className="blog-editor-description">
          GPTs에서 생성한 블로그 초안을 붙여넣으면 자동으로 제목 / 도입부 / 섹션을 분리하고,
          위험·긍정 키워드를 강조한 뒤 네이버 블로그에 바로 붙여넣을 수 있는 HTML로 내보냅니다.
        </p>
      </header>

      <div className="blog-editor-layout">
        <div className="blog-editor-column">
          <BlogInputBox
            value={rawText}
            onChange={setRawText}
            onParse={handleParse}
            onClear={handleClear}
            onLoadSample={handleLoadSample}
            parseMessage={parseMessage}
          />
          <KeywordRuleManager
            rules={rules}
            onChange={setRules}
            onReset={() => setRules(DEFAULT_KEYWORD_RULES)}
          />
        </div>

        <div className="blog-editor-column">
          {hasContent ? (
            <BlogSectionEditor
              parsed={parsed}
              onChange={setParsed}
              suggestedHashtags={hashtagBundle.suggested}
            />
          ) : (
            <div className="blog-editor-card blog-editor-empty">
              왼쪽에 원문을 붙여넣고 <strong>자동 분석</strong>을 누르면 여기에 편집기가 나타납니다.
            </div>
          )}
        </div>

        <div className="blog-editor-column">
          <BlogPreview parsed={parsed} rules={effectiveRules} />
          <div className="blog-editor-card">
            <h2 className="blog-editor-card-title">4. 복사</h2>
            <p className="blog-editor-card-hint">
              네이버 블로그에 붙여넣을 때는 <strong>HTML 형식 복사</strong> 버튼을 사용하세요.
              코드가 그대로 붙으면 브라우저가 HTML 복사를 지원하지 않는 상황이므로 <strong>미리보기 그대로 복사</strong>를 사용하거나, 미리보기 영역을 직접 드래그해서 복사하세요.
            </p>
            <CopyButtons
              htmlContent={htmlContent}
              markdownContent={markdownContent}
              textContent={textContent}
            />
            <BlogTemplatePreview html={htmlContent} />
          </div>
        </div>
      </div>
    </div>
  )
}
