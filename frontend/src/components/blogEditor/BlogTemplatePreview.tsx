interface BlogTemplatePreviewProps {
  html: string
}

/**
 * Renders the inline-styled HTML that will be copied to the clipboard,
 * so the user can sanity-check what Naver blog will receive.
 */
export default function BlogTemplatePreview({
  html,
}: BlogTemplatePreviewProps): React.JSX.Element {
  return (
    <details className="blog-editor-template">
      <summary>네이버 붙여넣기용 HTML 미리보기 (inline style)</summary>
      <div
        className="blog-editor-template-render"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <pre className="blog-editor-template-code">{html}</pre>
    </details>
  )
}
