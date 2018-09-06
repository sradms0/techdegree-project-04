const main = ( () => {
    const boardDiv = document.querySelector('#board');
    const endDiv = document.querySelector('.screen-win');
    const endDivMessage = document.querySelector('.message');
    const boxesUl = document.querySelector('.boxes');
    const boxLis = [...boxesUl.children];
    const playersLisFlags = document.querySelectorAll('.players');

    const screenDisplay = ((div, type, sec) => {
        let display = '';
        if (type === 'on') {
            div.classList.remove('fade');
        } else {
            div.classList.add('fade');
            display = 'none';
        }
        setTimeout(() => div.style.display = display, sec * 1000);
    });

    const togglePlayerFlag = (player, toggle) => {
        const flag = playersLisFlags[player.number - 1];

        if (toggle === 'on') flag.classList.add('active');
        else flag.classList.remove('active');
    }

    const next = (box, player) => {
        togglePlayerFlag(player, 'off');
        box.classList.add('box-filled-' + player.number);
        box.style.cursor = 'default';
        board.setCell(box.id);

        board.checkStatus();
        if (board.isTerminal) {
            if (board.winner.length > 0) {
                endDiv.classList.add('screen-win-' + board.winnerNumber);
                endDivMessage.textContent = board.winner + ' wins!'
            } else {
                endDiv.classList.add('screen-win-tie');
                endDivMessage.textContent = 'It\'s a tie!'
            }
            screenDisplay(endDiv, 'on', 1);
            screenDisplay(boardDiv, 'off', .5);
        } else togglePlayerFlag(board.currentPlayer, 'on');
    }

    const gridOff = () => {
        boxLis.filter((i) => i.classList.length === 1)
            .map((i) => {
                i.classList.add('paused');
                i.style.cursor = 'default';
            });
    }

    const gridOn = () => {
        boxLis.filter((i) => {
            return !i.classList.toString().includes('box-filled');
        }).map((i) => {
                i.classList.remove('paused'); 
                i.style.cursor = 'pointer';
            });
    }
    // create one function to handle all mouse events,
    //  depending on the event type.
    //
    // mouseover: will show the player's symbol as 
    // the background of the box
    //
    // mouseout: will delete the player's symbol from the
    //  box background after a mouseover 
    //
    // click: will run the next() for current player
    //  - after current player selects a box, the other 
    //    player in the player list is selected to go
    //
    //  - if the game is 'player vs computer', each time
    //    the player changes, check if the new current
    //    player is 'computer', and randomly select
    //    and unselected box :
    //    (this is an easy ai; the minimax algorithm
    //    will be implemented in the near future).
    //      - after Math.random() selects a box,
    //        setTimeout() is run before that box is actually
    //        set just for nice appearance. 
    //        during this process gridOff() runs so the human
    //        player cannot select a box, and gridOn() is run
    //        after the ai turn is over.
    const mouseHandler = (e) => {
        if (!board.isTerminal) {
            if (e.target.classList.contains('box')) {
                const box = e.target;
                // an unselect boxe should have only 1 class.
                // if unselected, then procede based on event types
                if (box.classList.length < 2) {
                    if (e.type.includes('mouse')) {
                        let img = '';
                        if (e.type.includes('over')) img = board.currentPlayer.symbol;
                        box.style.backgroundImage = img;

                    } else if (e.type === 'click') {
                        next(box, board.currentPlayer);
                        if (!board.isTerminal) {
                            if (board.currentPlayer.type === 'ai') {
                                gridOff();
                                setTimeout(() => {
                                    next(boxLis[ai(board)], board.currentPlayer);
                                }, 500);
                                setTimeout(() => gridOn(), 500);
                            }
                        }
                    }
                }
            }
        }
    }
    // add the mousehandler to the grid
    boxesUl.addEventListener('mouseover', (e) => mouseHandler(e));
    boxesUl.addEventListener('mouseout', (e) => mouseHandler(e));
    boxesUl.addEventListener('click', (e) => mouseHandler(e));

    // have the end screen listen for when player
    //  wants to play again
    endDiv.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            boxLis.forEach(i => {
                i.className = 'box'
                i.style.cursor = '';
                i.style.backgroundImage = '';
            });

            endDiv.classList.remove('screen-win-' + board.winnerNumber);
            board.reset()

            togglePlayerFlag(board.currentPlayer, 'on');
            screenDisplay(endDiv, 'off', 0);
            screenDisplay(boardDiv, 'on', 0);
        }
    });
    const startDiv = document.querySelector('#start');
    const player1NameInput = document.querySelector('#player-name-1');
    const player2NameInput = document.querySelector('#player-name-2');
    const player1 = new Player(1);
    const player2 = new Player(2);
    const board = new Board([player1, player2]);
    board.initiate();

    screenDisplay(boardDiv, 'off', 0);
    screenDisplay(endDiv, 'off', 0);
    startDiv.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            if (e.target.id === 'vs') {
                const vsAnchor = e.target;
                if (vsAnchor.className === 'pvp') {
                    vsAnchor.textContent = 'Player vs Player';
                    vsAnchor.className = 'pvc';
                    player2NameInput.value = '';
                    screenDisplay(player2NameInput, 'off', 0);
                } else if (vsAnchor.className === 'pvc') {
                    vsAnchor.textContent = 'Player vs Computer';
                    vsAnchor.className = 'pvp';
                    screenDisplay(player2NameInput, 'on', 0);
                }

            } else if (e.target.id === 'start') {
                player1.name = player1NameInput.value;
                player2.name = player2NameInput.value;

                if(player2NameInput.style.display === 'none') player2.type = 'ai';
                screenDisplay(startDiv, 'off', .5);
                screenDisplay(boardDiv, 'on', 0);
                togglePlayerFlag(board.currentPlayer, 'on');
            }
        }
    });
})();
