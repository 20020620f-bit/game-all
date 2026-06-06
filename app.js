"use strict";

const SAVE_KEY = "kitty-office-mini-games-v1";
const screen = document.querySelector("#screen");
const coinCount = document.querySelector("#coinCount");
const homeBtn = document.querySelector("#homeBtn");
const muteBtn = document.querySelector("#muteBtn");
const exportBtn = document.querySelector("#exportBtn");
const importBtn = document.querySelector("#importBtn");
const importFile = document.querySelector("#importFile");

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
];

const defaultSave = {
  version: 2,
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
  },
  updatedAt: Date.now(),
};

let save = loadSave();
let activeGame = null;
let transient = {};
let toastTimer = null;

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

function startGame(id) {
  activeGame = id;
  transient = {};
  if (save.games[id]) {
    save.games[id].plays += 1;
    save.plays += 1;
    persist();
  }
  render();
}

function backHome() {
  activeGame = null;
  transient = {};
  render();
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
