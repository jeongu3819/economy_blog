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

export const HIGHLIGHT_INLINE_STYLES: Record<HighlightClassName, string> = {
  'highlight-strong-positive':
    'background:#dcfce7;color:#166534;font-weight:800;padding:2px 5px;border-radius:6px;',
  'highlight-positive':
    'background:#e8f5e9;color:#166534;font-weight:700;padding:2px 5px;border-radius:6px;',
  'highlight-negative':
    'background:#fee2e2;color:#991b1b;font-weight:700;padding:2px 5px;border-radius:6px;',
  'highlight-risk':
    'background:#ffe4e6;color:#be123c;font-weight:800;padding:2px 5px;border-radius:6px;',
  'highlight-neutral':
    'background:#eef2ff;color:#3730a3;font-weight:700;padding:2px 5px;border-radius:6px;',
  'highlight-project-core':
    'background:#ffedd5;color:#c2410c;font-weight:800;padding:2px 5px;border-radius:6px;',
  'highlight-tech':
    'background:#e0f2fe;color:#0369a1;font-weight:800;padding:2px 5px;border-radius:6px;',
  'highlight-benefit':
    'background:#dcfce7;color:#166534;font-weight:800;padding:2px 5px;border-radius:6px;',
  'highlight-caution':
    'background:#fef3c7;color:#92400e;font-weight:800;padding:2px 5px;border-radius:6px;',
}

export const PARAGRAPH_INLINE_STYLES: Record<string, string> = {
  base: 'font-size:16px;color:#374151;margin:12px 0;line-height:1.82;word-break:keep-all;',
  'paragraph-positive':
    'background:#f0fdf4;border-left:5px solid #22c55e;padding:12px 14px;border-radius:12px;color:#14532d;',
  'paragraph-risk':
    'background:#fff1f2;border-left:5px solid #f43f5e;padding:12px 14px;border-radius:12px;color:#881337;',
  'paragraph-neutral':
    'background:#f8fafc;border-left:5px solid #94a3b8;padding:12px 14px;border-radius:12px;color:#1f2937;',
  'paragraph-project-core':
    'background:#fff7ed;border-left:5px solid #f97316;padding:13px 15px;border-radius:14px;color:#7c2d12;',
  'paragraph-benefit':
    'background:#f0fdf4;border-left:5px solid #22c55e;padding:13px 15px;border-radius:14px;color:#14532d;',
  'paragraph-caution':
    'background:#fffbeb;border-left:5px solid #f59e0b;padding:13px 15px;border-radius:14px;color:#78350f;',
}

const sectionTitleBase =
  'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;'

export const SECTION_TITLE_INLINE_STYLES: Record<string, string> = {
  base: `${sectionTitleBase}color:#111827;background:#f3f4f6;`,
  summary: `${sectionTitleBase}background:#eef2ff;color:#3730a3;`,
  company: `${sectionTitleBase}background:#f0f9ff;color:#075985;`,
  news: `${sectionTitleBase}background:#ecfdf5;color:#047857;`,
  filing: `${sectionTitleBase}background:#f8fafc;color:#334155;`,
  short: `${sectionTitleBase}background:#fff7ed;color:#c2410c;`,
  trader: `${sectionTitleBase}background:#faf5ff;color:#7e22ce;`,
  positive: `${sectionTitleBase}background:#ecfdf5;color:#047857;`,
  risk: `${sectionTitleBase}background:#fff1f2;color:#be123c;`,
  final: `${sectionTitleBase}background:#111827;color:#ffffff;`,
  // project-introduction
  problem: `${sectionTitleBase}background:#f5f3ff;color:#6d28d9;`,
  structure: `${sectionTitleBase}background:#eff6ff;color:#1d4ed8;`,
  ui: `${sectionTitleBase}background:#ecfeff;color:#0e7490;`,
  tech: `${sectionTitleBase}background:#f8fafc;color:#334155;`,
  core: `${sectionTitleBase}background:#fff7ed;color:#c2410c;`,
  'project-default': `${sectionTitleBase}background:#f3f4f6;color:#111827;`,
  'project-final': `${sectionTitleBase}background:#0f172a;color:#ffffff;`,
}

const subsectionTitleBase =
  'font-size:18px;font-weight:800;margin:18px 0 10px;padding:6px 10px;border-radius:10px;'

export const SUBSECTION_TITLE_INLINE_STYLES: Record<string, string> = {
  base: `${subsectionTitleBase}color:#111827;background:#f9fafb;border-left:4px solid #9ca3af;`,
  'project-introduction': `${subsectionTitleBase}color:#1e3a8a;background:#eff6ff;border-left:4px solid #3b82f6;`,
  'stock-analysis': `${subsectionTitleBase}color:#1f2937;background:#f3f4f6;border-left:4px solid #6b7280;`,
}

export const QUOTE_INLINE_STYLE =
  'margin:18px 0;background:#f8fafc;border-left:6px solid #3b82f6;border-radius:16px;padding:16px 18px;color:#0f172a;font-size:17px;font-weight:700;line-height:1.75;'

export const ORDERED_LIST_INLINE_STYLE =
  'margin:12px 0 18px 22px;padding:0;color:#374151;font-size:16px;line-height:1.8;'

export const ORDERED_LIST_ITEM_INLINE_STYLE = 'margin:6px 0;'

export const TITLE_INLINE_STYLES: Record<string, string> = {
  base: 'font-size:30px;line-height:1.35;font-weight:900;color:#111827;border-left:8px solid #2563eb;padding-left:14px;margin:0 0 10px;',
  'project-introduction':
    'font-size:30px;line-height:1.35;font-weight:900;color:#0f172a;border-left:8px solid #3b82f6;padding-left:14px;margin:0 0 14px;',
}

export const TITLE_INLINE_STYLE = TITLE_INLINE_STYLES.base

export const DATE_INLINE_STYLE = 'font-size:13px;color:#6b7280;margin:0 0 18px;'

export const INTRO_INLINE_STYLES: Record<string, string> = {
  base: 'background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:16px;margin:0 0 24px;color:#1e3a8a;font-weight:500;line-height:1.82;',
  'project-introduction':
    'background:#eff6ff;border:1px solid #bfdbfe;border-radius:18px;padding:18px;margin:0 0 22px;color:#1e3a8a;font-weight:500;line-height:1.85;',
}

export const INTRO_INLINE_STYLE = INTRO_INLINE_STYLES.base

export const DISCLAIMER_INLINE_STYLE =
  'margin-top:32px;background:#fffbeb;border:1px solid #fcd34d;border-left:6px solid #f59e0b;border-radius:16px;padding:16px;color:#78350f;font-size:14px;line-height:1.75;'

export const HASHTAG_INLINE_STYLE = 'margin-top:24px;color:#2563eb;font-weight:700;line-height:1.8;'
