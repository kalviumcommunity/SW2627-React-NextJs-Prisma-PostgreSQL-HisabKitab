/**
 * Firebase Cloud Messaging helper.
 * Sends push notifications to shop owner / staff devices.
 *
 * Requires FCM_SERVER_KEY in .env.
 * If not configured, operations are no-ops (graceful fallback).
 */

let admin;

function getAdmin() {
  if (admin) return admin;

  if (!process.env.FCM_SERVER_KEY) {
    console.warn("[FCM] FCM_SERVER_KEY not set — push notifications disabled.");
    return null;
  }

  admin = require("firebase-admin");

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FCM_SERVER_KEY)
      ),
    });
  }

  return admin;
}

/**
 * Send a push notification to a single device token.
 * @param {string} token  - FCM device token
 * @param {string} title
 * @param {string} body
 * @param {Record<string, string>} [data] - extra key/value payload
 */
async function sendPush(token, title, body, data = {}) {
  const fcm = getAdmin();
  if (!fcm || !token) return null;

  try {
    const result = await fcm.messaging().send({
      token,
      notification: { title, body },
      data,
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    });
    return result;
  } catch (err) {
    console.error("[FCM] Failed to send push:", err.message);
    return null;
  }
}

/**
 * Send to multiple tokens (multicast).
 * @param {string[]} tokens
 * @param {string} title
 * @param {string} body
 * @param {Record<string, string>} [data]
 */
async function sendMulticastPush(tokens, title, body, data = {}) {
  const fcm = getAdmin();
  if (!fcm || !tokens?.length) return null;

  try {
    const result = await fcm.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      data,
      android: { priority: "high" },
    });
    return result;
  } catch (err) {
    console.error("[FCM] Multicast failed:", err.message);
    return null;
  }
}

module.exports = { sendPush, sendMulticastPush };
