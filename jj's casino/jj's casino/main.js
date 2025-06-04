// Initial player stats
let money = 5000;
let xp = 0;
let level = 1;

const xpToLevelUpBase = 1000; // Base XP required for level 2
const rollBaseCost = 100;     // Base roll cost

// Buffs from anime characters (buff is % increase in money earned per roll)
const characters = [
  { name: "Sakura", buff: 0.05, cost: 500, unlocked: false },
  { name: "Naruto", buff: 0.1, cost: 2000, unlocked: false },
  { name: "Isagi", buff: 0.15, cost: 5000, unlocked: false },
  { name: "Nika", buff: 100, cost: 10000, unlocked: false }
];

// DOM Elements
const moneyDisplay = document.getElementById('money');
const xpDisplay = document.getElementById('xp');
const levelDisplay = document.getElementById('level');
const rollCostDisplay = document.getElementById('roll-cost');
const diceCostDisplay = document.getElementById('dice-cost');

const rollBtn = document.getElementById('roll-button');
const diceRollBtn = document.getElementById('dice-roll-button');
const diceResult = document.getElementById('dice-result');

const slots = [
  document.getElementById('slot1'),
  document.getElementById('slot2'),
  document.getElementById('slot3')
];

const rollHistory = document.getElementById('roll-history');
const characterList = document.getElementById('character-list');

const music = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');

// Calculate XP needed for next level (scales by 1.3 per level)
function xpToLevelUp(lvl) {
  return Math.floor(xpToLevelUpBase * Math.pow(1.3, lvl - 1));
}

// Calculate roll cost (increases 10% per level)
function rollCost(lvl) {
  return Math.floor(rollBaseCost * Math.pow(1.10, lvl - 1));
}

// Calculate dice roll cost (simpler, fixed for now)
function diceCost(lvl) {
  return 50 + (lvl - 1) * 10;
}

// Calculate total buff from unlocked characters
function totalBuff() {
  return characters.reduce((acc, c) => c.unlocked ? acc + c.buff : acc, 0);
}

// Update UI
function updateUI() {
  moneyDisplay.textContent = money.toFixed(2);
  xpDisplay.textContent = xp;
  levelDisplay.textContent = level;
  rollCostDisplay.textContent = rollCost(level);
  diceCostDisplay.textContent = diceCost(level);

  // Disable roll button if not enough money
  rollBtn.disabled = money < rollCost(level);
  diceRollBtn.disabled = money < diceCost(level);

  // Update character cards buy button states
  characterList.querySelectorAll('.character-card').forEach((card, i) => {
    const btn = card.querySelector('button');
    if (characters[i].unlocked) {
      btn.textContent = 'Owned';
      btn.disabled = true;
      btn.style.background = '#444';
      btn.style.color = '#bbb';
    } else if (money >= characters[i].cost) {
      btn.textContent = `Buy ($${characters[i].cost})`;
      btn.disabled = false;
      btn.style.background = 'linear-gradient(145deg, #ffd700, #b8860b)';
      btn.style.color = '#3a2a00';
    } else {
      btn.textContent = `Buy ($${characters[i].cost})`;
      btn.disabled = true;
      btn.style.background = '#555';
      btn.style.color = '#999';
    }
  });
}

// Initialize characters display
function initCharacters() {
  characterList.innerHTML = '';
  characters.forEach((char, index) => {
    const card = document.createElement('div');
    card.className = 'character-card';

    card.innerHTML = `
      <h3>${char.name}</h3>
      <p>Buff: +${(char.buff * 100).toFixed(0)}% money per roll</p>
      <button>Buy ($${char.cost})</button>
    `;

    const buyBtn = card.querySelector('button');
    buyBtn.addEventListener('click', () => {
      if (!char.unlocked && money >= char.cost) {
        money -= char.cost;
        char.unlocked = true;
        addToHistory(`Bought character ${char.name}! Buff +${(char.buff*100).toFixed(0)}%`);
        updateUI();
      }
    });

    characterList.appendChild(card);
  });
}

// Add text to roll history
function addToHistory(text) {
  const p = document.createElement('p');
  p.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
  rollHistory.prepend(p);

  // Limit roll history length to 20 lines
  if (rollHistory.children.length > 20) {
    rollHistory.removeChild(rollHistory.lastChild);
  }
}

// Handle leveling up
function checkLevelUp() {
  let xpNeeded = xpToLevelUp(level);
  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level++;
    addToHistory(`🎉 Leveled up to Level ${level}!`);
    xpNeeded = xpToLevelUp(level);
  }
}

// Roll the slot machine
function rollSlots() {
  const cost = rollCost(level);
  if (money < cost) {
    alert("Not enough money to roll!");
    return;
  }
  money -= cost;

  for (let i = 0; i < slots.length; i++) {
    slots[i].textContent = Math.floor(Math.random() * 10);
  }

  // Check for wins
  const s1 = slots[0].textContent;
  const s2 = slots[1].textContent;
  const s3 = slots[2].textContent;

  let reward = 0;
  if (s1 === s2 && s2 === s3) {
    // Three of a kind big win
    reward = cost * 15;
    addToHistory(`🎰 Triple match! You won $${reward.toFixed(2)}`);
  } else if (s1 === s2 || s2 === s3 || s1 === s3) {
    // Two of a kind smaller win
    reward = cost * 3;
    addToHistory(`🎰 Double match! You won $${reward.toFixed(2)}`);
  } else {
    addToHistory(`🎰 No match. Lost $${cost.toFixed(2)}`);
  }

  // Apply buff to reward
  reward += reward * totalBuff();

  money += reward;

  // Gain XP (10% of money spent)
  xp += Math.floor(cost * 0.10);

  checkLevelUp();
  updateUI();
}

// Dice game roll
function rollDice() {
  const cost = diceCost(level);
  if (money < cost) {
    alert("Not enough money to roll dice!");
    return;
  }
  money -= cost;

  const diceRoll = Math.floor(Math.random() * 6) + 1;
  let reward = 0;

  // Reward based on dice number rolled
  switch (diceRoll) {
    case 6:
      reward = cost * 8;
      break;
    case 5:
      reward = cost * 5;
      break;
    case 4:
      reward = cost * 3;
      break;
    case 3:
      reward = cost * 1.5;
      break;
    case 2:
      reward = cost * 1;
      break;
    case 1:
      reward = 0; // No reward
      break;
  }

  reward += reward * totalBuff();

  money += reward;
  xp += Math.floor(cost * 0.08);

  diceResult.textContent = `You rolled a ${diceRoll}! You won $${reward.toFixed(2)}.`;
  addToHistory(`🎲 Dice rolled ${diceRoll}, won $${reward.toFixed(2)}`);

  checkLevelUp();
  updateUI();
}

// Music toggle logic
musicToggle.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    musicToggle.textContent = '🔇 Music Off';
  } else {
    music.pause();
    musicToggle.textContent = '🎵 Music On';
  }
});

// Initialize game
function init() {
  money = 5000;
  xp = 0;
  level = 1;

  initCharacters();
  updateUI();

  rollBtn.addEventListener('click', rollSlots);
  diceRollBtn.addEventListener('click', rollDice);

  // Try autoplay (may fail in some browsers)
  music.play().then(() => {
    musicToggle.textContent = '🔇 Music Off';
  }).catch(() => {
    musicToggle.textContent = '🎵 Music On';
  });
}

init();
