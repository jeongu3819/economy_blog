import { Router } from 'express'
import { chromium } from 'playwright'
import path from 'path'
import selectors from '../config/selectors.config.js'
import { randomDelay, humanType } from '../utils/delay.js'
import { broadcast } from '../utils/logger.js'

const router = Router()

const GPTS_URL = 'https://chatgpt.com/g/g-67f26f292d908191af9814f781eff794-newstock'

router.post('/', async (req, res) => {
  const { ticker, scrapeData } = req.body

  if (!ticker) {
    return res.status(400).json({ error: '티커를 입력해주세요.' })
  }

  let browserContext = null

  try {
    broadcast('ChatGPT GPTs에 접속 중...', 'info')

    const userDataDir = path.join(process.cwd(), 'playwright-session')

    browserContext = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })

    const pages = browserContext.pages()
    const page = pages.length > 0 ? pages[0] : await browserContext.newPage()

    // Navigate to GPTs
    await page.goto(GPTS_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    })
    await randomDelay(3000, 5000)

    // Check for login button
    const loginBtn = await page.$(selectors.chatgpt.loginButton).catch(() => null)
    if (loginBtn) {
      broadcast('로그인이 필요하여 로그인을 시도합니다...', 'info')
      await loginBtn.click()
      await randomDelay(2000, 3000)
      
      const googleBtn = await page.waitForSelector(selectors.chatgpt.googleLoginButton, { timeout: 15000 }).catch(() => null)
      if (googleBtn) {
        broadcast('구글로 계속하기 선택됨. (필요시 팝업된 브라우저에서 직접 계정을 선택해주세요)', 'info')
        await googleBtn.click()
        await randomDelay(5000, 8000)
      } else {
        broadcast('구글 로그인 버튼을 찾을 수 없습니다. 브라우저에서 직접 로그인해주세요.', 'warn')
      }
    }

    // Build prompt
    const today = new Date().toISOString().split('T')[0]
    const newsContext = scrapeData?.news?.length
      ? `\n\n오늘의 관련 뉴스:\n${scrapeData.news.map(n => `- ${n.title}`).join('\n')}`
      : '\n\n오늘의 관련 뉴스가 없습니다. 최근 동향을 기반으로 분석해주세요.'

    const prompt = `오늘 날짜: ${today}
티커: ${ticker}

위 종목에 대한 오늘자 주식 분석 블로그 글을 작성해주세요.
반드시 오늘 날짜(${today})의 데이터를 기반으로 분석해주세요.
${newsContext}

다음 형식으로 HTML 블로그 포스팅을 작성해주세요:
1. 매력적인 제목 (h1)
2. 시장 동향 요약
3. 기술적 분석
4. 투자 의견
5. 면책 조항`

    broadcast('프롬프트를 입력 중...', 'info')

    // Wait for ChatGPT textarea (longer timeout to allow manual login if needed)
    try {
      broadcast('입력창 대기 중...', 'info')
      await page.waitForSelector(selectors.chatgpt.textArea, { timeout: 120000 })
      await randomDelay(1000, 2000)

      // Type prompt
      await page.fill(selectors.chatgpt.textArea, prompt)
      await randomDelay(500, 1000)

      // Send prompt
      broadcast('AI에게 분석을 요청 중...', 'info')
      const sendBtn = await page.$(selectors.chatgpt.sendButton)
      if (sendBtn) {
        await sendBtn.click()
      } else {
        await page.keyboard.press('Enter')
      }

      // Wait for response
      broadcast('AI 응답 대기 중... (최대 120초)', 'info')
      await page.waitForSelector(selectors.chatgpt.responseContainer, { timeout: 120000 })
      await randomDelay(5000, 10000)

      // Wait for response to complete (check if still generating)
      let attempts = 0
      let lastText = ''
      while (attempts < 30) {
        const currentText = await page.$eval(
          `${selectors.chatgpt.responseContainer}:last-child`,
          el => el.textContent
        ).catch(() => '')

        if (currentText && currentText === lastText && currentText.length > 100) {
          break
        }
        lastText = currentText
        await randomDelay(2000, 3000)
        attempts++
      }

      // Extract response - get HTML content
      let responseContent = await page.$eval(
        `${selectors.chatgpt.responseContainer}:last-child ${selectors.chatgpt.responseText}`,
        el => el.innerHTML
      ).catch(() => null)

      // Fallback to text if HTML extraction fails
      if (!responseContent) {
        responseContent = await page.$eval(
          `${selectors.chatgpt.responseContainer}:last-child`,
          el => el.innerHTML
        ).catch(() => '')
      }

      // Check if response mentions today's data
      if (responseContent && !responseContent.includes(today)) {
        broadcast('오늘 데이터 누락 감지! 재질의 중...', 'warn')

        const rePrompt = `위 응답에서 오늘 날짜(${today})의 실제 데이터가 반영되지 않은 것 같습니다. 반드시 오늘(${today}) 기준의 최신 데이터를 포함하여 다시 작성해주세요.`

        await page.fill(selectors.chatgpt.textArea, rePrompt)
        await randomDelay(500, 1000)
        
        const sendBtn2 = await page.$(selectors.chatgpt.sendButton)
        if (sendBtn2) await sendBtn2.click()
        else await page.keyboard.press('Enter')

        await randomDelay(5000, 8000)

        // Wait for new response
        attempts = 0
        lastText = ''
        while (attempts < 30) {
          const containers = await page.$$(selectors.chatgpt.responseContainer)
          const lastContainer = containers[containers.length - 1]
          const currentText = lastContainer ? await lastContainer.textContent() : ''
          
          if (currentText && currentText === lastText && currentText.length > 100) {
            break
          }
          lastText = currentText
          await randomDelay(2000, 3000)
          attempts++
        }

        // Re-extract
        const containers = await page.$$(selectors.chatgpt.responseContainer)
        const lastContainer = containers[containers.length - 1]
        if (lastContainer) {
          responseContent = await lastContainer.$eval(
            selectors.chatgpt.responseText,
            el => el.innerHTML
          ).catch(() => lastContainer.innerHTML())
        }
      }

      await browserContext.close()
      browserContext = null

      if (responseContent) {
        broadcast('AI 분석 완료! 블로그 원고가 생성되었습니다.', 'success')
        return res.json({
          success: true,
          content: responseContent,
          ticker,
        })
      } else {
        throw new Error('AI 응답을 가져올 수 없습니다.')
      }

    } catch (innerErr) {
      // If ChatGPT interaction fails, generate fallback content
      broadcast(`ChatGPT 직접 접속 실패: ${innerErr.message}. 기본 원고를 생성합니다.`, 'warn')

      await browserContext?.close().catch(() => {})
      browserContext = null

      const fallbackContent = generateFallbackContent(ticker, scrapeData)
      return res.json({
        success: true,
        content: fallbackContent,
        ticker,
        fallback: true,
      })
    }

  } catch (err) {
    broadcast(`AI 분석 오류: ${err.message}`, 'error')
    return res.status(500).json({ error: `AI 분석 실패: ${err.message}` })
  } finally {
    if (browserContext) await browserContext.close().catch(() => {})
  }
})

function generateFallbackContent(ticker, scrapeData) {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  const newsSection = scrapeData?.news?.length
    ? scrapeData.news.map(n => `<li>${n.title}</li>`).join('\n')
    : '<li>오늘 새로운 뉴스가 없습니다.</li>'

  return `
<h1>📊 ${ticker} 주식 분석 리포트 — ${today}</h1>

<h2>📰 오늘의 뉴스</h2>
<ul>
${newsSection}
</ul>

<h2>📈 시장 동향</h2>
<p>${ticker} 종목에 대한 오늘의 시장 동향을 분석한 결과, 전반적인 시장 흐름을 반영하고 있습니다. 
세부적인 분석을 위해 추가 데이터를 확인해주세요.</p>

<h2>🔍 기술적 분석</h2>
<p>기술적 지표들을 종합적으로 검토한 결과, 현재 가격 움직임에 주의가 필요합니다.
주요 지지선과 저항선을 참고하여 투자 결정을 내리시기 바랍니다.</p>

<h2>💡 투자 의견</h2>
<p>본 분석은 참고용으로만 활용하시기 바랍니다. 
실제 투자 결정은 개인의 투자 성향과 리스크 허용 범위를 고려하여 신중하게 진행하시기 바랍니다.</p>

<hr>
<p style="color: gray; font-size: 0.85em;">
⚠️ <strong>면책 조항</strong>: 본 블로그 포스팅은 정보 제공 목적으로만 작성되었으며, 투자 권유가 아닙니다. 
투자에 따른 모든 책임은 투자자 본인에게 있습니다.
</p>
`
}

export default router
