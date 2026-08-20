// WhatsApp bill notifications using Twilio's WhatsApp API.
// Requires a Twilio account + WhatsApp-enabled sender (sandbox for testing,
// approved business number for production). See README for setup.

require("dotenv").config();

let client = null;

function getClient() {
  if (
    !process.env.TWILIO_ACCOUNT_SID ||
    !process.env.TWILIO_AUTH_TOKEN
  ) {
    return null; // not configured
  }

  if (!client) {
    const twilio = require("twilio");

    client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }

  return client;
}

function formatBillMessage(order, items, recipientLabel) {
  const lines = items
    .map(
      (it) =>
        `- ${it.item_name} x${it.quantity} • ₹${Number(
          it.price
        ).toFixed(2)} each • ₹${(
          Number(it.price) * Number(it.quantity)
        ).toFixed(2)}`
    )
    .join("\n");

  // Dynamic delivery fee
  // ₹0 = FREE delivery
  const deliveryFee = Number(order.delivery_fee || 0);

  const deliveryText =
    deliveryFee === 0
      ? "FREE"
      : `₹${deliveryFee.toFixed(2)}`;

  const summary = [
    "*GABBA - Order Summary*",
    `Order #${order.id}`,
    "",
    "Items:",
    lines,
    "",
    `Subtotal: ₹${Number(order.subtotal).toFixed(2)}`,
    `Delivery Fee: ${deliveryText}`,
    `Tax: ₹${Number(order.tax).toFixed(2)}`,
    `*Total: ₹${Number(order.total).toFixed(2)}*`,
    "",
    `Payment: ${String(
      order.payment_method || "cod"
    ).toUpperCase()} (${order.payment_status || "pending"})`,
    recipientLabel === "customer"
      ? `Delivery Address: ${order.delivery_address}\nThank you for ordering from Gabba!`
      : `Customer: ${order.customer_name} | ${order.customer_phone}\nDelivery Address: ${order.delivery_address}`,
  ].join("\n");

  return summary;
}

async function sendWhatsAppMessage(toNumber, body) {
  const c = getClient();

  if (!c) {
    console.warn(
      "[whatsapp] Twilio not configured - skipping send. Set TWILIO_* env vars."
    );

    return { skipped: true };
  }

  try {
    const msg = await c.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: toNumber.startsWith("whatsapp:")
        ? toNumber
        : `whatsapp:${toNumber}`,
      body,
    });

    return { sid: msg.sid };
  } catch (err) {
    console.error(
      "[whatsapp] send failed:",
      err.message
    );

    return { error: err.message };
  }
}

// Sends the bill to both the customer and the restaurant owner.
async function sendBillToCustomerAndOwner(order, items) {
  const customerMsg = formatBillMessage(
    order,
    items,
    "customer"
  );

  const ownerMsg = formatBillMessage(
    order,
    items,
    "owner"
  );

  const results = {
    customer: null,
    owner: null,
  };

  if (order.customer_phone) {
    results.customer = await sendWhatsAppMessage(
      order.customer_phone,
      customerMsg
    );
  }

  if (process.env.OWNER_WHATSAPP_NUMBER) {
    results.owner = await sendWhatsAppMessage(
      process.env.OWNER_WHATSAPP_NUMBER,
      ownerMsg
    );
  }

  return results;
}

module.exports = {
  sendBillToCustomerAndOwner,
  sendWhatsAppMessage,
  formatBillMessage,
};