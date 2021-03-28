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
        SIZE: 4,
        MINES: 2
    },
    {
        SIZE: 8,
        MINES: 12 /// cahnge to 12
    },
    {
        SIZE: 12,
        MINES: 13
    },
]

var gLevel;
var glastLevelIdx;

//A Matrix containing cell objects: Each cell:
// { minesAroundCount: 4, isShown: true, isMine: false, isMarked: true }
var gBoard;

// keep and update the current game state: isOn: Boolean, when true we let the user play shownCount: 
//How many cells are shown markedCount: How many cells are marked (with a flag)
//secsPassed: How many seconds passed
var gGame = {};

var gIntervalStoper;

var gIsClue = false;

function initGame(levelIdx = 0) {
    gGame = createGGame();
    gLevel = gLevels[levelIdx];
    glastLevelIdx = levelIdx;
    changeSmiley(gPLAYER_IMG);
    gBoard = buildBoard();
    renderBoard(gBoard);
    renderLives();
    clearInterval(gIntervalStoper);
    renderTime();
    renderclues();
}

function smileyReset() {
    initGame(glastLevelIdx)
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
        lifeLeft: 3,
        cluesLeft: 3,
        gameOver: false
    }
}

function countNegs(mat, pos) {
    var count = 0;
    if (mat[pos.i][pos.j].isMine) return -1;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= mat[0].length) continue;
            if (i === pos.i && j === pos.j) continue;
            var cell = mat[i][j];
            if (cell.isMine) count++;
        }
    }
    return count;
}

// function SetMinesNegsAfterClick(clickPos){
function SetMinesNegsAfterClick(board, posClick) {
    for (var i = 0; i < gLevel.MINES; i++) {
        // setMineOnBoard(gBoard,clickPos);
        setMineOnBoard(board, posClick);
    }
    setMinesNegsCount(board);
}

function setMineOnBoard(board, posClick) {
    var emptyCells = getEmptyCells(board, posClick);
    var randNum = getRandomIntInclusive(0, emptyCells.length - 1);
    var randPos = emptyCells[randNum];
    board[randPos.i][randPos.j].isMine = true;

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
            var tdId = 'cell-' + i + '-' + j;
            var cellCont = '';
            var className = '';
            if (currCell.isMine) className = 'mine ';
            if (currCell.isShown) {
                className += 'shown';
                if (currCell.isMine) {
                    cellCont = gMINE_IMG;
                }
                else if (currCell.minesAroundCount > 0) {
                    cellCont = currCell.minesAroundCount;
                }
            } else {
                className += 'unShown';
                if (currCell.isMarked) cellCont = gFlAG_IMG;
            }
            strHTML += `<td id="${tdId}" class="${className}" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(this,${i},${j})">${cellCont}</td>`

        }
        strHTML += '</tr>\n';
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}
function showClue() {
    if(gGame.cluesLeft > 0) gIsClue = true;
}

// Called when a cell (td) is clicked
function cellClicked(elCell, i, j) {
    if (gBoard[i][j].isShown || gBoard[i][j].isMarked) return;
    if (!gGame.isOn) {
        if (gGame.gameOver) return;
        startTime();
        gGame.isOn = true;
        SetMinesNegsAfterClick(gBoard, { i, j });
    }
    if (gIsClue) {
        var saveShown = expandClue(gBoard, { i, j }); //set clue
        renderBoard(gBoard);
        gIsClue = false;
        expandClueHide(saveShown, gBoard, { i, j }); //hide clue
        setTimeout(renderBoard, 1000, gBoard);
        gGame.cluesLeft--;
        renderclues();
        return;
    }
    gBoard[i][j].isShown = true;
    if (gBoard[i][j].isMine) {
        gGame.revealedMinesCount++;
        gGame.lifeLeft--;
        renderLives();
    }
    if (gBoard[i][j].minesAroundCount === 0) {
        expandShown(gBoard, { i, j });
    }
    renderBoard(gBoard);
    gGame.gameOver = checkGameOver();
    return;
}


// Called on right click to mark a cell 
// function cellMarked(elCell, e, i, j) {
function cellMarked(elCell, i, j) {
    if (!gGame.isOn) {
        if (gGame.gameOver) return;
        // if (gGame.lifeLeft === 0 && gGame.gameOver) return;
        startTime();
        gGame.isOn = true;
        SetMinesNegsAfterClick(gBoard, { i, j });
        disableCell(document.querySelector(getSelector({ i, j })));
    }
    if (!gBoard[i][j].isShown) {
        if (!gBoard[i][j].isMarked) {
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
    renderBoard(gBoard)
    gGame.gameOver = checkGameOver();
}

//Game ends when all mines are marked, and all the other cells are shown
function checkGameOver() {
    // lose - clicking on mine - all mines should reveal
    if (gGame.revealedMinesCount === 3) {
        clearInterval(gIntervalStoper);
        console.log('You lost!');
        revealAllMines();
        changeSmiley(gLOSER_IMG);
        gGame.isOn = false;
        return true;
    }
    // win - all the mines are flagged, and all the other cells are shown
    else if ((gGame.markedMinesCount + gGame.revealedMinesCount) === gLevel.MINES && checkIfAllShown()) {
        clearInterval(gIntervalStoper);
        console.log('You Won!');
        changeSmiley(gWINNER_IMG);
        gGame.isOn = false;
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
    }
}

// When user clicks a cell with no mines around, we need to open not only that cell, 
//but also its neighbors. (basic -1st degreee neighbors)
function expandShown(board, pos) {
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (board[i][j].isMarked) continue;
            gBoard[i][j].isShown = true;
        }
    }
    return;
}

function expandClue(board, pos) {
    var saveShown = [];
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (gBoard[i][j].isShown || gBoard[i][j].isMarked) {
                saveShown.push({ i, j })
            }
            board[i][j].isShown = true;
        }
    }
    return saveShown;
}

function expandClueHide(saveShown, board, pos) {
    console.log(saveShown);
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            board[i][j].isShown = false;
        }
    }
    for (var m = 0; m < saveShown.length; m++) {
        var pos = saveShown[m];
        console.log(pos)
        console.log(m)
        if (board[pos.i][pos.j].isMarked) board[pos.i][pos.j].isShown = false;
        else board[pos.i][pos.j].isShown = true;
    }
    return;
}

function changeColorNumber(elCell) {
    elCell.style.backgroundColor = 'rgb(240, 190, 175)';
}

function changeSmiley(img) {
    var elImg = document.querySelector('.smileyReset');
    elImg.innerHTML = `${img}`;
}

function renderTime() {
    var elTimer = document.querySelector('.timer');
    elTimer.innerText = gGame.secsPassed + ' SEC';
}
function startTime() {
    gIntervalStoper = setInterval(function () {
        gGame.secsPassed++;
        renderTime();
    }, 1000)
}

function renderLives() {
    var elLives = document.querySelector('.lives');
    elLives.innerText = gGame.lifeLeft + ' LIVES';
}

function renderclues() {
    var elLives = document.querySelector('.clues');
    elLives.innerText = gGame.cluesLeft + ' CLUES';
}