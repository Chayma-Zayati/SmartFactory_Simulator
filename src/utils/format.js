export const fmtDateTime = (d) => {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleString('fr-FR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

export const fmtDuration = (sec) => {
  const h = Math.floor(sec / 3600).toString().padStart(2, '0')
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

export const uuid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)