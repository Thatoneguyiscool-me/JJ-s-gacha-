// Game state variables
let money = 10000;
let xp = 0;
let level = 1;
let xpToLevelUp = 1000;
let characters = [
  { name: "Sakura", buff: 0.05, cost: 500, unlocked: false },
  { name: "Naruto", buff: 0.1, cost: 2000, unlocked: false },
  { name: "Isagi", buff: 0.15, cost: 5000, unlocked: false },
  { name: "Nika", buff: 1.0, cost: 10000, unlocked: false }
];
let activeBuff = 1;

function updateDisplay() {
  document.getElementById("money").textContent = `💰 Money: $${money}`;
  document.getElementById("level").textContent = `⭐ Level: ${level}`;
  document.getElementById("xp").textContent = `📈 XP: ${xp} / ${xpToLevelUp}`;
  renderCharacterStore();
}

function gainXP(amount) {
  xp += amount;
  while (xp >= xpToLevelUp) {
    xp -= xpToLevelUp;
    level++;
    xpToLevelUp = Math.floor(xpToLevelUp * 1.1);
  }
}

function spinSlots() {
  let costToSpin = Math.floor(100 * level);
  if (money < costToSpin) {
    alert("Not enough money to roll!");
    return;
  }
  money -= costToSpin;

  const slots = document.querySelectorAll(".slot");
  const results = Array.from(slots).map(() => Math.floor(Math.random() * 10));
  results.forEach((num, idx) => (slots[idx].textContent = num));

  if (results[0] === results[1] && results[1] === results[2]) {
    let baseReward = 500 * results[0];
    let totalReward = Math.floor(baseReward * activeBuff);
    money += totalReward;
    gainXP(500);
    document.getElementById("result").textContent = `🎉 Jackpot! You won $${totalReward}`;
  } else {
    document.getElementById("result").textContent = `😢 No match. Try again!`;
    gainXP(100);
  }

  updateDisplay();
}

function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1;
  let reward = roll * 50;
  money += reward;
  gainXP(roll * 25);
  document.getElementById("dice-result").textContent = `🎲 You rolled a ${roll} and won $${reward}`;
  updateDisplay();
}

function unlockCharacter(index) {
  const character = characters[index];
  if (money >= character.cost && !character.unlocked) {
    money -= character.cost;
    character.unlocked = true;
    recalculateBuff();
    updateDisplay();
  } else {
    alert("Not enough money or already unlocked!");
  }
}

function recalculateBuff() {
  activeBuff = 1 + characters.reduce((sum, char) => char.unlocked ? sum + char.buff : sum, 0);
}

function renderCharacterStore() {
  const store = document.getElementById("character-store");
  store.innerHTML = "";
  characters.forEach((char, index) => {
    const charEl = document.createElement("div");
    charEl.className = "character";
    charEl.innerHTML = `
      <strong>${char.name}</strong><br>
      Buff: +${(char.buff * 100).toFixed(0)}%<br>
      Cost: $${char.cost}<br>
      ${char.unlocked ? "<em>Unlocked</em>" : `<button onclick="unlockCharacter(${index})">Buy</button>`}
    `;
    store.appendChild(charEl);
  });
}

// Background music setup
const music = new Audio("bg-music.mp3");
music.loop = true;
music.volume = 0.4;
document.addEventListener("DOMContentLoaded", () => {
  music.play().catch(() => {
    console.log("User interaction required to play audio.");
  });
  updateDisplay();
});
