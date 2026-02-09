import './Panels.css'

export default function ConnectionBanner({ online, url }) {
  return (
    <div className={`connectionBanner ${online ? 'online' : 'offline'}`}>
      <div className="connectionLeft">
        <svg
          className="wifiIcon"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.1 8.9a12 12 0 0 1 19.8 0M5.4 12.2a8 8 0 0 1 13.2 0M8.7 15.5a4 4 0 0 1 6.6 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M12 19.2h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <div className="connectionTexts">
          <strong className="connectionTitle">Calculation Service Connected</strong>
          <div className="connectionUrl mono">{url}</div>
        </div>
      </div>

      <span className={`statusBadge ${online ? 'ok' : 'ko'}`}>
        {online ? 'ONLINE' : 'OFFLINE'}
      </span>
    </div>
  )
}