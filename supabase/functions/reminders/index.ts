import { createClient } from 'npm:@supabase/supabase-js';
import { format } from 'npm:date-fns';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending applications older than 48h without reminder
    const { data: pendingApplications, error: fetchError } = await supabaseClient
      .from('applications')
      .select(`
        id,
        created_at,
        users (
          email,
          first_name,
          last_name
        )
      `)
      .eq('status', 'pending_review')
      .eq('reminder_sent', false)
      .lt('created_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

    if (fetchError) throw fetchError;

    // Process each application
    for (const app of pendingApplications) {
      // Send reminder email
      await sendReminderEmail(app);

      // Update reminder status
      const { error: updateError } = await supabaseClient
        .from('applications')
        .update({
          reminder_sent: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', app.id);

      if (updateError) throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: pendingApplications.length 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing reminders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      }
    );
  }
});

async function sendReminderEmail(application: any) {
  const emailContent = `
    Bonjour ${application.users.first_name},

    Nous avons remarqué que votre dossier d'assurance emprunteur est en attente depuis 48h.
    Pour finaliser votre souscription, veuillez vous connecter à votre espace client :
    ${Deno.env.get('VITE_APP_URL')}/loan

    Si vous avez besoin d'aide, notre équipe est à votre disposition.

    Cordialement,
    L'équipe CREDIRIS
  `;

  // Here you would integrate with your email service (SendGrid, Resend, etc.)
  console.log('Sending reminder email to:', application.users.email);
  console.log('Email content:', emailContent);
}