document.addEventListener('DOMContentLoaded', function() {
    var board,
        game = new Chess();
    var aiLevelElement = document.getElementById('aiLevel');
    var aiDepth = parseInt(aiLevelElement.value);

    var cfg = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onMouseoutSquare: onMouseoutSquare,
        onMouseoverSquare: onMouseoverSquare,
        onSnapEnd: onSnapEnd
    };
    board = ChessBoard('chessBoard', cfg);

    var stockfishWorker = new Worker('stockfish-worker.js');

    stockfishWorker.onmessage = function(event) {
        var line = event.data;
        if (line.includes('bestmove')) {
            var bestMove = line.split(' ')[1];
            game.move(bestMove);
            board.position(game.fen());
        }
    };

    aiLevelElement.addEventListener('change', function() {
        aiDepth = parseInt(this.value);
    });

    function onDragStart(source, piece, position, orientation) {
        if (game.in_checkmate() === true || game.in_draw() === true || piece.search(/^b/) !== -1) {
            return false;
        }
    }

    function onDrop(source, target) {
        var move = game.move({
            from: source,
            to: target,
            promotion: 'q'
        });

        if (move === null) return 'snapback';

        window.setTimeout(makeBestMove, 250);
    }

    function onMouseoverSquare(square, piece) {
        var moves = game.moves({
            square: square,
            verbose: true
        });

        if (moves.length === 0) return;

        greySquare(square);

        for (var i = 0; i < moves.length; i++) {
            greySquare(moves[i].to);
        }
    }

    function onMouseoutSquare(square, piece) {
        removeGreySquares();
    }

    function onSnapEnd() {
        board.position(game.fen());
    }

    function makeBestMove() {
        stockfishWorker.postMessage('position fen ' + game.fen());
        stockfishWorker.postMessage('go depth ' + aiDepth);
    }

    function removeGreySquares() {
        document.querySelectorAll('#chessBoard .square-55d63').forEach(square => {
            square.style.background = '';
        });
    }

    function greySquare(square) {
        var squareEl = document.querySelector('#chessBoard .square-' + square);

        var background = '#a9a9a9';
        if (squareEl.classList.contains('black-3c85d')) {
            background = '#696969';
        }

        squareEl.style.background = background;
    }
});
