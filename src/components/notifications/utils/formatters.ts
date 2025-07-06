export function formatNotificationDate(date: string): string {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / 60000);

  if (diffInMinutes < 1) return 'À l\'instant';
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `Il y a ${hours} h`;
  }
  
  return notificationDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}