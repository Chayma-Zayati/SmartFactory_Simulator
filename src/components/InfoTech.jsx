import './Panels.css'

export default function InfoTech({
  machineId,
  factoryId,
  wsUrl,
  state,
  sessionActive,
  totalEvents
}) {
  const isOffline = state === 'OFFLINE'

  return (
    <div className="card infoTechCard">
      <div className="cardHeader">
        <div className="cardHeaderLeft">
          <svg
            className="cardHeaderIcon infoIcon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <rect x="4" y="4" width="16" height="16" rx="4" fill="#60a5fa" opacity="0.15"/>
            <path d="M12 8h.01M11 11h2v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="cardHeaderTitle">Technical Information</span>
        </div>
      </div>

      <div className="infoGrid">
        <div className="infoItem">
          <div className="label">Machine Configuration</div>
          <div className="value mono">{machineId}</div>
        </div>

        <div className="infoItem">
          <div className="label">Factory</div>
          <div className="value mono">{factoryId}</div>
        </div>

        <div className="infoItem">
          <div className="label">Current Status</div>
          <div className={`value ${isOffline ? 'koTxt' : 'infoTxt'} mono`}>{state}</div>
        </div>

        <div className="infoItem">
          <div className="label">Active Session</div>
          <div className="value mono">{sessionActive ? 'emp' : 'Aucune'}</div>
        </div>

        <div className="infoItem wide">
          <div className="label">Calculation Service</div>
          <div className="value mono">{wsUrl}</div>
        </div>

        <div className="infoItem">
          <div className="label">Total Events</div>
          <div className="value mono">{totalEvents}</div>
        </div>
      </div>
    </div>
  )
}