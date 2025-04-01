import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2, Clock } from 'lucide-react';

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StatusTimelineProps {
  events: TimelineEvent[];
}

export function StatusTimeline({ events }: StatusTimelineProps) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.date}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                      event.status === 'completed' && 'bg-green-500',
                      event.status === 'current' && 'bg-blue-500',
                      event.status === 'upcoming' && 'bg-gray-200'
                    )}
                  >
                    {event.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : (
                      <Clock className={cn(
                        'h-5 w-5',
                        event.status === 'current' ? 'text-white' : 'text-gray-500'
                      )} />
                    )}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    {event.description && (
                      <p className="mt-0.5 text-sm text-gray-500">{event.description}</p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {format(new Date(event.date), 'dd MMMM yyyy', { locale: fr })}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}