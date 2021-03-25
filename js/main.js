'use strict'

var gMINE_IMG = '💥';
var gFlAG_IMG = '🚩';
var gPLAYER_IMG = '😀';
var gWINNER_IMG = '🥳';
var gLOSER_IMG = '😵';

// object by which the board size is set
// Is it should be array with 3 objects?
var gLevel = {
    SIZE: 4,
    MINES: 2
};

//A Matrix containing cell objects: Each cell:
// { minesAroundCount: 4, isShown: true, isMine: false, isMarked: true }
var gBoard;

// var gLevel = [];

// keep and update the current game state: isOn: Boolean, when true we let the user play shownCount: 
//How many cells are shown markedCount: How many cells are marked (with a flag)
//secsPassed: How many seconds passed
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    markedMinesCount: 0,
    revealedMinesCount: 0,
    secsPassed: 0,
    lifeLeft: 3
}

var gIntervalStoper;
//This is called when page loads
function initGame() {
    changeSmiley(gPLAYER_IMG);
    gBoard = buildBoard();
    renderBoard(gBoard);
}

//Builds the board - Set mines at random locations Call setMinesNegsCount() Return the created board
function buildBoard() {
    var board = createMat(4, 4);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = { minesAroundCount: 0, isShown: false, isMine: false, isMarked: false };
            board[i][j] = cell;
        }
    }
    // setting the mines randomly
    for (var i = 0; i < gLevel.MINES; i++) {
        console.log('mine number', i)
        setMineOnBoard(board);
    }
    setMinesNegsCount(board)
    return board;
}

function setMineOnBoard(board) {
    var emptyCells = getEmptyCells(board);
    var randNum = getRandomIntInclusive(0, emptyCells.length - 1);
    console.log('random num:', randNum);
    var randPos = emptyCells[randNum];
    console.log('pos:', randPos)
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
    console.log(emptyCells)
    return emptyCells;
}

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var pos = { i, j }
            var NegsNums = countNegs(board, pos);
            // console.log(i,j, ':' ,NegsNums);
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
            // if (currCell.isMine) cellCont = gMINE_IMG
            // else if (currCell.minesAroundCount > 0) cellCont = currCell.minesAroundCount
            // else cellCont = ''; //??
            // strHTML += `<td onclick="cellClicked(this,${i},${j})">${cellCont}</td>`
            // strHTML += `<td id="${cellCont}" onclick="cellClicked(this,${i},${j})"></td>` 
            // strHTML += `<td id="${cellCont}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,event,${i},${j})"></td>`
            strHTML += `<td id="${tdId}" class="${cellCont}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,event,${i},${j})"></td>`
        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return;
    else {
        // if (elCell.id = "mine") gGame.revealedMinesCount++;
        renderCellClicked(elCell, i, j);
        checkGameOver();
    }
    return;
}

function renderCellClicked(elCell, i, j) { // for now this is only then cell is clicked
    var strHTML = ''
    console.log('clickk!');
    if (elCell.className === 'mine') {
        strHTML = gMINE_IMG
        gGame.revealedMinesCount++
        console.log(gGame.revealedMinesCount)
        // gGame.lifeLeft--
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
    // elCell.classList.add("shown"); /// to check it later******
}

// Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide 
///the context menu on right click
function cellMarked(elCell, e, i, j) {
    e.preventDefault();
    if (!gBoard[i][j].isShown) {
        if (!gBoard[i][j].isMarked) {
            elCell.innerHTML = gFlAG_IMG;
            gGame.markedCount++;
            if (gBoard[i][j].isMine) gGame.markedMinesCount++
            // console.log('marked:',gGame.markedMinesCount);
        }
        else {
            elCell.innerHTML = '';
            gGame.markedCount--;
            if (gBoard[i][j].isMine) gGame.markedMinesCount--
        }
    }
    gBoard[i][j].isMarked = !gBoard[i][j].isMarked;
}

//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    console.log('checking if game over')
    // lose - clickef on mine - all mines ahould reveal
    if (gGame.revealedMinesCount === 1) { /// cahnge later to 3 ***** (to reveal the mines then the game is over)
        console.log('You lost!') /// to add an emojy *****
        revealAllMines();
        changeSmiley(gLOSER_IMG);
        gGame.isOn = false;
        return true; /// not sure I need it 
    }
    // win - all the mines are flagged, and all the other cells are shown
    else if ((gGame.markedMinesCount + gGame.revealedMinesCount) === gLevel.MINES && checkIfAllShown()) {
        console.log('You Won!') /// to add an emojy *****
        changeSmiley(gWINNER_IMG);
        return true;
    }
    return false;
}

function revealAllMines() {
    var elCells = document.querySelectorAll(".mine");
    for (var i = 0; i < gLevel.MINES; i++) {
        var elCell = elCells[i]
        elCell.innerHTML = gMINE_IMG;
        changeColorNumber(elCell);
        disableCell(elCell)
    }
}

// When user clicks a cell with no mines around, we need to open not only that cell, 
//but also its neighbors. (basic -1st degreee neighbors)
function expandShown(board, pos) { // i didn't used el cell
    console.log('hello')
    // var negs = []
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue
            if (i === pos.i && j === pos.j) continue
            renderCell(i, j);
            disableCell(document.querySelector(getSelector({ i, j })))
        }
    }
    return;
}

function changeColorNumber(elCell) {
    elCell.style.backgroundColor = 'rgb(218, 208, 212)';
}

function disableCell(elCell) {
    elCell.onclick = '';
    //to remove hober
    elCell.classList.add('disabled');
}

function changeSmiley(img) {
    var elImg = document.querySelector('.smileyTime');
    elImg.innerHTML = `${img}`;
}

function reset() {
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        markedMinesCount: 0,
        revealedMinesCount: 0,
        secsPassed: 0,
        lifeLeft: 3
    }
    initGame();
    

}

// function start() {
//     gIntervalStoper = setInterval(timeWatch, 1000)
// }
// function timeWatch() {
//     var elCount = document.querySelector('.smileyTime');
//     elCount.innerHTML = `<h4>${gGame.secsPassed}</h4>`
//     gGame.secsPassed++;
// }
