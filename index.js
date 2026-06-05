const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const betInput = document.getElementById("betAmount");
const balanceElement = document.getElementById("balance");

let balance = 1000.0;
let currentBet = 0;
let targetCrashPoint = 0;
let hasCashedOut = false;
let gameState = "waiting";
let animationId;
let currentMultiplier = 1.0;
let timeElapsed = 0;

const multiplier_text = document.getElementById("multiplier");

function drawFrame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Setting up exponential multiplier for each frame step
  timeElapsed += 16;
  currentMultiplier = Math.pow(1.0006, timeElapsed);

  // 2. Converting abstract values (time elapsed and current multiplier) to pixel coordinates x & y
  let x = canvas.width * 0.5;
  let y = canvas.height - (currentMultiplier - 1) * 50;

  // 3. Limit the height and width of the plane so it doesn't leave canvas before crashing
  x = Math.min(x, canvas.width * 0.8);
  y = Math.max(y, canvas.height * 0.2);

  // 4. Drawing the Line
  ctx.beginPath();
  ctx.moveTo(0, canvas.height); //bottom left
  ctx.quadraticCurveTo(x / 2, canvas.height, x, y); //control point at bottom middle of line
  ctx.strokeStyle = "#e61e25";
  ctx.lineWidth = 4;
  ctx.stroke();

  // 5. Plane
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(x - 10, y - 10, 20, 20);

  multiplier_text.textContent = currentMultiplier;

  requestAnimationFrame(drawFrame);
}

requestAnimationFrame(drawFrame);

function handleAction() {
  if (gameState === "waiting") {
    placeBet();
  } else if (gameState === "flying" && !hasCashedOut && currentBet > 0) {
    handleCashOut();
  }
}
function placeBet() {
  let bet = Number(betInput.value);
  if (bet <= 0) {
    alert("Invalid bet: Bet cannot be less than 0");
  }

  balance -= bet;
  currentBet = bet;
  updateBalanceUI();
}
function handleCashOut() {}

function updateBalanceUI() {
  balanceElement.textContent = balance;
}
