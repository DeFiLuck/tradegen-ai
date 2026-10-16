export default async function handler(req, res) {
  const allowedSymbols = ["EUR/USD", "GBP/USD", "BTC/USD", "XAU/USD"];

  const symbol = req.query.symbol || "EUR/USD";

  if (!allowedSymbols.includes(symbol)) {
    return res.status(400).json({ error: "Unsupported symbol" });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Market data key is not configured" });
  }

  try {
    const url = new URL("https://api.twelvedata.com/price");
    url.searchParams.set("symbol", symbol);
    url.searchParams.set("apikey", apiKey);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.status === "error" || !data.price) {
      return res.status(502).json({
        error: data.message || "Market data unavailable"
      });
    }

    return res.status(200).json({
      symbol,
      price: Number(data.price),
      updatedAt: new Date().toISOString()
    });
  } catch {
    return res.status(500).json({ error: "Unable to retrieve market data" });
  }
}
