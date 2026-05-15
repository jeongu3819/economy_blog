export type HighlightClassName =
  | 'highlight-strong-positive'
  | 'highlight-positive'
  | 'highlight-negative'
  | 'highlight-risk'
  | 'highlight-neutral'

export const HIGHLIGHT_CLASS_OPTIONS: HighlightClassName[] = [
  'highlight-strong-positive',
  'highlight-positive',
  'highlight-negative',
  'highlight-risk',
  'highlight-neutral',
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
}

export const PARAGRAPH_INLINE_STYLES: Record<string, string> = {
  base: 'font-size:16px;color:#374151;margin:12px 0;line-height:1.82;word-break:keep-all;',
  'paragraph-positive':
    'background:#f0fdf4;border-left:5px solid #22c55e;padding:12px 14px;border-radius:12px;color:#14532d;',
  'paragraph-risk':
    'background:#fff1f2;border-left:5px solid #f43f5e;padding:12px 14px;border-radius:12px;color:#881337;',
  'paragraph-neutral':
    'background:#f8fafc;border-left:5px solid #94a3b8;padding:12px 14px;border-radius:12px;color:#1f2937;',
}

export const SECTION_TITLE_INLINE_STYLES: Record<string, string> = {
  base:
    'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;color:#111827;background:#f3f4f6;',
  summary:
    'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;background:#eef2ff;color:#3730a3;',
  company:
    'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;background:#f0f9ff;color:#075985;',
  news:
    'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;background:#ecfdf5;color:#047857;',
  filing:
    'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;background:#f8fafc;color:#334155;',
  short:
    'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;background:#fff7ed;color:#c2410c;',
  trader:
    'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;background:#faf5ff;color:#7e22ce;',
  positive:
    'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;background:#ecfdf5;color:#047857;',
  risk:
    'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;background:#fff1f2;color:#be123c;',
  final:
    'font-size:22px;font-weight:850;margin:28px 0 14px;padding:10px 14px;border-radius:12px;background:#111827;color:#ffffff;',
}

export const TITLE_INLINE_STYLE =
  'font-size:30px;line-height:1.35;font-weight:900;color:#111827;border-left:8px solid #2563eb;padding-left:14px;margin:0 0 10px;'

export const DATE_INLINE_STYLE = 'font-size:13px;color:#6b7280;margin:0 0 18px;'

export const INTRO_INLINE_STYLE =
  'background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:16px;margin:0 0 24px;color:#1e3a8a;font-weight:500;line-height:1.82;'

export const DISCLAIMER_INLINE_STYLE =
  'margin-top:32px;background:#fffbeb;border:1px solid #fcd34d;border-left:6px solid #f59e0b;border-radius:16px;padding:16px;color:#78350f;font-size:14px;line-height:1.75;'

export const HASHTAG_INLINE_STYLE = 'margin-top:24px;color:#2563eb;font-weight:700;line-height:1.8;'
