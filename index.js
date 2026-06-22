const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const betInput = document.getElementById("betAmount");
const balanceText = document.getElementById("balance");
const actionBtn = document.getElementById("actionBtn");
const statusText = document.getElementById("statusText");
const targetMultiplierText = document.getElementById("targetMultiplier");
const estimatedWinningsText = document.getElementById("estimatedWinnings");

let balance = 1000.0;
let currentBet = 0;
let targetMultiplier = 0;
let hasCashedOut = false;
let gameState = "waiting"; // waiting, flying, crashed
let animationId;
let currentMultiplier = 1.0;
let timeElapsed = 0;

const multiplierText = document.getElementById("multiplierText");
const gameStateText = document.getElementById("gameStateText");

function drawFrame() {
  if (gameState !== "flying") return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Setting up exponential multiplier for each frame step
  timeElapsed += 16;
  currentMultiplier = Math.pow(1.0004, timeElapsed).toFixed(2);

  if (!hasCashedOut && currentBet > 0) {
    let estimatedWinnings = (currentMultiplier * currentBet).toFixed(2);
    estimatedWinningsText.textContent = estimatedWinnings;
    actionBtn.textContent = `CASH OUT BWP  ${estimatedWinnings}`;
  }

  // Checking if we can crash
  if (currentMultiplier >= targetMultiplier) {
    currentMultiplier = targetMultiplier;
    multiplierText.textContent = currentMultiplier + "x";
    //estimatedWinningsText.textContent = "0";
    triggerCrash();
    return;
  }

  // 2. Converting abstract values (time elapsed and current multiplier) to pixel coordinates x & y
  let horizontalProgress = timeElapsed / 3000;

  let x = horizontalProgress * (canvas.width * 0.8); // To make horizontal move instead of static
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

  multiplierText.textContent = currentMultiplier + "x";
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
    alert("Invalid bet: Bet cannot be less than or equal to 0");
    return;
  } else if (bet > balance) {
    alert("Invalid bet: Bet can't be greater than balance");
    return;
  }

  balance -= bet;
  currentBet = bet;
  updateBalanceUI();

  actionBtn.innerText = "BET PLACED (WAITING)";
  actionBtn.disabled = true;
  statusText.innerText = "READY FOR TAKEOFF...";
}
function handleCashOut() {
  hasCashedOut = true;
  let winnings = currentBet * currentMultiplier;
  balance += winnings;
  updateBalanceUI();

  actionBtn.textContent = `WON BWP ${winnings.toFixed(2)}`;
  actionBtn.classList.remove("cashout");
  actionBtn.disabled = true;

  statusText.innerText = `Cashed out BWP ${winnings}`;
  statusText.style.color = "#28a745";
}

function updateBalanceUI() {
  balanceText.textContent = balance.toFixed(2);
}

function startWaitingPhase() {
  gameState = "waiting";
  gameStateText.textContent = "Waiting";
  multiplierText.style.color = "#fff";
  // Reset everything. Clear canvas, reset values.
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff0000";
  let startY = canvas.height - 20;
  ctx.fillRect(0, startY, 20, 20);
  // Reset multiplier
  //timeElapsed = 0;
  currentBet = 0;
  multiplierText.textContent = "1.00x";
  estimatedWinningsText.textContent = "";

  // Enable action button

  actionBtn.innerText = "PLACE BET";
  actionBtn.disabled = false;
  statusText.innerText = "";

  // Automatically start round after 4 seconds
  setTimeout(initiateRound, 4000);
}

function initiateRound() {
  gameState = "flying";
  gameStateText.textContent = "Flying";

  statusText.innerText = "";
  // Calculating crash Point
  let rand = Math.pow(Math.random(), 0.3);
  targetMultiplier = Math.max(1.0, parseFloat((0.98 / (1 - rand)).toFixed(2)));
  targetMultiplierText.textContent = targetMultiplier;

  hasCashedOut = false;
  timeElapsed = 0;
  currentMultiplier = 1.0;

  // Separates active bettors from spectators
  if (currentBet > 0) {
    actionBtn.disabled = false;
    actionBtn.classList.add("cashout");
    actionBtn.textContent = "CASHOUT";
  } else {
    actionBtn.disabled = true;
    actionBtn.textContent = "Waiting for next round";
  }

  animationId = requestAnimationFrame(drawFrame);
}

function triggerCrash() {
  gameState = "crashed";
  gameStateText.textContent = "Crashed";
  cancelAnimationFrame(animationId);

  multiplierText.textContent += " FLEW AWAY";
  multiplierText.style.color = "#e61e25";

  actionBtn.classList.remove("cashout");
  actionBtn.disabled = true;

  setTimeout(startWaitingPhase, 4000);
}

startWaitingPhase();
