export type HighlightClassName =
  | 'highlight-strong-positive'
  | 'highlight-positive'
  | 'highlight-negative'
  | 'highlight-risk'
  | 'highlight-neutral'
  | 'highlight-project-core'
  | 'highlight-tech'
  | 'highlight-benefit'
  | 'highlight-caution'

export const HIGHLIGHT_CLASS_OPTIONS: HighlightClassName[] = [
  'highlight-strong-positive',
  'highlight-positive',
  'highlight-negative',
  'highlight-risk',
  'highlight-neutral',
  'highlight-project-core',
  'highlight-tech',
  'highlight-benefit',
  'highlight-caution',
]

const HIGHLIGHT_BASE =
  'color:inherit;font-weight:700;padding:0 2px;border-radius:0;'

export const HIGHLIGHT_INLINE_STYLES: Record<HighlightClassName, string> = {
  'highlight-strong-positive': `${HIGHLIGHT_BASE}background:linear-gradient(transparent 62%, #dcfce7 62%);font-weight:800;`,
  'highlight-positive': `${HIGHLIGHT_BASE}background:linear-gradient(transparent 62%, #dcfce7 62%);`,
  'highlight-negative': `${HIGHLIGHT_BASE}background:linear-gradient(transparent 62%, #ffe4e6 62%);`,
  'highlight-risk': `${HIGHLIGHT_BASE}background:linear-gradient(transparent 62%, #ffe4e6 62%);font-weight:800;`,
  'highlight-neutral': `${HIGHLIGHT_BASE}background:linear-gradient(transparent 62%, #dbeafe 62%);`,
  'highlight-project-core': `${HIGHLIGHT_BASE}background:linear-gradient(transparent 62%, #fef3c7 62%);font-weight:800;`,
  'highlight-tech': `${HIGHLIGHT_BASE}background:linear-gradient(transparent 62%, #dbeafe 62%);font-weight:800;`,
  'highlight-benefit': `${HIGHLIGHT_BASE}background:linear-gradient(transparent 62%, #dcfce7 62%);font-weight:800;`,
  'highlight-caution': `${HIGHLIGHT_BASE}background:linear-gradient(transparent 62%, #fef3c7 62%);font-weight:800;`,
}

const PARAGRAPH_BASE =
  'font-size:16px;color:#222;margin:22px 0;line-height:1.95;word-break:keep-all;text-align:center;background:transparent;border:none;padding:0;border-radius:0;'

export const HEADING_HIGHLIGHT_INLINE_STYLE =
  'background:#f6ddc3;color:#111827;font-weight:800;padding:0 6px;line-height:1.6;border-radius:0;box-decoration-break:clone;-webkit-box-decoration-break:clone;'

export const PARAGRAPH_INLINE_STYLES: Record<string, string> = {
  base: PARAGRAPH_BASE,
  'paragraph-positive': '',
  'paragraph-risk': '',
  'paragraph-neutral': '',
  'paragraph-project-core': '',
  'paragraph-benefit': '',
  'paragraph-caution': '',
}

export const PARAGRAPH_SOFT_NOTE_INLINE_STYLE =
  'font-size:16px;color:#222;line-height:1.9;word-break:keep-all;text-align:center;background:#f7fbf8;border-left:3px solid #8fd19e;padding:12px 14px;border-radius:0;margin:20px 0;'

export const PARAGRAPH_SOFT_CAUTION_INLINE_STYLE =
  'font-size:16px;color:#222;line-height:1.9;word-break:keep-all;text-align:center;background:#fff8f8;border-left:3px solid #f3a6a6;padding:12px 14px;border-radius:0;margin:20px 0;'

const sectionTitleBase =
  'font-size:21px;font-weight:800;color:#111827;line-height:1.6;letter-spacing:-0.02em;margin:44px 0 20px;padding:0;background:transparent;border:none;border-radius:0;text-align:center;'

export const SECTION_TITLE_INLINE_STYLES: Record<string, string> = {
  base: sectionTitleBase,
  summary: sectionTitleBase,
  company: sectionTitleBase,
  news: sectionTitleBase,
  filing: sectionTitleBase,
  short: sectionTitleBase,
  trader: sectionTitleBase,
  positive: sectionTitleBase,
  risk: sectionTitleBase,
  final: sectionTitleBase,
  problem: sectionTitleBase,
  structure: sectionTitleBase,
  ui: sectionTitleBase,
  tech: sectionTitleBase,
  core: sectionTitleBase,
  'project-default': sectionTitleBase,
  'project-final': sectionTitleBase,
}

const subsectionTitleBase =
  'font-size:18px;font-weight:800;color:#111827;margin:30px 0 16px;padding:0;background:transparent;border:none;border-radius:0;text-align:center;line-height:1.6;'

export const SUBSECTION_TITLE_INLINE_STYLES: Record<string, string> = {
  base: subsectionTitleBase,
  'project-introduction': subsectionTitleBase,
  'stock-analysis': subsectionTitleBase,
}

export const QUOTE_INLINE_STYLE =
  'margin:20px auto;background:transparent;border:none;border-radius:0;padding:0;color:#0f172a;font-size:17px;font-weight:700;line-height:1.8;text-align:center;word-break:keep-all;'

export const ORDERED_LIST_INLINE_STYLE =
  'margin:14px 0 20px;padding:0;color:#222;font-size:16px;line-height:1.9;list-style-position:inside;text-align:center;'

export const ORDERED_LIST_ITEM_INLINE_STYLE =
  'margin:8px 0;text-align:center;word-break:keep-all;'

const TITLE_BASE =
  'font-size:26px;line-height:1.6;font-weight:800;color:#111827;margin:0 0 28px;text-align:center;letter-spacing:-0.02em;background:transparent;border:none;padding:0;word-break:keep-all;'

export const TITLE_INLINE_STYLES: Record<string, string> = {
  base: TITLE_BASE,
  'project-introduction': TITLE_BASE,
}

export const TITLE_INLINE_STYLE = TITLE_INLINE_STYLES.base

export const DATE_INLINE_STYLE =
  'font-size:13px;color:#6b7280;margin:0 0 22px;text-align:center;'

const INTRO_BASE =
  'background:transparent;border:none;border-radius:0;padding:0;margin:0 0 28px;color:#222;font-weight:500;line-height:1.95;text-align:center;word-break:keep-all;font-size:16px;'

export const INTRO_INLINE_STYLES: Record<string, string> = {
  base: INTRO_BASE,
  'project-introduction': INTRO_BASE,
}

export const INTRO_INLINE_STYLE = INTRO_INLINE_STYLES.base

export const DISCLAIMER_INLINE_STYLE =
  'margin:32px auto 0;background:#fffbeb;border:1px solid #fcd34d;border-left:3px solid #f59e0b;border-radius:0;padding:14px;color:#78350f;font-size:14px;line-height:1.8;text-align:center;word-break:keep-all;'

export const HASHTAG_INLINE_STYLE =
  'margin:26px auto 0;color:#2563eb;font-weight:700;line-height:1.9;text-align:center;word-break:keep-all;'

export const BLOG_WRAPPER_INLINE_STYLE =
  "max-width:430px;width:100%;margin:0 auto;font-family:Arial,'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;line-height:1.85;color:#222;text-align:center;word-break:keep-all;overflow-wrap:break-word;box-sizing:border-box;padding:22px 18px;background:#ffffff;"
