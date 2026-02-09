import React, { useState } from 'react'
import './Panels.css'

export default function NFCPanel({
  factoryId,
  machineId,
  employee,
  sessionStart,
  canScan,
  onScan,
  onDisconnect,
  canDisconnect = true
}) {
  const [isOver, setIsOver] = useState(false)

  const cardPayload = {
    id: 'EMP-001',
    code: 'EMP001',
    fullName: 'Employee connected'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsOver(false)
    if (!canScan) return
    onScan(cardPayload.code)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!canScan) return
    setIsOver(true)
  }

  const handleDragLeave = () => setIsOver(false)

  return (
    <div className="card nfcCard">
      <div className="cardHeader">
        <div className="cardHeaderLeft">
          <svg className="cardHeaderIcon" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M7 10h10M7 14h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="cardHeaderTitle">Authentification NFC</span>
        </div>
      </div>

      <div className="row">
        <div className="label">ID Machine</div>
        <div className="value mono">{machineId}</div>
      </div>
      <div className="row">
        <div className="label">ID Usine</div>
        <div className="value mono">{factoryId}</div>
      </div>

      {employee ? (
        <>
          <div className="employeeBox">
            <div className="employeeContent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="employeeIcon">
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
                <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <div className="employeeTexts">
                <div className="empTitle">Employee connected</div>
                <div className="empId mono">
                  {employee.fullName || employee.code || employee.id}
                </div>
              </div>
              <span className="badge active small">Active</span>
            </div>
          </div>

          <div className="softRow">
            <span className="softLabel">Session Start: </span>
            <span className="softValue">{sessionStart}</span>
          </div>

          <button
            className="btn danger outline wide"
            onClick={onDisconnect}
            disabled={!canDisconnect}
            title={!canDisconnect ? 'Stop the machine before disconnecting' : ''}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 7v10M12 12h9M5 4h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Log out employee
          </button>

          {!canDisconnect && (
            <div className="softRow" style={{ color: '#b45309', fontWeight: 600 }}>
              Stop the machine before disconnecting.
            </div>
          )}
        </>
      ) : (
        <div className="nfcDemo">
          {/* Carte NFC  */}
          <div
            className="nfcCardDemo"
            draggable={canScan}
            onDragStart={() => setIsOver(false)}
          >
            <div className="nfcCardTitle">Carte NFC</div>
            <div className="nfcCardCode mono">{cardPayload.code}</div>
            <div className="nfcCardName">{cardPayload.fullName}</div>
            <div className="nfcCardHint">Drag me to the scan area</div>
          </div>

          {/* Zone de scan */}
          <div
            className={`nfcDropzone ${isOver ? 'over' : ''} ${!canScan ? 'disabled' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="nfcDropIcon">📡</div>
            <div className="nfcDropText">
              {canScan
                ? isOver ? 'Release to scan' : 'Move the card here'
                : 'Scan unavailable (active session)'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}