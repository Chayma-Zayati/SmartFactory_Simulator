export function createWsClient(
  url,
  {
    retryDelay = 1500,
    maxRetryDelay = 8000,
    heartbeatInterval = 10000,
    ackTimeout = 3000,
    maxRetries = 2,
    onMessage,
    onOpen,
    onClose,
    onError,
  } = {}
) {
  let socket = null
  let online = false
  let retry = retryDelay
  let heartbeatTimer = null
  let manuallyClosed = false
  const pending = new Map() 

  const clearPending = (cid, reason) => {
    const entry = pending.get(cid)
    if (entry) {
      clearTimeout(entry.timer)
      entry.reject?.(reason)
      pending.delete(cid)
    }
  }

  const startHeartbeat = () => {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (online && socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'PING', ts: Date.now() }))
      }
    }, heartbeatInterval)
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer) clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }

  const scheduleReconnect = () => {
    if (manuallyClosed) return
    const delay = retry
    retry = Math.min(maxRetryDelay, retry * 1.5)
    setTimeout(connect, delay)
  }

  const connect = () => {
    manuallyClosed = false
    socket = new WebSocket(url)

    socket.onopen = () => {
      online = true
      retry = retryDelay
      startHeartbeat()
      onOpen?.()
    }

    socket.onmessage = (evt) => {
      let data = evt.data
      try { data = JSON.parse(evt.data) } catch {}
      // Gestion ACK
      if (data?.type === 'ACK' && data.correlationId && pending.has(data.correlationId)) {
        const entry = pending.get(data.correlationId)
        clearTimeout(entry.timer)
        entry.resolve?.(data)
        pending.delete(data.correlationId)
        return
      }
      onMessage?.(data)
    }

    socket.onerror = (e) => {
      onError?.(e)
    }

    socket.onclose = () => {
      online = false
      stopHeartbeat()
      onClose?.()
      // fail pending
      pending.forEach((entry, cid) => clearPending(cid, new Error('WS closed')))
      scheduleReconnect()
    }
  }

  const send = (payload) =>
    new Promise((resolve, reject) => {
      const cid = payload.correlationId
      const attempt = 0

      const doSend = (tryCount) => {
        if (!(online && socket?.readyState === WebSocket.OPEN)) {
          return reject(new Error('WS offline'))
        }
        socket.send(JSON.stringify(payload))
        const timer = setTimeout(() => {
          if (tryCount < maxRetries) {
            doSend(tryCount + 1)
          } else {
            clearPending(cid, new Error('ACK timeout'))
          }
        }, ackTimeout)
        pending.set(cid, { timer, resolve, reject, attempt: tryCount })
      }

      doSend(attempt)
    })

  const close = () => {
    manuallyClosed = true
    stopHeartbeat()
    if (socket && socket.readyState === WebSocket.OPEN) socket.close()
    online = false
    pending.forEach((entry, cid) => clearPending(cid, new Error('WS closed')))
  }

  return {
    connect,
    send,
    close,
    get online() { return online },
  }
}