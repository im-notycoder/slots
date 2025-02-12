/**
 * Setup
 */
const debugEl = document.getElementById("debug");
const scoreboardEl = document.getElementById("scoreboard");
const endGameBtn = document.getElementById("endGame");
const spinnerBtn = document.getElementById("spinner"); // Added a reference to the spinner button
const iconMap = [
  "banana",
  "seven",
  "cherry",
  "plum",
  "orange",
  "bell",
  "bar",
  "lemon",
  "melon"
];
const icon_width = 79,
  icon_height = 79,
  num_icons = 9,
  time_per_icon = 100,
  indexes = [0, 0, 0];

let totalPoints = 0,
  spinsRemaining = 5;
let isSpinning = false; // Flag to track whether the reels are animating

// Function to update the scoreboard
function updateScoreboard() {
  scoreboardEl.textContent = `Score: ${totalPoints} | Spins Remaining: ${spinsRemaining}`;
}

// Function to reset the slot machine
function resetSlotMachine() {
  totalPoints = 0;
  spinsRemaining = 5;
  updateScoreboard();
}

/**
 * Roll one reel
 */
const roll = (reel, offset = 0) => {
  const delta =
    (offset + 2) * num_icons + Math.round(Math.random() * num_icons);

  return new Promise((resolve) => {
    const style = getComputedStyle(reel);
    const backgroundPositionY = parseFloat(style["background-position-y"]);
    const targetBackgroundPositionY =
      backgroundPositionY + delta * icon_height;
    const normTargetBackgroundPositionY =
      targetBackgroundPositionY % (num_icons * icon_height);

    setTimeout(() => {
      reel.style.transition = `background-position-y ${
        (8 + 1 * delta) * time_per_icon
      }ms cubic-bezier(.41,-0.01,.63,1.09)`;
      reel.style.backgroundPositionY = `${
        backgroundPositionY + delta * icon_height
      }px`;
    }, offset * 150);

    setTimeout(() => {
      reel.style.transition = "none";
      reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
      resolve(delta % num_icons);
    }, (8 + 1 * delta) * time_per_icon + offset * 150);
  });
};

/**
 * Roll all reels, when promise resolves roll again
 */
function rollAll() {
  if (spinsRemaining <= 0 || isSpinning) {
    // Added a check for isSpinning to prevent starting a new spin while reels are animating
    return;
  }

  isSpinning = true; // Set the flag to true when starting the spin

  // Setting up rolling text element
  const rollingText = document.createElement("div");
  rollingText.textContent = "Rolling...";
  rollingText.className = "rolling-text";
  debugEl.appendChild(rollingText);

  const reelsList = document.querySelectorAll(".slots > .reel");
  Promise.all([...reelsList].map((reel, i) => roll(reel, i)))
    .then((deltas) => {
      debugEl.removeChild(rollingText);

      deltas.forEach(
        (delta, i) => (indexes[i] = (indexes[i] + delta) % num_icons)
      );
      // debugEl.textContent = indexes.map((i) => iconMap[i]).join(" - ");

      let spinPoints = 0;

      if (indexes[0] == indexes[1] && indexes[1] == indexes[2]) {
        // All 3 icons matching
        spinPoints = 500;
      } else if (
        indexes[0] == indexes[1] ||
        indexes[1] == indexes[2] ||
        indexes[0] == indexes[2]
      ) {
        // 2 icons matching
        spinPoints = 200;
      } else {
        // No matching icons
        spinPoints = 50;
      }

      totalPoints += spinPoints;
      spinsRemaining--; // Decrement spinsRemaining here
      updateScoreboard();
      isSpinning = false; // Set the flag to false when the spin is complete
    });
}

// Button click event handlers
spinnerBtn.addEventListener("click", function () {
  indexes.fill(0);
  rollAll();
});

// "End Game" button click event handler
endGameBtn.addEventListener("click", function () {
  resetSlotMachine();
  endGameBtn.style.display = "none";
});
