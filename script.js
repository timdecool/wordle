const container = document.querySelector(".container");
const scoreZone = document.querySelector(".score");
scoreZone.innerHTML = "<span class='scoreFigure'>0</span> pts";

let dicoMotsTrouvables = [];
let dicoMotsValides = [];
let word = "";
let score = 0;

let currentLine = 0;
let currentUserWord = '';
let foundLetters = [];

// Bouton
const playBtn = document.querySelector(".playBtn");
playBtn.addEventListener('click', resetGame);


/// FONCTIONS JEU
document.addEventListener('keydown', ajouterLettre);

function ajouterLettre(e) {
    // Si la touche appuyée n'est pas une lettre, ne rien faire (sauf si c'est un backspace pour retirer la dernière lettre entrée)
    if(!e.key.match(/^[a-z]$/)) {
        e.preventDefault();
        if(e.key == "Backspace" && currentUserWord.length > 0) {
            currentUserWord = currentUserWord.substring(0, currentUserWord.length-1);
        } 
        else if(e.key == "Enter" && currentUserWord.length == 5) {
            verifierMot();
        }
    }
    else if(currentUserWord.length < 5) {
        currentUserWord += e.key.toUpperCase();
    }

    for (let i = 0; i < 5; i++) {
        container.firstElementChild.children[currentLine].children[i].textContent = currentUserWord[i] != undefined ? currentUserWord[i]:'';
    }
}

function verifierMot() {
    if(dicoMotsValides.indexOf(currentUserWord) > -1) {
        // Boucle pour les lettres bien placées
        for (let i = 0; i<5; i++) {
            if(currentUserWord[i] == word[i]) {
                container.firstElementChild.children[currentLine].children[i].classList.add("placed");
                foundLetters.push(currentUserWord[i]);
            }
        }

        // Boucle pour les lettres mal placées
        for (let i = 0; i<5; i++) {
            if (word.indexOf(currentUserWord[i]) > -1 && word.indexOf(currentUserWord[i]) != i) {
                let cptFL = 0;
                let cptWord = 0;
                for(let foundLetter of foundLetters) {
                    if (foundLetter == currentUserWord[i]) cptFL++;
                }
                for(let j=0; j<5; j++) {
                    if (word[j] == currentUserWord[i]) cptWord++;
                }

                if (cptFL < cptWord) {
                    container.firstElementChild.children[currentLine].children[i].classList.add("misplaced");
                    foundLetters.push(currentUserWord[i]);
                }
            }
        }

        if (word == currentUserWord) {
            score += Math.floor(5*(10-1.5*currentLine));
            scoreZone.innerHTML = `<span class='scoreFigure'>${score}</span> pts`;
            addToHistory(true);

        } else if(currentLine != 5){
            currentLine++;
            currentUserWord = '';
            foundLetters = [];
        }
        else {
            score = 0;
            scoreZone.innerHTML = `<span class='scoreFigure'>${score}</span> pts`;
            addToHistory(false);
        }
    }
}

const history = document.querySelector('.history');
function addToHistory(win) {
    const historyEntry = document.createElement('p');
    history.appendChild(historyEntry);
    historyEntry.textContent = win ? `${word} - ${Math.floor(5*(10-1.5*currentLine))} pts`:`${word} - 0 pts`;
    resetGame();
}

/// FONCTIONS RESET
function resetGame() {
    for(let i=0; i<6;i++) {
        for(let j=0;j<5;j++) {
            container.firstElementChild.children[i].children[j].textContent = "";
            if(container.firstElementChild.children[i].children[j].classList.contains('placed')) container.firstElementChild.children[i].children[j].classList.remove('placed');
            if(container.firstElementChild.children[i].children[j].classList.contains('misplaced')) container.firstElementChild.children[i].children[j].classList.remove('misplaced');
        }
    }
    currentLine = 0;
    currentUserWord = '';
    foundLetters = [];
    randomWord();
}


/// FONCTIONS LAYOUT
(function generateGameLayout() {
    const gameLayout = document.createElement("div");
    gameLayout.classList.add('gameLayout');
    container.appendChild(gameLayout);
    for(let i=0; i<6; i++) {
        const gameRow = document.createElement("div");
        gameRow.classList.add('gameRow');
        gameLayout.appendChild(gameRow);
        for(let j=0; j<5; j++) {
            const gameSlot = document.createElement("div");
            gameSlot.classList.add('gameSlot');
            gameRow.appendChild(gameSlot);
        }
        const scoreLine = document.createElement("div");
        gameRow.appendChild(scoreLine);
        scoreLine.classList.add('scoreline');
        scoreLine.innerHTML = `<span class='scoreFigure'>${Math.floor(5*(10-1.5*i))}</span>&nbsp;pts`;
    }
})();

/// FONCTIONS DICO
(async function importerFichierDico() {
    try {
        const reponse = await fetch('mots.txt');
        const contenu = await reponse.text();
    
        let lines = contenu.split('\n');
        lines = lines.map(line => line.replace ('\r', ''));
        lines = lines.map(line => retirerAccents(line).toUpperCase());
        lines = lines.filter(word => word.length == 5);
        dicoMotsValides = [...new Set(lines)];

        lines = lines.filter(word => word.at(-1) != "S" && word.at(-1) != "A" && word.at(-1) != "Z")
        dicoMotsTrouvables = [...new Set(lines)];
        randomWord();
        } catch(error) {
        console.error('Une erreur s\'est produite lors de l\'importation du fichier :', error);
    }
})();

function retirerAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function randomWord() {
    word = dicoMotsTrouvables[Math.floor(Math.random()*dicoMotsTrouvables.length)]; 
}

