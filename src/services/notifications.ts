export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export async function showNotification(title: string, body?: string): Promise<void> {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready
    await reg.showNotification(title, { body, icon: '/pwa-192x192.png', badge: '/pwa-64x64.png' })
  } else {
    new Notification(title, { body, icon: '/pwa-192x192.png' })
  }
}
