import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OrderItemInput {
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  pack_size: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_address,
      bkash_number,
      payment_method,
      total_amount,
      delivery_charge,
      items,
    } = body as {
      customer_name: string;
      customer_phone: string;
      customer_address: string;
      bkash_number: string | null;
      payment_method: string;
      total_amount: number;
      delivery_charge: number;
      items: OrderItemInput[];
    };

    if (
      !customer_name?.trim() ||
      !customer_phone?.trim() ||
      !customer_address?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return new Response(JSON.stringify({ error: "Invalid order payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: null,
        customer_name: customer_name.trim().slice(0, 120),
        customer_phone: customer_phone.trim().slice(0, 40),
        customer_address: customer_address.trim().slice(0, 500),
        bkash_number: payment_method === "bkash" ? bkash_number : null,
        payment_method,
        total_amount,
        delivery_charge,
      })
      .select("id, order_number")
      .single();

    if (orderError) throw orderError;

    const { error: itemsError } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        product_name: i.product_name,
        product_price: i.product_price,
        quantity: i.quantity,
        pack_size: i.pack_size,
      })),
    );

    if (itemsError) throw itemsError;

    return new Response(
      JSON.stringify({ id: order.id, order_number: order.order_number }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("create-guest-order error:", error);
    return new Response(JSON.stringify({ error: "Failed to create order" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
