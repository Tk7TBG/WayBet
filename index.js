const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const betInput = document.getElementById("betAmount");
const balanceText = document.getElementById("balance");
const actionBtn = document.getElementById("actionBtn");
const statusText = document.getElementById("statusText");

let balance = 1000.0;
let currentBet = 0;
let targetMultiplier = 0;
let hasCashedOut = false;
let gameState = "waiting"; // waiting, flying, crashed
let animationId;
let currentMultiplier = 1.0;
let timeElapsed = 0;

const multiplier_text = document.getElementById("multiplier");

function drawFrame() {
  if (gameState !== "flying") return;

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

  animationId = requestAnimationFrame(drawFrame);
}

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
  } else if (bet > balance) {
    alert("Invalid bet: Bet can't be greater than balance");
  }

  balance -= bet;
  currentBet = bet;
  updateBalanceUI();

  actionBtn.innerText = "BET PLACED (WAITING)";
  actionBtn.disabled = true;
  statusText.innerText = "READY FOR TAKEOFF...";
}
function handleCashOut() {}

function updateBalanceUI() {
  balanceText.textContent = balance;
}

function startWaitingPhase() {
  gameState = "waiting";

  // Reset everything. Clear canvas, reset values.
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Reset multiplier
  //timeElapsed = 0;
  //currentMultiplier = 0;

  // Enable action button
  /*
  actionBtn.innerText = "PLACE BET";
  actionBtn.disabled = false;
  statusText.innerText = "WAITING FOR NEXT ROUND";
  */
  // Automatically start round after 4 seconds
  setTimeout(initiateRound, 4000);
}

function initiateRound() {
  gameState = "flying";

  // Calculating crash Point
  let rand = Math.pow(Math.random(), 0.5);
  targetMultiplier = Math.max(1.0, parseFloat((0.98 / (1 - rand)).toFixed(2)));

  hasCashedOut = false;
  timeElapsed = 0;
  currentMultiplier = 1.0;

  if (currentBet > 0) {
    actionBtn.disabled = false;
    actionBtn.classList.add("cashout");
    actionBtn.textContent = "Current bet > 0";
  } else {
    actionBtn.disabled = true;
    actionBtn.textContent = "Current bet < 0";
  }

  animationId = requestAnimationFrame(drawFrame);
}
function triggerCrash() {
  gameState = "crashed";
}

startWaitingPhase();
