const clients = new Map();
const STALE_MS = 30 * 1000;

function touchClient(ip) {
  if (!ip) return;
  clients.set(ip, Date.now());
}

function getActiveUsers() {
  const now = Date.now();
  for (const [ip, lastSeen] of clients.entries()) {
    if (now - lastSeen > STALE_MS) {
      clients.delete(ip);
    }
  }
  return clients.size;
}

module.exports = { touchClient, getActiveUsers };
