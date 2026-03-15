import { Router } from 'express'
import { chromium } from 'playwright'
import selectors from '../config/selectors.config.js'
import { randomDelay } from '../utils/delay.js'
import { broadcast } from '../utils/logger.js'

const router = Router()

router.post('/', async (req, res) => {
  const { ticker } = req.body

  if (!ticker) {
    return res.status(400).json({ error: '티커를 입력해주세요.' })
  }

  let browser = null

  try {
    broadcast(`StockTitan에서 "${ticker}" 검색을 시작합니다...`, 'info')

    browser = await chromium.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    })

    const page = await context.newPage()

    // Navigate to StockTitan
    broadcast('StockTitan 사이트에 접속 중...', 'info')
    await page.goto(`https://stocktitan.net/search?q=${encodeURIComponent(ticker)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    await randomDelay(2000, 4000)

    // Check for today's date news
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0] // YYYY-MM-DD
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    broadcast(`오늘 날짜(${todayFormatted}) 뉴스/공시를 검색 중...`, 'info')

    // Try to find news items
    const newsItems = await page.$$eval(
      selectors.stocktitan.newsItem,
      (items, todayStr) => {
        return items.slice(0, 20).map(item => {
          const titleEl = item.querySelector('h2 a, h3 a, [class*="title"] a, a')
          const dateEl = item.querySelector('time, [class*="date"], [datetime]')
          return {
            title: titleEl?.textContent?.trim() || '',
            link: titleEl?.href || '',
            date: dateEl?.getAttribute('datetime') || dateEl?.textContent?.trim() || '',
          }
        }).filter(item => item.title)
      },
      todayStr
    ).catch(() => [])

    // Filter for today's news
    const todaysNews = newsItems.filter(item => {
      return item.date && item.date.includes(todayFormatted)
    })

    await randomDelay(1000, 2000)
    await browser.close()
    browser = null

    if (todaysNews.length > 0) {
      broadcast(`오늘의 뉴스 ${todaysNews.length}건 발견!`, 'success')
      return res.json({
        success: true,
        message: `${ticker} 관련 오늘의 뉴스 ${todaysNews.length}건 발견`,
        data: {
          ticker,
          date: todayFormatted,
          hasNews: true,
          newsCount: todaysNews.length,
          news: todaysNews,
          allNews: newsItems.slice(0, 10),
        }
      })
    } else {
      broadcast(`오늘의 뉴스는 없습니다. 최근 뉴스 ${newsItems.length}건을 반환합니다.`, 'warn')
      return res.json({
        success: true,
        message: `${ticker} 관련 오늘의 뉴스 없음. 최근 뉴스 ${newsItems.length}건 수집.`,
        data: {
          ticker,
          date: todayFormatted,
          hasNews: false,
          newsCount: 0,
          news: [],
          allNews: newsItems.slice(0, 10),
        }
      })
    }

  } catch (err) {
    broadcast(`스크래핑 오류: ${err.message}`, 'error')
    return res.status(500).json({ error: `스크래핑 실패: ${err.message}` })
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
})

export default router
