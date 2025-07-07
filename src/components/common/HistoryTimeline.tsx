

interface HistoryEvent {
  date: string;
  label: string;
  user?: string;
  status?: string;
}

export function HistoryTimeline({ history }: { history: HistoryEvent[] }) {
  if (!history || history.length === 0) {
    return <div className="text-gray-400">Aucune interaction enregistrée.</div>;
  }
  return (
    <ol className="relative border-l border-gray-200 dark:border-gray-700">
      {history.map((event, idx) => (
        <li key={idx} className="mb-6 ml-4">
          <div className="absolute w-3 h-3 bg-primary rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900" />
          <time className="mb-1 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">{event.date}</time>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{event.label}</div>
          {event.user && <div className="text-xs text-gray-500">Par : {event.user}</div>}
          {event.status && <div className="text-xs text-gray-500">Statut : {event.status}</div>}
        </li>
      ))}
    </ol>
  );
}
