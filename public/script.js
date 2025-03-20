let questions = [];
let currentQuestions = [];
let currentQuestion = 0;
let score = 0;
let answers = [];
let username = "";

const loginForm = document.getElementById("login-form");
const questionNav = document.querySelector(".question-nav");
const quizContainer = document.querySelector(".quiz-container");
const questionText = document.getElementById("question-text");
const optionsList = document.getElementById("options-list");
const svgImage = document.getElementById("svg-image");
const nextBtn = document.getElementById("next-btn");
const submitBtn = document.getElementById("submit-btn");
const questionList = document.getElementById("question-list");
const resultDiv = document.getElementById("result");
const startBtn = document.getElementById("start-btn");

startBtn.onclick = () => {
    username = document.getElementById("username").value.trim();
    if (username) {
        loginForm.style.display = "none";
        questionNav.style.display = "block";
        quizContainer.style.display = "block";
        loadQuestions();
    } else {
        alert("Please enter your name!");
    }
};

async function loadQuestions() {
    const response = await fetch('/questions');
    questions = await response.json();
    currentQuestions = getRandomQuestions(questions, 5);
    generateQuestionNav();
    loadQuestion(0);
}

function getRandomQuestions(array, count) {
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateQuestionNav() {
    questionList.innerHTML = "";
    currentQuestions.forEach((_, i) => {
        const li = document.createElement("li");
        li.textContent = i + 1;
        li.dataset.question = i;
        li.onclick = () => {
            currentQuestion = i;
            loadQuestion(currentQuestion);
            updateButtons();
        };
        questionList.appendChild(li);
    });
    updateNav(0);
}

function loadQuestion(index) {
    const q = currentQuestions[index];
    questionText.textContent = q.question;
    optionsList.innerHTML = "";
    q.options.forEach((option, i) => {
        const li = document.createElement("li");
        li.textContent = option;
        li.dataset.index = i;
        li.onclick = () => selectAnswer(i, index, li);
        if (answers[index] === i) li.classList.add("selected");
        optionsList.appendChild(li);
    });
    svgImage.innerHTML = q.svg;
    updateNav(index);
}

function updateNav(index) {
    const navItems = questionList.querySelectorAll("li");
    navItems.forEach(li => li.classList.remove("active"));
    navItems[index].classList.add("active");
}

function selectAnswer(selected, questionIndex, element) {
    answers[questionIndex] = selected;
    score = answers.reduce((acc, answer, idx) => {
        return acc + (answer === currentQuestions[idx].correct ? 1 : 0);
    }, 0);
    const options = optionsList.querySelectorAll("li");
    options.forEach(opt => opt.classList.remove("selected"));
    element.classList.add("selected");
}

function updateButtons() {
    nextBtn.style.display = currentQuestion === currentQuestions.length - 1 ? "none" : "inline";
    submitBtn.style.display = currentQuestion === currentQuestions.length - 1 ? "inline" : "none";
}

nextBtn.onclick = () => {
    if (currentQuestion < currentQuestions.length - 1) {
        currentQuestion++;
        loadQuestion(currentQuestion);
        updateButtons();
    }
};

submitBtn.onclick = async () => {
    const saved = await saveResults();
    displayResults();
    if (saved) alert("Відповідь збережено");
    else alert("Помилка при збереженні відповіді");
};

async function saveResults() {
    const result = {
        name: username,
        date: new Date().toISOString().split("T")[0],
        score: score
    };
    localStorage.setItem("prevScore", localStorage.getItem("lastScore") || 0);
    localStorage.setItem("lastScore", score);

    const response = await fetch('/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
    });
    return response.ok;
}

function displayResults() {
    const prevScore = localStorage.getItem("prevScore") || 0;
    resultDiv.innerHTML = `Your score: ${score}/${currentQuestions.length}<br>Previous score: ${prevScore}/${currentQuestions.length}`;
}