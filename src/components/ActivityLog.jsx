import './Panels.css'

const levelClass = {
  success: 'success',
  info: 'neutral',
  warn: 'warn',
  error: 'danger',
  system: 'system'
}

const fmtTime = (t) => {
  if (!t) return '—'
  const d = typeof t === 'number' ? new Date(t) : new Date(String(t))
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const fmtDuration = (ms) => {
  if (!ms && ms !== 0) return ''
  const totalSec = Math.round(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

const SOCKET_NOISE = new Set([
  'PING',
  'PONG',
  'ACK',
  'WS_EVENT',
  'WS_OPEN',
  'WS_CONNECTED',
  'WS_CLOSED',
  'WS_DISCONNECTED',
  'WS_ERROR'
])

const displayText = (item) => {
  const type = (item.eventType || item.type || '').toUpperCase()
  if (type === 'EMPLOYEE_CONNECTED') return 'Operator logged in'
  if (type === 'EMPLOYEE_DISCONNECTED') return 'Operator logged out'
  if (type === 'MACHINE_START') return 'Machine started'
  if (type === 'MACHINE_STOP') return 'Machine stopped'
  if (type === 'PIECE_OK') return 'Piece OK'
  if (type === 'PIECE_BAD') return 'Piece NOK'
  if (type === 'MACHINE_BREAKDOWN' || type === 'BREAKDOWN') return 'Machine Breakdown'
  if (type === 'MACHINE_RESUME' || type === 'RESUME') return 'Machine Resumed'
  if (type === 'RESET') return 'Reset machine'
  if (type === 'PRODUCTION') return 'Production Successful'
  return item.message || item.text || type || '—'
}

export default function ActivityLog({ logs }) {
  const filtered = logs.filter((l) => {
    const t = (l.eventType || l.type || '').toUpperCase()
    return !SOCKET_NOISE.has(t)
  })

  return (
    <div className="card activityCard">
      <div className="cardHeader">
        <div className="cardHeaderLeft">
          <svg className="cardHeaderIcon" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 4h14M5 10h14M5 16h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="cardHeaderTitle">Activity Log</span>
        </div>
        <span className="chip">{filtered.length} event{filtered.length > 1 ? 's' : ''}</span>
      </div>

      <div className="logList">
        {filtered.map(item => {
          const levelKey = (item.level || 'info').toLowerCase()
          const levelLabel = (item.level || 'info').toUpperCase()
          const type = (item.eventType || item.type || '').toUpperCase()
          const time = fmtTime(item.timestamp || item.at)
          const duration = fmtDuration(item.durationMs ?? item.duration ?? item.elapsedMs)
          const text = displayText(item)

          return (
            <div key={item.id} className={`logItem v2 ${levelClass[levelKey]}`}>
              <div className="logHeader">
                <span className="badge level">{levelLabel}</span>
                <div className="pill">
                  <span className="time">{time}</span>
                  {duration && <span className="dot">•</span>}
                  {duration && <span className="duration">Duration: {duration}</span>}
                </div>
              </div>
              <div className="logBody">
                <div className="title">{text}</div>
                {type && <div className="meta">Type: {type}</div>}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="emptyState">
            <svg className="emptyIcon" width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="emptyTitle">No events at the moment</div>
            <div className="emptySub">The log updates automatically</div>
          </div>
        )}
      </div>
    </div>
  )
}