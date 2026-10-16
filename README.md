# TradeGen AI Dashboard — Starter Prototype

This is a responsive front-end prototype for a subscription-based premium signals business covering forex, gold, and cryptocurrency.

## Run it
Open `index.html` in a modern browser. No build step is required.

## Included
- Responsive dark neon dashboard UI
- Illustrative SVG candlestick chart
- Working navigation, signal category filters, demo refresh, and membership plan preview
- Demo signal cards with entry, stop-loss, and take-profit fields
- Explicit demo-data warnings

## Important: not yet a live trading product
The displayed prices, confidence scores, and performance metrics are sample values. This prototype does not connect to live market data, generate real signals, authenticate members, store signal history, take payments, or place trades.

## Suggested production stages
1. Pick a market-data provider with forex, XAUUSD, and crypto coverage.
2. Define and backtest a signal strategy; show only verified calculations and disclose limitations.
3. Add a server-side API and database for quotes, signals, and signal outcomes.
4. Add member authentication and role-based premium access.
5. Connect a payment provider available in your target countries; validate webhooks server-side.
6. Add email/Telegram/WhatsApp alerts only after secure server-side handling.
7. Deploy to a hosting provider and configure environment variables outside the public source code.

Never place API keys or payment secrets in browser JavaScript. Start with paper trading; no signal can guarantee profit.
