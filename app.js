const CARDS = [
  { id: 1, name: 'Pyrox', emoji: '🔥', type: 'Fuoco', hp: 82, attack: 24, defense: 16, speed: 7, special: 18, ability: 'Braciata', rarity: 'Comune', image: 'assets/pyrox.svg' },
  { id: 2, name: 'Lumin', emoji: '✨', type: 'Luce', hp: 74, attack: 20, defense: 15, speed: 8, special: 16, ability: 'Faro', rarity: 'Comune', image: 'assets/lumin.svg' },
  { id: 3, name: 'Marek', emoji: '💧', type: 'Acqua', hp: 88, attack: 22, defense: 18, speed: 6, special: 17, ability: 'Marea', rarity: 'Rara', image: 'assets/marek.svg' },
  { id: 4, name: 'Vex', emoji: '🌿', type: 'Erba', hp: 79, attack: 19, defense: 17, speed: 5, special: 15, ability: 'Rinascita', rarity: 'Rara', image: 'assets/vex.svg' },
  { id: 5, name: 'Dravik', emoji: '⚡', type: 'Elettro', hp: 76, attack: 23, defense: 14, speed: 9, special: 19, ability: 'Scarica', rarity: 'Epica', image: 'assets/dravik.svg' },
  { id: 6, name: 'Glacor', emoji: '❄️', type: 'Ghiaccio', hp: 84, attack: 21, defense: 16, speed: 7, special: 16, ability: 'Blocco', rarity: 'Epica', image: 'assets/glacor.svg' },
  { id: 7, name: 'Bestia', emoji: '🦁', type: 'Bestia', hp: 96, attack: 26, defense: 20, speed: 6, special: 17, ability: 'Spinta Selvaggia', rarity: 'Leggendaria', image: 'assets/bestia.svg' }
];

const STORAGE_KEY = 'beast-pocket-save-v1';
const TYPE_PRICES = {
  Fuoco: 8,
  Acqua: 9,
  Erba: 7,
  Elettro: 10,
  Ghiaccio: 11,
  Luce: 8,
  Bestia: 15
};
const DEFAULT_STATE = {
  collection: [1, 2],
  deck: [1, 2],
  selectedCardId: 1,
  battleLog: [],
  lastPackOpenDate: null,
  coins: 0,
  battleMode: 'automatic'
};

let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getCardById(cardId) {
  return CARDS.find(card => card.id === cardId);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function render() {
  renderDeck();
  renderBook();
  renderBattle();
  renderCoins();
  renderBattleMode();
  saveState();
}

function renderCoins() {
  const coinCount = document.getElementById('coin-count');
  if (coinCount) {
    coinCount.textContent = `Monete: ${state.coins}`;
  }
}

function renderBattleMode() {
  const battleModeSelect = document.getElementById('battle-mode');
  if (battleModeSelect) {
    battleModeSelect.value = state.battleMode || 'automatic';
  }
}

function renderDeck() {
  const deckList = document.getElementById('deck-list');
  const deckCount = document.getElementById('deck-count');
  deckCount.textContent = `${state.deck.length} carte`;

  if (!state.deck.length) {
    deckList.innerHTML = '<div class="card-item">Apri una bustina per aggiungere creature al tuo mazzo.</div>';
    return;
  }

  deckList.innerHTML = state.deck.map(cardId => {
    const card = getCardById(cardId);
    return `
      <article class="card-item ${card.id === state.selectedCardId ? 'active' : ''}">
        <div class="card-image-wrap">
          <img src="${card.image}" alt="${card.name}" />
        </div>
        <div class="card-head">
          <h3>${card.emoji} ${card.name}</h3>
          <span>${card.type}</span>
        </div>
        <div class="card-meta">${card.rarity} • ${card.ability}</div>
        <div class="card-stats">
          <span class="stat-pill">HP ${card.hp}</span>
          <span class="stat-pill">Atk ${card.attack}</span>
          <span class="stat-pill">Vel ${card.speed}</span>
        </div>
        <div class="card-actions">
          <button class="secondary" data-action="select" data-id="${card.id}">Seleziona</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderBook() {
  const bookList = document.getElementById('book-list');
  const collectionCount = document.getElementById('collection-count');
  collectionCount.textContent = `${state.collection.length}/${CARDS.length} raccolte`;

  bookList.innerHTML = CARDS.map(card => {
    const owned = state.collection.includes(card.id);
    const price = getCardPrice(card);
    const affordable = state.coins >= price;

    return `
      <article class="card-item ${owned ? '' : 'inactive'}">
        <div class="card-image-wrap">
          <img src="${card.image}" alt="${card.name}" />
        </div>
        <div class="card-head">
          <h3>${card.emoji} ${card.name}</h3>
          <span>${card.type}</span>
        </div>
        <div class="card-meta">${card.rarity} • ${card.ability}</div>
        <div class="card-stats">
          <span class="stat-pill">HP ${card.hp}</span>
          <span class="stat-pill">Atk ${card.attack}</span>
          <span class="stat-pill">Dif ${card.defense}</span>
        </div>
        <div class="card-actions">
          ${owned ? '<span class="stat-pill">Posseduta</span>' : `<button data-action="buy" data-id="${card.id}" ${affordable ? '' : 'disabled'}>Compra (${price})</button>`}
        </div>
      </article>
    `;
  }).join('');
}

function renderBattle() {
  const playerPreview = document.getElementById('player-preview');
  const cpuPreview = document.getElementById('cpu-preview');
  const battleStatus = document.getElementById('battle-status');
  const battleLog = document.getElementById('battle-log');

  const playerCard = getCardById(state.selectedCardId) || getCardById(state.deck[0]);
  const cpuCard = getCardById(state.lastCpuCardId) || getCardById(CARDS[3].id);

  playerPreview.innerHTML = playerCard ? `
    <div class="mini-image-wrap"><img src="${playerCard.image}" alt="${playerCard.name}" /></div>
    <strong>${playerCard.emoji} ${playerCard.name}</strong><br/>
    HP ${playerCard.hp}<br/>
    Attacco ${playerCard.attack}<br/>
    Abilità ${playerCard.ability}
  ` : '<span>Nessuna creatura selezionata</span>';

  cpuPreview.innerHTML = cpuCard ? `
    <div class="mini-image-wrap"><img src="${cpuCard.image}" alt="${cpuCard.name}" /></div>
    <strong>${cpuCard.emoji} ${cpuCard.name}</strong><br/>
    HP ${cpuCard.hp}<br/>
    Attacco ${cpuCard.attack}<br/>
    Abilità ${cpuCard.ability}
  ` : '<span>CPU pronta</span>';

  battleStatus.textContent = state.lastBattleSummary || 'Scegli una creatura';

  if (!state.battleLog.length) {
    battleLog.innerHTML = '<div class="log-entry">Le battaglie compariranno qui.</div>';
    return;
  }

  battleLog.innerHTML = state.battleLog.slice(0, 6).map(entry => `<div class="log-entry">${entry}</div>`).join('');
}

function getCardPrice(card) {
  return TYPE_PRICES[card.type] || 10;
}

function addCardToDeck(cardId) {
  if (!state.collection.includes(cardId)) {
    state.collection.push(cardId);
  }
  if (!state.deck.includes(cardId)) {
    state.deck.push(cardId);
  }
  state.selectedCardId = cardId;
}

function buyCard(cardId) {
  const card = getCardById(cardId);
  if (!card) return;

  const price = getCardPrice(card);
  if (state.coins < price) {
    state.lastBattleSummary = `Non hai abbastanza monete per ${card.name}.`;
    render();
    return;
  }

  state.coins -= price;
  addCardToDeck(cardId);
  state.lastBattleSummary = `Hai comprato ${card.name} per ${price} monete`;
  render();
}

function openPack() {
  if (state.lastPackOpenDate === getTodayKey()) {
    state.lastBattleSummary = 'Hai già aperto una bustina oggi. Torna domani.';
    render();
    return;
  }

  const missing = CARDS.filter(card => !state.collection.includes(card.id));
  if (!missing.length) {
    state.lastBattleSummary = 'Hai già raccolto tutte le creature.';
    render();
    return;
  }

  const packCards = [];
  const pool = [...missing];
  while (packCards.length < 11 && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    packCards.push(pool.splice(index, 1)[0]);
  }

  const randomCard = packCards[0];
  addCardToDeck(randomCard.id);
  state.lastPackOpenDate = getTodayKey();
  state.battleLog.unshift(`Hai aperto una bustina e trovato ${randomCard.emoji} ${randomCard.name}!`);
  state.lastBattleSummary = `Nuova carta: ${randomCard.name}`;
  render();
}

function chooseCpuCard() {
  const available = state.deck.length ? state.deck : state.collection;
  const candidateIds = available.length ? available : CARDS.map(card => card.id);
  const chosenId = candidateIds[Math.floor(Math.random() * candidateIds.length)];
  state.lastCpuCardId = chosenId;
  return getCardById(chosenId);
}

function resolveBattle() {
  const playerCard = getCardById(state.selectedCardId) || getCardById(state.deck[0]);
  if (!playerCard) {
    state.lastBattleSummary = 'Aggiungi una creatura al mazzo prima di combattere.';
    render();
    return;
  }

  const cpuCard = chooseCpuCard();
  if (!cpuCard) {
    state.lastBattleSummary = 'La CPU non ha creature disponibili.';
    render();
    return;
  }

  const mode = state.battleMode || 'automatic';
  let playerHp = playerCard.hp;
  let cpuHp = cpuCard.hp;
  const log = [];
  let turn = 0;

  while (playerHp > 0 && cpuHp > 0 && turn < 6) {
    turn += 1;
    const playerFirst = playerCard.speed >= cpuCard.speed;

    if (playerFirst) {
      const playerAction = mode === 'manual' ? askPlayerAction(turn) : 'automatic';
      const playerDamage = playerAction === 'special'
        ? Math.max(10, playerCard.special + 6 + Math.floor(Math.random() * 4))
        : computeDamage(playerCard, cpuCard);
      cpuHp -= playerDamage;
      log.push(`${playerCard.name} usa ${playerAction === 'special' ? 'Abilità speciale' : playerCard.ability} e infligge ${playerDamage} danni.`);
      if (cpuHp <= 0) break;

      const cpuDamage = computeCpuDamage(cpuCard, playerCard, playerHp);
      if (cpuDamage.type === 'heal') {
        playerHp = Math.min(playerCard.hp, playerHp + cpuDamage.amount);
        log.push(`${cpuCard.name} si rigenera di ${cpuDamage.amount} HP.`);
      } else {
        playerHp -= cpuDamage.amount;
        log.push(`${cpuCard.name} contrattacca e infligge ${cpuDamage.amount} danni.`);
      }
    } else {
      const cpuDamage = computeCpuDamage(cpuCard, playerCard, playerHp);
      if (cpuDamage.type === 'heal') {
        cpuHp = Math.min(cpuCard.hp, cpuHp + cpuDamage.amount);
        log.push(`${cpuCard.name} si rigenera di ${cpuDamage.amount} HP.`);
      } else {
        playerHp -= cpuDamage.amount;
        log.push(`${cpuCard.name} contrattacca e infligge ${cpuDamage.amount} danni.`);
      }
      if (playerHp <= 0) break;

      const playerAction = mode === 'manual' ? askPlayerAction(turn) : 'automatic';
      const playerDamage = playerAction === 'special'
        ? Math.max(10, playerCard.special + 6 + Math.floor(Math.random() * 4))
        : computeDamage(playerCard, cpuCard);
      cpuHp -= playerDamage;
      log.push(`${playerCard.name} usa ${playerAction === 'special' ? 'Abilità speciale' : playerCard.ability} e infligge ${playerDamage} danni.`);
    }
  }

  let outcome = 'Pareggio';
  if (playerHp > cpuHp) {
    outcome = `Hai vinto contro ${cpuCard.name}!`;
    state.coins += 5;
  } else if (cpuHp > playerHp) {
    outcome = `La CPU ha vinto contro ${playerCard.name}.`;
  }

  state.battleLog = [outcome, ...log, ...state.battleLog].slice(0, 8);
  state.lastBattleSummary = outcome;
  render();
}

function askPlayerAction(turn) {
  if (typeof window === 'undefined' || !window.prompt) {
    return 'automatic';
  }

  const choice = window.prompt(`Turno ${turn}: scegli l'azione\n1 = Attacco\n2 = Abilità speciale`, '1');
  if (choice === '2') {
    return 'special';
  }
  return 'attack';
}

function computeDamage(attacker, defender) {
  const base = attacker.attack + attacker.special;
  const bonus = Math.floor(Math.random() * 6);
  const reduction = Math.floor(defender.defense / 3);
  return Math.max(8, base + bonus - reduction);
}

function computeCpuDamage(cpuCard, playerCard, playerHp) {
  const lowHp = playerHp <= 35;
  const useHeal = cpuCard.hp > 70 && Math.random() < 0.3;
  if (useHeal && cpuCard.hp < 90) {
    return { type: 'heal', amount: 14 };
  }
  if (lowHp && Math.random() < 0.5) {
    return { type: 'special', amount: cpuCard.special + 4 };
  }
  return { type: 'attack', amount: Math.max(8, cpuCard.attack + (Math.random() < 0.4 ? 5 : 0)) };
}

function handleAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const cardId = Number(button.dataset.id);

  if (action === 'select') {
    state.selectedCardId = cardId;
    state.lastBattleSummary = `Hai selezionato ${getCardById(cardId).name}`;
    render();
  }

  if (action === 'buy') {
    buyCard(cardId);
  }
}

document.addEventListener('click', handleAction);
document.getElementById('open-pack').addEventListener('click', openPack);
document.getElementById('battle-btn').addEventListener('click', resolveBattle);
document.getElementById('battle-mode').addEventListener('change', (event) => {
  state.battleMode = event.target.value;
  state.lastBattleSummary = event.target.value === 'manual' ? 'Modalità manuale attiva' : 'Modalità automatica attiva';
  render();
});

render();
