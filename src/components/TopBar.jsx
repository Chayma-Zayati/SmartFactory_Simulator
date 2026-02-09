import './TopBar.css'

export default function TopBar({ machineId = 'MACH-003', wsStatus = 'WebSocket Connecté' }) {
  return (
    <header className="topBar">
      <div className="topBarLeft">
        <div className="topBarLogo">📊</div>
        <div className="topBarTitles">
          <div className="topBarTitle">Smart Factory Simulator</div>
          <div className="topBarSubtitle">Operator Interface — Virtual Machine</div>
        </div>
      </div>

      <div className="topBarRight">
        <span className="wsBadge">{wsStatus}</span>
        <span className="machineBadge">{machineId}</span>
      </div>
    </header>
  )
}