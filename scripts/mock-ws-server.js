import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8081 })
console.log('Mock WS listening on ws://localhost:8081')

wss.on('connection', (ws, req) => {
  console.log('Client connected from', req.socket.remoteAddress)

  ws.on('close', () => console.log('Client disconnected'))

  ws.on('message', (data) => {
    let msg = data.toString()
    try { msg = JSON.parse(msg) } catch {}
    console.log('[recv]', msg)

    // Répondre ACK si correlationId présent
    if (msg?.correlationId) {
      const ack = { type: 'ACK', correlationId: msg.correlationId }
      console.log('[send]', ack)
      ws.send(JSON.stringify(ack))
    }

    // Répondre PONG aux PING
    if (msg?.type === 'PING') {
      const pong = { type: 'PONG', ts: Date.now() }
      console.log('[send]', pong)
      ws.send(JSON.stringify(pong))
    }
  })
})