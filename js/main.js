'use strict'

var gMINE_IMG = '💥';
var gFlAG_IMG = '🚩';
var gPLAYER_IMG = '😀';
var gWINNER_IMG = '🥳';
var gLOSER_IMG = '😵';

// object by which the board size is set

var gLevels = [
    {
        SIZE: 4,
        MINES: 2
    },
    {
        SIZE: 8,
        MINES: 12
    },
    {
        SIZE: 12,
        MINES: 13
    },
]

// var gLevel = gLevels[0];
var gLevel;

//A Matrix containing cell objects: Each cell:
// { minesAroundCount: 4, isShown: true, isMine: false, isMarked: true }
var gBoard;

// keep and update the current game state: isOn: Boolean, when true we let the user play shownCount: 
//How many cells are shown markedCount: How many cells are marked (with a flag)
//secsPassed: How many seconds passed
var gGame = {};

var gIntervalStoper;

function initGame(level = 0) {
    gGame = createGGame();
    gLevel = gLevels[level];
    changeSmiley(gPLAYER_IMG);
    gBoard = buildBoard();
    renderBoard(gBoard);
    updateLives();
    if (gIntervalStoper) clearInterval(gIntervalStoper);
}

//Builds the board - Set mines at random locations Call setMinesNegsCount() Return the created board
function buildBoard() {
    var board = createMat(gLevel.SIZE, gLevel.SIZE);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false };
            board[i][j] = cell;
        }
    }
    // setting the mines randomly
    for (var i = 0; i < gLevel.MINES; i++) {
        setMineOnBoard(board);
    }
    setMinesNegsCount(board);
    return board;
}

function createGGame() {
    return {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        markedMinesCount: 0,
        revealedMinesCount: 0,
        secsPassed: 0,
        lifeLeft: 3
    }
}


function setMineOnBoard(board) {
    var emptyCells = getEmptyCells(board);
    var randNum = getRandomIntInclusive(0, emptyCells.length - 1);
    var randPos = emptyCells[randNum];
    board[randPos.i][randPos.j].isMine = true;
}

function getEmptyCells(board) {
    var emptyCells = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = board[i][j];
            if (!currCell.isMine) {
                emptyCells.push({ i, j });
            }
        }
    }
    return emptyCells;
}

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var pos = { i, j };
            var NegsNums = countNegs(board, pos);
            board[i][j].minesAroundCount = NegsNums;
        }
    }
}

// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = '';
    // change to general size
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = board[i][j];
            var cellCont = '';
            if (currCell.isMine) {
                cellCont = 'mine';
            }
            else if (currCell.minesAroundCount > 0) cellCont = 'number';
            else cellCont = 'empty';
            var tdId = 'cell-' + i + '-' + j;
            strHTML += `<td id="${tdId}" class="${cellCont}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,event,${i},${j})"></td>`
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (!gIntervalStoper) startTime();
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return;
    else {
        // if (elCell.id = "mine") gGame.revealedMinesCount++;
        renderCellClicked(elCell, i, j);
        checkGameOver();
    }
    return;
}

function renderCellClicked(elCell, i, j) { // for now this is only then cell is clicked
    var strHTML = '';
    if (elCell.className === 'mine') {
        strHTML = gMINE_IMG;
        gGame.revealedMinesCount++;
        gGame.lifeLeft--;
        updateLives();
    } else if (elCell.className === 'number') {
        strHTML = gBoard[i][j].minesAroundCount;
    } else {
        strHTML = ''
        expandShown(gBoard, { i, j })
    }
    // elCell.innerHTML = elCell.id;
    elCell.innerHTML = strHTML;
    gBoard[i][j].isShown = true;
    // elCell.classList.add("shown"); /// to check it later******
    changeColorNumber(elCell);
    disableCell(elCell);
}

function renderCell(i, j) { // for now this is only then cell is clicked
    var currCell = gBoard[i][j];
    var strHTML = '';
    if (currCell.isMine) strHTML = gMINE_IMG;
    else if (currCell.minesAroundCount > 0) strHTML = currCell.minesAroundCount;
    else strHTML = '';
    var elCell = document.querySelector(getSelector({ i, j }))
    elCell.innerHTML = strHTML; /// to cahnge it
    gBoard[i][j].isShown = true;
    changeColorNumber(elCell);
    disableCell(elCell);
}

// Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide 
///the context menu on right click
function cellMarked(elCell, e, i, j) {
    e.preventDefault();
    checkGameOver();
    if (!gBoard[i][j].isShown) {
        if (!gBoard[i][j].isMarked) {
            elCell.innerHTML = gFlAG_IMG;
            gGame.markedCount++;
            if (gBoard[i][j].isMine) gGame.markedMinesCount++;
        }
        else {
            elCell.innerHTML = '';
            gGame.markedCount--;
            if (gBoard[i][j].isMine) gGame.markedMinesCount--;
        }
    }
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
}

//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    // lose - clicking on mine - all mines should reveal
    if (gGame.revealedMinesCount === 3) {
        clearInterval(gIntervalStoper);
        console.log('You lost!')
        revealAllMines();
        changeSmiley(gLOSER_IMG);
        gGame.isOn = false;
        return true; 
    }
    // win - all the mines are flagged, and all the other cells are shown
    else if ((gGame.markedMinesCount + gGame.revealedMinesCount) === gLevel.MINES && checkIfAllShown()) {
        clearInterval(gIntervalStoper);
        console.log('You Won!') 
        changeSmiley(gWINNER_IMG);
        return true;
    }
    return false;
}

function revealAllMines() {
    var elCells = document.querySelectorAll(".mine");
    for (var i = 0; i < gLevel.MINES; i++) {
        var elCell = elCells[i];
        elCell.innerHTML = gMINE_IMG;
        changeColorNumber(elCell);
        disableCell(elCell);
    }
}

// When user clicks a cell with no mines around, we need to open not only that cell, 
//but also its neighbors. (basic -1st degreee neighbors)
function expandShown(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (i === pos.i && j === pos.j) continue;
            if (board[i][j].isMarked) continue;
            renderCell(i, j);
            disableCell(document.querySelector(getSelector({ i, j })))
        }
    }
    return;
}

function changeColorNumber(elCell) {
    elCell.style.backgroundColor = 'rgb(240, 190, 175)';
}

function disableCell(elCell) {
    elCell.onclick = '';
    //to remove hober
    elCell.classList.add('disabled');
}

function changeSmiley(img) {
    var elImg = document.querySelector('.smileyReset');
    elImg.innerHTML = `${img}`;
}

function countTime() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = gGame.secsPassed + ' SEC';
}
function startTime() {
    gIntervalStoper = setInterval(function () {
        gGame.secsPassed++;
        countTime();
    }, 1000)
}

function updateLives() {
    var elLives = document.querySelector('.lives');
    elLives.innerText = gGame.lifeLeft + ' LIVES';
}

