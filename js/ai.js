const ai = ( () => {
        // sorting for moves by scores for all possible games when terminal
        const sort = type => {
            if (type === 'ascending') {
                return (a, b) => {
                    if (a.minimax < b.minimax) return -1;
                    else if (a.minimax > b.minimax) return 1;
                    return 0;
                }
            } else {
                return (a, b) => {
                    if (a.minimax > b.minimax) return -1;
                    else if (a.minimax < b.minimax) return 1;
                    return 0;
                }
            }
        }

        // check end result of the game
        const score = board => {
            if (board.winnerType === 'human') return 10;
            else if (board.winnerType === 'ai') return -10;
            else return 0;
        }

        // run through all possible games until a terminal is state is reached for each
        // passing the min max value to a move, depending on its player,
        const minimax = board => {
            if (board.isTerminal) return score(board);
            let boardScore = 0;
            
            // assign min or max
            if (board.currentPlayer.type === 'human') boardScore = -1000;
            else boardScore = 1000;

            const availableMoves = board.availableCells();
            const availableNextBoards = availableMoves.map(move => {
                const nextBoard = board.newState();
                nextBoard.setCell(move.loc);
                return nextBoard;
            })
            availableNextBoards.forEach(nextBoard => {
                const nextScore = minimax(nextBoard);
                if(board.currentPlayer.type === 'human') {
                    if (nextScore > boardScore) boardScore = nextScore;
                } else {
                    if (nextScore < boardScore) boardScore = nextScore;
                }
            });
            return boardScore;
        }

        // run minimiax here, passing all scenarios for all possible moves
        const choice = board => {
            const availableMoves = board.availableCells()
                .map(move => {
                    const nextBoard = board.newState();
                    nextBoard.setCell(move.loc);

                    move.minimax = minimax(nextBoard);
                    return move;
                });

            // sort array of moves by score accordingly depending on player 
            // and return that moves location
            if (board.currentPlayer.type === 'human') availableMoves.sort(sort('descending'));
            else availableMoves.sort(sort('ascending'));
            return availableMoves[0].loc;
        }

    return choice;
})();
