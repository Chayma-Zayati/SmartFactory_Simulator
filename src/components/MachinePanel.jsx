import './Panels.css'

const map = {
  OFFLINE: {
    title: 'Offline',
    chip: 'OFFLINE',
    box: 'statusBox offline',
    text: 'txtOffline',
    alert: { kind: 'info', text: 'Machine offline — Please scan an NFC card to start' },
    iconClass: 'ic offline'
  },
  IDLE: {
    title: 'Pending',
    chip: 'IDLE',
    box: 'statusBox idle',
    text: 'txtIdle',
    alert: { kind: 'info', text: 'Machine ready — Click “Start” to begin production' },
    iconClass: 'ic idle'
  },
  RUNNING: {
    title: 'In Production',
    chip: 'RUNNING',
    box: 'statusBox running',
    text: 'txtRun',
    alert: { kind: 'success', text: 'Production in progress — Machine operational' },
    iconClass: 'ic run'
  },
  BREAKDOWN: {
    title: 'Broken',
    chip: 'BREAKDOWN',
    box: 'statusBox breakdown',
    text: 'txtBreak',
    alert: { kind: 'danger', text: 'BREAKDOWN DETECTED — Machine requires intervention' },
    iconClass: 'ic break'
  }
}

function CircleIcon({ kind }) {
  if (kind === 'offline') {
    return (
      <div className="icWrap offline">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 8v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
  if (kind === 'idle') {
    return (
      <div className="icWrap idle">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M9 7v10M15 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
  if (kind === 'run') {
    return (
      <div className="icWrap run">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M3 13h4l2-3 3 6h3l3-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }
  return (
    <div className="icWrap break">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M12 3l9 18H3L12 3Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  )
}

export default function MachinePanel({ title, subtitle, state }) {
  const cfg = map[state] || map.IDLE

  return (
    <div className="card machineCard">
      <div className="cardHeader">
        <div className="cardHeaderLeft">
          <svg className="cardHeaderIcon" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 6h14M5 12h14M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="cardHeaderTitle">Machine Status</span>
        </div>
      </div>

      <div className="machineTitle">
        <div className="h1">{title}</div>
        <div className="sub">{subtitle}</div>
      </div>

      <div className={cfg.box}>
        <div className="statusIcon">
          <CircleIcon kind={cfg.iconClass.split(' ')[1]} />
        </div>
        <div className="statusTexts">
          <div className="label">État actuel</div>
          <div className={`stateText ${cfg.text}`}>{cfg.title}</div>
        </div>
        <span className={`stateChip chip-${state.toLowerCase()}`}>{cfg.chip}</span>
      </div>

      <div className={`machineAlert ${cfg.alert.kind}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          {cfg.alert.kind === 'danger' ? (
            <>
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 3l9 18H3L12 3Z" stroke="currentColor" strokeWidth="2"/>
            </>
          ) : (
            <>
              <rect x="4" y="4" width="16" height="16" rx="4" fill="#60a5fa" opacity="0.15"/>
              <path d="M12 8h.01M11 11h2v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </>
          )}
        </svg>
        <span>{cfg.alert.text}</span>
      </div>
    </div>
  )
}