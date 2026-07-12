const COLLECTION_NAME = 'The First Collection';

const RARITY_COLORS = {
  Common: '#6b7280',
  Rare: '#3b82f6',
  Epic: '#a855f7',
  Legendary: '#f59e0b',
  Mythic: '#ef4444'
};

const HERO_CARDS_RAW = [
  { id: 1, name: 'Roaring', emoji: '🦁', type: 'Predator', hp: 82, attack: 26, defense: 18, speed: 7, special: 16, ability: 'Rend', rarity: 'Common' },
  { id: 2, name: 'Wolven', emoji: '🐺', type: 'Wolf', hp: 78, attack: 24, defense: 16, speed: 9, special: 15, ability: 'Howl', rarity: 'Common' },
  { id: 3, name: 'Maw', emoji: '🦈', type: 'Ocean', hp: 90, attack: 25, defense: 20, speed: 6, special: 18, ability: 'Charge', rarity: 'Rare' },
  { id: 4, name: 'Jaguar', emoji: '🐆', type: 'Feline', hp: 80, attack: 23, defense: 17, speed: 8, special: 17, ability: 'Stealth', rarity: 'Rare' },
  { id: 5, name: 'Claw', emoji: '🐅', type: 'Feline', hp: 77, attack: 27, defense: 15, speed: 10, special: 20, ability: 'Fang', rarity: 'Epic' },
  { id: 6, name: 'Black Bear', emoji: '🐻', type: 'Bear', hp: 92, attack: 22, defense: 19, speed: 8, special: 16, ability: 'Stare', rarity: 'Epic' },
  { id: 7, name: 'Beast', emoji: '🦁', type: 'Legendary', hp: 98, attack: 28, defense: 22, speed: 7, special: 19, ability: 'Wild Charge', rarity: 'Legendary' }
];

// ---------------------------------------------------------------
// Procedural beast generation (~993 extra cards, ids 8..1000)
// ---------------------------------------------------------------
// Deterministic: every card's stats depend only on its id, via a seeded
// pseudo-random generator. This matters because CARDS is rebuilt fresh on
// every page load, on every device — if generation used plain Math.random()
// each device/session would see different stats for "card #482", breaking
// anyone's collection. Seeding by id keeps every card identical everywhere.
function mulberry32(seed) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAME_PREFIXES = ['Shadow', 'Storm', 'Iron', 'Blaze', 'Frost', 'Venom', 'Solar', 'Lunar', 'Thunder', 'Crimson', 'Golden', 'Silver', 'Obsidian', 'Emerald', 'Sapphire', 'Ember', 'Glacial', 'Toxic', 'Radiant', 'Void', 'Astral', 'Feral', 'Savage', 'Mystic', 'Ancient', 'Primal', 'Spectral', 'Molten', 'Arctic', 'Verdant', 'Rusted', 'Gilded', 'Twilight', 'Dawn'];
const NAME_ROOTS = ['Fang', 'Claw', 'Wing', 'Horn', 'Scale', 'Mane', 'Talon', 'Tusk', 'Spike', 'Howler', 'Stalker', 'Reaper', 'Guardian', 'Hunter', 'Serpent', 'Drake', 'Panther', 'Falcon', 'Raptor', 'Titan', 'Wyrm', 'Phantom', 'Warden', 'Prowler', 'Ravager', 'Sentinel', 'Marauder', 'Nomad', 'Colossus', 'Wraith'];
const BEAST_TYPES = ['Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Light', 'Shadow', 'Poison', 'Rock', 'Wind', 'Metal', 'Earth', 'Psychic', 'Dragon', 'Spirit'];
const BEAST_ABILITIES = ['Rend', 'Howl', 'Charge', 'Stealth', 'Fang', 'Stare', 'Wild Charge', 'Ember Burst', 'Tidal Wave', 'Root Snare', 'Static Shock', 'Frost Bite', 'Radiant Beam', 'Shadow Step', 'Venom Strike', 'Solar Flare', 'Lunar Veil', 'Thunder Clap', 'Crimson Slash', 'Golden Aura', 'Iron Wall', 'Obsidian Spike', 'Toxic Cloud', 'Void Pulse', 'Astral Drift', 'Feral Roar', 'Savage Bite', 'Mystic Ward', 'Primal Rage', 'Spectral Chain'];
const BEAST_EMOJIS = ['🦁', '🐺', '🦈', '🐆', '🐅', '🐻', '🐉', '🦂', '🐍', '🦅', '🦉', '🐢', '🐊', '🦇', '🦏', '🐘', '🦓', '🦒', '🦌', '🦬', '🐗', '🦔', '🦡', '🦫', '🦥', '🦦', '🦧', '🦍', '🐎', '🦄', '🐐', '🦙', '🐫', '🦘', '🐨', '🐼', '🐧', '🦩', '🦚', '🦜', '🐸', '🦎', '🐳', '🐬', '🦭', '🐡', '🦐', '🦑', '🐙', '🦋', '🐝', '🦗'];

const RARITY_TIERS = [
  { name: 'Common', threshold: 40, color: '#6b7280', hp: [60, 75], attack: [15, 20], defense: [10, 15], speed: [5, 8], special: [10, 14] },
  { name: 'Rare', threshold: 70, color: '#3b82f6', hp: [75, 88], attack: [20, 25], defense: [14, 19], speed: [7, 10], special: [14, 18] },
  { name: 'Epic', threshold: 88, color: '#a855f7', hp: [85, 98], attack: [24, 29], defense: [17, 22], speed: [8, 11], special: [17, 21] },
  { name: 'Legendary', threshold: 97, color: '#f59e0b', hp: [95, 108], attack: [27, 32], defense: [20, 25], speed: [9, 12], special: [19, 24] },
  { name: 'Mythic', threshold: 100, color: '#ef4444', hp: [105, 120], attack: [30, 36], defense: [22, 28], speed: [10, 14], special: [22, 28] }
];

function pickInRange(rng, [min, max]) {
  return min + Math.floor(rng() * (max - min + 1));
}

function rarityForRoll(roll) {
  return RARITY_TIERS.find(tier => roll < tier.threshold) || RARITY_TIERS[RARITY_TIERS.length - 1];
}

function buildPlaceholderImage(emoji, color) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' rx='18' fill='${color}'/><text x='50%' y='58%' font-size='60' text-anchor='middle' dominant-baseline='middle'>${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const HERO_CARDS = HERO_CARDS_RAW.map(card => ({
  ...card,
  image: buildPlaceholderImage(card.emoji, RARITY_COLORS[card.rarity])
}));

function generateProceduralCards(count) {
  const cards = [];
  for (let i = 0; i < count; i += 1) {
    const id = HERO_CARDS.length + 1 + i;
    const rng = mulberry32(id * 2654435761);

    const prefix = NAME_PREFIXES[i % NAME_PREFIXES.length];
    const root = NAME_ROOTS[Math.floor(i / NAME_PREFIXES.length) % NAME_ROOTS.length];
    const type = BEAST_TYPES[i % BEAST_TYPES.length];
    const ability = BEAST_ABILITIES[i % BEAST_ABILITIES.length];
    const emoji = BEAST_EMOJIS[i % BEAST_EMOJIS.length];
    const tier = rarityForRoll(i % 100);

    cards.push({
      id,
      name: `${prefix} ${root}`,
      emoji,
      type,
      hp: pickInRange(rng, tier.hp),
      attack: pickInRange(rng, tier.attack),
      defense: pickInRange(rng, tier.defense),
      speed: pickInRange(rng, tier.speed),
      special: pickInRange(rng, tier.special),
      ability,
      rarity: tier.name,
      image: buildPlaceholderImage(emoji, tier.color)
    });
  }
  return cards;
}

const RARITY_COLOR_BY_NAME = Object.fromEntries(RARITY_TIERS.map(tier => [tier.name, tier.color]));
HERO_CARDS.forEach(card => {
  card.image = buildPlaceholderImage(card.emoji, RARITY_COLOR_BY_NAME[card.rarity] || '#6b7280');
});

const CARDS = [...HERO_CARDS, ...generateProceduralCards(993)];
CARDS.forEach(card => { card.set = COLLECTION_NAME; });

const AVATAR_OPTIONS = ['🦁', '🐺', '🦈', '🐆', '🐅', '🐻', '🐉', '🦂'];

const RARITY_PRICES = {
  Common: 6,
  Rare: 10,
  Epic: 16,
  Legendary: 26,
  Mythic: 45
};

const DEFAULT_STATE = {
  username: null,
  avatar: AVATAR_OPTIONS[0],
  collection: [1, 2],
  deck: [1, 2],
  selectedCardId: 1,
  battleLog: [],
  lastPackOpenDate: null,
  coins: 0,
  battleMode: 'automatic',
  lastBattleSummary: '',
  lastCpuCardId: null
};

// `state` holds only game/profile data. Auth itself (who is logged in,
// password checks) is entirely handled by Firebase Auth — we never touch
// passwords here.
let state = { ...DEFAULT_STATE };
let currentUser = null; // Firebase Auth user object, or null when logged out
let suppressNextAuthMessage = false;
let authMode = 'login'; // 'login' | 'signup'

const auth = firebase.auth();
const db = firebase.firestore();

// ---------------------------------------------------------------
// Helpers: username <-> Firebase Auth email mapping
// ---------------------------------------------------------------
// Firebase Auth's email/password provider requires an email address.
// Since this game logs people in with a plain username, we deterministically
// turn a username into a fake-but-valid email under a fixed domain. The
// address is never actually used to send mail.
function usernameToEmail(username) {
  const normalized = username.trim().toLowerCase().replace(/\s+/g, '_');
  return `${normalized}@beastpocket.local`;
}

function getCardById(cardId) {
  return CARDS.find(card => card.id === cardId);
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------
// Firestore sync
// ---------------------------------------------------------------
function getSerializableStateForAccount() {
  return {
    username: state.username,
    avatar: state.avatar || AVATAR_OPTIONS[0],
    collection: Array.isArray(state.collection) ? [...state.collection] : [...DEFAULT_STATE.collection],
    deck: Array.isArray(state.deck) ? [...state.deck] : [...DEFAULT_STATE.deck],
    selectedCardId: state.selectedCardId ?? DEFAULT_STATE.selectedCardId,
    battleLog: Array.isArray(state.battleLog) ? [...state.battleLog] : [...DEFAULT_STATE.battleLog],
    lastPackOpenDate: state.lastPackOpenDate ?? DEFAULT_STATE.lastPackOpenDate,
    coins: state.coins ?? DEFAULT_STATE.coins,
    battleMode: state.battleMode ?? DEFAULT_STATE.battleMode,
    lastBattleSummary: state.lastBattleSummary ?? '',
    lastCpuCardId: state.lastCpuCardId ?? null
  };
}

async function persist() {
  render();
  if (!currentUser) return;
  try {
    await db.collection('users').doc(currentUser.uid).set(getSerializableStateForAccount(), { merge: true });
  } catch (error) {
    console.warn('Could not sync to Firestore:', error);
    setAuthMessage('Could not save to the cloud. Check your connection.');
  }
}

async function loadStateFromFirestore(uid) {
  const doc = await db.collection('users').doc(uid).get();
  if (doc.exists) {
    return { ...DEFAULT_STATE, ...doc.data() };
  }
  return null;
}

// ---------------------------------------------------------------
// Auth state
// ---------------------------------------------------------------
auth.onAuthStateChanged(async (user) => {
  currentUser = user;

  if (!user) {
    state = { ...DEFAULT_STATE };
    if (!suppressNextAuthMessage) {
      setAuthMessage('Enter any username and password to continue.');
    }
    suppressNextAuthMessage = false;
    render();
    return;
  }

  const existing = await loadStateFromFirestore(user.uid);
  if (existing) {
    state = existing;
  } else {
    // First time this uid has been seen (shouldn't normally happen since we
    // create the doc at sign-up, but this is a safe fallback).
    state = { ...DEFAULT_STATE, username: deriveUsernameFromEmail(user.email) };
    await db.collection('users').doc(user.uid).set(getSerializableStateForAccount());
  }

  if (!suppressNextAuthMessage) {
    setAuthMessage(`Welcome back, ${state.username}!`);
  }
  suppressNextAuthMessage = false;
  render();
});

function deriveUsernameFromEmail(email) {
  return email.split('@')[0];
}

function setAuthMessage(text) {
  const authMessage = document.getElementById('auth-message');
  if (authMessage) authMessage.textContent = text;
}

// ---------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------
function renderAuth() {
  const loginForm = document.getElementById('login-form');
  const welcomePanel = document.getElementById('welcome-panel');
  const gameContent = document.getElementById('game-content');

  if (!loginForm || !welcomePanel || !gameContent) return;

  if (currentUser) {
    loginForm.classList.add('hidden');
    welcomePanel.classList.remove('hidden');
    gameContent.classList.remove('hidden');
    welcomePanel.textContent = `Welcome, ${state.username}!`;
  } else {
    loginForm.classList.remove('hidden');
    welcomePanel.classList.add('hidden');
    gameContent.classList.add('hidden');
  }
}

function renderAccountDrawer() {
  const avatarIcon = document.getElementById('account-avatar-icon');
  const avatarLarge = document.getElementById('account-avatar-large');
  const drawerUsername = document.getElementById('account-drawer-username');
  const avatarPicker = document.getElementById('avatar-picker');

  const avatar = state.avatar || AVATAR_OPTIONS[0];
  if (avatarIcon) avatarIcon.textContent = avatar;
  if (avatarLarge) avatarLarge.textContent = avatar;
  if (drawerUsername) drawerUsername.textContent = state.username || '';

  if (avatarPicker && !avatarPicker.dataset.built) {
    avatarPicker.innerHTML = AVATAR_OPTIONS.map(option => `
      <button type="button" class="avatar-option" data-avatar="${option}" aria-label="Choose avatar ${option}">${option}</button>
    `).join('');
    avatarPicker.dataset.built = 'true';
  }
  if (avatarPicker) {
    avatarPicker.querySelectorAll('.avatar-option').forEach(button => {
      button.classList.toggle('selected', button.dataset.avatar === avatar);
    });
  }
}

function render() {
  renderAuth();
  renderAccountDrawer();
  renderDeck();
  renderBook();
  renderBattle();
  renderCoins();
  renderBattleMode();
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
  if (!deckList || !deckCount) return;
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
  const collectionName = document.getElementById('collection-name');
  if (!bookList || !collectionCount) return;
  collectionCount.textContent = `${state.collection.length}/${CARDS.length} collected`;
  if (collectionName) collectionName.textContent = COLLECTION_NAME;

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
  if (!playerPreview || !cpuPreview || !battleStatus || !battleLog) return;

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
  return RARITY_PRICES[card.rarity] || 10;
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
    persist();
    return;
  }

  state.coins -= price;
  addCardToDeck(cardId);
  state.lastBattleSummary = `You bought ${card.name} for ${price} coins`;
  persist();
}

function openPack() {
  if (state.lastPackOpenDate === getTodayKey()) {
    state.lastBattleSummary = 'You already opened a pack today. Come back tomorrow.';
    persist();
    return;
  }

  const DUPLICATE_REFUND = 3;
  const newCards = [];
  const duplicateCards = [];

  for (let i = 0; i < 5; i += 1) {
    const card = CARDS[Math.floor(Math.random() * CARDS.length)];
    if (state.collection.includes(card.id) || newCards.some(c => c.id === card.id)) {
      duplicateCards.push(card);
      state.coins += DUPLICATE_REFUND;
    } else {
      newCards.push(card);
      addCardToDeck(card.id);
    }
  }

  state.lastPackOpenDate = getTodayKey();

  const summaryParts = [];
  if (newCards.length) {
    const names = newCards.map(card => `${card.emoji} ${card.name}`).join(', ');
    state.battleLog.unshift(`You opened a pack (5 cards) and found: ${names}`);
    summaryParts.push(`New: ${newCards.map(card => card.name).join(', ')}`);
  }
  if (duplicateCards.length) {
    const refund = duplicateCards.length * DUPLICATE_REFUND;
    state.battleLog.unshift(`${duplicateCards.length} duplicate card(s) converted to ${refund} coins.`);
    summaryParts.push(`+${refund} coins from duplicates`);
  }

  state.lastBattleSummary = summaryParts.join(' • ') || 'Pack opened.';
  persist();
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
    persist();
    return;
  }

  const cpuCard = chooseCpuCard();
  if (!cpuCard) {
    state.lastBattleSummary = 'The CPU has no creatures available.';
    persist();
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
  persist();
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
    persist();
  }

  if (action === 'buy') {
    buyCard(cardId);
  }
}

// ---------------------------------------------------------------
// Account drawer (slide-out menu)
// ---------------------------------------------------------------
function openAccountDrawer() {
  const drawer = document.getElementById('account-drawer');
  if (drawer) drawer.classList.add('open');
}

function closeAccountDrawer() {
  const drawer = document.getElementById('account-drawer');
  if (drawer) drawer.classList.remove('open');
}

async function reauthenticate(promptLabel) {
  const password = window.prompt(promptLabel);
  if (!password) return false;
  try {
    const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, password);
    await currentUser.reauthenticateWithCredential(credential);
    return true;
  } catch (error) {
    setAuthMessage('Incorrect password. Please try again.');
    return false;
  }
}

async function handleAvatarChange(avatar) {
  if (!currentUser) return;
  state.avatar = avatar;
  await persist();
}

async function handleChangeUsername() {
  const newUsername = window.prompt('Enter your new username');
  if (!newUsername || !newUsername.trim()) return;
  const username = newUsername.trim();
  const newEmail = usernameToEmail(username);

  try {
    await currentUser.updateEmail(newEmail);
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      const ok = await reauthenticate('Please re-enter your current password to confirm this change');
      if (!ok) return;
      try {
        await currentUser.updateEmail(newEmail);
      } catch (retryError) {
        setAuthMessage(describeAuthError(retryError));
        return;
      }
    } else {
      setAuthMessage(describeAuthError(error));
      return;
    }
  }

  state.username = username;
  await persist();
  setAuthMessage(`Username updated to ${username}.`);
}

async function handleChangePassword() {
  const newPassword = window.prompt('Enter your new password (at least 6 characters)');
  if (!newPassword || newPassword.trim().length < 6) {
    if (newPassword !== null) setAuthMessage('Password must be at least 6 characters.');
    return;
  }

  try {
    await currentUser.updatePassword(newPassword.trim());
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      const ok = await reauthenticate('Please re-enter your current password to confirm this change');
      if (!ok) return;
      try {
        await currentUser.updatePassword(newPassword.trim());
      } catch (retryError) {
        setAuthMessage(describeAuthError(retryError));
        return;
      }
    } else {
      setAuthMessage(describeAuthError(error));
      return;
    }
  }

  setAuthMessage('Password updated.');
}

async function handleLogout() {
  closeAccountDrawer();
  await auth.signOut();
}

async function handleDeleteAccount() {
  const confirmed = window.confirm('Delete your account? This action cannot be undone.');
  if (!confirmed) return;

  const uid = currentUser.uid;
  try {
    await db.collection('users').doc(uid).delete();
    await currentUser.delete();
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      const ok = await reauthenticate('Please re-enter your password to confirm account deletion');
      if (!ok) return;
      try {
        await db.collection('users').doc(uid).delete();
        await currentUser.delete();
      } catch (retryError) {
        setAuthMessage(describeAuthError(retryError));
        return;
      }
    } else {
      setAuthMessage(describeAuthError(error));
      return;
    }
  }

  closeAccountDrawer();
}

function describeAuthError(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'That username is already taken.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'That username contains characters that are not allowed.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Wrong password. Please try again.';
    case 'auth/user-not-found':
      return 'No account found with that username.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

async function promptAndUpdateAccount(action) {
  if (!currentUser) return;

  if (action === 'change-username') return handleChangeUsername();
  if (action === 'change-password') return handleChangePassword();
  if (action === 'logout') return handleLogout();
  if (action === 'delete-account') return handleDeleteAccount();
}

// ---------------------------------------------------------------
// Login / sign-up
// ---------------------------------------------------------------
function setAuthMode(mode) {
  authMode = mode;
  const title = document.getElementById('auth-title');
  const submitBtn = document.getElementById('auth-submit');
  const toggleQuestion = document.getElementById('auth-toggle-question');
  const toggleBtn = document.getElementById('auth-toggle-btn');

  if (mode === 'signup') {
    title.textContent = 'Sign up';
    submitBtn.textContent = 'Create account';
    toggleQuestion.textContent = 'Already have an account?';
    toggleBtn.textContent = 'Log in';
    setAuthMessage('Choose a username and password to create your account.');
  } else {
    title.textContent = 'Login';
    submitBtn.textContent = 'Login';
    toggleQuestion.textContent = "Don't have an account?";
    toggleBtn.textContent = 'Sign up';
    setAuthMessage('Enter your username and password to continue.');
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    setAuthMessage('Please enter both username and password.');
    return;
  }

  const email = usernameToEmail(username);

  if (authMode === 'signup') {
    setAuthMessage('Creating your account…');
    try {
      suppressNextAuthMessage = true;
      const credential = await auth.createUserWithEmailAndPassword(email, password);
      const newState = { ...DEFAULT_STATE, username };
      await db.collection('users').doc(credential.user.uid).set(newState);
      state = newState;
      setAuthMessage(`Account created for ${username}.`);
      render();
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setAuthMessage('That username is already taken. Try logging in instead.');
      } else {
        setAuthMessage(describeAuthError(error));
      }
      return;
    }
  } else {
    setAuthMessage('Signing in…');
    try {
      await auth.signInWithEmailAndPassword(email, password);
      // onAuthStateChanged will load the Firestore doc and re-render.
    } catch (error) {
      const noAccountCodes = ['auth/user-not-found', 'auth/invalid-credential', 'auth/invalid-login-credentials'];
      if (noAccountCodes.includes(error.code)) {
        setAuthMessage('No account found with that username and password. If you are new, use Sign up instead.');
      } else {
        setAuthMessage(describeAuthError(error));
      }
      return;
    }
  }

  usernameInput.value = '';
  passwordInput.value = '';
}

document.addEventListener('click', (event) => {
  if (event.target.closest('#account-menu-toggle')) {
    openAccountDrawer();
    return;
  }

  if (event.target.closest('#account-drawer-close') || event.target.closest('#account-drawer-backdrop')) {
    closeAccountDrawer();
    return;
  }

  const avatarOption = event.target.closest('.avatar-option');
  if (avatarOption) {
    handleAvatarChange(avatarOption.dataset.avatar);
    return;
  }

  const drawerButton = event.target.closest('#account-drawer button[data-action]');
  if (drawerButton) {
    promptAndUpdateAccount(drawerButton.dataset.action);
    return;
  }

  handleAction(event);
});

document.getElementById('login-form').addEventListener('submit', handleLogin);
document.getElementById('auth-toggle-btn').addEventListener('click', () => {
  setAuthMode(authMode === 'login' ? 'signup' : 'login');
});
document.getElementById('open-pack').addEventListener('click', openPack);
document.getElementById('battle-btn').addEventListener('click', resolveBattle);
document.getElementById('battle-mode').addEventListener('change', (event) => {
  state.battleMode = event.target.value;
  state.lastBattleSummary = event.target.value === 'manual' ? 'Manual mode active' : 'Automatic mode active';
  persist();
});

render();
