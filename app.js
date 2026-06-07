"use strict";

const SAVE_KEY = "kitty-office-mini-games-v1";
const screen = document.querySelector("#screen");
const coinCount = document.querySelector("#coinCount");
const homeBtn = document.querySelector("#homeBtn");
const muteBtn = document.querySelector("#muteBtn");
const exportBtn = document.querySelector("#exportBtn");
const importBtn = document.querySelector("#importBtn");
const importFile = document.querySelector("#importFile");

function asset(path) {
  return `assets/game/${path}.svg`;
}

function assetImg(path, className = "", alt = "") {
  return `<img class="${className}" src="${asset(path)}" alt="${alt}" loading="lazy" />`;
}

const games = [
  {
    id: "pairs",
    title: "甜点翻牌",
    icon: "🍰",
    color: "#ffe3e8",
    tag: "1 分钟",
    blurb: "记住位置，翻出同款甜点。",
    bestLabel: "步",
  },
  {
    id: "merge",
    title: "花束合成",
    icon: "💐",
    color: "#e7fbf6",
    tag: "可暂停",
    blurb: "滑动合并，攒出更大的花束。",
    bestLabel: "分",
  },
  {
    id: "sort",
    title: "包包收纳",
    icon: "👜",
    color: "#fff4cb",
    tag: "短局",
    blurb: "把桌面小物放进对应格子。",
    bestLabel: "秒",
  },
  {
    id: "find",
    title: "下午茶找不同",
    icon: "🫖",
    color: "#e5eeff",
    tag: "轻观察",
    blurb: "点出右边画面里的不同处。",
    bestLabel: "关",
  },
  {
    id: "dress",
    title: "今日穿搭",
    icon: "🎀",
    color: "#f0e8ff",
    tag: "收藏",
    blurb: "换发型、衣服、鞋和蝴蝶结。",
    bestLabel: "件",
  },
  {
    id: "room",
    title: "桌面布置",
    icon: "🪴",
    color: "#e9f7df",
    tag: "装饰",
    blurb: "摆一个适合摸鱼的办公桌。",
    bestLabel: "件",
  },
  {
    id: "milkTea",
    title: "奶茶店",
    icon: "🧋",
    color: "#ffe4c9",
    tag: "接单",
    blurb: "按顾客小票配茶底、奶、糖和小料。",
    bestLabel: "杯",
  },
  {
    id: "flowerShop",
    title: "花店",
    icon: "🌸",
    color: "#ffe4f0",
    tag: "花束",
    blurb: "照订单搭配花材和包装。",
    bestLabel: "束",
  },
  {
    id: "stall",
    title: "摆摊店",
    icon: "🛍️",
    color: "#fff2c8",
    tag: "经营",
    blurb: "进货、定价、布置摊位，开张收摊。",
    bestLabel: "利",
  },
  {
    id: "skyShooter",
    title: "纸飞机射击",
    icon: "✈️",
    color: "#dfe9ef",
    tag: "射击",
    blurb: "拖动飞机，射击远处飞来的障碍。",
    bestLabel: "分",
  },
];

const defaultSave = {
  version: 3,
  coins: 9999,
  muted: true,
  plays: 0,
  unlocked: {
    dress: ["hair-bob", "top-cardigan", "bottom-denim", "shoe-mary", "accent-red"],
    room: ["wall-sky", "desk-oak", "lamp-lemon", "plant-mint", "cup-cherry", "laptop-graphite"],
  },
  games: {
    pairs: { best: 0, plays: 0 },
    merge: { best: 0, score: 0, board: null, plays: 0 },
    sort: { best: 0, plays: 0 },
    find: { best: 0, completed: [], plays: 0 },
    dress: {
      plays: 0,
      selected: {
        hair: "hair-bob",
        top: "top-cardigan",
        bottom: "bottom-denim",
        shoe: "shoe-mary",
        accent: "accent-red",
      },
    },
    room: {
      plays: 0,
      selected: {
        wall: "wall-sky",
        desk: "desk-oak",
        lamp: "lamp-lemon",
        plant: "plant-mint",
        cup: "cup-cherry",
        laptop: "laptop-graphite",
      },
    },
    milkTea: { best: 0, served: 0, plays: 0 },
    flowerShop: { best: 0, served: 0, plays: 0 },
    stall: { best: 0, day: 1, reputation: 1, plays: 0, last: "还没开张" },
    skyShooter: { best: 0, plays: 0, kills: 0 },
  },
  updatedAt: Date.now(),
};

let save = loadSave();
let activeGame = null;
let transient = {};
let toastTimer = null;
const SKY_SHOOTER_CONTINUE_COST = 120;

const pairIcons = ["🍓", "🍰", "🧋", "🍩", "🍪", "🍒", "🧁", "🍮"];
const mergeRanks = [
  null,
  { label: "🌷", value: 2 },
  { label: "🌸", value: 4 },
  { label: "🌹", value: 8 },
  { label: "🌺", value: 16 },
  { label: "🌻", value: 32 },
  { label: "💐", value: 64 },
  { label: "👑", value: 128 },
  { label: "✨", value: 256 },
];

const sortItems = [
  { icon: "💄", cat: "beauty" },
  { icon: "🪞", cat: "beauty" },
  { icon: "🧴", cat: "beauty" },
  { icon: "🎧", cat: "tech" },
  { icon: "⌚", cat: "tech" },
  { icon: "📱", cat: "tech" },
  { icon: "🍬", cat: "snack" },
  { icon: "🍫", cat: "snack" },
  { icon: "🍪", cat: "snack" },
  { icon: "🧣", cat: "wear" },
  { icon: "🧦", cat: "wear" },
  { icon: "🕶️", cat: "wear" },
];

const sortBins = [
  { id: "beauty", label: "美妆", icon: "💄" },
  { id: "tech", label: "数码", icon: "🎧" },
  { id: "snack", label: "零食", icon: "🍬" },
  { id: "wear", label: "配饰", icon: "🧣" },
];

const findScenes = [
  {
    id: "tea",
    common: [
      item("🍰", 42, 59, 58),
      item("🫖", 58, 56, 62),
      item("🌷", 26, 41, 48),
      item("🍓", 72, 65, 44),
      item("☁️", 24, 18, 56),
    ],
    diffs: [
      [item("🍪", 33, 68, 38), item("🍩", 33, 68, 38)],
      [item("💌", 76, 39, 40), item("🎁", 76, 39, 40)],
      [item("✨", 63, 22, 36), item("⭐", 63, 22, 36)],
    ],
  },
  {
    id: "desk",
    common: [
      item("💻", 45, 59, 62),
      item("☕", 66, 62, 43),
      item("🪴", 28, 52, 54),
      item("📎", 74, 43, 34),
      item("☁️", 24, 18, 54),
    ],
    diffs: [
      [item("📒", 35, 72, 42), item("📕", 35, 72, 42)],
      [item("🍬", 59, 39, 36), item("🍫", 59, 39, 36)],
      [item("🌙", 77, 21, 38), item("☀️", 77, 21, 38)],
    ],
  },
  {
    id: "vanity",
    common: [
      item("🪞", 48, 45, 68),
      item("💐", 26, 56, 54),
      item("💎", 67, 63, 42),
      item("🧴", 72, 45, 40),
      item("☁️", 24, 18, 54),
    ],
    diffs: [
      [item("💄", 36, 66, 40), item("🖌️", 36, 66, 40)],
      [item("🎀", 62, 28, 42), item("🦋", 62, 28, 42)],
      [item("🍒", 78, 70, 36), item("🍓", 78, 70, 36)],
    ],
  },
];

const dressOptions = {
  hair: [
    opt("hair-bob", "短发", "#352832", 0),
    opt("hair-cocoa", "可可", "#7a4a38", 30),
    opt("hair-honey", "蜂蜜", "#d79b53", 45),
    opt("hair-berry", "莓果", "#9a3751", 55),
  ],
  top: [
    opt("top-cardigan", "针织", "#f46b7c", 0),
    opt("top-mint", "薄荷", "#53c6ae", 35),
    opt("top-sky", "蓝衫", "#69a7ff", 40),
    opt("top-ink", "小黑", "#3b3540", 55),
  ],
  bottom: [
    opt("bottom-denim", "牛仔", "#6f9bce", 0),
    opt("bottom-lemon", "柠檬", "#f4c542", 35),
    opt("bottom-lilac", "紫裙", "#a98be8", 42),
    opt("bottom-mocha", "摩卡", "#9f765f", 52),
  ],
  shoe: [
    opt("shoe-mary", "玛丽", "#27232a", 0),
    opt("shoe-cherry", "红鞋", "#f44d61", 28),
    opt("shoe-cream", "白鞋", "#f2edf0", 34),
    opt("shoe-sky", "蓝鞋", "#69a7ff", 45),
  ],
  accent: [
    opt("accent-red", "红结", "#ff1f2d", 0),
    opt("accent-mint", "绿结", "#53c6ae", 28),
    opt("accent-lemon", "黄结", "#f4c542", 32),
    opt("accent-lilac", "紫结", "#a98be8", 38),
  ],
};

const roomOptions = {
  wall: [
    opt("wall-sky", "晨蓝", "#dff1ff", 0),
    opt("wall-peach", "蜜桃", "#ffe1d7", 32),
    opt("wall-mint", "薄荷", "#dff7f2", 38),
    opt("wall-lilac", "雾紫", "#efe6ff", 42),
  ],
  desk: [
    opt("desk-oak", "浅木", "#d9a46f", 0),
    opt("desk-white", "白桌", "#f6f2ef", 35),
    opt("desk-mint", "绿桌", "#67cdb8", 45),
    opt("desk-rose", "玫瑰", "#e87989", 50),
  ],
  lamp: [
    opt("lamp-lemon", "暖灯", "#f4c542", 0),
    opt("lamp-cherry", "红灯", "#f44d61", 28),
    opt("lamp-sky", "蓝灯", "#69a7ff", 32),
    opt("lamp-mint", "绿灯", "#53c6ae", 36),
  ],
  plant: [
    opt("plant-mint", "绿植", "#39966f", 0, "#d98b64"),
    opt("plant-lilac", "小花", "#a98be8", 36, "#53c6ae"),
    opt("plant-lemon", "黄花", "#f4c542", 42, "#69a7ff"),
    opt("plant-rose", "红花", "#f44d61", 48, "#7ac58e"),
  ],
  cup: [
    opt("cup-cherry", "红杯", "#f44d61", 0),
    opt("cup-sky", "蓝杯", "#69a7ff", 22),
    opt("cup-mint", "绿杯", "#53c6ae", 26),
    opt("cup-ink", "黑杯", "#3b3540", 32),
  ],
  laptop: [
    opt("laptop-graphite", "石墨", "#4f535c", 0),
    opt("laptop-rose", "玫瑰", "#d78998", 38),
    opt("laptop-silver", "银色", "#c9cdd4", 42),
    opt("laptop-blue", "蓝色", "#537dc6", 48),
  ],
};

const milkTeaOptions = {
  tea: ["红茶", "绿茶", "乌龙"],
  milk: ["牛奶", "燕麦奶", "厚乳"],
  sugar: ["三分糖", "半糖", "七分糖"],
  topping: ["珍珠", "布丁", "椰果"],
};

const milkTeaOrders = [
  order("珍珠奶茶", "红茶", "牛奶", "半糖", "珍珠", "🧋"),
  order("乌龙厚乳", "乌龙", "厚乳", "三分糖", "布丁", "🥤"),
  order("清爽椰果绿", "绿茶", "燕麦奶", "三分糖", "椰果", "🍵"),
  order("布丁奶绿", "绿茶", "牛奶", "七分糖", "布丁", "🍮"),
  order("燕麦珍珠乌龙", "乌龙", "燕麦奶", "半糖", "珍珠", "🧋"),
];

const milkTeaVisuals = {
  tea: {
    红茶: "#8d4b32",
    绿茶: "#87b86c",
    乌龙: "#b07141",
  },
  milk: {
    牛奶: "#fff1d7",
    燕麦奶: "#ead0a8",
    厚乳: "#ffe4bd",
  },
  sugar: {
    三分糖: "31%",
    半糖: "50%",
    七分糖: "70%",
  },
  topping: {
    珍珠: "●",
    布丁: "■",
    椰果: "◆",
  },
  toppingAsset: {
    珍珠: "milk-tea/pearl",
    布丁: "milk-tea/pudding",
    椰果: "milk-tea/coconut",
  },
  customers: ["customers/customer-1", "customers/customer-2", "customers/customer-3"],
};

const flowerOptions = {
  flower: ["玫瑰", "郁金香", "雏菊", "向日葵", "满天星"],
  wrap: ["粉纸", "牛皮纸", "蓝丝带"],
};

const flowerEmoji = {
  玫瑰: "🌹",
  郁金香: "🌷",
  雏菊: "🌼",
  向日葵: "🌻",
  满天星: "✨",
  粉纸: "🎀",
  牛皮纸: "📦",
  蓝丝带: "💙",
};

const flowerAssets = {
  玫瑰: "flowers/rose",
  郁金香: "flowers/tulip",
  雏菊: "flowers/daisy",
  向日葵: "flowers/sunflower",
  满天星: "flowers/baby-breath",
};

const flowerOrders = [
  bouquet("告白花束", ["玫瑰", "玫瑰", "满天星"], "粉纸"),
  bouquet("早安花束", ["郁金香", "雏菊", "满天星"], "蓝丝带"),
  bouquet("元气花束", ["向日葵", "向日葵", "雏菊"], "牛皮纸"),
  bouquet("温柔小束", ["玫瑰", "郁金香", "雏菊"], "粉纸"),
  bouquet("办公桌花", ["雏菊", "满天星", "满天星"], "牛皮纸"),
];

const stallWeather = [
  { name: "晴天", emoji: "☀️", traffic: 1.12 },
  { name: "多云", emoji: "⛅", traffic: 1 },
  { name: "小雨", emoji: "🌧️", traffic: 0.72 },
  { name: "晚风", emoji: "🌙", traffic: 1.22 },
];

const wrapClass = {
  粉纸: "wrap-pink",
  牛皮纸: "wrap-kraft",
  蓝丝带: "wrap-blue",
};

const stallGoodsAssets = ["stall/cake", "stall/skewer", "stall/cookie", "stall/gift"];

function order(name, tea, milk, sugar, topping, icon) {
  return { name, tea, milk, sugar, topping, icon };
}

function bouquet(name, flowers, wrap) {
  return { name, flowers, wrap };
}

function item(icon, x, y, size) {
  return { icon, x, y, size };
}

function opt(id, label, color, cost, alt = null) {
  return { id, label, color, cost, alt };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return structuredClone(defaultSave);
    const parsed = JSON.parse(raw);
    const loaded = mergeSave(structuredClone(defaultSave), parsed);
    if ((parsed.version || 1) < 2) {
      loaded.version = 2;
      loaded.coins = Math.max(Number(loaded.coins) || 0, 9999);
    }
    return loaded;
  } catch {
    return structuredClone(defaultSave);
  }
}

function mergeSave(base, incoming) {
  for (const [key, value] of Object.entries(incoming || {})) {
    if (value && typeof value === "object" && !Array.isArray(value) && key in base) {
      base[key] = mergeSave(base[key], value);
    } else {
      base[key] = value;
    }
  }
  return base;
}

function persist() {
  save.updatedAt = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  syncChrome();
}

function syncChrome() {
  coinCount.textContent = save.coins;
  muteBtn.classList.toggle("is-muted", save.muted);
  muteBtn.textContent = save.muted ? "♪" : "♫";
}

function cleanupActiveGame() {
  if (typeof transient.cleanup === "function") {
    transient.cleanup();
  }
}

function startGame(id) {
  cleanupActiveGame();
  activeGame = id;
  transient = {};
  if (save.games[id]) {
    save.games[id].plays += 1;
    save.plays += 1;
    persist();
  }
  render();
  scrollToTop();
}

function backHome() {
  cleanupActiveGame();
  activeGame = null;
  transient = {};
  render();
  scrollToTop();
}

function scrollToTop() {
  window.requestAnimationFrame(() => window.scrollTo(0, 0));
}

function render() {
  syncChrome();
  if (!activeGame) {
    renderHub();
    return;
  }
  const game = games.find((entry) => entry.id === activeGame);
  screen.innerHTML = `
    <section class="game-frame">
      <div class="game-toolbar">
        <div class="game-toolbar-left">
          <button class="icon-button" type="button" data-action="home" title="返回" aria-label="返回">‹</button>
          <div class="game-title">
            <p class="eyebrow">${game.tag}</p>
            <h2>${game.title}</h2>
          </div>
        </div>
        <div class="toolbar-actions" id="toolbarActions"></div>
      </div>
      <div id="gameStats"></div>
      <div id="gameSurface" class="game-surface"></div>
    </section>
  `;
  screen.querySelector('[data-action="home"]').addEventListener("click", backHome);

  if (activeGame === "pairs") renderPairs();
  if (activeGame === "merge") renderMerge();
  if (activeGame === "sort") renderSort();
  if (activeGame === "find") renderFind();
  if (activeGame === "dress") renderDress();
  if (activeGame === "room") renderRoom();
  if (activeGame === "milkTea") renderMilkTea();
  if (activeGame === "flowerShop") renderFlowerShop();
  if (activeGame === "stall") renderStall();
  if (activeGame === "skyShooter") renderSkyShooter();
}

function renderHub() {
  const template = document.querySelector("#hubTemplate");
  screen.replaceChildren(template.content.cloneNode(true));
  const cards = screen.querySelector("#gameCards");
  for (const game of games) {
    const stat = save.games[game.id]?.best || 0;
    const button = document.createElement("button");
    button.className = "game-card";
    button.type = "button";
    button.style.setProperty("--card-color", game.color);
    button.innerHTML = `
      <div class="game-card-top">
        <span class="game-icon">${game.icon}</span>
        <span class="tag">${game.tag}</span>
      </div>
      <div>
        <h3>${game.title}</h3>
        <p>${game.blurb}</p>
      </div>
      <div class="game-meta">
        <span class="tag">最好 ${stat || "-" } ${game.bestLabel}</span>
        <span class="tag">玩过 ${save.games[game.id]?.plays || 0}</span>
      </div>
    `;
    button.addEventListener("click", () => startGame(game.id));
    cards.append(button);
  }
  screen.querySelector("#playsCount").textContent = save.plays;
  screen.querySelector("#unlockCount").textContent = countUnlocks();
  screen.querySelector("#bestCount").textContent = totalBest();
  screen.querySelector("#hubExportBtn").addEventListener("click", exportSave);
  screen.querySelector("#hubImportBtn").addEventListener("click", () => importFile.click());
}

function countUnlocks() {
  return Object.values(save.unlocked).reduce((sum, list) => sum + list.length, 0);
}

function totalBest() {
  return games.reduce((sum, game) => sum + Number(save.games[game.id]?.best || 0), 0);
}

function renderStats(rows) {
  const stats = document.querySelector("#gameStats");
  stats.innerHTML = `<div class="scorebar">${rows
    .map((row) => `<div><span>${row.label}</span><strong>${row.value}</strong></div>`)
    .join("")}</div>`;
}

function toolbarButton(label, action, primary = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = primary ? "primary-button" : "pill-button";
  button.textContent = label;
  button.addEventListener("click", action);
  document.querySelector("#toolbarActions").append(button);
  return button;
}

function reward(coins, message) {
  save.coins += coins;
  persist();
  toast(`${message} +${coins} 金币`);
}

function toast(message) {
  window.clearTimeout(toastTimer);
  document.querySelector(".toast")?.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);
  toastTimer = window.setTimeout(() => node.remove(), 2200);
}

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function renderPairs(reset = false) {
  if (!transient.pairs || reset) {
    transient.pairs = {
      tiles: shuffle([...pairIcons, ...pairIcons]).map((icon, index) => ({
        id: `${icon}-${index}`,
        icon,
        open: false,
        matched: false,
      })),
      first: null,
      lock: false,
      moves: 0,
      matches: 0,
    };
  }
  toolbarButton("新局", () => renderPairs(true));
  const state = transient.pairs;
  renderStats([
    { label: "步数", value: state.moves },
    { label: "配对", value: `${state.matches}/8` },
    { label: "最好", value: save.games.pairs.best || "-" },
    { label: "金币", value: save.coins },
  ]);
  const surface = document.querySelector("#gameSurface");
  surface.innerHTML = `<div class="pair-board"></div>`;
  const board = surface.querySelector(".pair-board");
  state.tiles.forEach((tile, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `card-tile ${tile.open ? "is-open" : ""} ${tile.matched ? "is-matched" : ""}`;
    button.textContent = tile.icon;
    button.setAttribute("aria-label", tile.open || tile.matched ? tile.icon : "未翻开");
    button.addEventListener("click", () => pickPair(index));
    board.append(button);
  });
}

function pickPair(index) {
  const state = transient.pairs;
  const tile = state.tiles[index];
  if (state.lock || tile.open || tile.matched) return;
  tile.open = true;
  if (state.first === null) {
    state.first = index;
    render();
    return;
  }
  state.moves += 1;
  const first = state.tiles[state.first];
  if (first.icon === tile.icon) {
    first.matched = true;
    tile.matched = true;
    state.matches += 1;
    state.first = null;
    if (state.matches === pairIcons.length) {
      const best = save.games.pairs.best;
      if (!best || state.moves < best) save.games.pairs.best = state.moves;
      reward(Math.max(8, 28 - state.moves), "配对完成");
    }
    render();
    return;
  }
  state.lock = true;
  render();
  window.setTimeout(() => {
    first.open = false;
    tile.open = false;
    state.first = null;
    state.lock = false;
    render();
  }, 620);
}

function renderMerge(reset = false) {
  if (!save.games.merge.board || reset) {
    save.games.merge.board = emptyBoard();
    save.games.merge.score = 0;
    addMergeTile();
    addMergeTile();
    persist();
  }
  toolbarButton("新局", () => renderMerge(true));
  renderStats([
    { label: "分数", value: save.games.merge.score },
    { label: "最好", value: save.games.merge.best || "-" },
    { label: "最大", value: maxMergeValue() },
    { label: "金币", value: save.coins },
  ]);
  const surface = document.querySelector("#gameSurface");
  surface.innerHTML = `
    <div class="merge-layout">
      <div>
        <div class="merge-board"></div>
        <div class="direction-pad">
          <button class="direction-button" data-dir="up" type="button" aria-label="上">↑</button>
          <button class="direction-button" data-dir="left" type="button" aria-label="左">←</button>
          <button class="direction-button" data-dir="down" type="button" aria-label="下">↓</button>
          <button class="direction-button" data-dir="right" type="button" aria-label="右">→</button>
        </div>
      </div>
      <aside class="tool-panel">
        <h3>合成记录</h3>
        <p>${mergeSummary()}</p>
        <button class="primary-button" type="button" id="cashMerge">收下奖励</button>
      </aside>
    </div>
  `;
  const board = surface.querySelector(".merge-board");
  save.games.merge.board.flat().forEach((rank) => {
    const cell = document.createElement("div");
    cell.className = "merge-cell";
    cell.dataset.rank = rank || 0;
    cell.textContent = rank ? mergeRanks[rank]?.label || "💎" : "";
    board.append(cell);
  });
  surface.querySelectorAll(".direction-button").forEach((button) => {
    button.addEventListener("click", () => moveMerge(button.dataset.dir));
  });
  surface.querySelector("#cashMerge").addEventListener("click", () => {
    const amount = Math.floor(maxMergeValue() / 32);
    if (amount > 0) reward(amount, "花束奖励");
    else toast("再合大一点");
  });
}

function emptyBoard() {
  return Array.from({ length: 4 }, () => Array(4).fill(0));
}

function addMergeTile() {
  const open = [];
  save.games.merge.board.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell) open.push([r, c]);
    });
  });
  if (!open.length) return;
  const [r, c] = open[Math.floor(Math.random() * open.length)];
  save.games.merge.board[r][c] = Math.random() > 0.86 ? 2 : 1;
}

function moveMerge(dir) {
  const board = save.games.merge.board;
  const before = JSON.stringify(board);
  let gained = 0;
  const getLine = (index) => {
    if (dir === "left") return board[index];
    if (dir === "right") return [...board[index]].reverse();
    if (dir === "up") return board.map((row) => row[index]);
    return board.map((row) => row[index]).reverse();
  };
  const setLine = (index, line) => {
    const out = dir === "right" || dir === "down" ? [...line].reverse() : line;
    if (dir === "left" || dir === "right") board[index] = out;
    else out.forEach((value, row) => (board[row][index] = value));
  };
  for (let i = 0; i < 4; i += 1) {
    const { line, score } = compressLine(getLine(i));
    gained += score;
    setLine(i, line);
  }
  if (JSON.stringify(board) !== before) {
    save.games.merge.score += gained;
    save.games.merge.best = Math.max(save.games.merge.best || 0, save.games.merge.score);
    addMergeTile();
    persist();
    if (!canMoveMerge()) {
      reward(Math.max(10, Math.floor(save.games.merge.score / 40)), "合成结束");
      save.games.merge.board = null;
      persist();
    }
    render();
  }
}

function compressLine(line) {
  const values = line.filter(Boolean);
  const out = [];
  let score = 0;
  for (let i = 0; i < values.length; i += 1) {
    if (values[i] === values[i + 1]) {
      const merged = values[i] + 1;
      out.push(merged);
      score += mergeRanks[merged]?.value || 512;
      i += 1;
    } else {
      out.push(values[i]);
    }
  }
  while (out.length < 4) out.push(0);
  return { line: out, score };
}

function canMoveMerge() {
  const board = save.games.merge.board;
  if (board.flat().some((cell) => !cell)) return true;
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      if (board[r][c] === board[r]?.[c + 1] || board[r][c] === board[r + 1]?.[c]) return true;
    }
  }
  return false;
}

function maxMergeValue() {
  const rank = Math.max(0, ...(save.games.merge.board || emptyBoard()).flat());
  return rank ? mergeRanks[rank]?.value || 512 : 0;
}

function mergeSummary() {
  const max = maxMergeValue();
  if (!max) return "开一局新的花束合成。";
  return `当前最大花束值 ${max}，本局分数 ${save.games.merge.score}。`;
}

function renderSort(reset = false) {
  if (!transient.sort || reset) {
    transient.sort = {
      items: shuffle(sortItems).map((entry, index) => ({ ...entry, id: `${entry.icon}-${index}`, done: false })),
      selected: null,
      sorted: 0,
      mistakes: 0,
      started: Date.now(),
    };
  }
  toolbarButton("重排", () => renderSort(true));
  const state = transient.sort;
  renderStats([
    { label: "已收", value: `${state.sorted}/12` },
    { label: "错放", value: state.mistakes },
    { label: "最好", value: save.games.sort.best ? `${save.games.sort.best}s` : "-" },
    { label: "金币", value: save.coins },
  ]);
  const surface = document.querySelector("#gameSurface");
  surface.innerHTML = `
    <div class="sort-layout">
      <div class="sort-items"></div>
      <aside class="tool-panel">
        <div class="sort-bins"></div>
      </aside>
    </div>
  `;
  const items = surface.querySelector(".sort-items");
  state.items.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `tile-button ${state.selected === index ? "is-selected" : ""} ${entry.done ? "is-done" : ""}`;
    button.textContent = entry.icon;
    button.addEventListener("click", () => {
      if (!entry.done) {
        state.selected = state.selected === index ? null : index;
        render();
      }
    });
    items.append(button);
  });
  const bins = surface.querySelector(".sort-bins");
  sortBins.forEach((bin) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile-button bin-button";
    button.innerHTML = `<span>${bin.icon}</span><strong>${bin.label}</strong>`;
    button.addEventListener("click", () => sortInto(bin.id));
    bins.append(button);
  });
}

function sortInto(cat) {
  const state = transient.sort;
  if (state.selected === null) {
    toast("先选一个小物");
    return;
  }
  const entry = state.items[state.selected];
  if (entry.cat === cat) {
    entry.done = true;
    state.sorted += 1;
    state.selected = null;
    if (state.sorted === state.items.length) {
      const seconds = Math.max(1, Math.round((Date.now() - state.started) / 1000));
      if (!save.games.sort.best || seconds < save.games.sort.best) save.games.sort.best = seconds;
      reward(Math.max(10, 26 - state.mistakes * 2), "收纳完成");
    }
  } else {
    state.mistakes += 1;
    toast("放错格子");
  }
  render();
}

function renderFind(reset = false) {
  if (!transient.find || reset) {
    const level = save.games.find.completed.length % findScenes.length;
    transient.find = {
      sceneIndex: level,
      found: [],
      started: Date.now(),
    };
  }
  toolbarButton("换一关", () => renderFind(true));
  const state = transient.find;
  const scene = findScenes[state.sceneIndex];
  renderStats([
    { label: "找到", value: `${state.found.length}/3` },
    { label: "完成", value: save.games.find.completed.length },
    { label: "最好", value: save.games.find.best || "-" },
    { label: "金币", value: save.coins },
  ]);
  const surface = document.querySelector("#gameSurface");
  surface.innerHTML = `<div class="find-scenes"><div class="scene"></div><div class="scene is-play"></div></div>`;
  drawScene(surface.querySelectorAll(".scene")[0], scene, false);
  drawScene(surface.querySelectorAll(".scene")[1], scene, true);
}

function drawScene(node, scene, playable) {
  const state = transient.find;
  const entries = [...scene.common, ...scene.diffs.map((pair) => (playable ? pair[1] : pair[0]))];
  entries.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "scene-item";
    button.style.left = `${entry.x}%`;
    button.style.top = `${entry.y}%`;
    button.style.setProperty("--size", `${entry.size}px`);
    button.textContent = entry.icon;
    const isDiff = playable && index >= scene.common.length;
    button.dataset.diff = isDiff ? "true" : "false";
    if (isDiff) {
      const diffIndex = index - scene.common.length;
      button.classList.toggle("is-found", state.found.includes(diffIndex));
      button.addEventListener("click", () => findDiff(diffIndex));
    }
    node.append(button);
  });
}

function findDiff(index) {
  const state = transient.find;
  if (state.found.includes(index)) return;
  state.found.push(index);
  if (state.found.length === 3) {
    const scene = findScenes[state.sceneIndex];
    if (!save.games.find.completed.includes(scene.id)) save.games.find.completed.push(scene.id);
    save.games.find.best = Math.max(save.games.find.best || 0, save.games.find.completed.length);
    reward(18, "找不同完成");
  }
  render();
}

function renderDress() {
  toolbarButton("保存搭配", () => reward(6, "搭配保存"), true);
  renderStats([
    { label: "衣橱", value: save.unlocked.dress.length },
    { label: "金币", value: save.coins },
    { label: "收集", value: `${save.unlocked.dress.length}/${Object.values(dressOptions).flat().length}` },
    { label: "玩过", value: save.games.dress.plays },
  ]);
  const selected = save.games.dress.selected;
  save.games.dress.best = save.unlocked.dress.length;
  persist();
  const surface = document.querySelector("#gameSurface");
  const colors = {
    hair: getOption(dressOptions.hair, selected.hair).color,
    top: getOption(dressOptions.top, selected.top).color,
    bottom: getOption(dressOptions.bottom, selected.bottom).color,
    shoe: getOption(dressOptions.shoe, selected.shoe).color,
    accent: getOption(dressOptions.accent, selected.accent).color,
  };
  surface.innerHTML = `
    <div class="dress-layout">
      <div class="avatar-stage" style="--hair-color:${colors.hair};--top-color:${colors.top};--bottom-color:${colors.bottom};--shoe-color:${colors.shoe};--accent-color:${colors.accent}">
        <div class="avatar">
          <div class="avatar-hair"></div>
          <div class="avatar-head"></div>
          <div class="avatar-bow"></div>
          <div class="avatar-body"></div>
          <div class="avatar-skirt"></div>
          <div class="avatar-leg left"></div>
          <div class="avatar-leg right"></div>
          <div class="avatar-shoe left"></div>
          <div class="avatar-shoe right"></div>
        </div>
      </div>
      <div class="wardrobe-panel"></div>
    </div>
  `;
  renderChoices(surface.querySelector(".wardrobe-panel"), "dress", dressOptions, selected, (group, option) => {
    save.games.dress.selected[group] = option.id;
    persist();
    render();
  });
}

function renderRoom() {
  toolbarButton("保存桌面", () => reward(6, "桌面保存"), true);
  renderStats([
    { label: "物件", value: save.unlocked.room.length },
    { label: "金币", value: save.coins },
    { label: "收集", value: `${save.unlocked.room.length}/${Object.values(roomOptions).flat().length}` },
    { label: "玩过", value: save.games.room.plays },
  ]);
  const selected = save.games.room.selected;
  save.games.room.best = save.unlocked.room.length;
  persist();
  const colors = {
    wall: getOption(roomOptions.wall, selected.wall).color,
    desk: getOption(roomOptions.desk, selected.desk).color,
    lamp: getOption(roomOptions.lamp, selected.lamp).color,
    plant: getOption(roomOptions.plant, selected.plant).color,
    pot: getOption(roomOptions.plant, selected.plant).alt || "#d98b64",
    cup: getOption(roomOptions.cup, selected.cup).color,
    laptop: getOption(roomOptions.laptop, selected.laptop).color,
  };
  const surface = document.querySelector("#gameSurface");
  surface.innerHTML = `
    <div class="room-layout">
      <div class="room-stage" style="--wall-color:${colors.wall};--desk-color:${colors.desk};--lamp-color:${colors.lamp};--plant-color:${colors.plant};--pot-color:${colors.pot};--cup-color:${colors.cup};--laptop-color:${colors.laptop}">
        <div class="room-floor"></div>
        <div class="room-desk"></div>
        <div class="room-leg left"></div>
        <div class="room-leg right"></div>
        <div class="room-laptop"></div>
        <div class="room-lamp"></div>
        <div class="room-plant"></div>
        <div class="room-cup"></div>
      </div>
      <div class="wardrobe-panel"></div>
    </div>
  `;
  renderChoices(surface.querySelector(".wardrobe-panel"), "room", roomOptions, selected, (group, option) => {
    save.games.room.selected[group] = option.id;
    persist();
    render();
  });
}

function renderChoices(container, bucket, groups, selected, onSelect) {
  Object.entries(groups).forEach(([group, options]) => {
    const section = document.createElement("section");
    section.className = "choice-group";
    section.innerHTML = `<h3>${group}</h3><div class="choice-grid"></div>`;
    const grid = section.querySelector(".choice-grid");
    options.forEach((option) => {
      const unlocked = save.unlocked[bucket].includes(option.id);
      const button = document.createElement("button");
      button.type = "button";
      button.className = `choice-button ${selected[group] === option.id ? "is-active" : ""} ${unlocked ? "" : "is-locked"}`;
      button.title = unlocked ? option.label : `${option.cost} 金币`;
      button.innerHTML = unlocked
        ? `<span class="swatch" style="--swatch:${option.color}"></span>`
        : `<strong>${option.cost}</strong>`;
      button.addEventListener("click", () => {
        if (!unlocked) {
          unlockOption(bucket, option);
          return;
        }
        onSelect(group, option);
      });
      grid.append(button);
    });
    container.append(section);
  });
}

function unlockOption(bucket, option) {
  if (save.coins < option.cost) {
    toast("金币不够");
    return;
  }
  save.coins -= option.cost;
  save.unlocked[bucket].push(option.id);
  persist();
  toast(`已解锁 ${option.label}`);
  render();
}

function getOption(options, id) {
  return options.find((entry) => entry.id === id) || options[0];
}

function renderMilkTea(reset = false) {
  if (!transient.milkTea || reset) {
    transient.milkTea = {
      order: randomFrom(milkTeaOrders),
      current: { tea: null, milk: null, sugar: null, topping: null },
      served: 0,
      combo: 0,
      mistakes: 0,
      customer: randomFrom(milkTeaVisuals.customers),
      flash: "",
    };
  }
  toolbarButton("换顾客", () => {
    transient.milkTea.order = randomFrom(milkTeaOrders);
    transient.milkTea.current = { tea: null, milk: null, sugar: null, topping: null };
    transient.milkTea.customer = randomFrom(milkTeaVisuals.customers);
    transient.milkTea.flash = "";
    render();
  });
  toolbarButton("新一轮", () => renderMilkTea(true));
  const state = transient.milkTea;
  const patience = Math.max(24, 100 - state.mistakes * 22);
  renderStats([
    { label: "本轮", value: `${state.served}/5` },
    { label: "连击", value: state.combo },
    { label: "总杯数", value: save.games.milkTea.best || 0 },
    { label: "金币", value: save.coins },
  ]);
  const surface = document.querySelector("#gameSurface");
  surface.innerHTML = `
    <div class="shop-scene milk-tea-scene ${state.flash ? `is-${state.flash}` : ""}">
      <section class="scene-customer">
        <div class="customer-avatar">${assetImg(state.customer, "asset-avatar", "顾客")}</div>
        <div class="customer-bubble">
          <p class="eyebrow">Order</p>
          <h3>${state.order.name}</h3>
          <p>${state.order.tea} · ${state.order.milk} · ${state.order.sugar} · ${state.order.topping}</p>
          <div class="patience-bar"><span style="width:${patience}%"></span></div>
        </div>
      </section>
      <section class="tea-counter">
        <div class="machine">
          ${assetImg("milk-tea/machine", "machine-asset", "奶茶机")}
          <strong>TEA</strong>
        </div>
        ${milkTeaCupVisual(state.current)}
        <button class="primary-button serve-button" type="button" id="serveMilkTea">出杯</button>
      </section>
      <section class="scene-shelf"></section>
    </div>
  `;
  const panel = surface.querySelector(".scene-shelf");
  renderSceneOptionGroup(panel, "茶底", milkTeaOptions.tea, state.current.tea, (value) => {
    state.current.tea = value;
    state.flash = "";
    render();
  }, { 红茶: "🫖", 绿茶: "🍵", 乌龙: "🥃" });
  renderSceneOptionGroup(panel, "奶底", milkTeaOptions.milk, state.current.milk, (value) => {
    state.current.milk = value;
    state.flash = "";
    render();
  }, { 牛奶: "🥛", 燕麦奶: "🌾", 厚乳: "🍦" });
  renderSceneOptionGroup(panel, "甜度", milkTeaOptions.sugar, state.current.sugar, (value) => {
    state.current.sugar = value;
    state.flash = "";
    render();
  }, { 三分糖: "⅓", 半糖: "½", 七分糖: "⅔" });
  renderSceneOptionGroup(panel, "小料", milkTeaOptions.topping, state.current.topping, (value) => {
    state.current.topping = value;
    state.flash = "";
    render();
  }, {
    珍珠: assetImg("milk-tea/pearl", "choice-asset", "珍珠"),
    布丁: assetImg("milk-tea/pudding", "choice-asset", "布丁"),
    椰果: assetImg("milk-tea/coconut", "choice-asset", "椰果"),
  });
  surface.querySelector("#serveMilkTea").addEventListener("click", serveMilkTea);
}

function serveMilkTea() {
  const state = transient.milkTea;
  const current = state.current;
  if (!current.tea || !current.milk || !current.sugar || !current.topping) {
    toast("配方还没选完");
    return;
  }
  const ok =
    current.tea === state.order.tea &&
    current.milk === state.order.milk &&
    current.sugar === state.order.sugar &&
    current.topping === state.order.topping;
  if (!ok) {
    state.combo = 0;
    state.mistakes += 1;
    state.flash = "wrong";
    toast("顾客说味道不对");
    render();
    return;
  }
  state.served += 1;
  state.combo += 1;
  save.games.milkTea.served += 1;
  save.games.milkTea.best = save.games.milkTea.served;
  reward(18 + state.combo * 2, "奶茶出杯");
  if (state.served >= 5) {
    reward(30, "奶茶店收工");
    transient.milkTea = null;
    render();
    return;
  }
  state.order = nextDifferent(milkTeaOrders, state.order);
  state.current = { tea: null, milk: null, sugar: null, topping: null };
  state.customer = randomFrom(milkTeaVisuals.customers);
  state.flash = "success";
  persist();
  render();
}

function milkTeaPreview(current) {
  const parts = [current.tea, current.milk, current.sugar, current.topping].filter(Boolean);
  return parts.length ? parts.join(" + ") : "空杯";
}

function milkTeaCupVisual(current) {
  const tea = current.tea ? milkTeaVisuals.tea[current.tea] : "#f8f3ef";
  const milk = current.milk ? milkTeaVisuals.milk[current.milk] : "transparent";
  const sugar = current.sugar ? milkTeaVisuals.sugar[current.sugar] : "0%";
  const toppingAsset = current.topping ? milkTeaVisuals.toppingAsset[current.topping] : "";
  const bubbles = Array.from(
    { length: current.topping ? 9 : 0 },
    (_, index) => `<i style="--i:${index}">${assetImg(toppingAsset, "topping-asset", current.topping)}</i>`,
  ).join("");
  return `
    <div class="cup-station">
      <div class="cup-lid"></div>
      <div class="visual-cup" style="--tea:${tea};--milk:${milk};--sugar:${sugar}">
        <div class="cup-fill tea-fill"></div>
        <div class="cup-fill milk-fill"></div>
        <div class="cup-sugar"></div>
        <div class="cup-toppings">${bubbles}</div>
      </div>
      <div class="cup-label">${milkTeaPreview(current)}</div>
    </div>
  `;
}

function renderFlowerShop(reset = false) {
  if (!transient.flowerShop || reset) {
    transient.flowerShop = {
      order: randomFrom(flowerOrders),
      current: { flowers: [], wrap: null },
      served: 0,
      streak: 0,
      flash: "",
    };
  }
  toolbarButton("清空花束", () => {
    transient.flowerShop.current = { flowers: [], wrap: null };
    transient.flowerShop.flash = "";
    render();
  });
  toolbarButton("新订单", () => renderFlowerShop(true));
  const state = transient.flowerShop;
  renderStats([
    { label: "本轮", value: `${state.served}/5` },
    { label: "连单", value: state.streak },
    { label: "总花束", value: save.games.flowerShop.best || 0 },
    { label: "金币", value: save.coins },
  ]);
  const surface = document.querySelector("#gameSurface");
  surface.innerHTML = `
    <div class="shop-scene flower-scene ${state.flash ? `is-${state.flash}` : ""}">
      <section class="scene-customer florist-order">
        <div class="customer-avatar">${assetImg("customers/florist", "asset-avatar", "花店店员")}</div>
        <div class="customer-bubble">
          <p class="eyebrow">Bouquet</p>
          <h3>${state.order.name}</h3>
          <p>${state.order.flowers.map((entry) => `${flowerEmoji[entry]}${entry}`).join(" · ")} · ${flowerEmoji[state.order.wrap]}${state.order.wrap}</p>
        </div>
      </section>
      <section class="flower-workbench">
        <div class="flower-buckets"></div>
        ${flowerBouquetVisual(state.current)}
        <button class="primary-button serve-button" type="button" id="serveBouquet">包好</button>
      </section>
      <section class="scene-shelf wrap-shelf"></section>
    </div>
  `;
  const buckets = surface.querySelector(".flower-buckets");
  flowerOptions.flower.forEach((value) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "flower-bucket";
    button.innerHTML = `<span>${assetImg(flowerAssets[value], "flower-asset", value)}</span><strong>${value}</strong>`;
    button.addEventListener("click", () => {
      if (state.current.flowers.length >= 3) {
        toast("一束最多 3 枝");
        return;
      }
      state.current.flowers.push(value);
      state.flash = "";
      render();
    });
    buckets.append(button);
  });
  const panel = surface.querySelector(".wrap-shelf");
  renderSceneOptionGroup(
    panel,
    "包装纸",
    flowerOptions.wrap,
    state.current.wrap,
    (value) => {
      state.current.wrap = value;
      state.flash = "";
      render();
    },
    flowerEmoji,
  );
  surface.querySelector("#serveBouquet").addEventListener("click", serveBouquet);
}

function serveBouquet() {
  const state = transient.flowerShop;
  if (state.current.flowers.length !== 3 || !state.current.wrap) {
    toast("花材和包装还没选完");
    return;
  }
  const ok = sameCounts(state.current.flowers, state.order.flowers) && state.current.wrap === state.order.wrap;
  if (!ok) {
    state.streak = 0;
    state.flash = "wrong";
    toast("这束和订单不一样");
    render();
    return;
  }
  state.served += 1;
  state.streak += 1;
  save.games.flowerShop.served += 1;
  save.games.flowerShop.best = save.games.flowerShop.served;
  reward(20 + state.streak * 2, "花束完成");
  if (state.served >= 5) {
    reward(32, "花店打烊");
    transient.flowerShop = null;
    render();
    return;
  }
  state.order = nextDifferent(flowerOrders, state.order);
  state.current = { flowers: [], wrap: null };
  state.flash = "success";
  persist();
  render();
}

function flowerPreview(current) {
  const flowers = current.flowers.map((entry) => flowerEmoji[entry] || "🌸").join("");
  const wrap = current.wrap ? flowerEmoji[current.wrap] || current.wrap : "待包装";
  return flowers ? `${flowers} ${wrap}` : "空花束";
}

function flowerBouquetVisual(current) {
  const flowers = current.flowers
    .map(
      (entry, index) => `
        <span class="bouquet-flower flower-${index}" style="--tilt:${(index - 1) * 12}deg">
          <i>${assetImg(flowerAssets[entry], "bouquet-asset", entry)}</i>
        </span>
      `,
    )
    .join("");
  const wrap = current.wrap ? wrapClass[current.wrap] : "wrap-none";
  return `
    <div class="bouquet-table">
      <div class="bouquet-vase">
        <div class="bouquet-paper ${wrap}"></div>
        <div class="bouquet-stems">${flowers || "<em>选择 3 枝花</em>"}</div>
      </div>
      <div class="bouquet-label">${flowerPreview(current)}</div>
    </div>
  `;
}

function renderStall(reset = false) {
  if (!transient.stall || reset) {
    transient.stall = { stock: 24, price: 9, decor: 1, result: null };
  }
  toolbarButton("重置方案", () => renderStall(true));
  const state = transient.stall;
  const result = state.result;
  renderStats([
    { label: "天数", value: save.games.stall.day },
    { label: "口碑", value: save.games.stall.reputation.toFixed(1) },
    { label: "最好利润", value: save.games.stall.best || 0 },
    { label: "金币", value: save.coins },
  ]);
  const surface = document.querySelector("#gameSurface");
  surface.innerHTML = `
    <div class="shop-scene market-scene">
      <section class="market-stage ${result ? "has-result" : ""}">
        <div class="market-sky">
          <span class="lantern one">${assetImg("stall/lantern-red", "lantern-asset", "灯笼")}</span>
          <span class="lantern two">${assetImg("stall/lantern-yellow", "lantern-asset", "灯笼")}</span>
          <span class="weather-badge">${result ? `${result.weather.emoji}${result.weather.name}` : "🌙夜市"}</span>
        </div>
        <div class="market-customers">
          ${stallCustomerVisual(result)}
        </div>
        <div class="stall-cart" style="--decor:${state.decor}">
          ${assetImg("stall/cart", "cart-asset", "摊车")}
          <div class="stall-awning"></div>
          <div class="price-sign">¥${state.price}</div>
          <div class="goods-tray">${stallGoodsVisual(state.stock)}</div>
          <div class="stall-table"></div>
          <div class="stall-wheels"><span></span><span></span></div>
        </div>
        <div class="market-result">
          <strong>${result ? `卖出 ${result.sold}/${result.stock}` : "还没开张"}</strong>
          <span>${result ? `利润 ${result.profit}` : "调好库存、单价和布置后开张"}</span>
        </div>
      </section>
      <section class="scene-shelf stall-controls">
        ${stallStepper("进货", "stock", state.stock, 6, 60, 3)}
        ${stallStepper("单价", "price", state.price, 5, 18, 1)}
        ${stallStepper("布置", "decor", state.decor, 0, 5, 1)}
        <button class="primary-button serve-button" type="button" id="startStallDay">开张</button>
      </section>
    </div>
  `;
  surface.querySelectorAll("[data-step]").forEach((button) => {
    button.addEventListener("click", () => adjustStall(button.dataset.field, Number(button.dataset.step)));
  });
  surface.querySelector("#startStallDay").addEventListener("click", startStallDay);
}

function stallStepper(label, field, value, min, max, step) {
  return `
    <div class="stepper-row">
      <div>
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
      <div class="stepper-actions">
        <button class="mini-button" type="button" data-field="${field}" data-step="${-step}" ${value <= min ? "disabled" : ""}>-</button>
        <button class="mini-button" type="button" data-field="${field}" data-step="${step}" ${value >= max ? "disabled" : ""}>+</button>
      </div>
    </div>
  `;
}

function adjustStall(field, step) {
  const limits = {
    stock: [6, 60],
    price: [5, 18],
    decor: [0, 5],
  };
  const [min, max] = limits[field];
  transient.stall[field] = Math.max(min, Math.min(max, transient.stall[field] + step));
  transient.stall.result = null;
  render();
}

function startStallDay() {
  const state = transient.stall;
  const cost = state.stock * 3 + state.decor * 15;
  if (save.coins < cost) {
    toast("金币不够进货");
    return;
  }
  const weather = randomFrom(stallWeather);
  const priceFactor = Math.max(0.38, 1.35 - (state.price - 8) * 0.08);
  const baseDemand = 18 + save.games.stall.reputation * 4 + state.decor * 3;
  const demand = Math.max(0, Math.round(baseDemand * weather.traffic * priceFactor + randInt(-4, 6)));
  const sold = Math.min(state.stock, demand);
  const revenue = sold * state.price;
  const profit = revenue - cost;
  save.coins += profit;
  save.games.stall.best = Math.max(save.games.stall.best || 0, profit);
  save.games.stall.day += 1;
  const sellRate = state.stock ? sold / state.stock : 0;
  const reputationDelta = sellRate > 0.72 && state.price <= 13 ? 0.25 : sellRate < 0.35 ? -0.2 : 0.05;
  save.games.stall.reputation = Math.max(1, Math.min(5, save.games.stall.reputation + reputationDelta));
  save.games.stall.last = `${weather.emoji}${weather.name} 卖出 ${sold}/${state.stock}，利润 ${profit}`;
  state.result = { weather, sold, stock: state.stock, profit };
  persist();
  toast(profit >= 0 ? `收摊盈利 ${profit}` : `今天亏了 ${Math.abs(profit)}`);
  render();
}

function stallGoodsVisual(stock) {
  const count = Math.max(4, Math.min(18, Math.ceil(stock / 3)));
  return Array.from(
    { length: count },
    (_, index) => `<span style="--i:${index}">${assetImg(stallGoodsAssets[index % stallGoodsAssets.length], "good-asset", "商品")}</span>`,
  ).join("");
}

function stallCustomerVisual(result) {
  const customers = result ? Math.max(1, Math.min(5, Math.ceil(result.sold / 8))) : 2;
  return Array.from(
    { length: customers },
    (_, index) => `<span class="market-person person-${index}">${assetImg(["customers/customer-1", "customers/customer-2", "customers/customer-3", "customers/shopper"][index % 4], "market-avatar", "顾客")}</span>`,
  ).join("");
}

function renderOptionGroup(container, title, options, active, onPick, emojiMap = null) {
  const section = document.createElement("section");
  section.className = "option-group";
  section.innerHTML = `<h3>${title}</h3><div class="option-grid"></div>`;
  const grid = section.querySelector(".option-grid");
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `recipe-button ${active === option ? "is-active" : ""}`;
    button.textContent = emojiMap?.[option] ? `${emojiMap[option]} ${option}` : option;
    button.addEventListener("click", () => onPick(option));
    grid.append(button);
  });
  container.append(section);
}

function renderSceneOptionGroup(container, title, options, active, onPick, emojiMap = null) {
  const section = document.createElement("section");
  section.className = "scene-option-group";
  section.innerHTML = `<h3>${title}</h3><div class="scene-option-grid"></div>`;
  const grid = section.querySelector(".scene-option-grid");
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `scene-choice ${active === option ? "is-active" : ""}`;
    button.innerHTML = `<span>${emojiMap?.[option] || ""}</span><strong>${option}</strong>`;
    button.addEventListener("click", () => onPick(option));
    grid.append(button);
  });
  container.append(section);
}

function renderSkyShooter() {
  document.querySelector("#gameStats").hidden = true;
  toolbarButton("重开", () => transient.skyShooter?.restart());

  const surface = document.querySelector("#gameSurface");
  surface.classList.add("shooter-surface");
  surface.innerHTML = `
    <div class="shooter-wrap">
      <canvas id="skyShooterCanvas" class="shooter-canvas" aria-label="纸飞机射击画面"></canvas>
      <div class="shooter-hud">
        <div class="shooter-score">
          <span>分数</span>
          <strong id="shooterScore">0</strong>
        </div>
        <div class="shooter-life">
          <span>生命</span>
          <strong><i>✈</i><b id="shooterLives">3</b></strong>
          <div id="shooterPips" class="shooter-pips" aria-hidden="true"></div>
        </div>
      </div>
      <div class="shooter-subhud">
        <span>最好 <strong id="shooterBest">${save.games.skyShooter.best}</strong></span>
        <span>金币 <strong id="shooterCoins">${save.coins}</strong></span>
      </div>
      <div id="shooterOverlay" class="shooter-overlay" aria-live="polite">
        <div class="shooter-panel">
          <h3 id="shooterOverlayTitle"></h3>
          <p id="shooterOverlayText"></p>
          <div id="shooterOverlayActions" class="shooter-actions"></div>
        </div>
      </div>
    </div>
  `;

  const state = createSkyShooter(surface.querySelector(".shooter-wrap"));
  transient.skyShooter = state;
  transient.cleanup = () => state.destroy();
}

function createSkyShooter(root) {
  const canvas = root.querySelector("#skyShooterCanvas");
  const ctx = canvas.getContext("2d");
  const scoreNode = root.querySelector("#shooterScore");
  const livesNode = root.querySelector("#shooterLives");
  const pipsNode = root.querySelector("#shooterPips");
  const bestNode = root.querySelector("#shooterBest");
  const coinsNode = root.querySelector("#shooterCoins");
  const overlay = root.querySelector("#shooterOverlay");
  const overlayTitle = root.querySelector("#shooterOverlayTitle");
  const overlayText = root.querySelector("#shooterOverlayText");
  const overlayActions = root.querySelector("#shooterOverlayActions");

  let width = 360;
  let height = 600;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let running = false;
  let ended = false;
  let score = 0;
  let lives = 3;
  let kills = 0;
  let spawnTimer = 0;
  let fireTimer = 0;
  let bullets = [];
  let enemyBullets = [];
  let enemies = [];
  let particles = [];
  let backdrop = [];
  const pointer = { active: false };
  const player = { x: width / 2, y: height - 80, radius: 25, invulnerable: 0 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(280, rect.width || width);
    height = Math.max(460, rect.height || height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    player.x = clamp(player.x, 36, width - 36);
    player.y = clamp(player.y, 90, height - 54);
    if (!backdrop.length) resetBackdrop();
    draw();
  }

  function resetBackdrop() {
    backdrop = Array.from({ length: 26 }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: index % 5 === 0 ? randInt(18, 44) : randInt(2, 6),
      speed: randInt(14, 42),
      kind: index % 5 === 0 ? "rock" : "dust",
      drift: Math.random() * 18 - 9,
      seed: Math.random() * 10,
    }));
  }

  function resetRun() {
    score = 0;
    lives = 3;
    kills = 0;
    spawnTimer = 0.45;
    fireTimer = 0;
    bullets = [];
    enemyBullets = [];
    enemies = [];
    particles = [];
    ended = false;
    running = false;
    player.x = width / 2;
    player.y = height - 78;
    player.invulnerable = 1.2;
    updateHud();
    draw();
  }

  function updateHud() {
    scoreNode.textContent = score;
    livesNode.textContent = lives;
    bestNode.textContent = Math.max(save.games.skyShooter.best, score);
    coinsNode.textContent = save.coins;
    pipsNode.innerHTML = Array.from({ length: 3 }, (_, index) =>
      `<span class="${index < lives ? "is-live" : ""}"></span>`,
    ).join("");
  }

  function updateOuterStats() {
    const stats = document.querySelector("#gameStats");
    if (stats) stats.hidden = true;
  }

  function setOverlay(title, text, actions) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    overlayActions.replaceChildren();
    actions.forEach((action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = action.primary ? "primary-button" : "pill-button";
      button.textContent = action.label;
      button.disabled = !!action.disabled;
      button.addEventListener("click", action.onClick);
      overlayActions.append(button);
    });
    overlay.classList.add("is-visible");
  }

  function hideOverlay() {
    overlay.classList.remove("is-visible");
  }

  function start() {
    if (running) return;
    hideOverlay();
    running = true;
    last = performance.now();
    raf = window.requestAnimationFrame(step);
  }

  function restart() {
    window.cancelAnimationFrame(raf);
    resetRun();
    start();
  }

  function continueWithCoins() {
    if (save.coins < SKY_SHOOTER_CONTINUE_COST) {
      toast("金币不够续命");
      return;
    }
    save.coins -= SKY_SHOOTER_CONTINUE_COST;
    persist();
    lives = 3;
    ended = false;
    player.invulnerable = 2.4;
    enemies = enemies.filter((enemy) => enemy.y < 0);
    enemyBullets = [];
    particles.push(...burst(player.x, player.y, "#f7d65c", 18));
    updateHud();
    start();
  }

  function finishRun() {
    if (ended) return;
    ended = true;
    running = false;
    window.cancelAnimationFrame(raf);
    const gameSave = save.games.skyShooter;
    gameSave.best = Math.max(gameSave.best || 0, score);
    gameSave.kills = Math.max(gameSave.kills || 0, kills);
    persist();
    updateHud();
    updateOuterStats();
    setOverlay("飞机坠毁", `本局 ${score} 分，击落 ${kills} 个目标。`, [
      {
        label: `花 ${SKY_SHOOTER_CONTINUE_COST} 金币续 3 命`,
        primary: true,
        disabled: save.coins < SKY_SHOOTER_CONTINUE_COST,
        onClick: continueWithCoins,
      },
      { label: "重新开始", onClick: restart },
      { label: "返回首页", onClick: backHome },
    ]);
  }

  function step(now) {
    if (!running) return;
    const dt = Math.min(0.034, Math.max(0.001, (now - last) / 1000));
    last = now;
    update(dt);
    draw();
    raf = window.requestAnimationFrame(step);
  }

  function update(dt) {
    updateBackdrop(dt);
    player.invulnerable = Math.max(0, player.invulnerable - dt);

    fireTimer -= dt;
    if (fireTimer <= 0) {
      shootPlayerBullet();
      fireTimer = score > 2500 ? 0.115 : 0.145;
    }

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnEnemy();
      const difficulty = Math.min(2.4, 1 + score / 3800);
      spawnTimer = (Math.random() * 0.48 + 0.42) / difficulty;
    }

    bullets.forEach((bullet) => {
      bullet.y += bullet.vy * dt;
      bullet.x += bullet.vx * dt;
    });
    enemyBullets.forEach((bullet) => {
      bullet.y += bullet.vy * dt;
      bullet.x += bullet.vx * dt;
    });
    enemies.forEach((enemy) => {
      enemy.age += dt;
      enemy.y += enemy.vy * dt;
      enemy.x = enemy.baseX + Math.sin(enemy.age * enemy.wave + enemy.seed) * enemy.drift;
      enemy.shoot -= dt;
      if (enemy.shoot <= 0 && enemy.y > 40 && enemy.y < height * 0.72) {
        shootEnemyBullet(enemy);
        enemy.shoot = enemy.type === "carrier" ? 0.86 : 1.55 + Math.random() * 0.8;
      }
    });
    particles.forEach((particle) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.life -= dt;
      particle.vy += 90 * dt;
    });

    handleCollisions();
    bullets = bullets.filter((bullet) => bullet.y > -24 && bullet.x > -24 && bullet.x < width + 24);
    enemyBullets = enemyBullets.filter((bullet) => bullet.y < height + 24 && bullet.x > -24 && bullet.x < width + 24);
    enemies = enemies.filter((enemy) => enemy.y < height + 90 && enemy.hp > 0);
    particles = particles.filter((particle) => particle.life > 0);
    updateHud();
  }

  function updateBackdrop(dt) {
    backdrop.forEach((item) => {
      item.y += item.speed * dt;
      item.x += item.drift * dt * 0.16;
      if (item.y > height + item.r + 8) {
        item.y = -item.r - randInt(0, 80);
        item.x = Math.random() * width;
      }
    });
  }

  function shootPlayerBullet() {
    bullets.push({ x: player.x, y: player.y - 34, vx: 0, vy: -520, radius: 4, power: 1 });
    if (score > 1800) {
      bullets.push({ x: player.x - 17, y: player.y - 24, vx: -26, vy: -500, radius: 3, power: 1 });
      bullets.push({ x: player.x + 17, y: player.y - 24, vx: 26, vy: -500, radius: 3, power: 1 });
    }
  }

  function shootEnemyBullet(enemy) {
    if (enemy.type === "carrier") {
      [-0.72, 0, 0.72].forEach((angle) => {
        enemyBullets.push({
          x: enemy.x,
          y: enemy.y + enemy.radius * 0.5,
          vx: angle * 90,
          vy: 178,
          radius: 4,
        });
      });
      return;
    }
    enemyBullets.push({ x: enemy.x, y: enemy.y + enemy.radius, vx: 0, vy: 190, radius: 4 });
  }

  function spawnEnemy() {
    const difficulty = Math.min(2.2, 1 + score / 4200);
    const roll = Math.random();
    const x = randInt(36, Math.max(37, Math.floor(width - 36)));
    if (score > 1700 && roll > 0.89) {
      enemies.push({
        type: "carrier",
        x,
        baseX: x,
        y: -74,
        radius: 54,
        hp: 12,
        points: 620,
        vy: 42 + difficulty * 10,
        wave: 1.1,
        drift: 46,
        seed: Math.random() * 8,
        age: 0,
        shoot: 0.45,
      });
      return;
    }
    if (roll > 0.68) {
      enemies.push({
        type: "rock",
        x,
        baseX: x,
        y: -34,
        radius: randInt(18, 27),
        hp: 2,
        points: 90,
        vy: 92 + difficulty * 32,
        wave: 0.7,
        drift: 18,
        seed: Math.random() * 8,
        age: 0,
        shoot: 99,
      });
      return;
    }
    enemies.push({
      type: roll > 0.44 ? "zig" : "scout",
      x,
      baseX: x,
      y: -38,
      radius: roll > 0.44 ? 23 : 20,
      hp: roll > 0.44 ? 2 : 1,
      points: roll > 0.44 ? 150 : 110,
      vy: roll > 0.44 ? 104 + difficulty * 28 : 126 + difficulty * 32,
      wave: roll > 0.44 ? 3.2 : 1.4,
      drift: roll > 0.44 ? 46 : 18,
      seed: Math.random() * 8,
      age: 0,
      shoot: roll > 0.72 ? 1.1 : 99,
    });
  }

  function handleCollisions() {
    bullets.forEach((bullet) => {
      if (bullet.hit) return;
      enemies.forEach((enemy) => {
        if (enemy.hp <= 0 || bullet.hit) return;
        if (distance(bullet.x, bullet.y, enemy.x, enemy.y) < bullet.radius + enemy.radius * 0.76) {
          bullet.hit = true;
          enemy.hp -= bullet.power;
          particles.push(...burst(bullet.x, bullet.y, "#c78031", 4));
          if (enemy.hp <= 0) destroyEnemy(enemy);
        }
      });
    });

    if (player.invulnerable <= 0) {
      for (const enemy of enemies) {
        if (enemy.hp > 0 && distance(player.x, player.y, enemy.x, enemy.y) < player.radius + enemy.radius * 0.58) {
          enemy.hp = 0;
          destroyEnemy(enemy, false);
          hitPlayer();
          break;
        }
      }
    }

    if (player.invulnerable <= 0) {
      for (const bullet of enemyBullets) {
        if (!bullet.hit && distance(player.x, player.y, bullet.x, bullet.y) < player.radius + bullet.radius) {
          bullet.hit = true;
          hitPlayer();
          break;
        }
      }
    }

    bullets = bullets.filter((bullet) => !bullet.hit);
    enemyBullets = enemyBullets.filter((bullet) => !bullet.hit);
  }

  function destroyEnemy(enemy, award = true) {
    if (award) {
      score += enemy.points;
      kills += 1;
      if (kills % 8 === 0) {
        save.coins += 8;
        persist();
      }
    }
    particles.push(...burst(enemy.x, enemy.y, enemy.type === "rock" ? "#b7c1c1" : "#4f6fba", enemy.type === "carrier" ? 26 : 12));
  }

  function hitPlayer() {
    lives -= 1;
    player.invulnerable = 1.5;
    particles.push(...burst(player.x, player.y, "#e65b5b", 18));
    enemyBullets = enemyBullets.filter((bullet) => bullet.y < player.y - 80);
    if (lives <= 0) {
      lives = 0;
      updateHud();
      finishRun();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    drawBackdrop();
    enemies.forEach(drawEnemy);
    bullets.forEach(drawPlayerBullet);
    enemyBullets.forEach(drawEnemyBullet);
    particles.forEach(drawParticle);
    drawPlayer();
  }

  function drawBackdrop() {
    ctx.fillStyle = "#c9d0d0";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(99, 111, 114, 0.22)";
    ctx.lineWidth = 1;
    backdrop.forEach((item) => {
      if (item.kind === "rock") {
        drawSoftRock(item.x, item.y, item.r, item.seed);
      } else {
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  function drawPlayer() {
    ctx.save();
    ctx.globalAlpha = player.invulnerable > 0 && Math.floor(performance.now() / 110) % 2 === 0 ? 0.45 : 1;
    drawPlane(player.x, player.y, 38, -1, "#eef3f3", "#111");
    ctx.restore();
  }

  function drawEnemy(enemy) {
    if (enemy.type === "rock") {
      drawAsteroid(enemy.x, enemy.y, enemy.radius, enemy.seed);
      return;
    }
    if (enemy.type === "carrier") {
      drawCarrier(enemy.x, enemy.y, enemy.radius);
      return;
    }
    drawPlane(enemy.x, enemy.y, enemy.radius, 1, enemy.type === "zig" ? "#e6eeee" : "#f4f4ef", "#1a1a1a");
  }

  function drawPlane(x, y, size, direction, fill, stroke) {
    ctx.save();
    ctx.translate(x, y);
    if (direction > 0) ctx.rotate(Math.PI);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(2, size * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.25, size * 0.1);
    ctx.lineTo(size * 0.78, size * 0.36);
    ctx.lineTo(size * 0.31, size * 0.5);
    ctx.lineTo(size * 0.16, size * 0.86);
    ctx.lineTo(0, size * 0.62);
    ctx.lineTo(-size * 0.16, size * 0.86);
    ctx.lineTo(-size * 0.31, size * 0.5);
    ctx.lineTo(-size * 0.78, size * 0.36);
    ctx.lineTo(-size * 0.25, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.62);
    ctx.lineTo(0, size * 0.54);
    ctx.moveTo(-size * 0.28, size * 0.18);
    ctx.lineTo(size * 0.28, size * 0.18);
    ctx.stroke();
    ctx.fillStyle = "#d7e1e1";
    ctx.fillRect(-size * 0.16, -size * 0.08, size * 0.32, size * 0.38);
    ctx.strokeRect(-size * 0.16, -size * 0.08, size * 0.32, size * 0.38);
    ctx.restore();
  }

  function drawCarrier(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.fillStyle = "#d6dddd";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.92);
    ctx.lineTo(size * 0.78, -size * 0.42);
    ctx.lineTo(size * 0.32, -size * 0.72);
    ctx.lineTo(size * 0.16, -size * 0.15);
    ctx.lineTo(-size * 0.16, -size * 0.15);
    ctx.lineTo(-size * 0.32, -size * 0.72);
    ctx.lineTo(-size * 0.78, -size * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#edf2f2";
    ctx.fillRect(-size * 0.24, -size * 0.2, size * 0.48, size * 0.64);
    ctx.strokeRect(-size * 0.24, -size * 0.2, size * 0.48, size * 0.64);
    ctx.beginPath();
    ctx.moveTo(-size * 0.54, -size * 0.2);
    ctx.lineTo(size * 0.54, -size * 0.2);
    ctx.moveTo(-size * 0.42, size * 0.2);
    ctx.lineTo(size * 0.42, size * 0.2);
    ctx.stroke();
    ctx.restore();
  }

  function drawAsteroid(x, y, radius, seed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(seed);
    ctx.fillStyle = "#e0e6e4";
    ctx.strokeStyle = "#697373";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const angle = (Math.PI * 2 * i) / 10;
      const r = radius * (0.76 + Math.sin(seed + i * 1.7) * 0.16);
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawSoftRock(x, y, radius, seed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = 0.32;
    ctx.strokeStyle = "#8f9a9a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 12; i += 1) {
      const angle = (Math.PI * 2 * i) / 12;
      const r = radius * (0.74 + Math.sin(seed + i) * 0.12);
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayerBullet(bullet) {
    ctx.save();
    ctx.strokeStyle = "#b46a25";
    ctx.fillStyle = "#cf8836";
    ctx.lineWidth = 2;
    roundRect(ctx, bullet.x - 3, bullet.y - 12, 6, 20, 3);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawEnemyBullet(bullet) {
    ctx.save();
    ctx.fillStyle = "#646be8";
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawParticle(particle) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function burst(x, y, color, count) {
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = randInt(50, 190);
      const life = Math.random() * 0.35 + 0.35;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        color,
        life,
        maxLife: life,
      };
    });
  }

  function onPointerDown(event) {
    if (!running) return;
    event.preventDefault();
    pointer.active = true;
    canvas.setPointerCapture?.(event.pointerId);
    movePlayerTo(event);
  }

  function onPointerMove(event) {
    if (!pointer.active || !running) return;
    event.preventDefault();
    movePlayerTo(event);
  }

  function onPointerUp(event) {
    pointer.active = false;
    canvas.releasePointerCapture?.(event.pointerId);
  }

  function movePlayerTo(event) {
    const rect = canvas.getBoundingClientRect();
    player.x = clamp(event.clientX - rect.left, 32, width - 32);
    player.y = clamp(event.clientY - rect.top - 44, 92, height - 54);
  }

  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(root);
  window.addEventListener("resize", resize);
  canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
  canvas.addEventListener("pointermove", onPointerMove, { passive: false });
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  resize();
  resetRun();
  setOverlay("准备起飞", "拖动飞机移动，自动射击远处飞来的敌机和陨石。右上角是当前生命。", [
    { label: "开始", primary: true, onClick: start },
    { label: "返回首页", onClick: backHome },
  ]);

  return {
    restart,
    destroy() {
      running = false;
      window.cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    },
  };
}

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function nextDifferent(list, current) {
  if (list.length < 2) return current;
  let next = randomFrom(list);
  while (next === current) next = randomFrom(list);
  return next;
}

function sameCounts(left, right) {
  const counts = new Map();
  left.forEach((entry) => counts.set(entry, (counts.get(entry) || 0) + 1));
  right.forEach((entry) => counts.set(entry, (counts.get(entry) || 0) - 1));
  return [...counts.values()].every((value) => value === 0);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function distance(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function exportSave() {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kitty-mini-save-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importSave(file) {
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      save = mergeSave(structuredClone(defaultSave), parsed);
      persist();
      toast("存档已导入");
      backHome();
    } catch {
      toast("存档文件无效");
    }
  });
  reader.readAsText(file);
}

homeBtn.addEventListener("click", backHome);
muteBtn.addEventListener("click", () => {
  save.muted = !save.muted;
  persist();
});
exportBtn.addEventListener("click", exportSave);
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", () => {
  const [file] = importFile.files;
  if (file) importSave(file);
  importFile.value = "";
});

window.addEventListener("keydown", (event) => {
  if (activeGame !== "merge") return;
  const map = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
  };
  if (map[event.key]) {
    event.preventDefault();
    moveMerge(map[event.key]);
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

render();
