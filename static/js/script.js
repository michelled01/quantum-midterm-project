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

//load dom function
function loadDOM() {
    player.innerHTML = currentPlayer
    playAgain.addEventListener("click", reset)
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
        currentPlayer = 2
        player.innerHTML = currentPlayer
        var myid = "#cell" + cell;
        document.querySelector(myid).className = "player1";
        checkWon()
    } else if (currentPlayer === 2) {
        currentPlayer = 1
        player.innerHTML = currentPlayer
        var myid = "#cell" + cell;
        document.querySelector(myid).className = "player2";
        checkWon()
    }
    if (box === 16) {
        setTimeout(() => alert("boxes filled"), 300)
        reset()
    }
}

//the checkWon function
function checkWon() {
    // let cell = document.querySelectorAll(".board div")
    for (let y = 0; y < winningArray.length; y++) {
        let square = winningArray[y]
        if (square.every(q => document.querySelector("#cell" + q).classList.contains("player1"))) {
            setTimeout(() => alert("player one (red) wins"), 200)
            setTimeout(() =>  {reset()}, "1000")
        } else if (square.every(q => document.querySelector("#cell" + q).classList.contains("player2"))) {
            setTimeout(() => alert("player two (blue) wins"), 200)
            setTimeout(() =>  {reset()}, "1000")
        }
    }
}
function reset() {
    for (let i = 0; i < 16; i++) {        
        var myid = "#cell" + i;
        document.querySelector(myid).className = "cell";
    }
    loadDOM()
}
