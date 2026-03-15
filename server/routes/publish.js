import { Router } from 'express'
import { chromium } from 'playwright'
import dotenv from 'dotenv'
import selectors from '../config/selectors.config.js'
import { randomDelay, humanType } from '../utils/delay.js'
import { broadcast } from '../utils/logger.js'

dotenv.config({ path: '../.env' })

const router = Router()

router.post('/', async (req, res) => {
  const { platform, content, ticker } = req.body

  if (!platform || !content) {
    return res.status(400).json({ error: '플랫폼과 콘텐츠를 모두 입력해주세요.' })
  }

  const isNaver = platform.toLowerCase() === 'naver'
  const credentials = {
    id: isNaver ? process.env.NAVER_ID : process.env.TISTORY_ID,
    pw: isNaver ? process.env.NAVER_PW : process.env.TISTORY_PW,
  }

  if (!credentials.id || !credentials.pw) {
    broadcast(`${platform} 자격증명이 .env에 설정되지 않았습니다.`, 'error')
    return res.status(400).json({ error: `.env에 ${platform.toUpperCase()} 자격증명을 설정해주세요.` })
  }

  let browser = null

  try {
    broadcast(`${platform} 블로그에 포스팅을 시작합니다...`, 'info')

    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })

    const page = await context.newPage()

    if (isNaver) {
      await publishToNaver(page, credentials, content, ticker)
    } else {
      await publishToTistory(page, credentials, content, ticker)
    }

    await randomDelay(2000, 3000)
    await browser.close()
    browser = null

    broadcast(`${platform} 블로그 포스팅 완료!`, 'success')
    return res.json({ success: true, message: `${platform} 발행 성공` })

  } catch (err) {
    broadcast(`${platform} 포스팅 오류: ${err.message}`, 'error')
    return res.status(500).json({ error: `포스팅 실패: ${err.message}` })
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
})

async function publishToNaver(page, credentials, content, ticker) {
  const sel = selectors.naver

  // Login
  broadcast('네이버 로그인 중...', 'info')
  await page.goto('https://nid.naver.com/nidlogin.login', { waitUntil: 'domcontentloaded' })
  await randomDelay(2000, 3000)

  await page.fill(sel.loginIdInput, credentials.id)
  await randomDelay(500, 1000)
  await page.fill(sel.loginPwInput, credentials.pw)
  await randomDelay(500, 1000)

  await page.click(sel.loginButton)
  await randomDelay(3000, 5000)

  broadcast('네이버 블로그 글쓰기 페이지로 이동 중...', 'info')

  // Navigate to blog write page
  await page.goto(`https://blog.naver.com/${credentials.id}/postwrite`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  })
  await randomDelay(3000, 5000)

  // Extract title from content
  const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i)
  const title = titleMatch
    ? titleMatch[1].replace(/<[^>]*>/g, '').trim()
    : `${ticker} 주식 분석 — ${new Date().toLocaleDateString('ko-KR')}`

  broadcast(`제목 입력 중: "${title}"`, 'info')

  // Fill title
  try {
    const titleInput = await page.waitForSelector(sel.titleInput, { timeout: 10000 })
    await titleInput.fill(title)
  } catch {
    broadcast('제목 입력란을 찾지 못했습니다. 수동으로 입력해주세요.', 'warn')
  }

  await randomDelay(1000, 2000)

  // Fill content via clipboard
  broadcast('본문 입력 중...', 'info')
  try {
    const contentArea = await page.waitForSelector(sel.contentArea, { timeout: 10000 })
    await contentArea.click()
    await randomDelay(500, 1000)

    // Use keyboard shortcuts to paste HTML content
    await page.evaluate((html) => {
      document.execCommand('insertHTML', false, html)
    }, content).catch(() => {})
  } catch {
    broadcast('본문 입력란을 찾지 못했습니다. 수동으로 입력해주세요.', 'warn')
  }

  await randomDelay(2000, 3000)

  // Click publish
  broadcast('발행 버튼 클릭 중...', 'info')
  try {
    const publishBtn = await page.waitForSelector(sel.publishButton, { timeout: 10000 })
    await publishBtn.click()
    await randomDelay(3000, 5000)
  } catch {
    broadcast('발행 버튼을 찾지 못했습니다. 수동으로 발행해주세요.', 'warn')
  }
}

async function publishToTistory(page, credentials, content, ticker) {
  const sel = selectors.tistory

  // Login
  broadcast('티스토리 로그인 중...', 'info')
  await page.goto('https://www.tistory.com/auth/login', { waitUntil: 'domcontentloaded' })
  await randomDelay(2000, 3000)

  // Try Kakao login or direct login
  try {
    await page.fill(sel.loginIdInput, credentials.id)
    await randomDelay(500, 1000)
    await page.fill(sel.loginPwInput, credentials.pw)
    await randomDelay(500, 1000)
    await page.click(sel.loginButton)
  } catch {
    broadcast('직접 로그인을 시도합니다...', 'info')
    // Alternative login flow
    const kakaoBtn = await page.$('a[class*="kakao"], .btn_kakao')
    if (kakaoBtn) {
      await kakaoBtn.click()
      await randomDelay(2000, 3000)
      await page.fill('input[name="loginId"], #loginId--1', credentials.id)
      await randomDelay(500, 1000)
      await page.fill('input[name="password"], #password--2', credentials.pw)
      await randomDelay(500, 1000)
      await page.click('button[type="submit"]')
    }
  }

  await randomDelay(3000, 5000)

  broadcast('티스토리 글쓰기 페이지로 이동 중...', 'info')

  // Navigate to write page
  await page.goto('https://www.tistory.com/auth/login', { waitUntil: 'domcontentloaded' })
  await randomDelay(2000, 3000)

  // Extract title
  const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i)
  const title = titleMatch
    ? titleMatch[1].replace(/<[^>]*>/g, '').trim()
    : `${ticker} 주식 분석 — ${new Date().toLocaleDateString('ko-KR')}`

  broadcast(`제목 입력 중: "${title}"`, 'info')

  try {
    const titleInput = await page.waitForSelector(sel.titleInput, { timeout: 10000 })
    await titleInput.fill(title)
  } catch {
    broadcast('제목 입력란을 찾지 못했습니다.', 'warn')
  }

  await randomDelay(1000, 2000)

  // Content
  broadcast('본문 입력 중...', 'info')
  try {
    // Switch to HTML mode if available
    const htmlBtn = await page.$('button[title="HTML"], .btn_html')
    if (htmlBtn) {
      await htmlBtn.click()
      await randomDelay(500, 1000)
    }

    const contentArea = await page.waitForSelector(sel.contentArea, { timeout: 10000 })
    await contentArea.click()
    await page.evaluate((html) => {
      const editor = document.querySelector('#tinymce, .CodeMirror, #editor-root')
      if (editor) {
        if (editor.CodeMirror) {
          editor.CodeMirror.setValue(html)
        } else {
          editor.innerHTML = html
        }
      }
    }, content).catch(() => {})
  } catch {
    broadcast('본문 입력란을 찾지 못했습니다.', 'warn')
  }

  await randomDelay(2000, 3000)

  // Publish
  broadcast('발행 버튼 클릭 중...', 'info')
  try {
    const publishBtn = await page.waitForSelector(sel.publishButton, { timeout: 10000 })
    await publishBtn.click()
    await randomDelay(3000, 5000)
  } catch {
    broadcast('발행 버튼을 찾지 못했습니다. 수동으로 발행해주세요.', 'warn')
  }
}

export default router
