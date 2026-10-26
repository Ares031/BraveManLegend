// Runs synchronously before scene scripts so Canvas and classic DEMO bindings exist.
(() => {
  const script=document.currentScript;
  const root=new URL('../',script.src);
  const url=path=>new URL(path,root).href;
  const page=GAME_PAGE_LAYOUTS[script.dataset.scene];
  if(!page)throw Error('Unknown scene layout');
  const main=document.createElement('main');
  main.innerHTML=`
    <header><a class="brand" href="${url('towns/starter-village/index.html')}">✦ BRAVE MAN LEGEND</a></header>
    <section class="heading"><div><h1>${page.name}</h1><p class="subtitle">${page.subtitle}</p></div></section>
    <div class="play-layout" id="play-layout"${page.travel||page.returnTo?' data-extra-controls="true"':''}>
      <div class="weather" id="phase">載入世界…</div>
      <aside class="message-panel panel" aria-labelledby="message-title"><h2 id="message-title">一般訊息</h2><div id="message-log" role="log" aria-live="polite"></div></aside>
      <div class="stage-column">
        <section class="scene"><canvas id="${page.canvasId}" width="960" height="640" aria-label="${page.description}"></canvas>${page.caption?`<div class="map-caption">${page.caption}</div>`:''}${page.distance?'<div id="distance" class="journey-distance">旅程 0000 m</div>':''}</section>
        <nav aria-label="遊戲選單" id="game-menu">${[['character','人物狀態'],['inventory','背包'],['skills','技能'],['settings','設定']].map(([id,name])=>`<button data-panel="${id}">${name}</button>`).join('')}<button id="toggle-developer" aria-controls="developer-panel system-panel" aria-expanded="true">開發者專用</button></nav>
        ${page.travel?`<div class="travel-controls controls"><button id="pause">Ⅱ 暫停前進</button><button id="restart">↺ 重新出發</button><a class="return-village" href="${url('towns/starter-village/index.html')}">← 返回新手村</a></div>`:''}
        ${page.returnTo?`<div class="interior-controls"><a class="return-town" href="${url(page.returnTo.path)}">${page.returnTo.text}</a></div>`:''}
      </div>
      <aside class="developer-panel panel" id="developer-panel" aria-labelledby="developer-title"><h2 id="developer-title">開發者訊息</h2><div class="world-controls" aria-label="世界控制"><button id="toggle-day-night" type="button" title="切換日夜，重新倒數 600 秒">☀ / ☾ 切換日夜</button><button id="reroll-weather" type="button" title="晴天 70%、雨天 20%、迷霧 10%">⚄ 重骰天氣</button></div><p id="${page.clockId}" class="world-status" aria-label="世界時間與氣候">正在載入世界狀態…</p>${page.debug?`<dl>${page.debug.map(([name,id])=>`<dt>${name}</dt><dd id="${id}"></dd>`).join('')}</dl>`:''}${page.encounters?'<div class="encounters"><p>點擊怪物揮斬</p><p id="encounterRates"></p><p id="encounterCount">場上 0 隻 · 擊退 0 隻</p></div>':''}</aside>
      <aside class="system-panel panel" id="system-panel" aria-labelledby="system-title" hidden><h2 id="system-title">系統訊息</h2><div id="system-message-log" role="log" aria-live="polite"><p class="empty-message">目前沒有系統訊息。</p></div></aside>
    </div>
    <footer><span>${page.footer}</span>${page.footerLink?`<a href="${url(page.footerLink.path)}">${page.footerLink.text}</a>`:`<span>${page.footerText}</span>`}</footer>
    ${page.portal?'<dialog id="portal-dialog" aria-labelledby="portal-title"><h2 id="portal-title">傳送門</h2><p id="portal-message"></p><div id="portal-destinations"></div><form method="dialog"><button>關閉</button></form></dialog>':''}`;
  script.before(main);
  if(page.encounters){const drop=document.createElement('p');drop.id='last-drop';drop.textContent='尚未進行掉落判定';main.querySelector('.encounters').append(drop);}
})();
