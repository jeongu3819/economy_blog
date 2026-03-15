/**
 * SSE 로그 매니저
 * 실시간으로 프론트엔드에 로그를 전송합니다.
 */

const clients = new Set()

export function addClient(res) {
  clients.add(res)
  res.on('close', () => clients.delete(res))
}

export function broadcast(message, type = 'info') {
  const data = JSON.stringify({ message, type, timestamp: new Date().toISOString() })
  for (const client of clients) {
    try {
      client.write(`data: ${data}\n\n`)
    } catch {
      clients.delete(client)
    }
  }
  // Also log to console
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    system: '⚙️',
    warn: '⚠️',
  }[type] || '📋'
  console.log(`${prefix} [${type.toUpperCase()}] ${message}`)
}

export function getClientCount() {
  return clients.size
}
