const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface OrderItemPayload {
  name: string;
  quantity: number;
  price: number;
  packSize?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      orderNumber,
      customerName,
      customerPhone,
      customerAddress,
      paymentMethod,
      bkashNumber,
      deliveryCharge,
      totalAmount,
      items = [],
    } = body as {
      orderNumber: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      paymentMethod: string;
      bkashNumber?: string | null;
      deliveryCharge?: number;
      totalAmount: number;
      items: OrderItemPayload[];
    };

    const adminPhone = Deno.env.get("CALLMEBOT_PHONE");
    const apiKey = Deno.env.get("CALLMEBOT_APIKEY");

    if (!adminPhone || !apiKey) {
      console.warn("CallMeBot env vars missing; skipping WhatsApp notification");
      return new Response(JSON.stringify({ sent: false, reason: "not_configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lines = [
      "🛒 নতুন অর্ডার / New Order",
      "",
      `📋 Order: ${orderNumber}`,
      `👤 Name: ${customerName}`,
      `📱 Phone: ${customerPhone}`,
      `📍 Address: ${customerAddress}`,
      `💳 Payment: ${paymentMethod === "cod" ? "Cash on Delivery" : "bKash"}`,
      paymentMethod === "bkash" && bkashNumber ? `🔖 TrxID: ${bkashNumber}` : null,
      "",
      "Items:",
      ...items.map(
        (i) => `• ${i.name}${i.packSize ? ` (${i.packSize})` : ""} x ${i.quantity} = ${i.price * i.quantity} BDT`,
      ),
      deliveryCharge ? `🚚 Delivery: ${deliveryCharge} BDT` : null,
      `💰 Total: ${totalAmount} BDT`,
    ]
      .filter((l) => l !== null)
      .join("\n");

    const phone = adminPhone.replace(/[^\d+]/g, "");
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(lines)}&apikey=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url);
    const text = await res.text();
    console.log("CallMeBot status", res.status, text.slice(0, 200));

    return new Response(JSON.stringify({ sent: res.ok }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("order-whatsapp-notify error", error);
    return new Response(JSON.stringify({ sent: false, error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
