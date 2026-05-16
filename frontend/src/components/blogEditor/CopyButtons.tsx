import { useState } from 'react'
import { copyHtmlToClipboard, copyTextToClipboard, copyPreviewElement } from '../../utils/clipboard'

interface CopyButtonsProps {
  htmlContent: string
  markdownContent: string
  textContent: string
}

export default function CopyButtons({
  htmlContent,
  markdownContent,
  textContent,
}: CopyButtonsProps): React.JSX.Element {
  const [message, setMessage] = useState('')

  const notify = (msg: string) => {
    setMessage(msg)
    window.setTimeout(() => setMessage(''), 3000)
  }

  const handleCopyHtml = async () => {
    const ok = await copyHtmlToClipboard(htmlContent, textContent)
    if (ok) {
      notify('HTML 형식으로 복사되었습니다. 네이버 블로그에 붙여넣으면 스타일이 적용됩니다.')
    } else {
      notify('HTML 복사에 실패했습니다. 아래 "미리보기 그대로 복사"를 사용해 보세요.')
    }
  }

  const handleCopyMarkdown = async () => {
    const ok = await copyTextToClipboard(markdownContent)
    notify(ok ? '마크다운이 복사되었습니다.' : '마크다운 복사에 실패했습니다.')
  }

  const handleCopyText = async () => {
    const ok = await copyTextToClipboard(textContent)
    notify(ok ? '텍스트가 복사되었습니다.' : '텍스트 복사에 실패했습니다.')
  }

  const handleCopyPreview = () => {
    const ok = copyPreviewElement('blog-preview-copy-area')
    notify(ok ? '미리보기가 복사되었습니다. 네이버 블로그에 붙여넣어 보세요.' : '미리보기 복사에 실패했습니다.')
  }

  return (
    <div className="blog-editor-copy">
      <div className="blog-editor-actions">
        <button type="button" className="blog-editor-button" onClick={handleCopyHtml}>
          HTML 형식 복사
        </button>
        <button type="button" className="blog-editor-button secondary" onClick={handleCopyMarkdown}>
          Markdown 복사
        </button>
        <button type="button" className="blog-editor-button secondary" onClick={handleCopyText}>
          텍스트 복사
        </button>
        <button type="button" className="blog-editor-button secondary" onClick={handleCopyPreview}>
          미리보기 그대로 복사
        </button>
      </div>
      {message && <p className="copy-message">{message}</p>}
    </div>
  )
}
