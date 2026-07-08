const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const chipValues = [1, 5, 10, 25, 50, 100, 500, 1000];
const chipPositions = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
    { x: 4, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 }
];
const cardPositionMap = {
    'A': { col: 0, row: 0 },
    '2': { col: 1, row: 0 },
    '3': { col: 2, row: 0 },
    '4': { col: 3, row: 0 },
    '5': { col: 4, row: 0 },
    '6': { col: 0, row: 1 },
    '7': { col: 1, row: 1 },
    '8': { col: 2, row: 1 },
    '9': { col: 3, row: 1 },
    '10': { col: 4, row: 1 },
    'J': { col: 0, row: 2 },
    'Q': { col: 1, row: 2 },
    'K': { col: 2, row: 2 }
};

let deck = [];
let playerCards = [];
let dealerCards = [];
let gameActive = false;
let balance = 1000;
let currentBet = 0;
let dealerHideCard = true;

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function getCardValue(card) {
    if (card.value === 'A') return 11;
    if (['K', 'Q', 'J'].includes(card.value)) return 10;
    return parseInt(card.value);
}

function calculateScore(cards) {
    let score = 0;
    let aces = 0;
    
    for (let card of cards) {
        score += getCardValue(card);
        if (card.value === 'A') aces++;
    }
    
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

function dealCard(toPlayer) {
    const card = deck.pop();
    if (toPlayer) {
        playerCards.push(card);
    } else {
        dealerCards.push(card);
    }
    return card;
}

function getCardBackgroundPosition(card) {
    const pos = cardPositionMap[card.value];
    const x = -(pos.col * 88);
    const y = -(pos.row * 124);
    return `${x}px ${y}px`;
}

function getCardImageUrl(card) {
    return `assets/Cards/${card.suit}-88x124.png`;
}

function renderCard(card, container, isHidden = false) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    
    if (isHidden) {
        cardEl.classList.add('card-back');
    } else {
        cardEl.style.backgroundImage = `url(${getCardImageUrl(card)})`;
        cardEl.style.backgroundPosition = getCardBackgroundPosition(card);
    }
    
    container.appendChild(cardEl);
}

function renderChips() {
    const container = document.getElementById('chips-container');
    container.innerHTML = '';
    
    chipValues.forEach((value, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'chip-wrapper';
        
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.style.backgroundPosition = `-${chipPositions[index].x * 64}px -${chipPositions[index].y * 72}px`;
        chip.addEventListener('click', () => placeBet(value));
        
        const chipValue = document.createElement('span');
        chipValue.className = 'chip-value';
        chipValue.textContent = `$${value}`;
        
        wrapper.appendChild(chip);
        wrapper.appendChild(chipValue);
        container.appendChild(wrapper);
    });
}

function placeBet(amount) {
    if (gameActive) return;
    if (balance >= amount) {
        balance -= amount;
        currentBet += amount;
        updateDisplay();
    }
}

function clearBet() {
    if (gameActive) return;
    balance += currentBet;
    currentBet = 0;
    updateDisplay();
}

function updateDisplay() {
    document.getElementById('balance').textContent = balance;
    document.getElementById('current-bet').textContent = currentBet;
    document.getElementById('player-score').textContent = calculateScore(playerCards);
    
    if (dealerHideCard && dealerCards.length > 0) {
        const visibleCards = dealerCards.slice(1);
        document.getElementById('dealer-score').textContent = `? + ${calculateScore(visibleCards)}`;
    } else {
        document.getElementById('dealer-score').textContent = calculateScore(dealerCards);
    }
}

function showMessage(msg) {
    document.getElementById('message').textContent = msg;
}

function startGame() {
    if (currentBet <= 0) {
        showMessage('Por favor coloca una apuesta primero!');
        return;
    }
    
    createDeck();
    playerCards = [];
    dealerCards = [];
    gameActive = true;
    dealerHideCard = true;
    
    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';
    showMessage('');
    
    dealCard(true);
    dealCard(false);
    dealCard(true);
    dealCard(false);
    
    playerCards.forEach(card => renderCard(card, document.getElementById('player-cards')));
    renderCard(dealerCards[0], document.getElementById('dealer-cards'), true);
    for (let i = 1; i < dealerCards.length; i++) {
        renderCard(dealerCards[i], document.getElementById('dealer-cards'));
    }
    
    updateDisplay();
    
    document.getElementById('start-btn').disabled = true;
    document.getElementById('hit-btn').disabled = false;
    document.getElementById('stand-btn').disabled = false;
    document.getElementById('clear-bet').disabled = true;
    
    if (calculateScore(playerCards) === 21) {
        endGame('¡Black Jack! ¡Ganaste! 🎉', 2.5);
    }
}

function hit() {
    if (!gameActive) return;
    
    const card = dealCard(true);
    renderCard(card, document.getElementById('player-cards'));
    updateDisplay();
    
    if (calculateScore(playerCards) > 21) {
        endGame('¡Te pasaste! Perdiste 😢', 0);
    }
}

function stand() {
    if (!gameActive) return;
    
    gameActive = false;
    dealerHideCard = false;
    
    document.getElementById('dealer-cards').innerHTML = '';
    dealerCards.forEach(card => renderCard(card, document.getElementById('dealer-cards')));
    updateDisplay();
    
    while (calculateScore(dealerCards) < 17) {
        const card = dealCard(false);
        renderCard(card, document.getElementById('dealer-cards'));
        updateDisplay();
    }
    
    const playerScore = calculateScore(playerCards);
    const dealerScore = calculateScore(dealerCards);
    
    if (dealerScore > 21) {
        endGame('¡El croupier se pasó! Ganaste 🎉', 2);
    } else if (playerScore > dealerScore) {
        endGame('¡Ganaste! 🎉', 2);
    } else if (playerScore < dealerScore) {
        endGame('¡Perdiste! 😢', 0);
    } else {
        endGame('¡Empate! 🤝', 1);
    }
}

function endGame(msg, multiplier) {
    gameActive = false;
    dealerHideCard = false;
    
    document.getElementById('dealer-cards').innerHTML = '';
    dealerCards.forEach(card => renderCard(card, document.getElementById('dealer-cards')));
    
    balance += Math.floor(currentBet * multiplier);
    if (balance <= 0) {
        balance = 50;
        showMessage('¡Te quedaste sin dinero! Reiniciaste el juego con 50 dólares.');
    }
    currentBet = 0;
    
    updateDisplay();
    showMessage(msg);
    
    document.getElementById('start-btn').disabled = false;
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;
    document.getElementById('clear-bet').disabled = false;
}

function init() {
    renderChips();
    updateDisplay();
    
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('hit-btn').addEventListener('click', hit);
    document.getElementById('stand-btn').addEventListener('click', stand);
    document.getElementById('clear-bet').addEventListener('click', clearBet);
}

init();
