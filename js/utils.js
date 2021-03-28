'use strict'

function createMat(ROWS, COLS) {
    var mat = [];
    for (var i = 0; i < ROWS; i++) {
        var row = [];
        for (var j = 0; j < COLS; j++) {
            row.push('');
        }
        mat.push(row);
    }
    return mat;
}

//The maximum is inclusive and the minimum is inclusive
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function disableCell(elCell) {
    elCell.onclick = '';
    //to remove hober
    elCell.classList.add('disabled');
}

function getEmptyCells(board, posClick) {
    var emptyCells = [];
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = board[i][j];
            if (!(currCell.isMine) && !(i === posClick.i && j === posClick.j)) {
                emptyCells.push({ i, j });
            }
        }
    }
    return emptyCells;
}

function checkIfAllShown() {
    var NotShown = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j];
            if (!currCell.isShown && !currCell.isMine) {
                NotShown.push({ i, j });
            }
        }
    }
    return (NotShown.length === 0);
}

function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j;
}
