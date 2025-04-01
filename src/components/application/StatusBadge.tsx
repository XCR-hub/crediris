import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending_review':
        return {
          label: 'En cours de traitement',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800'
        };
      case 'approved':
        return {
          label: 'Approuvé',
          icon: CheckCircle2,
          className: 'bg-green-100 text-green-800'
        };
      case 'rejected':
        return {
          label: 'Rejeté',
          icon: XCircle,
          className: 'bg-red-100 text-red-800'
        };
      case 'processing':
        return {
          label: 'En traitement',
          icon: Loader2,
          className: 'bg-blue-100 text-blue-800'
        };
      case 'needs_info':
        return {
          label: 'Informations requises',
          icon: AlertTriangle,
          className: 'bg-orange-100 text-orange-800'
        };
      default:
        return {
          label: status,
          icon: Clock,
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className,
        className
      )}
    >
      <Icon className={cn(
        'w-4 h-4 mr-1',
        status.toLowerCase() === 'processing' && 'animate-spin'
      )} />
      {config.label}
    </div>
  );
}