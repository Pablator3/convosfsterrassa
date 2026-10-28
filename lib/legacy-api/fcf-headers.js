const FCF_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36";

// Mimics a Chrome request on Windows to the FCF API.
const FCF_HEADERS = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "ca-ES,ca;q=0.9,es;q=0.8,en;q=0.7",
  Referer: "https://www.fcf.cat/",
  Origin: "https://www.fcf.cat",
  "User-Agent": FCF_USER_AGENT,
  "sec-ch-ua": '"Chromium";v="155", "Google Chrome";v="155", "Not.A/Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Windows"',
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
};

module.exports = { FCF_HEADERS, FCF_USER_AGENT };
