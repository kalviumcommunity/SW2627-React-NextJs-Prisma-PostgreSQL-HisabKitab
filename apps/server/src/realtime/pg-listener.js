/**
 * pg-listener.js — Postgres LISTEN/NOTIFY → SSE bridge
 *
 * When Postgres fires a NOTIFY on the "shop_events" channel,
 * this module broadcasts the payload to all SSE clients
 * connected to the relevant shop.
 *
 * Usage: import this module in index.js once to start listening.
 */

const { Client } = require("pg");

// In-memory SSE client registry
// { clientId: { res, userId, shopId } }
const clients = new Map();

let pgClient = null;

async function startPgListener() {
  if (!process.env.DATABASE_URL) {
    console.warn("[SSE] DATABASE_URL not set — real-time disabled.");
    return;
  }

  pgClient = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await pgClient.connect();
    await pgClient.query("LISTEN shop_events");
    console.log("[SSE] Listening on Postgres channel: shop_events");

    pgClient.on("notification", (msg) => {
      try {
        const payload = JSON.parse(msg.payload);
        broadcastToShop(payload.shopId, payload);
      } catch (e) {
        console.error("[SSE] Failed to parse notification:", e);
      }
    });

    pgClient.on("error", (err) => {
      console.error("[SSE] PG client error:", err.message);
      reconnect();
    });
  } catch (err) {
    console.error("[SSE] Failed to start pg listener:", err.message);
  }
}

function reconnect() {
  setTimeout(() => {
    console.log("[SSE] Attempting reconnect...");
    startPgListener();
  }, 5000);
}

/**
 * Broadcast an event to all SSE clients subscribed to a given shop.
 * @param {string} shopId
 * @param {object} payload
 */
function broadcastToShop(shopId, payload) {
  const message = `data: ${JSON.stringify(payload)}\n\n`;
  let sent = 0;

  for (const [clientId, client] of clients.entries()) {
    if (client.shopId === shopId) {
      try {
        client.res.write(message);
        sent++;
      } catch {
        clients.delete(clientId);
      }
    }
  }

  if (sent > 0) {
    console.log(`[SSE] Broadcast to ${sent} client(s) in shop ${shopId}`);
  }
}

function addSseClient(clientId, client) {
  clients.set(clientId, client);
  console.log(`[SSE] Client connected: ${clientId} (shop: ${client.shopId})`);
}

function removeSseClient(clientId) {
  clients.delete(clientId);
  console.log(`[SSE] Client disconnected: ${clientId}`);
}

function getSseClients() {
  return clients;
}

// Auto-start listener when this module is first imported
startPgListener();

module.exports = { addSseClient, removeSseClient, getSseClients, broadcastToShop };
