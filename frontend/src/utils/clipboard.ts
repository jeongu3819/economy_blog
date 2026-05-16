export async function copyHtmlToClipboard(html: string, plainText?: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([html], { type: 'text/html' })
      const textBlob = new Blob([plainText ?? html], { type: 'text/plain' })
      await navigator.clipboard.write([
        new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob }),
      ])
      return true
    }
  } catch (err) {
    console.error('HTML clipboard write failed:', err)
  }
  return fallbackCopyHtml(html)
}

function fallbackCopyHtml(html: string): boolean {
  const container = document.createElement('div')
  container.innerHTML = html
  container.style.cssText = 'position:fixed;left:-9999px;top:0;'
  container.setAttribute('contenteditable', 'true')
  document.body.appendChild(container)

  const range = document.createRange()
  range.selectNodeContents(container)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)

  const ok = document.execCommand('copy')
  sel?.removeAllRanges()
  document.body.removeChild(container)
  return ok
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (err) {
    console.error('Text clipboard write failed:', err)
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.cssText = 'position:fixed;left:-9999px;top:0;'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)
  return ok
}

export function copyPreviewElement(elementId: string): boolean {
  const el = document.getElementById(elementId)
  if (!el) return false
  const range = document.createRange()
  range.selectNodeContents(el)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
  const ok = document.execCommand('copy')
  sel?.removeAllRanges()
  return ok
}
