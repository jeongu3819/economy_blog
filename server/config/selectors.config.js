/**
 * CSS Selector 설정 파일
 * 각 사이트의 UI 변경 시 이 파일만 수정하면 됩니다.
 */

export default {
  stocktitan: {
    searchInput: 'input[type="search"], input[name="q"], input[placeholder*="Search"]',
    searchButton: 'button[type="submit"], button[aria-label="Search"]',
    newsItem: 'article, .news-item, .press-release-item, [class*="release"]',
    newsDate: 'time, .date, [class*="date"], [datetime]',
    newsTitle: 'h2 a, h3 a, .title a, [class*="title"] a',
    newsLink: 'a[href*="press-release"], a[href*="news"]',
  },

  chatgpt: {
    loginButton: '[data-testid="login-button"]',
    googleLoginButton: 'button[data-provider="google"]',
    textArea: '#prompt-textarea, textarea[data-id="root"]',
    sendButton: 'button[data-testid="send-button"], button[aria-label="Send prompt"]',
    responseContainer: '[data-message-author-role="assistant"]',
    responseText: '.markdown, .prose, [class*="markdown"]',
    regenerateButton: 'button:has-text("Regenerate"), button[aria-label*="Regenerate"]',
  },

  naver: {
    loginIdInput: '#id',
    loginPwInput: '#pw',
    loginButton: '.btn_login, #log\\.login',
    blogWriteButton: 'a[href*="blog.me"], .btn_write',
    titleInput: '.se-title-input, #subject',
    contentArea: '.se-component-content, #content',
    publishButton: '.publish_btn, .btn_ok, button:has-text("발행")',
    categorySelect: '.blog_category, select[name="category"]',
  },

  tistory: {
    loginIdInput: '#loginId, input[name="loginId"]',
    loginPwInput: '#loginPw, input[name="password"]',
    loginButton: '.btn_login, button[type="submit"]',
    writeButton: '#write-btn, a[href*="manage/newpost"]',
    titleInput: '#post-title-inp',
    contentArea: '#tinymce, .CodeMirror, #editor-root',
    publishButton: '#publish-layer-btn, .btn_save',
    categorySelect: '#category',
  },
}
