import { useState } from 'react'

interface CopyButtonsProps {
  htmlContent: string
  markdownContent: string
  textContent: string
}

async function copyToClipboard(content: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content)
      return true
    }
  } catch {
    // fall through to fallback
  }
  try {
    const textarea = document.createElement('textarea')
    textarea.value = content
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}

export default function CopyButtons({
  htmlContent,
  markdownContent,
  textContent,
}: CopyButtonsProps): React.JSX.Element {
  const [message, setMessage] = useState('')

  const handleCopy = async (content: string, label: string) => {
    const ok = await copyToClipboard(content)
    setMessage(ok ? `${label}이(가) 복사되었습니다.` : `${label} 복사에 실패했습니다.`)
    window.setTimeout(() => setMessage(''), 2500)
  }

  return (
    <div className="blog-editor-copy">
      <div className="blog-editor-actions">
        <button className="blog-editor-button" onClick={() => handleCopy(htmlContent, 'HTML')}>
          HTML 복사
        </button>
        <button
          className="blog-editor-button secondary"
          onClick={() => handleCopy(markdownContent, '마크다운')}
        >
          Markdown 복사
        </button>
        <button
          className="blog-editor-button secondary"
          onClick={() => handleCopy(textContent, '텍스트')}
        >
          미리보기 텍스트 복사
        </button>
      </div>
      {message && <p className="copy-message">{message}</p>}
    </div>
  )
}
