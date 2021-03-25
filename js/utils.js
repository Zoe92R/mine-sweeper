'use strict'


function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}


function countNegs(mat, pos) {
    var count = 0
    if (mat[pos.i][pos.j].isMine) return -1
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= mat.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (j < 0 || j >= mat[0].length) continue
            if (i === pos.i && j === pos.j) continue
            var cell = mat[i][j]
            if (cell.isMine) count++
        }
    }
    return count;
}



    // function getRandomPos() {
    //     var i = getRandomIntInclusive(0, gLevel.SIZE - 1);
    //     var j = getRandomIntInclusive(0, gLevel.SIZE - 1);
    //     return { i, j };
    // }

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

    function checkIfAllShown() {
        var NotShown = []
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

// function renderCellMine() {
//     var elCells = document.querySelectorAll("#mine");
//     for (var i = 0 ; i <gLevel.MINES ; i++){
//         console.log(i)
//        elCells[i].innerHTML = gMINE_IMG; 
//     }
//   }

function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j;
}

function getEmptyCells(checkFor) {
    var emptyCells = []
    for (var i = 1; i < gBoard.length - 1; i++) {
        for (var j = 1; j < gBoard[0].length - 1; j++) {
            var currCell = gBoard[i][j];
            if (currCell === checkFor) {
                emptyCells.push({ i, j });
            }
        }
    }
    return emptyCells;
}
