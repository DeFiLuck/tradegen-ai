const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

function drawChart(seed=5) {
  const svg = $('#candlestick-chart');
  if (!svg) return;
  let state = seed * 12345;
  const rand = () => { state = (state * 16807) % 2147483647; return (state - 1) / 2147483646; };
  const candles = [];
  let prev = 165;
  for (let i=0; i<54; i++) {
    const drift = i > 34 ? 1.2 : (i > 18 ? .3 : -.1);
    const open = prev;
    const close = Math.max(75, Math.min(260, open + (rand()-.47)*26 + drift));
    const high = Math.max(open, close) + rand()*13;
    const low = Math.min(open, close) - rand()*13;
    candles.push({open, close, high, low});
    prev = close;
  }
  const x0=42, xStep=13.2, chartTop=22, chartBottom=270;
  const y = v => chartBottom - (v-65)/210*(chartBottom-chartTop);
  let out = '';
  for(let i=0;i<6;i++){
    const gy=chartTop+i*(chartBottom-chartTop)/5;
    out += `<line x1="30" y1="${gy}" x2="785" y2="${gy}" stroke="#173344" stroke-width="1"/>`;
    out += `<text x="790" y="${gy+3}" fill="#66849a" font-size="9" text-anchor="end">${260-i*40}</text>`;
  }
  for(let i=0;i<8;i++){
    const gx=45+i*103;
    out += `<line x1="${gx}" y1="18" x2="${gx}" y2="288" stroke="#102b3a" stroke-width="1"/>`;
  }
  candles.forEach((c,i)=>{
    const x=x0+i*xStep;
    const up=c.close>=c.open, color=up?'#00e6a0':'#ff6684';
    out += `<line x1="${x}" y1="${y(c.high)}" x2="${x}" y2="${y(c.low)}" stroke="${color}" stroke-width="1.4"/>`;
    const top=Math.min(y(c.open),y(c.close)), h=Math.max(3,Math.abs(y(c.open)-y(c.close)));
    out += `<rect x="${x-3.2}" y="${top}" width="6.4" height="${h}" rx="1" fill="${color}" opacity=".95"/>`;
  });
  const avg = candles.map((c,i)=>candles.slice(Math.max(0,i-7),i+1).reduce((sum,v)=>sum+v.close,0)/Math.min(i+1,8));
  out += `<polyline points="${avg.map((v,i)=>`${x0+i*xStep},${y(v)}`).join(' ')}" fill="none" stroke="#28a9ff" stroke-width="1.6" opacity=".9"/>`;
  out += `<line x1="30" y1="296" x2="785" y2="296" stroke="#173344"/>`;
  ['09:00','11:00','13:00','15:00','17:00','19:00','21:00'].forEach((t,i)=>out += `<text x="${50+i*105}" y="315" fill="#66849a" font-size="9">${t}</text>`);
  const last=candles[candles.length-1].close;
  out += `<line x1="30" y1="${y(last)}" x2="785" y2="${y(last)}" stroke="#00e6a0" stroke-dasharray="4 5" opacity=".6"/>`;
  svg.innerHTML=out;
}

function setFilter(filter) {
  $$('.filter').forEach(btn=>btn.classList.toggle('active',btn.dataset.filter===filter));
  $$('.signal-card').forEach(card=>card.classList.toggle('hidden',filter!=='All' && card.dataset.category!==filter));
}
$$('.filter').forEach(btn=>btn.addEventListener('click',()=>setFilter(btn.dataset.filter)));

const viewContent = {
  dashboard: ['Dashboard overview','Your demo market dashboard is ready. Connect a market-data provider and a tested signal engine to turn this preview into a live product.'],
  signals: ['Live signals','Signal cards currently contain sample values. A live feed should only publish after a strategy has generated and validated a setup.'],
  markets: ['Markets','Track forex pairs, gold (XAUUSD), and major cryptocurrencies. Live quotes and historical candles require a market-data API connection.'],
  journal: ['Signal history','This area will store signal creation time, entry, stop-loss, take-profit, status, and outcome so members can review transparent performance.'],
  membership: ['Membership plans','Choose a subscription structure for your business. Payment processing, account access, and protected premium signals are not connected in this prototype.'],
  settings: ['Settings','Set your preferred markets, notification channels, risk disclosures, and account settings when authentication is added.']
};
function showView(key) {
  const [title,desc]=viewContent[key] || viewContent.dashboard;
  $('#page-title').textContent=title;
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===key));
  const extra=$('#extra-view');
  const mainGrid=$('.content-grid'), metrics=$('.metrics-grid'), bottom=$('.bottom-grid'), notice=$('.notice');
  if(key==='dashboard') {
    extra.classList.add('hidden'); mainGrid.classList.remove('hidden'); metrics.classList.remove('hidden'); bottom.classList.remove('hidden'); notice.classList.remove('hidden');
    return;
  }
  mainGrid.classList.add('hidden'); metrics.classList.add('hidden'); bottom.classList.add('hidden'); extra.classList.remove('hidden'); notice.classList.remove('hidden');
  let more='';
  if(key==='membership') {
    more=`<div class="plan-grid">
      <div class="plan"><h3>Starter</h3><div class="price">Free</div><small>For new members</small><p>Limited market previews and public updates.</p><button class="button button-outline" data-plan="Starter">Selected preview</button></div>
      <div class="plan"><h3>Premium</h3><div class="price">Set price</div><small>Monthly subscription</small><p>Full signal feed, entry levels, risk targets, and history.</p><button class="button button-primary" data-plan="Premium">Plan to configure</button></div>
      <div class="plan"><h3>VIP</h3><div class="price">Set price</div><small>Advanced membership</small><p>Premium features plus enhanced market reports and alerts.</p><button class="button button-outline" data-plan="VIP">Plan to configure</button></div>
    </div><p><b>Next:</b> choose your currency and prices, then connect a payment provider and secure member login. These buttons do not take payment.</p>`;
  } else if(key==='signals') {
    more='<p>Use the Dashboard tab to preview signal cards. Production signals will need a defined strategy, live market feed, server-side validation, and persistent storage.</p><button class="button button-outline" data-go-dashboard>Back to dashboard</button>';
  } else if(key==='markets') {
    more='<p><b>Forex:</b> EUR/USD, GBP/USD, USD/JPY · <b>Gold:</b> XAUUSD · <b>Crypto:</b> BTC/USD, ETH/USD.</p><p>Market availability and price formats vary by data provider. The visible values are sample data.</p>';
  } else if(key==='journal') {
    more='<p>No verified historical results are recorded yet. When storage is connected, this page will show closed signals and outcomes, including losses, without hiding unsuccessful trades.</p>';
  } else if(key==='settings') {
    more='<p>Future settings: preferred assets, alert delivery, timezone, account security, subscription status, and risk disclosure acknowledgement.</p>';
  } else {
    more='<p>This prototype demonstrates the front-end only. Live prices, accounts, secure premium access, payments, and signal generation are separate integrations.</p>';
  }
  extra.innerHTML=`<h2>${title}</h2><p>${desc}</p>${more}`;
  $$('[data-go-dashboard]',extra).forEach(b=>b.addEventListener('click',()=>showView('dashboard')));
  $$('[data-plan]',extra).forEach(b=>b.addEventListener('click',()=>alert('Subscription checkout is not connected yet. No payment has been taken.')));
}
$$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.view)));
$$('[data-view-link]').forEach(btn=>btn.addEventListener('click',()=>showView(btn.dataset.viewLink)));
$('#view-all-signals').addEventListener('click',()=>showView('signals'));
$('#refresh-btn').addEventListener('click',()=>{
  drawChart(Math.floor(Math.random()*1000)+1);
  $('#updated-at').textContent='just now';
  $('#metric-signals').textContent=String(10+Math.floor(Math.random()*7));
  $('#refresh-btn').textContent='✓ Refreshed';
  setTimeout(()=>$('#refresh-btn').textContent='↻ Refresh demo',1200);
});
$('#chart-market').addEventListener('change', e=>{
  const chartTitle = e.target.value;
  $('.chart-panel .panel-heading .muted').textContent=`${chartTitle} · illustrative candlestick chart`;
  drawChart(chartTitle.length*13);
});
$('#year').textContent=new Date().getFullYear();
drawChart();
