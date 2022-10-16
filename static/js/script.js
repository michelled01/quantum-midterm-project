let board = document.querySelector(".board")
let player = document.querySelector(".player")
let playAgain = document.querySelector(".playAgain")
let restart = document.querySelector(".restart")
let box = 0
let winningArray = [[0,1,2,3],[4,5,6,7],[8,9,10,11],[12,13,14,15],
                    [0,4,8,12],[1,5,9,13],[2,6,10,14],[3,7,11,15],
                    [0,5,10,15],[3,6,9,12]];
let currentPlayer = 1
document.addEventListener("DOMContentLoaded", loadDOM)

class Qubit {

    zeroCell;
    oneCell;
    owner;

    constructor() {
        this.zeroCell = -1
        this.oneCel = -1
        this.owner = 0
    }    

}

let qubits = new Array(6)

let currentMove = -1
let cellsToSelect = 0
let selected = []

//load dom function
function loadDOM() {
    player.innerHTML = currentPlayer

    for(i=0; i<qubits.length; i++) {
        qubits[i] = new Qubit();
    }

    playAgain.addEventListener("click", reset)
}




function moveType(typeID) {

    currentMove = typeID;

    if(typeID==1) {
        cellsToSelect = 2;
    }

}

function resetMove() {
    currentMove = -1
    cellsToSelect = 0
    selected = []
}

function addQubit() {

    if(document.querySelector("#cell" + selected[0]).className != "cell" || document.querySelector("#cell" + selected[1]).className != "cell") {
        alert("To add a qubit, select empty spaces")
        resetMove()
        return
    }

    qubitIndex = -1

    for(i=0; i<qubits.length; i++) {
        if(qubits[i].owner===0) {
            qubitIndex = i
            break
        }
    }

    if(qubitIndex === -1) {
        alert("no qubits available, choose a different move type")
        resetMove()
        return
    }

    q = qubits[qubitIndex]

    q.zeroCell = selected[0]
    q.oneCell = selected[1]
    q.owner = currentPlayer

    class_name = q.owner==1 ? "player1_superpos" : "player2_superpos"
    document.querySelector("#cell"+q.zeroCell).className = class_name
    document.querySelector("#cell"+q.oneCell).className = class_name

    axios.post('/quantum', {
        params: {
            qubitIndex,
        }
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        console.log(res.data);
    })
    .catch(err => console.error(err));


}

function selectCell(cell) {

    console.log("cell number" + cell.toString());

    if(currentMove === -1) {
        alert("select a move type!")
        return
    }

    selected.push(cell)
    cellsToSelect -= 1

    if(cellsToSelect === 0) { //last remaining cell

        if(currentMove === 1) {
            addQubit()
            if(currentMove === -1) {
                return
            }
        }

        if(currentPlayer === 1) {
            currentPlayer = 2
        } else {
            currentPlayer = 1
        }

        currentMove = -1
        selected = []
        player.innerHTML = currentPlayer
        

    }
        
    if (box === 42) {
        setTimeout(() => alert("boxes filled"), 300)
        setTimeout(() => restart.style.display = "flex", 500)
    }
}

//the checkWon function
function checkWon() {
    // let cell = document.querySelectorAll(".board div")
    for (let y = 0; y < winningArray.length; y++) {
        let square = winningArray[y]
        if (square.every(q => document.querySelector("#cell" + q).classList.contains("player1"))) {
            setTimeout(() => alert("player one (red) wins"), 200)
            setTimeout(() => {reset()}, "1000")
        } else if (square.every(q => document.querySelector("#cell" + q).classList.contains("player2"))) {
            setTimeout(() => alert("player two (blue) wins"), 200)
            setTimeout(() => reset(), 1000)
        }
    }
}
function reset() {
    for (let i = 0; i < 16; i++) {        
        document.querySelector("#cell" + i).className = "cell";

    }
    
    qubits = new Array(6)

    currentMove = -1
    cellsToSelect = 0
    selected = []

    loadDOM()
}
