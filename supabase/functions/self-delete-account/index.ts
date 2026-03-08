import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    // Get the requesting user
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const targetUserId = user.id;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Delete related data
    await adminClient.from("notifications").delete().eq("user_id", targetUserId);
    await adminClient.from("account_deletion_requests").delete().eq("user_id", targetUserId);
    await adminClient.from("product_reviews").delete().eq("user_id", targetUserId);

    // Disassociate orders (keep records)
    await adminClient.from("orders").update({ user_id: null }).eq("user_id", targetUserId);

    // Delete chat data
    const { data: conversations } = await adminClient
      .from("chat_conversations")
      .select("id")
      .eq("user_id", targetUserId);
    if (conversations && conversations.length > 0) {
      const convIds = conversations.map((c) => c.id);
      await adminClient.from("chat_messages").delete().in("conversation_id", convIds);
      await adminClient.from("chat_conversations").delete().eq("user_id", targetUserId);
    }

    // Delete profile and roles
    await adminClient.from("user_roles").delete().eq("user_id", targetUserId);
    await adminClient.from("profiles").delete().eq("user_id", targetUserId);

    // Delete auth user
    const { error } = await adminClient.auth.admin.deleteUser(targetUserId);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
