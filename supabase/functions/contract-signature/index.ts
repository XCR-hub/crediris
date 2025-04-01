import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse webhook payload
    const payload = await req.json();
    const { 
      dossierId,
      status,
      signatureDate,
      signatureIp,
      signatureData,
      contractUrl
    } = payload;

    console.log('Received contract signature webhook:', {
      dossierId,
      status,
      signatureDate
    });

    // Update application status in database
    const { error: updateError } = await supabaseClient
      .from('applications')
      .update({
        status: 'signed',
        signature_date: signatureDate,
        signature_ip: signatureIp,
        signature_data: signatureData,
        contract_url: contractUrl,
        updated_at: new Date().toISOString()
      })
      .eq('afi_esca_id', dossierId);

    if (updateError) {
      throw updateError;
    }

    // Get application details for email notification
    const { data: application, error: fetchError } = await supabaseClient
      .from('applications')
      .select(`
        *,
        users (
          email,
          first_name,
          last_name
        )
      `)
      .eq('afi_esca_id', dossierId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Send email notification
    await sendEmailNotification({
      to: application.users.email,
      type: 'CONTRACT_SIGNED',
      data: {
        firstName: application.users.first_name,
        applicationId: application.id,
        contractUrl
      }
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});

async function sendEmailNotification({ to, type, data }: {
  to: string;
  type: 'CONTRACT_SIGNED';
  data: any;
}) {
  // Here you would integrate with your email service (e.g., Resend, SendGrid)
  // This is just a placeholder
  console.log('Sending email notification:', {
    to,
    type,
    data
  });
}