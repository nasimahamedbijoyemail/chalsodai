import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const normalizePhone = (p: string) => p.replace(/[^0-9]/g, "").slice(-10);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_number, phone } = (await req.json()) as {
      order_number?: string;
      phone?: string;
    };

    if (!order_number?.trim() || !phone?.trim()) {
      return new Response(
        JSON.stringify({ error: "অর্ডার নম্বর ও ফোন নম্বর দিন" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, payment_method, total_amount, delivery_charge, customer_name, customer_phone, customer_address, created_at, admin_notes",
      )
      .eq("order_number", order_number.trim().toUpperCase())
      .maybeSingle();

    if (error) throw error;

    if (!order || normalizePhone(order.customer_phone) !== normalizePhone(phone)) {
      return new Response(
        JSON.stringify({ error: "অর্ডারটি পাওয়া যায়নি। নম্বরগুলো মিলিয়ে দেখুন।" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("id, product_name, product_price, quantity, pack_size")
      .eq("order_id", order.id);

    // Mask the stored phone before returning
    const { customer_phone, id: _id, ...safeOrder } = order;

    return new Response(
      JSON.stringify({
        order: {
          ...safeOrder,
          customer_phone: customer_phone.replace(/\d(?=\d{3})/g, "*"),
        },
        items: items || [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("track-order error:", e);
    return new Response(JSON.stringify({ error: "কিছু ভুল হয়েছে, আবার চেষ্টা করুন" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
