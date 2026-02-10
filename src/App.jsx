import React from "react";
import TopBar from "./components/TopBar.jsx";
import ConnectionBanner from "./components/ConnectionBanner.jsx";
import NFCPanel from "./components/NFCPanel.jsx";
import MachineStatusCard from "./components/MachineStatusCard.jsx";
import ControlPanel from "./components/ControlPanel.jsx";
import SessionStats from "./components/SessionStats.jsx";
import ActivityLog from "./components/ActivityLog.jsx";
import InfoTech from "./components/InfoTech.jsx";
import UserGuide from "./components/UserGuide.jsx";
import useMachineSimulator from "./hooks/useMachineSimulator.js";
import "./components/Panels.css";

export default function App() {
  const wsUrl =
    import.meta.env.VITE_WS_URL || "ws://calculation-service:8080/events";
  const sim = useMachineSimulator({
    wsUrl,
  });

  return (
    <>
      <TopBar machineId={sim.machineId} wsStatus="WebSocket Connecté" />

      <div className="container">
        <ConnectionBanner online={sim.ws.online} url={sim.ws.url} />

        <div className="grid">
          <div className="leftCol">
            <NFCPanel
              factoryId={sim.factoryId}
              machineId={sim.machineId}
              employee={sim.session.employee}
              sessionStart={sim.session.startedAt}
              canScan={!sim.session.active}
              onScan={sim.actions.scanNFC}
              onDisconnect={sim.actions.disconnectEmployee}
              canDisconnect={
                sim.machine.state === "IDLE" || sim.machine.state === "OFFLINE"
              } // <-- ajoute ceci
            />

            <ControlPanel
              state={sim.machine.state}
              canStart={sim.guards.canStart}
              canStop={sim.guards.canStop}
              canPiece={sim.guards.canProduce}
              canBreakdown={sim.guards.canBreakdown}
              canResume={sim.guards.canResume}
              onStart={sim.actions.start}
              onStop={sim.actions.stop}
              onPieceOk={sim.actions.pieceOk}
              onPieceBad={sim.actions.pieceBad}
              onBreakdown={sim.actions.breakdown}
              onResume={sim.actions.resume}
              onReset={sim.actions.reset}
              guardMessage={sim.machine.guardMessage}
            />
          </div>

          <div className="rightCol">
            <MachineStatusCard
              title="Machine de Production #3"
              subtitle="CNC - Tour Automatique"
              state={sim.machine.state}
              message={sim.machine.message}
            />
            <SessionStats
              active={sim.session.active}
              ok={sim.stats.ok}
              bad={sim.stats.bad}
              total={sim.stats.total}
              breakdowns={sim.stats.breakdowns}
              qualityRate={sim.stats.qualityRate}
              uptimeDisplay={sim.stats.uptimeDisplay}
              lastUpdate={sim.stats.lastUpdate}
              targetQuality={95}
            />

            <ActivityLog logs={sim.logs} />
          </div>
        </div>

        {/*<InfoTech
          machineId={sim.machineId}
          factoryId={sim.factoryId}
          wsUrl={sim.ws.url}
          state={sim.machine.state}
          sessionActive={sim.session.active}
          totalEvents={sim.stats.totalEvents}
        />*/}

        <UserGuide />
      </div>
    </>
  );
}
