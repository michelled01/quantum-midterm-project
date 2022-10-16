let board = document.querySelector(".board")
let player = document.querySelector(".player")
let playAgain = document.querySelector(".playAgain")
let restart = document.querySelector(".restart")
let box = 0
let winningArray = [];
let currentPlayer = 1
document.addEventListener("DOMContentLoaded", loadDOM)

//load dom function
function loadDOM() {
    player.innerHTML = currentPlayer
    // playAgain.addEventListener("click", reset)
    // var cell = document.getElementsByClassName('cell');
    // Array.from(cell).forEach(square => {
    //     square.addEventListener("click", selectCell)
    // })
}

function selectCell(cell) {
    console.log("cell number" + cell.toString());
    // pass the cell number to Python
    axios.post('/quantum', {
        params: {
            cell,
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

        
    if (currentPlayer === 1) {
        // alert("current player is 1")
        currentPlayer = 2
        player.innerHTML = currentPlayer
        var myid = "#cell" + cell;
        document.querySelector(myid).className = "player1";
        console.log(this)
        // checkWon()
    } else if (currentPlayer === 2) {
        // alert("current player is 2")
        currentPlayer = 1
        player.innerHTML = currentPlayer
        var myid = "#cell" + cell;
        document.querySelector(myid).className = "player2";
        // checkWon()
    }
    if (box === 42) {
        setTimeout(() => alert("boxes filled"), 300)
        setTimeout(() => restart.style.display = "flex", 500)
    }
}

//the checkWon function
function checkWon() {
    let cell = document.querySelectorAll(".board div")
    for (let y = 0; y < winningArray.length; y++) {
        let square = winningArray[y]
        if (square.every(q => cell[q].classList.contains("player-one"))) {
            setTimeout(() => alert("player one(red) wins "), 200)
            setTimeout(() => restart.style.display = "flex", 500)
        } else if (square.every(q => cell[q].classList.contains("player-two"))) {
            setTimeout(() => alert("player two(yellow) wins"), 200)
            setTimeout(() => restart.style.display = "flex", 500)
        }
    }
}
function reset() {
    board.innerHTML = ""
    loadDOM()
    restart.style.display = "none"
}
