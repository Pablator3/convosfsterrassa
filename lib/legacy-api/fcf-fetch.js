const { FCF_HEADERS } = require("./fcf-headers");

let proxyAgent;

// Node's built-in fetch ignores HTTPS_PROXY, so use undici only when a proxy is configured.
function getProxyAgent() {
  if (proxyAgent === undefined) {
    const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    proxyAgent = proxy ? new (require("undici").EnvHttpProxyAgent)() : null;
  }
  return proxyAgent;
}

function fcfFetch(url, options = {}) {
  const init = { ...options, headers: FCF_HEADERS };
  const agent = getProxyAgent();
  return agent ? require("undici").fetch(url, { ...init, dispatcher: agent }) : fetch(url, init);
}

module.exports = { fcfFetch };
