import './Panels.css'

export default function SessionStats({
  active,
  ok,
  bad,
  total,
  breakdowns,
  qualityRate = undefined,   
  uptimeDisplay,
  lastUpdate,
  targetQuality = 95
}) {
  const computedQuality = (() => {
    if (typeof qualityRate === 'number' && !Number.isNaN(qualityRate)) {
      return Math.max(0, Math.min(100, Math.round(qualityRate)))
    }
    if (total > 0) {
      return Math.max(0, Math.min(100, Math.round((ok / total) * 100)))
    }
    return 0 
  })()

  const targetReached = computedQuality >= targetQuality

  return (
    <div className="card">
      <div className="cardHeader">
        <div className="cardHeaderLeft">
          <svg className="cardHeaderIcon" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
            <path d="M8 8h8M8 12h8M8 16h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="cardHeaderTitle">Statistiques de Session</span>
        </div>
        <span className={`badge ${active ? 'session' : 'neutral'}`}>
          {active ? 'Session Active' : 'None'}
        </span>
      </div>

      {!active ? (
        <div className="emptyState">
          <svg className="emptyIcon" width="56" height="56" viewBox="0 0 24 24" fill="none">
            <path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 16.5 12 12l9 4.5-9 4.5-9-4.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div className="emptyTitle">No active session</div>
          <div className="emptySub">Statistics will be displayed after scanning the NFC card</div>
        </div>
      ) : (
        <>
          {/* KPI */}
          <div className="kpiGrid">
            <div className="kpiTint success">
              <div className="kpiHead">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="kpiIcon">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div className="label">Pieces OK</div>
              </div>
              <div className="value big successTxt">{ok}</div>
            </div>

            <div className="kpiTint warn">
              <div className="kpiHead">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="kpiIcon">
                  <path d="M12 7v6M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <div className="label">Defects</div>
              </div>
              <div className="value big warnTxt">{bad}</div>
            </div>

            <div className="kpiTint info">
              <div className="kpiHead">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="kpiIcon">
                  <path d="M4 7l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4 17l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <div className="label">Total</div>
              </div>
              <div className="value big infoTxt">{total}</div>
            </div>

            <div className="kpiTint danger">
              <div className="kpiHead">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="kpiIcon">
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 3l9 18H3L12 3Z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <div className="label">Pannes</div>
              </div>
              <div className="value big dangerTxt">{breakdowns}</div>
            </div>
          </div>

          {/* Taux de Qualité */}
          <div className="qualitySection">
            <div className="qualityTitle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="qualityIcon">
                <path d="M4 16l5-5 4 4 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Quality Rate</span>
            </div>

            <div className={`qualityPercent ${targetReached ? 'okTxt' : 'koTxt'}`}>
              {computedQuality}%
            </div>

            <div className="qualityBar">
              <div className="barBg dark">
                <div className="barFill" style={{ width: `${computedQuality}%` }} />
              </div>
              <div className="qualityMeta">
                <span className="metaLeft">Target: {targetQuality}%</span>
                <span className={targetReached ? 'okTxt' : 'koTxt'}>
                  {targetReached ? '✓ Objectif atteint' : '✕ Objectif non atteint'}
                </span>
              </div>
            </div>
          </div>

          {/* Temps de Production */}
          <div className="timeBlock">
            <div className="timeLeft">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="timeIcon">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Production Time</span>
            </div>
            <div className="timeValue mono">{uptimeDisplay}</div>
          </div>

          <div className="lastUpdate">Last Activity : {lastUpdate}</div>
        </>
      )}
    </div>
  )
}