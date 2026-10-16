
export default async function handler(req, res) {
  const allowedSymbols = [
    "EUR/USD",
    "GBP/USD",
    "BTC/USD",
    "XAU/USD",
    "ETH/USD",
    "USD/JPY",
    "AUD/USD",
    "USD/CAD",
    "USD/CHF",
    "NZD/USD"
  ];

  const allowedIntervals = [
    "1min",
    "5min",
    "15min",
    "30min",
    "45min",
    "1h",
    "2h",
    "4h",
    "8h",
    "1day",
    "1week",
    "1month"
  ];

  const symbol = req.query.symbol || "EUR/USD";
  const interval = req.query.interval || "5min";

  if (!allowedSymbols.includes(symbol)) {
    return res.status(400).json({
      error: "Unsupported market symbol"
    });
  }

  if (!allowedIntervals.includes(interval)) {
    return res.status(400).json({
      error: "Unsupported chart timeframe"
    });
  }

  const apiKey = process.env.TWELVE_DATA_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "Market data key is not configured"
    });
  }

  try {
    const url = new URL(
      "https://api.twelvedata.com/time_series"
    );

    url.searchParams.set("symbol", symbol);
    url.searchParams.set("interval", interval);
    url.searchParams.set("outputsize", "100");
    url.searchParams.set("apikey", apiKey);

    const response = await fetch(url);
    const data = await response.json();

    if (
      !response.ok ||
      data.status === "error" ||
      !Array.isArray(data.values)
    ) {
      return res.status(502).json({
        error:
          data.message || "Historical market data unavailable"
      });
    }

    return res.status(200).json({
      symbol,
      interval,
      values: data.values,
      updatedAt: new Date().toISOString()
    });
  } catch {
    return res.status(500).json({
      error: "Unable to retrieve historical market data"
    });
  }
}
