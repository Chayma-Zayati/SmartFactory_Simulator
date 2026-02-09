export function createWsClient(url) {
  let socket = null
  let online = false

  const connect = (onOpen) => {
    online = false
    setTimeout(() => {
      online = true
      onOpen?.()
    }, 300) 
  }

  const send = (event) => {
  
    if (!online) {
      console.warn('[WS OFFLINE] Événement mis en file:', event)
      return
    }
    console.log('[WS SEND]', event)
    // socket?.send(JSON.stringify(event))
  }

  const close = () => {
    online = false
    try { socket?.close?.() } catch {}
  }

  return {
    url,
    online,
    connect,
    send,
    close,
    get onlineStatus() { return online }
  }
}