import { toast } from '@/lib/hooks/useToast';

export interface NotificationOptions {
  title?: string;
  description: string;
  variant?: 'default' | 'success' | 'error' | 'info';
}

/**
 * Send a notification to the user
 * @param options Notification options
 */
export function sendNotification({ title, description, variant = 'default' }: NotificationOptions) {
  toast({
    title,
    description,
    variant,
  });
}