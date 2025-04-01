import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/hooks/useToast';

interface WebhookPayload {
  applicationId: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  type: 'STATUS_UPDATE' | 'DOCUMENT_REQUIRED' | 'OFFER_READY';
  message: string;
  documentUrls?: string[];
}

/**
 * Handles incoming webhooks from AFI ESCA
 * @param payload Webhook payload
 */
export async function handleWebhook(payload: WebhookPayload): Promise<void> {
  try {
    // Update application status in database
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status: payload.status.toLowerCase(),
        updated_at: new Date().toISOString(),
        afi_esca_status: payload.status,
        afi_esca_documents: payload.documentUrls || []
      })
      .eq('afi_esca_id', payload.applicationId);

    if (updateError) {
      throw updateError;
    }

    // Send notification to user
    toast({
      title: getNotificationTitle(payload.type),
      description: payload.message,
      variant: getNotificationVariant(payload.status)
    });

    // Send email notification if needed
    if (payload.type === 'OFFER_READY' || payload.status === 'APPROVED') {
      await sendEmailNotification(payload);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    throw error;
  }
}

/**
 * Gets the notification title based on webhook type
 */
function getNotificationTitle(type: WebhookPayload['type']): string {
  switch (type) {
    case 'STATUS_UPDATE':
      return 'Mise à jour du statut';
    case 'DOCUMENT_REQUIRED':
      return 'Document requis';
    case 'OFFER_READY':
      return 'Offre disponible';
    default:
      return 'Notification';
  }
}

/**
 * Gets the notification variant based on application status
 */
function getNotificationVariant(status: WebhookPayload['status']): 'success' | 'error' | 'info' {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    default:
      return 'info';
  }
}

/**
 * Sends an email notification to the user
 */
async function sendEmailNotification(payload: WebhookPayload): Promise<void> {
  try {
    // Get application details
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .select(`
        *,
        users (
          email,
          first_name,
          last_name
        )
      `)
      .eq('afi_esca_id', payload.applicationId)
      .single();

    if (applicationError) {
      throw applicationError;
    }

    // Send email using your preferred email service
    // This is just a placeholder - implement your own email sending logic
    console.log('Sending email to:', application.users.email, {
      type: payload.type,
      status: payload.status,
      message: payload.message
    });
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw here - we don't want to fail the webhook if email fails
  }
}