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
let column = [0,1,2,3] // the lowest available cells in each column

class Qubit {

    zeroCell;
    oneCell;
    owner;
    entangled;

    constructor() {
        this.zeroCell = -1
        this.oneCel = -1
        this.owner = 0
        this.entangled = -1
    }    

}

let qubits = new Array(6)

let currentMove = -1
let cellsToSelect = 0
let selected = []

// load dom function
function loadDOM() {
    player.innerHTML = currentPlayer

    for(i=0; i<qubits.length; i++) {
        qubits[i] = new Qubit();
    }

    playAgain.addEventListener("click", reset)
}

function moveType(typeID) {

    currentMove = typeID;
    selected = []

    if(typeID===-1) {
        cellsToSelect = 0;
    } else if(typeID===1) {
        cellsToSelect = 2;
    } else if(typeID===2) {
        cellsToSelect = 1;
    } else if(typeID>=3 && typeID<=5) {
        cellsToSelect = 1;
    } else if(typeID===6) {
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

    //var zeroLowestCell = column[selected[0]%4]
    //column[selected[0]%4] += 4
    //var oneLowestCell = column[selected[1]%4]
    //column[selected[1]%4] += 4

    q.zeroCell = selected[0]
    q.oneCell = selected[1]
    q.owner = currentPlayer

    class_name = q.owner==1 ? "player1_superpos" : "player2_superpos"

    document.querySelector("#cell"+q.zeroCell).className = class_name
    document.querySelector("#cell"+q.oneCell).className = class_name
    
    document.querySelector("#cell" + q.zeroCell).innerHTML = "&lt;0&gt;<sub>" + qubitIndex + "</sub>"
    document.querySelector("#cell" + q.oneCell).innerHTML = "&lt;1&gt;<sub>" + qubitIndex + "</sub>"
    

    axios.post('/initializeQubit', {
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

function measureQubit() {

    qubitIndex = -1

    for(i=0; i<qubits.length; i++) {
        if(qubits[i].owner==currentPlayer && (qubits[i].zeroCell===selected[0] || qubits[i].oneCell===selected[0])) {
            qubitIndex = i
            break
        }
    }

    if(qubitIndex === -1) {
        alert("cannot measure something which is not your qubit")
        resetMove()
        return
    }


    q = qubits[qubitIndex];
    result = -1

    axios.post('/measureQubit', {
        params: {
            qubitIndex,
        }
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        result = res.data

        playerName = q.owner==1 ? "player1" : "player2"
    
        document.querySelector("#cell" + q.zeroCell).className = result==0 ? playerName : "cell";
        document.querySelector("#cell" + q.oneCell).className = result==1 ? playerName : "cell";
        
        document.querySelector("#cell" + q.zeroCell).innerHTML = ""
        document.querySelector("#cell" + q.oneCell).innerHTML = ""

        qubits[qubitIndex] = new Qubit();
        checkWon()
    })
    .catch(err => console.error(err));

    

}

function gate(gateID) { //0 = X, 1 = Z, 2 = H

    qubitIndex = -1

    for(i=0; i<qubits.length; i++) {
        if(qubits[i].owner==currentPlayer && (qubits[i].zeroCell===selected[0] || qubits[i].oneCell===selected[0])) {
            qubitIndex = i
            break
        }
    }

    if(qubitIndex === -1) {
        alert("cannot apply a gate to something which is not your qubit")
        resetMove()
        return
    }
    

    axios.post('/applyGate', {
        params: {
            qubitIndex,
            gateID,
        }
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        console.log(res.data)
    })
    .catch(err => console.error(err));

}

function cnot() {

    controlIndex = -1

    for(i=0; i<qubits.length; i++) {
        if(qubits[i].zeroCell===selected[0] || qubits[i].oneCell===selected[0]) {
            controlIndex = i
            break
        }
    }

    if(controlIndex === -1) {
        alert("the control must be a valid qubit")
        resetMove()
        return
    }

    targetIndex = -1;

    for(i=0; i<qubits.length; i++) {
        if(qubits[i].owner==currentPlayer && (qubits[i].zeroCell===selected[1] || qubits[i].oneCell===selected[1])) {
            targetIndex = i
            break
        }
    }

    if(targetIndex === -1) {
        alert("the target must be one of your qubits")
        resetMove()
        return
    }

    if(controlIndex === targetIndex) {
        alert("the target and control cannot be the same qubit")
        resetMove()
        return
    }

    control = qubits[controlIndex]
    target = qubits[targetIndex]

    if((control.entangled!=-1 && control.entangled!=targetIndex) || (target.entangled!=-1 && target.entangled!=controlIndex)) {
        alert("cannot entangle qubits already in an entangled state")
        resetMove()
        return
    }

    control.entangled = targetIndex
    target.entangled = controlIndex

    axios.post('/cnot', {
        params: {
            controlIndex,
            targetIndex
        }
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        console.log(res.data)
    })
    .catch(err => console.error(err));

}

function selectCell(cell) {

    //console.log("cell number" + cell.toString());

    if(currentMove === -1) {

        var myCell = document.querySelector("#cell" + cell)

        if((myCell.className.includes("player2") && currentPlayer === 1) || (myCell.className.includes("player1") && currentPlayer === 2)) {
            alert("cannot add something at an occupied position")
            resetMove()
            return
        }
        
        //var lowestCell = column[cell%4]
        if (myCell.className == "cell") {
            if (currentPlayer === 1) {
                currentPlayer = 2
                player.innerHTML = currentPlayer
                myCell.className = "player1";
                box+=1
                checkWon()
            } else if (currentPlayer === 2) {
                currentPlayer = 1
                player.innerHTML = currentPlayer
                myCell.className = "player2";
                box+=1
                checkWon()
            }
            if (box === 16) {
                setTimeout(() => alert("boxes filled"), 300)
                setTimeout(() => reset(), 1000)
            }
            //column[cell%4] += 4
        }
        return
    }

    selected.push(cell)
    cellsToSelect -= 1

    if(cellsToSelect === 0) { // last remaining cell

        if(currentMove === 1) {
            addQubit()
            if(currentMove === -1) {
                return
            }
        } else if(currentMove === 2) {
            measureQubit()
            if(currentMove === -1) {
                return
            }
        } else if(currentMove >= 3 && currentMove <= 5) {
            gate(currentMove-3)
            <1>0
            
            if(currentMove === -1) {
                return
            }
        } else if(currentMove === 6) {
            cnot()
            if(currentMove === -1) {
                return
            }
        }

        console.log("player " + currentPlayer)

        if(currentPlayer === 1) {
            currentPlayer = 2
        } else {
            currentPlayer = 1
        }

        console.log("player " + currentPlayer)

        currentMove = -1
        selected = []
        player.innerHTML = currentPlayer
        
        //document.querySelector("circuit").src = "static/images/circuit.png?" + new Date().getTime()
    }
        
    if (box === 16) {
        setTimeout(() => alert("boxes filled"), 300)
        setTimeout(() => reset(), 1000)
    }
}

// check for any winning positions
function checkWon() {
    // let cell = document.querySelectorAll(".board div")
    for (let y = 0; y < winningArray.length; y++) {
        let square = winningArray[y]
        if (square.every(q => document.querySelector("#cell" + q).classList.contains("player1"))) {
            setTimeout(() => alert("player one (red) wins"), 200)
            setTimeout(() => reset(), 1000)
        } else if (square.every(q => document.querySelector("#cell" + q).classList.contains("player2"))) {
            setTimeout(() => alert("player two (blue) wins"), 200)
            setTimeout(() => reset(), 1000)
        }
    }
}
function reset() {
    for (let i = 0; i < 16; i++) {        
        document.querySelector("#cell" + i).className = "cell";
        document.querySelector("#cell" + i).innerHTML = "";
    }
    
    qubits = new Array(6)

    currentMove = -1
    cellsToSelect = 0
    selected = []

    loadDOM()
}
