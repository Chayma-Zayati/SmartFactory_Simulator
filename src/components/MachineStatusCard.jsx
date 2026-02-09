import './MachineStatusCard.css'

const STATE_CONFIG = {
  OFFLINE: {
    label: 'OFFLINE',
    icon: 'power',
    pill: 'ko',
    msg: 'Machine offline — Please scan an NFC card to start'
  },
  IDLE: {
    label: 'IDLE',
    icon: 'pause',
    pill: 'idle',
    msg: 'Machine ready — Click “Start” to begin production'
  },
  RUNNING: {
    label: 'RUNNING',
    icon: 'pulse',
    pill: 'ok',
    msg: 'Production in progress — Machine operational'
  },
  BREAKDOWN: {
    label: 'BREAKDOWN',
    icon: 'warning',
    pill: 'danger',
    msg: 'BREAKDOWN DETECTED — Machine requires intervention'
  }
}

export default function MachineStatusCard({ title, subtitle, state, message }) {
  const conf = STATE_CONFIG[state] || STATE_CONFIG.IDLE
  const finalMessage = message || conf.msg

  return (
    <div className={`machineStatusCard ${conf.pill}`}>
      <div className="machineHeader">Statut Machine</div>

      <div className="machineTitle">{title}</div>
      {subtitle && <div className="machineSub">{subtitle}</div>}

      <div className="statusBox">
        <div className={`statusIcon ${conf.pill}`}>
          {conf.icon === 'power' && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v10M6.2 6.2a7 7 0 1 0 11.6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
          {conf.icon === 'pause' && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>
              <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>
            </svg>
          )}
          {conf.icon === 'pulse' && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h4l2-4 3 8 3-6 2 2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {conf.icon === 'warning' && (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 4 3 20h18L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M12 9v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="17" r="1" fill="currentColor"/>
            </svg>
          )}
        </div>

        <div>
          <div className="statusLabel">État actuel</div>
          <div className={`statusValue ${conf.pill}`}>
            {conf.pill === 'ko' && 'Offline'}
            {conf.pill === 'idle' && 'Pending'}
            {conf.pill === 'ok' && 'In Production'}
            {conf.pill === 'danger' && 'Broken'}
          </div>
        </div>

        <span className={`statePill ${conf.pill}`}>{conf.label}</span>
      </div>

      {finalMessage && (
        <div className={`statusMsg ${conf.pill}`}>
          {conf.pill === 'danger' && '⚠️ '}
          {conf.pill === 'idle' && 'ℹ️ '}
          {conf.pill === 'ok' && '✓ '}
          {conf.pill === 'ko' && 'ℹ️ '}
          {finalMessage}
        </div>
      )}
    </div>
  )
}