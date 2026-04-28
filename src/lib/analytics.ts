const VISITOR_KEY = 'pf_vid'

function getVisitorId(): string {
  let vid = localStorage.getItem(VISITOR_KEY)
  if (!vid) {
    vid = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
    localStorage.setItem(VISITOR_KEY, vid)
  }
  return vid
}

export function track(companyId: string, eventType: string): void {
  if (!companyId) return
  const body = {
    companyId,
    eventType,
    visitorId: getVisitorId(),
    referrer: typeof document !== 'undefined' ? document.referrer : '',
  }
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {})
}
