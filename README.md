# Machine Simulator (NFC + WebSocket)

Prototype d’interface de simulation machine avec authentification NFC (drag & drop), logique d’état, statistiques, et WebSocket robuste (ACK, heartbeat, reconnexion).

## Sommaire
- [1. Démarrage rapide](#1-démarrage-rapide)
- [2. Configuration](#2-configuration)
- [3. Schéma WebSocket (contrat)](#3-schéma-websocket-contrat)
- [4. États & transitions](#4-états--transitions)
- [5. Tests manuels recommandés](#5-tests-manuels-recommandés)
- [6. Structure des fichiers clés](#6-structure-des-fichiers-clés)
- [7. Scripts npm](#7-scripts-npm)
- [8. Définition of Done](#8-d%C3%A9finition-of-done)

---

## 1. Démarrage rapide

```bash
npm install
npm run dev      # Lancer l’app en dev
npm run lint     # Linter
npm run build    # Build
```

Mock WebSocket (optionnel, Node) :
```bash
node scripts/mock-ws-server.js
```
Configure `WS_URL` (voir section Configuration) si tu utilises le mock local (`ws://localhost:8081`).

---

## 2. Configuration

Variables clés (selon ton outillage : `.env`, Vite, etc.) :
- `VITE_WS_URL` (ou `WS_URL` selon ton bundler) : URL du WebSocket serveur.
- `FACTORY_ID` / `MACHINE_ID` (optionnel) : identifiants par défaut.

Par défaut dans le hook : `ws://calculation-service:8080/events`. Remplace par le mock local ou ton vrai endpoint.

---

## 3. Schéma WebSocket (contrat)

### Enveloppe commune (tous messages)
```json
{
  "type": "STRING",
  "ts": 1710000000,
  "machineId": "MACH-003",
  "sessionId": "sess-123",
  "correlationId": "uuid",
  "payload": { /* spécifique à l’event */ }
}
```

### Événements émis par le client (simulateur)
- `EMPLOYEE_CONNECTED` : `{ empCode: string }`
- `EMPLOYEE_DISCONNECTED` : `{}`
- `MACHINE_START` : `{}`
- `MACHINE_STOP` : `{}`
- `PIECE_OK` : `{ quality?: string }`
- `PIECE_BAD` : `{ reason?: string }`
- `MACHINE_BREAKDOWN` : `{ reason?: string }`
- `MACHINE_RESUME` : `{}`
- `RESET` : `{}`
- `PING` : `{}` (heartbeat)

### Événements attendus du serveur
- `ACK` : `{ correlationId: string }`
- `ERROR` : `{ code: string, message: string, correlationId?: string }`
- `PONG` : `{}` (réponse au PING)
- Optionnel : `SYSTEM_NOTICE`, `PRODUCTION_COMMAND`, etc.

### Règle d’ACK / retry
- Chaque message émis démarre un timer (ex. 3000 ms). Sans `ACK`, retry jusqu’à 2 fois. Au-delà : log WARN.
- Heartbeat : `PING` périodique, attente de `PONG`; sinon reconnexion.

---

## 4. États & transitions

États machine : `OFFLINE` → `IDLE` → `RUNNING` ↔ `BREAKDOWN`.

Guards (actions autorisées) :
- `EMPLOYEE_CONNECTED` : seulement si `OFFLINE`.
- `MACHINE_START` : seulement si `IDLE` et session active.
- `MACHINE_STOP` : seulement si `RUNNING`.
- `PIECE_OK` / `PIECE_BAD` : seulement si `RUNNING`.
- `MACHINE_BREAKDOWN` : si `IDLE` ou `RUNNING`.
- `MACHINE_RESUME` : si `BREAKDOWN`.
- `EMPLOYEE_DISCONNECTED` : seulement si `IDLE` ou `OFFLINE`.

UI : boutons grisés + tooltip explicite quand l’action est interdite.

---

## 5. Tests manuels recommandés

1) **Parcours normal**  
   WS online → `EMPLOYEE_CONNECTED` → `MACHINE_START` → `PIECE_OK` → `MACHINE_STOP` → `EMPLOYEE_DISCONNECTED`.

2) **Panne / reprise**  
   En RUNNING : `MACHINE_BREAKDOWN` → vérifier blocage production → `MACHINE_RESUME`.

3) **Blocage déconnexion**  
   En RUNNING : bouton déconnexion grisé + log WARN.

4) **Coupure WS**  
   Arrêter le serveur WS → bannière offline → reconnexion automatique → retour online.

5) **ACK/timeout**  
   Simuler l’absence d’ACK → vérifier retries puis log WARN.

6) **Payload invalide côté serveur**  
   Réponse `ERROR` → log l’erreur et aucune transition locale.

---

## 6. Structure des fichiers clés

- `src/lib/createWsClient.js`  
  Client WebSocket robuste (reconnexion, heartbeat, ACK/timeout/retry).

- `src/hooks/useMachineSimulator.js`  
  Logique de simulation : états machine, session, stats, actions, émission WS.

- `src/components/NFCPanel.jsx`  
  UI NFC (drag & drop de carte, scan).

- `src/components/SessionStats.jsx`  
  KPI, qualité, uptime.

- `src/components/Panels.css`  
  Styles du thème moderne.

- `scripts/mock-ws-server.js`  
  Mock WebSocket pour tests locaux (optionnel).

---

## 7. Scripts npm

- `npm run dev` : démarrage en mode développement.
- `npm run build` : build de production.
- `npm run lint` : lint du projet.
- `node scripts/mock-ws-server.js` : mock WebSocket local (si besoin).

---

## 8. Définition of Done

- WS : reconnexion + heartbeat opérationnels, ACK/timeout/retry gérés.
- Guards respectés : actions non autorisées bloquées et visibles en UI.
- Scénarios de test (section 5) validés manuellement.
- UI : états offline/erreur visibles, responsive, tooltips sur boutons désactivés.
- README à jour avec schéma WS, scénarios de test, et commandes de build.

---

## Faut-il utiliser le mock WS ?

- **Non obligatoire** si tu as déjà un backend WS fonctionnel : configure `WS_URL` et fais les tests manuels contre ce backend.
- **Utile** si tu veux tester en local sans dépendre du backend : lance `node scripts/mock-ws-server.js` puis mets `WS_URL=ws://localhost:8081`.