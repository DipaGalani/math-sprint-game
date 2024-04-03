// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

// Scroll
let valueY = 0;

// Refresh Splash Page Best Scores
function bestScoresToDOM() {
  bestScores.forEach((bestScore, i) => {
    bestScore.textContent = `${bestScoreArray[i].bestScore}s`;
  });
}

// check local storage for best scores
function getSavedBestScores() {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.getItem("bestScores"));
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];
    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
}

// update bestScore array
function updateBestScore() {
  bestScoreArray.forEach((score, index) => {
    // Select best score to update
    if (questionAmount == score.questions) {
      const savedBestScore = Number(bestScoreArray[index].bestScore);
      if (savedBestScore === 0 || savedBestScore > finalTime) {
        bestScoreArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  bestScoresToDOM();
  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
}

// reset game
function playAgain() {
  gamePage.addEventListener("click", startTimer);
  equationsArray = [];
  playerGuessArray = [];
  timeLeft = 3;
  valueY = 0;
  playAgainBtn.hidden = true;
  splashPage.hidden = false;
  scorePage.hidden = true;
}

// Show Score Page
function showScorePage() {
  gamePage.hidden = true;
  scorePage.hidden = false;
  // show play again button after 1 second
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000);
}

// Format and Display time in DOM
function scoresToDOM() {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1);

  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: ${penaltyTime}s`;
  finalTimeEl.textContent = `${finalTimeDisplay}s`;

  updateBestScore();

  // scroll to top, go to score page
  itemContainer.scrollTo({
    top: 0,
    behavior: "instant",
  });

  showScorePage();
}

// Check score
function checkScore() {
  equationsArray.forEach((question, i) => {
    if (question.evaluated !== playerGuessArray[i]) {
      penaltyTime += 0.5;
    }
  });
  finalTime = penaltyTime + timePlayed;
  scoresToDOM();
}

// stop timer, process results, go to Score Page
function checkTime() {
  console.log(timePlayed);
  if (playerGuessArray.length == questionAmount) {
    console.log("checkTime(), player guess array", playerGuessArray);
    clearInterval(timer);
    checkScore();
  }
}

// add a tent of a second to timePlayed
function addTime() {
  timePlayed += 0.1;
  checkTime();
}

// start timer when game page is clicked
function startTimer() {
  // reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  gamePage.removeEventListener("click", startTimer);
}

// scroll and store user selection to the playerGuessArray
function select(isGuessedTrue) {
  // scroll 80px
  valueY += 80;
  itemContainer.scroll(0, valueY);
  // Add player guess to array
  return isGuessedTrue
    ? playerGuessArray.push("true")
    : playerGuessArray.push("false");
}

// Display Game Page
function showGamePage() {
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

// Get random number upto a max number
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  const correctEquations = getRandomInt(questionAmount);
  const wrongEquations = questionAmount - correctEquations;

  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArray.push(equationObject);
  }

  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// Add equations to DOM
function equationsToDOM() {
  equationsArray.forEach(({ value, evaluated }) => {
    // Item
    const item = document.createElement("div");
    item.classList.add("item");
    // Equation Text
    const equationText = document.createElement("h1");
    equationText.textContent = value;
    // Appen
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = "";
  // Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  // Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  // Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainer.appendChild(bottomSpacer);
}

// Run the countdown
let timeLeft = 3;
function countdownStart() {
  countdown.textContent = timeLeft;
  let timeCount = setInterval(() => {
    if (timeLeft === 1) {
      clearInterval(timeCount);
    }
    timeLeft--;
    countdown.textContent = timeLeft;
  }, 1000);
}

// Navigate from splash page to countdown page
function showCountdown() {
  countdownPage.hidden = false;
  splashPage.hidden = true;
  countdownStart();
  populateGamePage();
  setTimeout(showGamePage, 4000);
}

// Get the value from the selected radio button
function getRadioValue() {
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if (radioInput.checked) {
      radioValue = radioInput.value;
    }
  });
  return radioValue;
}

// Form that decides amount of questions
function selectQuestionAmount(evt) {
  evt.preventDefault();
  questionAmount = getRadioValue();
  console.log("selectQuestionAmount() - Question Amount:", questionAmount);
  if (questionAmount) {
    showCountdown();
  }
}

startForm.addEventListener("click", () => {
  radioContainers.forEach((radioContainer) => {
    // Remove selected label styling
    radioContainer.classList.remove("selected-label");
    // Add it back if the radio input is checked
    if (radioContainer.children[1].checked) {
      radioContainer.classList.add("selected-label");
    }
  });
});

// Event Listeners
startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);

// On Load
getSavedBestScores();
