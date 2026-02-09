import { useEffect, useMemo, useRef, useState } from 'react'
import { createWsClient } from '../lib/createWsClient'

const nowISO = () => new Date().toISOString()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const formatDuration = (totalSeconds) => {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const s = String(totalSeconds % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

const initialStats = {
  ok: 0,
  bad: 0,
  total: 0,
  breakdowns: 0,
  qualityRate: 0,
  totalEvents: 0,
  uptimeDisplay: '00:00:00',
  lastUpdate: null
}

export default function useMachineSimulator({
  factoryId = 'FACTORY-001',
  machineId = 'MACH-003',
  wsUrl = 'ws://calculation-service:8080/events',
  autoProduce = false
} = {}) {
  const [ws, setWs] = useState({ online: false, url: wsUrl })
  const [session, setSession] = useState({ active: false, employee: null, startedAt: null })
  const [machine, setMachine] = useState({
    state: 'OFFLINE',
    message: 'Machine offline — Please scan an NFC card'
  })
  const [stats, setStats] = useState(initialStats)
  const [logs, setLogs] = useState([])
  const [productionSeconds, setProductionSeconds] = useState(0)

  
  const lastCycleStartRef = useRef(null)    
  const lastPieceRef = useRef(null)         
  const breakdownStartRef = useRef(null)    
  const lastActionRef = useRef(null)        
  const pushLog = (level, eventType, message, extra = {}) => {
    const now = Date.now()
    const durationMs =
      extra.durationMs ??
      (lastActionRef.current ? now - lastActionRef.current : undefined)

    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        level,
        eventType,
        message,
        timestamp: now, 
        durationMs,
        ...extra
      },
      ...prev
    ])
    setStats((s) => ({ ...s, totalEvents: s.totalEvents + 1 }))
    lastActionRef.current = now
  }

  const updateQuality = (ok, bad) => {
    const total = ok + bad
    const qualityRate = total === 0 ? 0 : Math.round((ok / total) * 100)
    return { total, qualityRate }
  }

  const resetStats = () => {
    setStats(initialStats)
    setProductionSeconds(0)
  }

  const [wsClient] = useState(() =>
    createWsClient(wsUrl, {
      onOpen: () => {
        setWs({ online: true, url: wsUrl })
        pushLog('SUCCESS', 'WS_CONNECTED', 'WebSocket connected')
      },
      onClose: () => {
        setWs({ online: false, url: wsUrl })
        pushLog('WARN', 'WS_DISCONNECTED', 'WebSocket disconnected')
      },
      onError: (e) => {
        pushLog('ERROR', 'WS_ERROR', e?.message || 'WebSocket error')
      },
      onMessage: (data) => {
        pushLog('SYSTEM', 'WS_EVENT', typeof data === 'string' ? data : JSON.stringify(data))
      }
    })
  )

  useEffect(() => {
    wsClient.connect()
    return () => wsClient.close()
  }, [wsClient])

  const emit = (type, payload = {}) => {
    const correlationId = crypto.randomUUID()
    return wsClient.send({
      type,
      payload,
      ts: Date.now(),
      machineId,
      sessionId: session.startedAt || null,
      correlationId
    })
  }

  useEffect(() => {
    let timer
    if (machine.state === 'RUNNING') {
      timer = setInterval(() => {
        setProductionSeconds((s) => {
          const next = s + 1
          setStats((prev) => ({
            ...prev,
            uptimeDisplay: formatDuration(next),
            lastUpdate: nowISO()
          }))
          return next
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [machine.state])

  useEffect(() => {
    if (!autoProduce) return
    let timer
    if (machine.state === 'RUNNING') {
      timer = setInterval(() => {
        setStats((s) => {
          const ok = s.ok + 1
          const bad = Math.random() < 0.15 ? s.bad + 1 : s.bad
          const { total, qualityRate } = updateQuality(ok, bad)
          return { ...s, ok, bad, total, qualityRate, lastUpdate: nowISO() }
        })
        pushLog('SUCCESS', 'PRODUCTION', 'Piece produced')
        emit('PIECE_OK', { auto: true }).catch(() => {})
      }, 2500)
    }
    return () => clearInterval(timer)
  }, [machine.state, autoProduce])

  const actions = useMemo(() => ({
    scanNFC: async (empCode = 'OUV001') => {
      await sleep(400)
      resetStats()
      setSession({
        active: true,
        employee: { id: 'EMP-001', code: empCode, fullName: 'Employee connected' },
        startedAt: nowISO()
      })
      pushLog('INFO', 'SESSION_START', `Session started (${empCode})`)
      emit('EMPLOYEE_CONNECTED', { empCode }).catch(() => {})
    },

    disconnectEmployee: () => {
      const isStopped = ['IDLE', 'OFFLINE'].includes(machine.state)
      if (!isStopped) {
        pushLog('WARN', 'DISCONNECT_BLOCKED', 'Stop the machine before disconnecting.')
        setMachine((m) => ({ ...m, message: 'Stop the machine before disconnecting.' }))
        return false
      }
      setSession({ active: false, employee: null, startedAt: null })
      resetStats()
      setMachine((m) => ({
        ...m,
        state: 'OFFLINE',
        message: 'Machine offline — Please scan an NFC card'
      }))
      pushLog('INFO', 'SESSION_END', 'Employee disconnected')
      emit('EMPLOYEE_DISCONNECTED', {}).catch(() => {})
      return true
    },

    start: () => {
      setMachine({ state: 'RUNNING', message: 'Production in progress — Machine operational' })
      lastCycleStartRef.current = Date.now()
      lastPieceRef.current = null
      pushLog('SUCCESS', 'MACHINE_START', 'Machine started')
      emit('MACHINE_START', {}).catch(() => {})
    },

    stop: () => {
      setMachine({ state: 'IDLE', message: 'Machine ready — Click “Start” to begin production' })
      pushLog('INFO', 'MACHINE_STOP', 'Production stopped')
      emit('MACHINE_STOP', {}).catch(() => {})
    },

    pieceOk: () => {
      const now = Date.now()
      const baseline = lastPieceRef.current ?? lastCycleStartRef.current
      const durationMs = baseline ? now - baseline : undefined
      lastPieceRef.current = now

      setStats((s) => {
        const ok = s.ok + 1
        const { total, qualityRate } = updateQuality(ok, s.bad)
        return { ...s, ok, total, qualityRate, lastUpdate: nowISO() }
      })
      pushLog('SUCCESS', 'PIECE_OK', 'Piece OK', { durationMs })
      emit('PIECE_OK', {}).catch(() => {})
      // lastCycleStartRef.current = now 
    },

    pieceBad: () => {
      const now = Date.now()
      const baseline = lastPieceRef.current ?? lastCycleStartRef.current
      const durationMs = baseline ? now - baseline : undefined
      lastPieceRef.current = now

      setStats((s) => {
        const bad = s.bad + 1
        const { total, qualityRate } = updateQuality(s.ok, bad)
        return { ...s, bad, total, qualityRate, lastUpdate: nowISO() }
      })
      pushLog('WARN', 'PIECE_BAD', 'Non-compliant piece', { durationMs })
      emit('PIECE_BAD', {}).catch(() => {})
      // lastCycleStartRef.current = now
    },

    breakdown: () => {
      setMachine({ state: 'BREAKDOWN', message: 'BREAKDOWN DETECTED — Machine requires intervention' })
      breakdownStartRef.current = Date.now()
      setStats((s) => ({ ...s, breakdowns: s.breakdowns + 1 }))
      pushLog('ERROR', 'BREAKDOWN', 'Breakdown detected')
      emit('MACHINE_BREAKDOWN', {}).catch(() => {})
    },

    resume: () => {
      setMachine({ state: 'RUNNING', message: 'Production in progress — Machine operational' })
      const now = Date.now()
      const durationMs = breakdownStartRef.current ? now - breakdownStartRef.current : undefined
      breakdownStartRef.current = null
      lastCycleStartRef.current = now 
      pushLog('SUCCESS', 'RESUME', 'Production resumed', { durationMs })
      emit('MACHINE_RESUME', {}).catch(() => {})
    },

    reset: () => {
      resetStats()
      setMachine({ state: 'IDLE', message: 'Machine ready — Click “Start” to begin production' })
      setLogs([])
      lastCycleStartRef.current = null
      lastPieceRef.current = null
      breakdownStartRef.current = null
      lastActionRef.current = null
      pushLog('INFO', 'RESET', 'Simulation reset')
      emit('RESET', {}).catch(() => {})
    }
  }), [machine.state, session.startedAt])

  const guards = useMemo(() => ({
    canStart: session.active && machine.state !== 'RUNNING' && machine.state !== 'BREAKDOWN',
    canStop: machine.state === 'RUNNING',
    canProduce: machine.state === 'RUNNING',
    canBreakdown: machine.state === 'RUNNING',
    canResume: machine.state === 'BREAKDOWN'
  }), [session.active, machine.state])

  return {
    factoryId,
    machineId,
    ws,
    session,
    machine,
    stats,
    logs,
    guards,
    actions
  }
}