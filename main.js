async function getNewWord(language) {
  try {
    const response = await fetch(`http://localhost:3001/word/${language}`)
    const data = await response.json()
    console.log(data);
    return data;
  } catch (error) {
    console.log(error)
  }
}

async function updateResult(level) {
  try {
    let currentLevel;

    switch (level) {
      case 1:
        currentLevel = 'first';
        break;
      case 2:
        currentLevel = 'second';
        break;
      case 3:
        currentLevel = 'third';
        break;
      case 4:
        currentLevel = 'fourth';
        break;
      case 5:
        currentLevel = 'fifth';
        break;
      case 6:
        currentLevel = 'sixth';
        break;
    }

    await fetch(`http://localhost:3001/result/${currentLevel}`, {
      method: 'PUT',
    });

  } catch (error) {
    console.log(error)
  }
}

function setLanguage() {
  let currentLanguage = window.localStorage.getItem('language');

  if(currentLanguage === 'pt'){
    window.localStorage.setItem('language', 'en');
  }
  else if(currentLanguage === 'en'){
    window.localStorage.setItem('language', 'pt');
  }
  else{
    window.localStorage.setItem('language', 'pt');
  }

  getCurrentLanguage();
}

function getCurrentLanguage(){
  let currentLanguage = window.localStorage.getItem('language');
  let button = document.getElementById('language-btt');

  if(currentLanguage === 'pt'){
    button.innerHTML = `<div class="logo-container">Change Language <img src="brazil.png" class="logo"></div`
  }
  else if(currentLanguage === 'en'){
    button.innerHTML = `<div class="logo-container">Change Language <img src="united-states.png" class="logo"></div`
  }
}

async function showResultsOnModal(){
  let resultContainer = document.getElementById('results-container');

  try {
    const response = await fetch(`http://localhost:3001/result`)
    const data = await response.json()

    resultContainer.innerHTML = `
      <p>Number of players who won: ${data.winners}</p>
      <p>Nivel 1: ${data.level.first}</p>
      <p>Nivel 2: ${data.level.second}</p>
      <p>Nivel 3: ${data.level.third}</p>
      <p>Nivel 4: ${data.level.fourth}</p>
      <p>Nivel 5: ${data.level.fifth}</p>
      <p>Nivel 6: ${data.level.sixth}</p>
    `;

  } catch (error) {
    console.log(error)
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const keys = document.querySelectorAll(".keyboard-row button");
  let guessedWords = [[]];
  let availableSpace = 1;
  let guessedWordCount = 0;
  let modal = document.getElementById("myModal");
  let span = document.getElementsByClassName("close")[0];
  let word = await startOrResetGame();

  document.getElementById('language-btt').addEventListener('click', async () => {
    if(guessedWordCount !== 6){
      const result = window.confirm('The game is still in progress! Want to wish?');
      if(result){
        word = await startOrResetGame();
      }
      else{
        return;
      }
    } 
  })

  document.getElementById('play-again-btt').addEventListener('click', async () => {
    modal.style.display = "none";
    word = await startOrResetGame();
  })

  span.onclick = function() {
    modal.style.display = "none";
  }
  
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  } 

  async function startOrResetGame(){
    document.getElementById("board").innerHTML = "";
    setLanguage();
    createSquares();
    guessedWords = [[]];
    availableSpace = 1;
    guessedWordCount = 0;

    const currentLanguage = window.localStorage.getItem('language');
    return await getNewWord(currentLanguage);
  }

  function getCurrentWordArr() {
    const numberOfGuessedWords = guessedWords.length;
    return guessedWords[numberOfGuessedWords - 1];
  }

  function updateGuessedWords(letter) {
    const currentWordArr = getCurrentWordArr();

    if (currentWordArr && currentWordArr.length < 5) {
      currentWordArr.push(letter);

      const availableSpaceEl = document.getElementById(String(availableSpace));

      availableSpace = availableSpace + 1;
      availableSpaceEl.textContent = letter;
    }
  }

  function getTileColor(letter, index) {
    const isCorrectLetter = word.includes(letter);

    if (!isCorrectLetter) {
      return "rgb(58, 58, 60)";
    }

    const letterInThatPosition = word.charAt(index);
    const isCorrectPosition = letter === letterInThatPosition;

    if (isCorrectPosition) {
      return "rgb(83, 141, 78)";
    }

    return "rgb(181, 159, 59)";
  }

  async function handleSubmitWord() {
    const currentWordArr = getCurrentWordArr();

    if (currentWordArr.length !== 5) {
      window.alert("Word must be 5 letters");
      return;
    }

    const currentWord = currentWordArr.join("");

    const firstLetterId = guessedWordCount * 5 + 1;
    const interval = 200;
    currentWordArr.forEach((letter, index) => {
      setTimeout(() => {
        const tileColor = getTileColor(letter, index);

        const letterId = firstLetterId + index;
        const letterEl = document.getElementById(letterId);
        letterEl.classList.add("animate__flipInX");
        letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
      }, interval * index);
    });

    guessedWordCount += 1;

    if (currentWord === word) {
      await updateResult(guessedWords.length);
      modal.style.display = "block";
      await showResultsOnModal();
    }

    if (guessedWords.length === 6) {
      window.alert(`Sorry, you have no more guesses! The word is ${word}.`);
      // const result = window.confirm('Do you like play again?');
      // if(result){
      //   word = await startOrResetGame();
      // }
      // else{
      //   return;
      // }
      // word = await startOrResetGame()
    }

    guessedWords.push([]);

  }

  function createSquares() {
    const gameBoard = document.getElementById("board");

    for (let index = 0; index < 30; index++) {
      let square = document.createElement("div");
      square.classList.add("square");
      square.classList.add("animate__animated");
      square.setAttribute("id", index + 1);
      gameBoard.appendChild(square);
    }
  }

  function handleDeleteLetter() {
    const currentWordArr = getCurrentWordArr();
    const removedLetter = currentWordArr.pop();

    guessedWords[guessedWords.length - 1] = currentWordArr;

    const lastLetterEl = document.getElementById(String(availableSpace - 1));

    lastLetterEl.textContent = "";
    availableSpace = availableSpace - 1;
  }

  for (let i = 0; i < keys.length; i++) {
    keys[i].onclick = async ({ target }) => {
      const letter = target.getAttribute("data-key");

      if (letter === "enter") {
        await handleSubmitWord();
        return;
      }

      if (letter === "del") {
        handleDeleteLetter();
        return;
      }

      updateGuessedWords(letter);
    };
  }
});
