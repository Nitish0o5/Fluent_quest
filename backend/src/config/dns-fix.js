/**
 * DNS Fix for Restricted Networks
 * ─────────────────────────────────
 * Must be imported BEFORE any other module that uses DNS (e.g. mongoose).
 *
 * Some networks (college, corporate, ISP) block DNS resolution for
 * MongoDB Atlas hostnames. This patches Node's dns.lookup to fall back
 * to Google Public DNS (8.8.8.8) when the OS resolver fails.
 */
import dns from "node:dns";
import { Resolver } from "node:dns/promises";

const googleResolver = new Resolver();
googleResolver.setServers(["8.8.8.8", "8.8.4.4"]);

// Fix SRV resolution (used by mongodb+srv:// connection strings)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Patch dns.lookup (used internally by Node's net.connect / TLS)
const _originalLookup = dns.lookup;
dns.lookup = function patchedLookup(hostname, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (typeof options === "number") {
    options = { family: options };
  }

  _originalLookup.call(dns, hostname, options, async (err, address, family) => {
    if (!err) return callback(null, address, family);

    // OS DNS failed — try Google DNS
    try {
      const records = await googleResolver.resolve4(hostname);
      if (records?.length) {
        return callback(null, records[0], 4);
      }
    } catch {
      // fall through to original error
    }
    return callback(err);
  });
};

console.log("🔧 DNS fallback to Google (8.8.8.8) enabled");
