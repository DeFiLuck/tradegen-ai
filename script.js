
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const markets = [
  { symbol: "EUR/USD", label: "EUR/USD", index: 0 },
  { symbol: "XAU/USD", label: "XAUUSD", index: 1 },
  { symbol: "BTC/USD", label: "BTC/USD", index: 2 }
];

function drawChart(seed = 5) {
  const svg = $("#candlestick-chart");
  if (!svg) return;

  let state = seed * 12345;
  const rand = () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };

  const candles = [];
  let prev = 165;

  for (let i = 0; i < 54; i++) {
    const drift = i > 34 ? 1.2 : i > 18 ? 0.3 : -0.1;
    const open = prev;
    const close = Math.max(
      75,
      Math.min(260, open + (rand() - 0.47) * 26 + drift)
    );
    const high = Math.max(open, close) + rand() * 13;
    const low = Math.min(open, close) - rand() * 13;
    candles.push({ open, close, high, low });
    prev = close;
  }

  const x0 = 42, xStep = 13.2, top = 22, bottom = 270;
  const y = v => bottom - (v - 65) / 210 * (bottom - top);
  let out = "";

  for (let i = 0; i < 6; i++) {
    const gy = top + i * (bottom - top) / 5;
    out += `<line x1="30" y1="${gy}" x2="785" y2="${gy}" stroke="#173344"/>`;
    out += `<text x="790" y="${gy + 3}" fill="#66849a" font-size="9" text-anchor="end">${260 - i * 40}</text>`;
  }

  for (let i = 0; i < 8; i++) {
    const gx = 45 + i * 103;
    out += `<line x1="${gx}" y1="18" x2="${gx}" y2="288" stroke="#102b3a"/>`;
  }

  candles.forEach((c, i) => {
    const x = x0 + i * xStep;
    const color = c.close >= c.open ? "#00e6a0" : "#ff6684";
    out += `<line x1="${x}" y1="${y(c.high)}" x2="${x}" y2="${y(c.low)}" stroke="${color}" stroke-width="1.4"/>`;
    const candleTop = Math.min(y(c.open), y(c.close));
    const h = Math.max(3, Math.abs(y(c.open) - y(c.close)));
    out += `<rect x="${x - 3.2}" y="${candleTop}" width="6.4" height="${h}" rx="1" fill="${color}"/>`;
  });

  const avg = candles.map((c, i) =>
    candles.slice(Math.max(0, i - 7), i + 1)
      .reduce((sum, v) => sum + v.close, 0) / Math.min(i + 1, 8)
  );

  out += `<polyline points="${avg.map((v, i) => `${x0 + i * xStep},${y(v)}`).join(" ")}" fill="none" stroke="#28a9ff" stroke-width="1.6"/>`;
  out += `<line x1="30" y1="296" x2="785" y2="296" stroke="#173344"/>`;

  ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00", "21:00"]
    .forEach((t, i) => {
      out += `<text x="${50 + i * 105}" y="315" fill="#66849a" font-size="9">${t}</text>`;
    });

  svg.innerHTML = out;
}

function setFilter(filter) {
  $$(".filter").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.filter === filter)
  );

  $$(".signal-card").forEach(card =>
    card.classList.toggle(
      "hidden",
      filter !== "All" && card.dataset.category !== filter
    )
  );
}

$$(".filter").forEach(btn =>
  btn.addEventListener("click", () => setFilter(btn.dataset.filter))
);

async function updateMarketPrice(market) {
  const item = $(".market-strip > div:nth-child(" + (market.index + 1) + ")");
  if (!item) return;

  const priceElement = $("b", item);
  const changeElement = $("span", item);

  try {
    const response = await fetch(
      "/api/market?symbol=" + encodeURIComponent(market.symbol),
      { cache: "no-store" }
    );

    const data = await response.json();

    if (!response.ok || typeof data.price !== "number") {
      throw new Error(data.error || "Price unavailable");
    }

    priceElement.textContent = data.price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    });

    if (changeElement) {
      changeElement.textContent = "Live quote";
      changeElement.className = "up";
    }

    item.setAttribute("title", "Latest quote received from the market data provider");
  } catch (error) {
    if (changeElement) {
      changeElement.textContent = "Unavailable";
      changeElement.className = "";
    }
    console.error("Price update failed for " + market.symbol, error);
  }
}

async function refreshMarketPrices() {
  await Promise.all(markets.map(updateMarketPrice));

  const accountStatus = $(".account small");
  if (accountStatus) accountStatus.textContent = "Live prices · Demo signals";

  const feedStatus = $(".live-label");
  if (feedStatus) feedStatus.textContent = "Live prices · Demo signals";
}

const viewContent = {
  dashboard: [
    "Dashboard overview",
    "Live market quotes with illustrative demo signals."
  ],
  signals: [
    "Live signals",
    "Signal cards are still sample values. Verified strategy-generated signals are not connected."
  ],
  markets: [
    "Markets",
    "Market prices are retrieved from the configured market-data API when supported."
  ],
  journal: [
    "Signal history",
    "Verified historical signal outcomes and persistent storage are not connected yet."
  ],
  membership: [
    "Membership plans",
    "Payment processing, account access, and protected premium signals are not connected yet."
  ],
  settings: [
    "Settings",
    "Account security, notification preferences, and member settings are future integrations."
  ]
};

function showView(key) {
  const [title, desc] = viewContent[key] || viewContent.dashboard;
  $("#page-title").textContent = title;

  $$(".nav-item").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.view === key)
  );

  const extra = $("#extra-view");
  const mainGrid = $(".content-grid");
  const metrics = $(".metrics-grid");
  const bottom = $(".bottom-grid");
  const notice = $(".notice");

  if (key === "dashboard") {
    extra.classList.add("hidden");
    mainGrid.classList.remove("hidden");
    metrics.classList.remove("hidden");
    bottom.classList.remove("hidden");
    notice.classList.remove("hidden");
    return;
  }

  mainGrid.classList.add("hidden");
  metrics.classList.add("hidden");
  bottom.classList.add("hidden");
  extra.classList.remove("hidden");
  notice.classList.remove("hidden");

  let more = "";

  if (key === "membership") {
    more = `<div class="plan-grid">
      <div class="plan"><h3>Starter</h3><div class="price">Free</div><small>For new members</small><p>Limited market previews and public updates.</p><button class="button button-outline" data-plan="Starter">Selected preview</button></div>
      <div class="plan"><h3>Premium</h3><div class="price">Set price</div><small>Monthly subscription</small><p>Full signal feed and market reports.</p><button class="button button-primary" data-plan="Premium">Plan to configure</button></div>
      <div class="plan"><h3>VIP</h3><div class="price">Set price</div><small>Advanced membership</small><p>Enhanced market reports and alerts.</p><button class="button button-outline" data-plan="VIP">Plan to configure</button></div>
    </div><p>Checkout is not connected. These buttons do not take payment.</p>`;
  } else if (key === "signals") {
    more = `<p>Trading signals remain demo examples until a strategy is implemented and tested.</p><button class="button button-outline" data-go-dashboard>Back to dashboard</button>`;
  } else if (key === "markets") {
    more = `<p><b>Forex:</b> EUR/USD, GBP/USD · <b>Gold:</b> XAUUSD · <b>Crypto:</b> BTC/USD.</p><button class="button button-outline" id="refresh-markets">Refresh live prices</button>`;
  } else if (key === "journal") {
    more = `<p>No verified historical results are recorded yet.</p>`;
  } else if (key === "settings") {
    more = `<p>Account settings and alerts will be connected in a later stage.</p>`;
  }

  extra.innerHTML = `<h2>${title}</h2><p>${desc}</p>${more}`;

  $$("[data-go-dashboard]", extra).forEach(btn =>
    btn.addEventListener("click", () => showView("dashboard"))
  );

  $$("[data-plan]", extra).forEach(btn =>
    btn.addEventListener("click", () =>
      alert("Checkout is not connected. No payment has been taken.")
    )
  );

  $("#refresh-markets")?.addEventListener("click", refreshMarketPrices);
}

$$(".nav-item").forEach(btn =>
  btn.addEventListener("click", () => showView(btn.dataset.view))
);

$$("[data-view-link]").forEach(btn =>
  btn.addEventListener("click", () => showView(btn.dataset.viewLink))
);

$("#view-all-signals")?.addEventListener("click", () => showView("signals"));

$("#refresh-btn")?.addEventListener("click", async () => {
  const btn = $("#refresh-btn");
  btn.disabled = true;
  btn.textContent = "Refreshing prices…";
  await refreshMarketPrices();
  btn.disabled = false;
  btn.textContent = "↻ Refresh prices";
});

$("#chart-market")?.addEventListener("change", event => {
  const market = event.target.value;
  const subtitle = $(".chart-panel .panel-heading .muted");
  if (subtitle) subtitle.textContent = market + " · illustrative chart (not live candles)";
  drawChart(market.length * 13);
});

if ($("#year")) $("#year").textContent = new Date().getFullYear();

drawChart();
refreshMarketPrices();
setInterval(refreshMarketPrices, 60000);
