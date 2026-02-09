import React, { useState } from 'react'
import ConnectionBanner from '../components/ConnectionBanner'
import NFCPanel from '../components/NFCPanel'
import MachinePanel from '../components/MachinePanel'
import ControlPanel from '../components/ControlPanel'
import SessionStats from '../components/SessionStats'
import ActivityLog from '../components/ActivityLog'
import '../components/Panels.css'

export default function OperatorDashboard() {
  const [employee, setEmployee] = useState(null)
  const [machineState, setMachineState] = useState('OFFLINE')
  const [sessionActive, setSessionActive] = useState(false)

  const [ok, setOk] = useState(0)
  const [bad, setBad] = useState(0)
  const [total, setTotal] = useState(0)
  const [breakdowns, setBreakdowns] = useState(0)
  const [uptimeDisplay, setUptimeDisplay] = useState('00:00:00')
  const [lastUpdate, setLastUpdate] = useState('—')
  const [activities, setActivities] = useState([])

  const touch = () => setLastUpdate(new Date().toLocaleTimeString())
  const resetCounters = () => {
    setOk(0); setBad(0); setTotal(0); setBreakdowns(0); setUptimeDisplay('00:00:00')
  }

  const addActivity = (type, message, level = 'info') => {
    const newActivity = {
      id: Date.now(),
      type,
      message,
      level,
      timestamp: new Date().toLocaleTimeString()
    }
    setActivities(prev => [newActivity, ...prev].slice(0, 20))
  }

  const onScan = (id) => {
    setEmployee(id)
    setMachineState('IDLE')
    addActivity('SYSTEM', `Employé ${id} connecté`, 'system')
    touch()
  }

  const onDisconnect = () => {
    addActivity('SYSTEM', `Employé ${employee} déconnecté`, 'neutral')
    setEmployee(null)
    setMachineState('OFFLINE')
    setSessionActive(false)
    resetCounters()
    touch()
  }

  const startProduction = () => {
    if (!employee) return
    setMachineState('RUNNING')
    setSessionActive(true)
    addActivity('MACHINE', 'Production démarrée', 'success')
    touch()
  }

  const onStart = () => startProduction()

  const onStop = () => {
    setMachineState(employee ? 'IDLE' : 'OFFLINE')
    setSessionActive(false)
    addActivity('MACHINE', 'Production arrêtée', 'neutral')
    resetCounters()
    touch()
  }

  const onPieceOk = () => {
    if (machineState !== 'RUNNING') return
    setOk(v => v + 1)
    setTotal(v => v + 1)
    addActivity('SUCCESS_OK', 'Pièce OK', 'success')
    touch()
  }

  const onPieceBad = () => {
    if (machineState !== 'RUNNING') return
    setBad(v => v + 1)
    setTotal(v => v + 1)
    addActivity('WARN_DEFAUT', 'Pièce Défaut', 'warn')
    touch()
  }

  const onBreakdown = () => {
    if (machineState !== 'RUNNING') return
    setMachineState('BREAKDOWN')
    setBreakdowns(v => v + 1)
    addActivity('PANNE', 'Machine hors service', 'danger')
    touch()
  }

  const onResume = () => {
    if (machineState !== 'BREAKDOWN') return
    addActivity('MACHINE', 'Reprise production', 'success')
    startProduction()
  }

  const canStart = !!employee && machineState === 'IDLE'
  const canStop = machineState === 'RUNNING'
  const canPiece = machineState === 'RUNNING'
  const canBreakdown = machineState === 'RUNNING'
  const canResume = machineState === 'BREAKDOWN'

  return (
    <div className="pageWrap">
      <ConnectionBanner online={sessionActive} url="ws://calculation-service:8080/events" />

    
      <div className="mainGrid">
        {/* Colonne gauche*/}
        <div className="gridCol">
          <NFCPanel
            factoryId="FACTORY-001"
            machineId="MACH-003"
            employee={employee}
            sessionStart={employee ? new Date().toLocaleString() : ''}
            canScan={!employee}
            onScan={onScan}
            onDisconnect={onDisconnect}
          />

          <MachinePanel
            title="Machine de Production #3"
            subtitle="CNC - Tour Automatique"
            state={machineState}
          />

          <ControlPanel
            state={machineState}
            employee={employee}
            canStart={canStart}
            canStop={canStop}
            canPiece={canPiece}
            canBreakdown={canBreakdown}
            canResume={canResume}
            onStart={onStart}
            onStop={onStop}
            onPieceOk={onPieceOk}
            onPieceBad={onPieceBad}
            onBreakdown={onBreakdown}
            onResume={onResume}
            onReset={onStop}
            guardMessage={machineState === 'BREAKDOWN' ? 'Machine en panne — Intervention requise' : ''}
          />
        </div>

        <div className="gridCol">
          <SessionStats
            active={sessionActive}
            ok={ok}
            bad={bad}
            total={total}
            breakdowns={breakdowns}
            targetQuality={95}
            uptimeDisplay={uptimeDisplay}
            lastUpdate={lastUpdate}
          />

          <ActivityLog activities={activities} />
        </div>
      </div>
    </div>
  )
}