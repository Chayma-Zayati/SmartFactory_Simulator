import './Panels.css'

export default function ControlPanel({
  state,
  employee,
  canStart,
  canStop,
  canPiece,
  canBreakdown,
  canResume,
  onStart,
  onStop,
  onPieceOk,
  onPieceBad,
  onBreakdown,
  onResume,
  onReset,
  guardMessage
}) {
  const isConnected = !!employee
  const isBreakdown = state === 'BREAKDOWN'
  const isRunning = state === 'RUNNING'

  return (
    <div className="card controlCard operatorPanel">
      <div className="cardHeader">
        <div className="cardHeaderLeft">
          <svg className="cardHeaderIcon" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 6h14M5 12h14M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="cardHeaderTitle">Control Panel</span>
        </div>
      </div>

    
      <div className="controlRow two">
        <button
          className={`btn big ${canStart ? 'startFill' : 'startDisabled'}`}
          disabled={!canStart}
          onClick={onStart}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M6 4l14 8-14 8V4Z" fill="currentColor"/>
          </svg>
          Start
        </button>

        <button className="btn big dangerOutline" disabled={!canStop} onClick={onStop}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Stop
        </button>
      </div>

      {!isConnected && state === 'OFFLINE' && (
        <div className="controlHint info">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="4" fill="#60a5fa" opacity="0.15"/>
            <path d="M12 8h.01M11 11h2v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Please scan an NFC card first</span>
        </div>
      )}

      {isRunning && !isBreakdown && (
        <>
          <div className="signalTitle">📦 Production Report</div>
          <div className="controlRow three">
            <button className="btn big okFill" disabled={!canPiece} onClick={onPieceOk}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>
                Piece OK
                <div className="btnSub">Good piece</div>
              </span>
            </button>

            <button className="btn big warnFill" disabled={!canPiece} onClick={onPieceBad}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 7v6M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>
                Defective piece
                <div className="btnSub">Bad piece</div>
              </span>
            </button>

            <button className="btn big breakdownFill" disabled={!canBreakdown} onClick={onBreakdown}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 3l9 18H3L12 3Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>
                Report a Breakdown
                <div className="btnSub">Machine Out of Service</div>
              </span>
            </button>
          </div>
        </>
      )}

      {isBreakdown && (
        <div className="controlRow one">
          <div className="controlAlert danger">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 3l9 18H3L12 3Z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{guardMessage || 'Machine Breakdown — Intervention Required'}</span>
          </div>

          <button className="btn big resumeFill" disabled={!canResume} onClick={onResume}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v6l5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>
              Resume Production
              <div className="btnSub">After Repair</div>
            </span>
          </button>
        </div>
      )}

      <div className="controlRow one">
        <button className="btn neutral outline" onClick={onReset}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M4 11a8 8 0 1 1 2.3 5.7M4 11V6h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Reset machine
        </button>
      </div>
    </div>
  )
}