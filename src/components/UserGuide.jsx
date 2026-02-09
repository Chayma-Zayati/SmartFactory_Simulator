import './Panels.css'

export default function UserGuide() {
  const steps = [
    {
      title: 'Scan the NFC card',
      text:
        'Enter your employee ID (e.g., EMP001) and click “Scan NFC card”',
    },
    {
      title: 'Start production',
      text:
        'Once logged in, click “Start” to begin',
    },
    {
      title: 'Report pieces',
      text:
        'Click “Part OK” or “Defective Part” after each production',
    },
    {
      title: 'Manage Breakdowns',
      text:
        'In case of a problem, click “Report a Breakdown”',
    },
    {
      title: 'End Session',
      text:
        'Stop the machine, then log out the employee',
    },
  ]

  return (
    <div className="card guideCard">
      <div className="cardHeader">
        <div className="cardHeaderLeft">
          <svg
            className="cardHeaderIcon"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 4h9l3 3v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 10h6M9 14h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="cardHeaderTitle">User Guide</span>
        </div>
      </div>

      <ol className="guide">
        {steps.map((s, i) => (
          <li key={i} className="guideItem">
            <span className="stepBadge">{i + 1}</span>
            <div className="stepTexts">
              <strong className="stepTitle">{s.title}</strong>
              <span className="stepDesc">{s.text}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}