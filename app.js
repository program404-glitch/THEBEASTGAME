const CARDS = [
  { id: 1, name: 'Roaring', emoji: '🦁', type: 'Predator', hp: 82, attack: 26, defense: 18, speed: 7, special: 16, ability: 'Rend', rarity: 'Common', image: 'assets/bestia.svg' },
  { id: 2, name: 'Wolven', emoji: '🐺', type: 'Wolf', hp: 78, attack: 24, defense: 16, speed: 9, special: 15, ability: 'Howl', rarity: 'Common', image: 'assets/vex.svg' },
  { id: 3, name: 'Maw', emoji: '🦈', type: 'Ocean', hp: 90, attack: 25, defense: 20, speed: 6, special: 18, ability: 'Charge', rarity: 'Rare', image: 'assets/marek.svg' },
  { id: 4, name: 'Jaguar', emoji: '🐆', type: 'Feline', hp: 80, attack: 23, defense: 17, speed: 8, special: 17, ability: 'Stealth', rarity: 'Rare', image: 'assets/glacor.svg' },
  { id: 5, name: 'Claw', emoji: '🐅', type: 'Feline', hp: 77, attack: 27, defense: 15, speed: 10, special: 20, ability: 'Fang', rarity: 'Epic', image: 'assets/dravik.svg' },
  { id: 6, name: 'Black Bear', emoji: '🐻', type: 'Bear', hp: 92, attack: 22, defense: 19, speed: 8, special: 16, ability: 'Stare', rarity: 'Epic', image: 'assets/pyrox.svg' },
  { id: 7, name: 'Beast', emoji: '🦁', type: 'Legendary', hp: 98, attack: 28, defense: 22, speed: 7, special: 19, ability: 'Wild Charge', rarity: 'Legendary', image: 'assets/lumin.svg' }
];

const STORAGE_KEY = 'beast-pocket-save-v1';
const SHARED_ACCOUNT_URL = 'https://jsonblob.com/api/jsonBlob/019f5646-8e12-7ac1-8e76-2801c7553130';
const TYPE_PRICES = {
  Fire: 8,
  Water: 9,
  Grass: 7,
  Electric: 10,
  Ice: 11,
  Light: 8,
  Beast: 15,
  Predator: 12,
  Wolf: 10,
  Ocean: 10,
  Feline: 10,
  Bear: 11,
  Legendary: 15
};
const DEFAULT_STATE = {
  collection: [1, 2],
  deck: [1, 2],
  selectedCardId: 1,
  battleLog: [],
  lastPackOpenDate: null,
  coins: 0,
  battleMode: 'automatic',
  loggedInUser: null
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

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function loadRemoteUsers() {
  try {
    const response = await fetch(SHARED_ACCOUNT_URL, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Unable to load shared users');
    const data = await response.json();
    return data && typeof data === 'object' && data.users ? data.users : {};
  } catch (error) {
    console.warn('Shared account sync unavailable:', error);
    return {};
  }
}

async function saveRemoteUsers(users) {
  try {
    const response = await fetch(SHARED_ACCOUNT_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users })
    });
    if (!response.ok) throw new Error('Unable to save shared users');
    return true;
  } catch (error) {
    console.warn('Could not save shared account data:', error);
    return false;
  }
}

function getSerializableStateForAccount() {
  return {
    collection: Array.isArray(state.collection) ? [...state.collection] : [...DEFAULT_STATE.collection],
    deck: Array.isArray(state.deck) ? [...state.deck] : [...DEFAULT_STATE.deck],
    selectedCardId: state.selectedCardId ?? DEFAULT_STATE.selectedCardId,
    battleLog: Array.isArray(state.battleLog) ? [...state.battleLog] : [...DEFAULT_STATE.battleLog],
    lastPackOpenDate: state.lastPackOpenDate ?? DEFAULT_STATE.lastPackOpenDate,
    coins: state.coins ?? DEFAULT_STATE.coins,
    battleMode: state.battleMode ?? DEFAULT_STATE.battleMode,
    lastBattleSummary: state.lastBattleSummary ?? '',
    lastCpuCardId: state.lastCpuCardId
  };
}

async function syncCurrentAccountState() {
  if (!state.loggedInUser || !state.passwordHash) return;
  const users = await loadRemoteUsers();
  users[state.loggedInUser] = {
    passwordHash: state.passwordHash,
    state: getSerializableStateForAccount()
  };
  await saveRemoteUsers(users);
}

function getCardById(cardId) {
  return CARDS.find(card => card.id === cardId);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function renderAuth() {
  const loginForm = document.getElementById('login-form');
  const welcomePanel = document.getElementById('welcome-panel');
  const authMessage = document.getElementById('auth-message');
  const gameContent = document.getElementById('game-content');

  if (!loginForm || !welcomePanel || !authMessage || !gameContent) return;

  if (state.loggedInUser) {
    loginForm.classList.add('hidden');
    welcomePanel.classList.remove('hidden');
    gameContent.classList.remove('hidden');
    welcomePanel.textContent = `Welcome, ${state.loggedInUser}!`;
    authMessage.textContent = 'You are now logged in.';
  } else {
    loginForm.classList.remove('hidden');
    welcomePanel.classList.add('hidden');
    gameContent.classList.add('hidden');
    authMessage.textContent = 'Enter any username and password to continue.';
  }
}

function render() {
  renderAuth();
  renderDeck();
  renderBook();
  renderBattle();
  renderCoins();
  renderBattleMode();
  saveState();
  if (state.loggedInUser && state.passwordHash) {
    syncCurrentAccountState();
  }
}

function renderCoins() {
  const coinCount = document.getElementById('coin-count');
  if (coinCount) {
    coinCount.textContent = `Coins: ${state.coins}`;
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
  deckCount.textContent = `${state.deck.length} cards`;

  if (!state.deck.length) {
    deckList.innerHTML = '<div class="card-item">Open a pack to add beasts to your deck. Each pack contains 5 cards.</div>';
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
          <span class="stat-pill">Spd ${card.speed}</span>
        </div>
        <div class="card-actions">
          <button class="secondary" data-action="select" data-id="${card.id}">Select</button>
        </div>
      </article>
    `;
  }).join('');
}

function renderBook() {
  const bookList = document.getElementById('book-list');
  const collectionCount = document.getElementById('collection-count');
  collectionCount.textContent = `${state.collection.length}/${CARDS.length} collected`;

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
          <span class="stat-pill">Def ${card.defense}</span>
        </div>
        <div class="card-actions">
          ${owned ? '<span class="stat-pill">Owned</span>' : `<button data-action="buy" data-id="${card.id}" ${affordable ? '' : 'disabled'}>Buy (${price})</button>`}
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
    Attack ${playerCard.attack}<br/>
    Ability ${playerCard.ability}
  ` : '<span>No creature selected</span>';

  cpuPreview.innerHTML = cpuCard ? `
    <div class="mini-image-wrap"><img src="${cpuCard.image}" alt="${cpuCard.name}" /></div>
    <strong>${cpuCard.emoji} ${cpuCard.name}</strong><br/>
    HP ${cpuCard.hp}<br/>
    Attack ${cpuCard.attack}<br/>
    Ability ${cpuCard.ability}
  ` : '<span>CPU ready</span>';

  battleStatus.textContent = state.lastBattleSummary || 'Choose a beast';

  if (!state.battleLog.length) {
    battleLog.innerHTML = '<div class="log-entry">Battles will appear here.</div>';
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
    state.lastBattleSummary = `You do not have enough coins for ${card.name}.`;
    render();
    return;
  }

  state.coins -= price;
  addCardToDeck(cardId);
  state.lastBattleSummary = `You bought ${card.name} for ${price} coins`;
  render();
}

function openPack() {
  if (state.lastPackOpenDate === getTodayKey()) {
    state.lastBattleSummary = 'You already opened a pack today. Come back tomorrow.';
    render();
    return;
  }

  const missing = CARDS.filter(card => !state.collection.includes(card.id));
  if (!missing.length) {
    state.lastBattleSummary = 'You have collected every beast.';
    render();
    return;
  }

  const packCards = [];
  const pool = [...missing];
  while (packCards.length < 5 && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    packCards.push(pool.splice(index, 1)[0]);
  }

  const randomCard = packCards[0];
  addCardToDeck(randomCard.id);
  state.lastPackOpenDate = getTodayKey();
  state.battleLog.unshift(`You opened a pack and found ${randomCard.emoji} ${randomCard.name}!`);
  state.lastBattleSummary = `New card: ${randomCard.name}`;
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
    state.lastBattleSummary = 'Add a beast to your deck before fighting.';
    render();
    return;
  }

  const cpuCard = chooseCpuCard();
  if (!cpuCard) {
    state.lastBattleSummary = 'The CPU has no creatures available.';
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
      log.push(`${playerCard.name} uses ${playerAction === 'special' ? 'Special ability' : playerCard.ability} and deals ${playerDamage} damage.`);
      if (cpuHp <= 0) break;

      const cpuDamage = computeCpuDamage(cpuCard, playerCard, playerHp);
      if (cpuDamage.type === 'heal') {
        playerHp = Math.min(playerCard.hp, playerHp + cpuDamage.amount);
        log.push(`${cpuCard.name} heals for ${cpuDamage.amount} HP.`);
      } else {
        playerHp -= cpuDamage.amount;
        log.push(`${cpuCard.name} counterattacks and deals ${cpuDamage.amount} damage.`);
      }
    } else {
      const cpuDamage = computeCpuDamage(cpuCard, playerCard, playerHp);
      if (cpuDamage.type === 'heal') {
        cpuHp = Math.min(cpuCard.hp, cpuHp + cpuDamage.amount);
        log.push(`${cpuCard.name} heals for ${cpuDamage.amount} HP.`);
      } else {
        playerHp -= cpuDamage.amount;
        log.push(`${cpuCard.name} counterattacks and deals ${cpuDamage.amount} damage.`);
      }
      if (playerHp <= 0) break;

      const playerAction = mode === 'manual' ? askPlayerAction(turn) : 'automatic';
      const playerDamage = playerAction === 'special'
        ? Math.max(10, playerCard.special + 6 + Math.floor(Math.random() * 4))
        : computeDamage(playerCard, cpuCard);
      cpuHp -= playerDamage;
      log.push(`${playerCard.name} uses ${playerAction === 'special' ? 'Special ability' : playerCard.ability} and deals ${playerDamage} damage.`);
    }
  }

  let outcome = 'Draw';
  if (playerHp > cpuHp) {
    outcome = `You won against ${cpuCard.name}!`;
    state.coins += 5;
  } else if (cpuHp > playerHp) {
    outcome = `The CPU won against ${playerCard.name}.`;
  }

  state.battleLog = [outcome, ...log, ...state.battleLog].slice(0, 8);
  state.lastBattleSummary = outcome;
  render();
}

function askPlayerAction(turn) {
  if (typeof window === 'undefined' || !window.prompt) {
    return 'automatic';
  }

  const choice = window.prompt(`Turn ${turn}: choose an action\n1 = Attack\n2 = Special ability`, '1');
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
    state.lastBattleSummary = `You selected ${getCardById(cardId).name}`;
    render();
  }

  if (action === 'buy') {
    buyCard(cardId);
  }
}

function toggleAccountMenu() {
  const accountMenu = document.getElementById('account-menu');
  if (accountMenu) {
    accountMenu.classList.toggle('hidden');
  }
}

async function promptAndUpdateAccount(action) {
  const authMessage = document.getElementById('auth-message');
  if (!authMessage) return;

  if (action === 'change-username') {
    const newUsername = window.prompt('Enter your new username');
    if (!newUsername || !newUsername.trim()) return;
    const username = newUsername.trim();
    const users = await loadRemoteUsers();
    const currentUser = state.loggedInUser;
    if (!currentUser) return;
    const currentEntry = users[currentUser];
    if (!currentEntry) return;
    delete users[currentUser];
    users[username] = {
      passwordHash: currentEntry.passwordHash,
      state: currentEntry.state
    };
    await saveRemoteUsers(users);
    state.loggedInUser = username;
    state.passwordHash = currentEntry.passwordHash;
    authMessage.textContent = `Username updated to ${username}.`;
    render();
    return;
  }

  if (action === 'change-password') {
    const newPassword = window.prompt('Enter your new password');
    if (!newPassword || !newPassword.trim()) return;
    const passwordHash = await hashPassword(newPassword.trim());
    const users = await loadRemoteUsers();
    const currentUser = state.loggedInUser;
    if (!currentUser) return;
    const currentEntry = users[currentUser];
    if (!currentEntry) return;
    users[currentUser] = {
      passwordHash,
      state: currentEntry.state
    };
    await saveRemoteUsers(users);
    state.passwordHash = passwordHash;
    authMessage.textContent = 'Password updated.';
    render();
    return;
  }

  if (action === 'logout') {
    state.loggedInUser = null;
    state.passwordHash = null;
    authMessage.textContent = 'You have been logged out.';
    render();
    return;
  }

  if (action === 'delete-account') {
    const confirmed = window.confirm('Delete your account? This action cannot be undone.');
    if (!confirmed) return;
    const users = await loadRemoteUsers();
    const currentUser = state.loggedInUser;
    if (!currentUser) return;
    delete users[currentUser];
    await saveRemoteUsers(users);
    localStorage.removeItem(STORAGE_KEY);
    state = { ...DEFAULT_STATE };
    authMessage.textContent = 'Account deleted.';
    render();
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const authMessage = document.getElementById('auth-message');

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    authMessage.textContent = 'Please enter both username and password.';
    return;
  }

  const passwordHash = await hashPassword(password);
  const users = await loadRemoteUsers();
  const existingAccount = users[username];

  if (existingAccount) {
    if (existingAccount.passwordHash !== passwordHash) {
      authMessage.textContent = 'Wrong password. Please try again.';
      return;
    }

    state = {
      ...DEFAULT_STATE,
      ...(existingAccount.state || {}),
      loggedInUser: username,
      passwordHash
    };
    authMessage.textContent = `Welcome back, ${username}!`;
  } else {
    state = {
      ...DEFAULT_STATE,
      loggedInUser: username,
      passwordHash
    };
    users[username] = {
      passwordHash,
      state: getSerializableStateForAccount()
    };
    await saveRemoteUsers(users);
    authMessage.textContent = `Account created for ${username}.`;
  }

  usernameInput.value = '';
  passwordInput.value = '';
  render();
}

document.addEventListener('click', (event) => {
  const accountToggle = event.target.closest('#account-menu-toggle');
  if (accountToggle) {
    toggleAccountMenu();
    return;
  }

  const accountButton = event.target.closest('button[data-action]');
  if (accountButton) {
    const action = accountButton.dataset.action;
    if (action && action.startsWith('change-') || action === 'logout' || action === 'delete-account') {
      promptAndUpdateAccount(action);
      return;
    }
  }

  handleAction(event);
});
document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('open-pack').addEventListener('click', openPack);
document.getElementById('battle-btn').addEventListener('click', resolveBattle);
document.getElementById('battle-mode').addEventListener('change', (event) => {
  state.battleMode = event.target.value;
  state.lastBattleSummary = event.target.value === 'manual' ? 'Manual mode active' : 'Automatic mode active';
  render();
});

render();
