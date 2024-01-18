document.addEventListener('DOMContentLoaded', function () {
    const quoteElement = document.getElementById('quote');
    const userInputElement = document.getElementById('userInput');
    const durationSelect = document.getElementById('durationSelect');
    const includeSpecialCheckbox = document.getElementById('includeSpecial');
    const includeNumbersCheckbox = document.getElementById('includeNumbers');
    const includeCapitalCheckbox = document.getElementById('includeCapital');
    const resultElement = document.getElementById('result');
    const statsElement = document.getElementById('stats');

    let startTime;
    let endTime;
    let testDuration;
    let correctWords = 0;
    let totalWords = 0;
    let originalWords = [];
    let timerElement = document.getElementById('timer');
    let countdownInterval;

    // Fetch and display the initial paragraph
    getRandomParagraphs();

    // Fetch random paragraphs with Essential Generators API
    function getRandomParagraphs() {
        const includeSpecial = includeSpecialCheckbox.checked;
        const includeNumbers = includeNumbersCheckbox.checked;
        const includeCapital = includeCapitalCheckbox.checked;

        fetch(`/get_random_paragraphs?include_special=${includeSpecial}&include_numbers=${includeNumbers}&include_capital=${includeCapital}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch random paragraphs (${response.status} ${response.statusText})`);
                }
                return response.json();
            })
            .then(data => {
                originalWords = data.paragraph.split(/\s+/).map(word => word.trim());
                quoteElement.innerHTML = originalWords.map(word => `<span>${word}</span>`).join(' ');
            })
            .catch(error => {
                console.error('Error fetching random paragraphs:', error.message);
                quoteElement.textContent = "Failed to fetch random paragraphs. Please try again.";
            });
    }

    // Enable the typing test
    function startTypingTest() {
        resultElement.textContent = '';
        statsElement.textContent = '';
        userInputElement.value = '';
        testDuration = parseInt(durationSelect.value, 10);
        startTime = new Date();
        endTime = new Date(startTime.getTime() + testDuration * 1000);
        // Display initial timer value
        updateTimerDisplay();

        // Start the countdown interval
        countdownInterval = setInterval(updateTimerDisplay, 1000);
        setTimeout(() => endTypingTest(), testDuration * 1000);
    }

    function updateTimerDisplay() {
        const currentTime = new Date();
        const remainingTimeInSeconds = Math.max(0, Math.round((endTime - currentTime) / 1000));
        timerElement.textContent = `${remainingTimeInSeconds}s`;
    
        if (remainingTimeInSeconds === 0) {
            clearInterval(countdownInterval);
        }
    }
    
    // Check real-time accuracy
    function updateParagraphColor() {
        const userInputText = userInputElement.value.trim();
        const userInputWords = userInputText.split(/\s+/);

        originalWords.forEach((word, index) => {
            const isCorrect = index < userInputWords.length && word.toLowerCase() === userInputWords[index].toLowerCase();
            quoteElement.children[index].className = isCorrect ? 'correct' : 'incorrect';
        });
    }

    // Check if a word is typed correctly and update color
    function checkWord(word, userInputWord) {
        if (word === userInputWord) {
            return `<span class="correct">${word}</span>`;
        } else {
            return `<span class="incorrect">${userInputWord}</span>`;
        }
    }

    // Check the user's typing accuracy and speed
    function endTypingTest() {
        const elapsedTimeInSeconds = (endTime - startTime) / 1000;
        const originalText = originalWords.join(' ');
        const userInputText = userInputElement.value.trim();

        // Calculate words per minute (WPM)
        const wordsPerMinute = Math.round((userInputText.split(/\s+/).length / elapsedTimeInSeconds) * 60);

        resultElement.textContent = `Your typing speed: ${wordsPerMinute} WPM`;

        // Calculate accuracy for the words the user has typed
        let correctWords = 0;
        let totalWordsTyped = userInputText.split(/\s+/).length;

        for (let i = 0; i < totalWordsTyped; i++) {
            if (originalText.split(/\s+/)[i] === userInputText.split(/\s+/)[i]) {
                correctWords++;
            }
        }

        const accuracy = Math.round((correctWords / totalWordsTyped) * 100);

        statsElement.innerHTML = `<p>Accuracy: ${accuracy}%</p>`;
    }

    // Event listeners
    userInputElement.addEventListener('input', function () {
        if (!startTime) {
            // Start the test on the first input
            startTypingTest();
        }
        updateParagraphColor();
    });

    includeSpecialCheckbox.addEventListener('change', getRandomParagraphs);
    includeNumbersCheckbox.addEventListener('change', getRandomParagraphs);
    includeCapitalCheckbox.addEventListener('change', getRandomParagraphs);

    // Add a reference to the refresh button
    const refreshButton = document.getElementById('refreshButton');

    // Event listener for the refresh button
    refreshButton.addEventListener('click', function () {
        getRandomParagraphs();
        startTypingTest();
    });
});
