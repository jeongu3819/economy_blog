/**
 * 랜덤 딜레이 유틸리티 (봇 탐지 회피용)
 */

export function randomDelay(minMs = 1000, maxMs = 3000) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  return new Promise(resolve => setTimeout(resolve, delay))
}

export function humanTypeDelay() {
  return randomDelay(50, 200)
}

export async function humanType(page, selector, text) {
  await page.click(selector)
  for (const char of text) {
    await page.keyboard.type(char)
    await humanTypeDelay()
  }
}
