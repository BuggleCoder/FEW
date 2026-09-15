const $studentContainer = $(".student");
let role = "";
let selectedGrade = "";
let selectedSubject = "";
let currentGameQuestions = {};
let currentQuestionIndex = 0;
let score = 0;
let game = "";
let canPlaceMark = false;
let tictactoeTurn = "X";
let xMoves = [];
let oMoves = [];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const steps = {
  confirmProgress: {
    text: "Continue without signing in?",
    buttons: [{ id: "yes", text: "Yes" }],
  },
  warnProgress: {
    text: "Your progress will not be saved",
    buttons: [],
  },
  selectGrade: {
    text: "Select your grade level",
    buttons: [
      { id: "grade3", text: "3rd Grade" },
      { id: "grade4", text: "4th Grade" },
    ],
  },
  chooseSubject: {
    text: "Choose a subject",
    buttons: [{ id: "math", text: "Math" }],
  },
  chooseGame: {
    text: "Choose a game",
    buttons: [
      { id: "timer", text: "Speedy Solver" },
      { id: "tictactoe", text: "Tic Tac Toe" },
    ],
  },
};

function renderStep(step) {
  $studentContainer.empty();
  $studentContainer.append(`<p class="step-text">${step.text}</p>`);
  step.buttons.forEach((btn) => {
    $studentContainer.append(`<button id="${btn.id}">${btn.text}</button>`);
  });
}

$("#studentBtn").on("click", () => {
  role = "Student";
  renderStep(steps.confirmProgress);
});

$studentContainer.on("click", "button", function () {
  const buttonId = $(this).attr("id");
  if (buttonId === "yes") {
    renderStep(steps.warnProgress);
    setTimeout(() => renderStep(steps.selectGrade), 1500);
  } else if (buttonId === "grade3" || buttonId === "grade4") {
    selectedGrade = buttonId;
    renderStep(steps.chooseSubject);
  } else if (buttonId === "math") {
    selectedSubject = buttonId;
    renderStep(steps.chooseGame);
  } else if (buttonId === "timer") {
    game = "timer";
    currentQuestionIndex = 0;
    score = 0;
    currentGameQuestions = generateQuestions(selectedGrade, selectedSubject);
    renderGame("timer", selectedGrade, selectedSubject);
  } else if (buttonId === "tictactoe") {
    game = "tictactoe";
    tictactoeTurn = "X";
    canPlaceMark = false;
    xMoves = [];
    oMoves = [];
    currentQuestionIndex = 0;
    currentGameQuestions = generateQuestions(selectedGrade, selectedSubject);
    renderGame("tictactoe", selectedGrade, selectedSubject);
  }
});

$studentContainer.on("submit", "#gameForm", function (e) {
  e.preventDefault();
  let userAnswer = parseInt($(this).find('[name="answer"]').val(), 10);
  let correctAnswer = currentGameQuestions.answers[currentQuestionIndex];

  if (game === "timer") {
    if (userAnswer === correctAnswer) {
      score++;
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < 10) {
      displayQuestion();
    } else {
      $studentContainer.html(`
        <h3>You're Done!</h3>
        <p class="step-text">You scored ${score} out of 10!</p>
      `);
    }
  } else if (game === "tictactoe") {
    if (userAnswer === correctAnswer) {
      $("#text").text(
        `Correct! Click an empty square on the board to place your mark.`,
      );
      canPlaceMark = true;
    } else {
      $("#text").text(`Incorrect! The computer takes a turn.`);
      currentQuestionIndex++;

      setTimeout(() => {
        handleComputerMove();
      }, 1500);
    }
  }
});

$studentContainer.on("click", ".tictactoeBtn", function () {
  let $clickedBtn = $(this);

  if ($clickedBtn.text().trim() === "") {
    $clickedBtn.text("X");
    xMoves.push($clickedBtn.attr("id"));

    if (checkGameStatus()) {
      return;
    }

    canPlaceMark = false;
    currentQuestionIndex++;
    $("#text").text("Correct! Computer (O) is thinking...");

    setTimeout(() => {
      handleComputerMove();
    }, 1000);
  } else {
    $("#text").text("That space is already taken!");
  }
});

function checkGameStatus() {
  const winningCombinations = [
    ["tictactoe1", "tictactoe2", "tictactoe3"],
    ["tictactoe4", "tictactoe5", "tictactoe6"],
    ["tictactoe7", "tictactoe8", "tictactoe9"],
    ["tictactoe1", "tictactoe4", "tictactoe7"],
    ["tictactoe2", "tictactoe5", "tictactoe8"],
    ["tictactoe3", "tictactoe6", "tictactoe9"],
    ["tictactoe1", "tictactoe5", "tictactoe9"],
    ["tictactoe3", "tictactoe5", "tictactoe7"],
  ];

  let playerWon = winningCombinations.some((combo) =>
    combo.every((id) => xMoves.includes(id)),
  );
  let computerWon = winningCombinations.some((combo) =>
    combo.every((id) => oMoves.includes(id)),
  );

  if (playerWon) {
    $("#text").text(`Game Over! Player 1 wins!`);
    return true;
  }
  if (computerWon) {
    $("#text").text(`Game Over! Player 2 wins!`);
    return true;
  }
  if (xMoves.length + oMoves.length === 9) {
    $("#text").text("Game Over! It's a tie!");
    return true;
  }

  return false;
}

function handleComputerMove() {
  let oMoved = false;

  const winningCombinations = [
    ["tictactoe1", "tictactoe2", "tictactoe3"],
    ["tictactoe4", "tictactoe5", "tictactoe6"],
    ["tictactoe7", "tictactoe8", "tictactoe9"],
    ["tictactoe1", "tictactoe4", "tictactoe7"],
    ["tictactoe2", "tictactoe5", "tictactoe8"],
    ["tictactoe3", "tictactoe6", "tictactoe9"],
    ["tictactoe1", "tictactoe5", "tictactoe9"],
    ["tictactoe3", "tictactoe5", "tictactoe7"],
  ];

  function findCriticalMove(teamMoves, opponentMoves) {
    for (let combo of winningCombinations) {
      let teamCount = combo.filter((id) => teamMoves.includes(id)).length;
      let opponentCount = combo.filter((id) =>
        opponentMoves.includes(id),
      ).length;
      if (teamCount === 2 && opponentCount === 0) {
        return combo.find((id) => !teamMoves.includes(id));
      }
    }
    return null;
  }

  let shouldMessUp = Math.random() < 0.33;
  if (shouldMessUp) {
    let emptyButtons = [];
    $(".tictactoeBtn").each(function () {
      if ($(this).text().trim() === "") {
        emptyButtons.push($(this));
      }
    });
    if (emptyButtons.length > 0) {
      let randomBtn =
        emptyButtons[Math.floor(Math.random() * emptyButtons.length)];
      randomBtn.text("O");
      oMoves.push(randomBtn.attr("id"));
      oMoved = true;
    }
  }

  if (!oMoved) {
    let winningMove = findCriticalMove(oMoves, xMoves);
    if (winningMove) {
      $("#" + winningMove).text("O");
      oMoves.push(winningMove);
      oMoved = true;
    }
  }

  if (!oMoved) {
    let blockingMove = findCriticalMove(xMoves, oMoves);
    if (blockingMove) {
      $("#" + blockingMove).text("O");
      oMoves.push(blockingMove);
      oMoved = true;
    }
  }

  if (
    !oMoved &&
    !xMoves.includes("tictactoe5") &&
    !oMoves.includes("tictactoe5")
  ) {
    $("#tictactoe5").text("O");
    oMoves.push("tictactoe5");
    oMoved = true;
  }

  if (!oMoved) {
    if (
      xMoves.includes("tictactoe8") &&
      !xMoves.includes("tictactoe2") &&
      !oMoves.includes("tictactoe2")
    ) {
      $("#tictactoe2").text("O");
      oMoves.push("tictactoe2");
      oMoved = true;
    } else if (
      xMoves.includes("tictactoe2") &&
      !xMoves.includes("tictactoe8") &&
      !oMoves.includes("tictactoe8")
    ) {
      $("#tictactoe8").text("O");
      oMoves.push("tictactoe8");
      oMoved = true;
    } else if (
      xMoves.includes("tictactoe4") &&
      !xMoves.includes("tictactoe6") &&
      !oMoves.includes("tictactoe6")
    ) {
      $("#tictactoe6").text("O");
      oMoves.push("tictactoe6");
      oMoved = true;
    } else if (
      xMoves.includes("tictactoe6") &&
      !xMoves.includes("tictactoe4") &&
      !oMoves.includes("tictactoe4")
    ) {
      $("#tictactoe4").text("O");
      oMoves.push("tictactoe4");
      oMoved = true;
    }
  }

  if (!oMoved) {
    $(".tictactoeBtn").each(function () {
      if ($(this).text().trim() === "") {
        $(this).text("O");
        oMoves.push($(this).attr("id"));
        oMoved = true;
        return false;
      }
    });
  }

  if (checkGameStatus()) {
    return;
  }

  $("#text").text("Computer placed an O. Your turn!");
  displayQuestion();
}

function generateQuestions(grade, subject) {
  let num1 = [];
  let num2 = [];
  let answers = [];
  if (subject === "math") {
    for (let i = 0; i < 100; i++) {
      num1.push(Math.floor(Math.random() * 9) + 1);
      num2.push(Math.floor(Math.random() * 9) + 1);
      answers.push(num1[i] * num2[i]);
    }
  }
  return { num1, num2, answers };
}

function renderGame(game, grade, subject) {
  $studentContainer.empty();
  if (game === "timer") {
    $studentContainer.append(`
      <div id="questionArea"></div>
      <form id="gameForm">
        <input type="number" id="answer" name="answer" placeholder="Enter your answer" required autocomplete="off">
        <input id="submit" type="submit" value="Submit">
      </form>
    `);
    displayQuestion();
  } else if (game === "tictactoe") {
    $studentContainer.append(`
      <p><strong>Rules:</strong> Answer correctly to claim a turn. Answer incorrectly, and turn passes to the opponent!</p>
      <div id="questionArea"></div>
      <form id="gameForm">
        <input type="number" id="answer" name="answer" placeholder="Enter your answer" required autocomplete="off">
        <input id="submit" type="submit" value="Submit">
      </form>
      <br>
      <p id="text"></p>
      <div id="board"></div>
    `);

    for (let i = 0; i < 9; i++) {
      $("#board").append(
        `<button class="tictactoeBtn" id="tictactoe${i + 1}" style="width:50px; height:50px; margin:2px; vertical-align:top; font-size:20px; font-weight:bold;"></button>`,
      );
      if ((i + 1) % 3 === 0) $("#board").append("<br>");
    }
    displayQuestion();
  }
}

function displayQuestion() {
  let n1 = currentGameQuestions.num1[currentQuestionIndex];
  let n2 = currentGameQuestions.num2[currentQuestionIndex];
  $("#questionArea").html(
    `<p class="step-text">Question ${currentQuestionIndex + 1}: What is ${n1} x ${n2}?</p>`,
  );
  $("#answer").val("").focus();
}
