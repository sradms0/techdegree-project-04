const ticTacToe = (function () {
    class Board {
        constructor(players) {
            this.div = document.querySelector('#board');
            this.endScreen = document.querySelector('.screen-win');
            this.endScreenMessage = document.querySelector('.message');
            this.players = players;
            this.currentPlayer = players[0];
            this.winner = null;
            this.hasTie = false;
            this.sides = 3;
            this.currentPlayer.turn = 'on';

            this.initiate();
        }

        initiate() {
            let i = 0;
            let j = 0;
            // emulate matrix by assigning each box coordinates
            this.grid = [...document.querySelectorAll('.box')];
            this.grid.forEach(k => {
                if (j === this.sides) {
                    j = 0;
                    i++;
                }
                k.coords = {x: i, y: j++};
            });
            const gridParent = this.grid[0].parentElement;

            // every time a player selects a box, 
            //  fill the box, 
            //  change the cursor to default,
            //  add the box (containing coords) to player's list,
            //  and check the status of the game
            const next = (box, player) => {
                box.classList.add('box-filled-' + player.number);
                box.style.cursor = 'default';
                player.turn = 'off';
                player.addMark(box);
                this.checkStatus();
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
                if (!this.winner && !this.hasTie) {
                    if (e.target.classList.contains('box')) {
                        const box = e.target;
                        // an unselect boxe should have only 1 class.
                        // if unselected, then procede based on event types
                        if (box.classList.length < 2) {
                            if (e.type.includes('mouse')) {
                                let img = '';
                                if (e.type.includes('over')) {
                                    img = this.currentPlayer.symbol;
                                }
                                box.style.backgroundImage = img;
                            } else if (e.type === 'click') {
                                next(box, this.currentPlayer);
                                let idx = 0;
                                if (!this.winner && !this.hasTie){
                                    if (this.currentPlayer.number === 1) {
                                        idx = 1;
                                    }
                                    this.currentPlayer = this.players[idx];
                                    this.currentPlayer.turn = 'on';

                                    if (this.currentPlayer.type === 'computer') {
                                        const aiChoice = () => {
                                            const emptyBoxes = document.querySelectorAll(
                                            '.boxes li:not([class*="box-filled"])');
                                            const randomInt = Math.floor(Math.random() * emptyBoxes.length);
                                            return emptyBoxes[randomInt];
                                        }

                                        this.gridOff();
                                        setTimeout(() => {
                                            next(aiChoice(), this.currentPlayer);
                                            if (!this.winner || !this.tie){
                                                this.currentPlayer = this.players[0];
                                                this.currentPlayer.turn = 'on';
                                            }
                                        }, 500);
                                        setTimeout(() => this.gridOn(), 500);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // add the mousehandler to the grid
            gridParent.addEventListener('mouseover', (e) => {
                mouseHandler(e);
            });
            gridParent.addEventListener('mouseout', (e) => {
                mouseHandler(e);
            });
            gridParent.addEventListener('click', (e) => {
                mouseHandler(e);
            });

            // have the end screen listen for when player
            //  wants to play again
            this.endScreen.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    this.reset()
                }
            });

            screenDisplay(this.div, 'off', 0);
            screenDisplay(this.endScreen, 'off', 0);
        }


        // every time a turn is over, checkStatus() uses
        //  the validator object to check if a win or tie
        //  is present.
        //  validator:
        //      -analayzes the current player's moves
        //      -methods checking for a win:
        //          --straight(i)--
        //              - vertical line will consist of
        //                x boxes in the same column
        //              - horizontal line will consist of
        //                x boxes in the same row
        //              (check rows or columns)
        //          --leftDiagonal(i)--
        //              - left diagonal line will consist of
        //                x boxes with each box holding same
        //                row and col. (eg.: 0,0 1,1 2,2)
        //              (check rows and columns)
        //          --rightDiagonal(i)--
        //              - right diagonal line will consist of
        //                x boxes meeting the following:
        //                  -for x boxes, each row is on less
        //                   than the last
        //                  -for x boxes, each column is on more
        //                   than the last
        //          (the paramater, i, is an int passed in from
        //          a loop, validator.iterator incrementing i and passing it each time
        //          to these methods, incrementing the rows array and/or
        //          cols array within the validator)
        //          - win() checks col and rows arrays after each iteration
        //      -if win() is false after these checks, then tie() is run
        checkStatus() {
            if (this.currentPlayer.marks.length >= this.sides) {
                const validator = {
                    marks: this.currentPlayer.marks,
                    rows: [],
                    cols: [],

                    straight: (i) => {
                        validator.rows = validator.marks.filter((j) => j.coords.x === i);
                        validator.cols = validator.marks.filter((j) => j.coords.y === i);
                    },
                    leftDiagonal: (i) => {
                        validator.rows = [...validator.rows, ...validator.marks.filter(
                            (j) => j.coords.x === i && j.coords.y === i)];
                    },
                    rightDiagonal: (i) => {
                        validator.rows = [...validator.rows, ...validator.marks.filter(
                            (j) => j.coords.x === i && 
                                   (this.sides - 1) - i === j.coords.y)];
                    },
                    win: () => {
                        return (
                            validator.rows.length === this.sides || 
                            validator.cols.length === this.sides
                        );
                    },
                    tie: () => {
                        return (
                            this.players[0].marks.length + 
                            this.players[1].marks.length
                            ===
                            this.grid.length
                        );
                    },
                    iterator: (type) => {
                        validator.rows = []
                        validator.cols = []
                        let check = null;

                        if (type === 'straight') {
                            check = (i) => validator.straight(i);
                        } else if (type === 'leftDiagonal') {
                            check = (i) => validator.leftDiagonal(i);
                        } else if (type === 'rightDiagonal') {
                            check = (i) => validator.rightDiagonal(i);
                        }
                        for (let i = 0; i < this.sides && !validator.win(); i++) {
                            check(i);
                        }
                    }
                }

                validator.iterator('straight');
                if (!validator.win()) {
                    validator.iterator('leftDiagonal');
                    if (!validator.win()) {
                        validator.iterator('rightDiagonal');
                    }
                }

                if (validator.win()) {
                    this.winner = this.currentPlayer;
                    this.endScreen.classList.add('screen-win-' + this.winner.number);
                    this.endScreenMessage.textContent = this.winner.name + ' wins!'

                } else if (validator.tie()) {
                    this.hasTie = true; 
                    this.endScreen.classList.add('screen-win-tie');
                    this.endScreenMessage.textContent = 'It\'s a tie!'
                }
                if (this.winner || this.hasTie) {
                    screenDisplay(this.endScreen, 'on', 1);
                    screenDisplay(this.div, 'off', .5);
                }
            }
        }

        gridOff() {
            this.grid.filter((i) => i.classList.length === 1)
                .map((i) => {
                    i.classList.add('paused');
                    i.style.cursor = 'default';
                });
        }

        gridOn() {
            this.grid.filter((i) => {
                return !i.classList.toString().includes('box-filled');
            }).map((i) => {
                    i.classList.remove('paused'); 
                    i.style.cursor = 'pointer';
                });
        }

        reset() {
            if (this.winner) {
                this.endScreen.classList.remove(
                    'screen-win-' + this.winner.number);
                this.winner = null;
            } else {
                this.endScreen.classList.remove('screen-tie');
                this.hasTie = false;
            }
            this.players[0].marks = [];
            this.players[1].marks = [];
            this.grid.forEach((i) => {
                i.className = 'box'
                i.style.cursor = '';
                i.style.backgroundImage = '';
            });

            this.currentPlayer.turn = 'on';

            screenDisplay(this.endScreen, 'off', true);
            screenDisplay(this.div, 'on', false);
        }
    }

    class Player {
        constructor(number) {
            this.playerLi = document.querySelector(
                '#player' + number);
            this.nameLi = document.createElement('li');
            this.nameLi.className = 'player-name';
            this.type = false;
            this.number = number;
            this.marks = [];
            if (number === 1) {
                this.symbol = "url('img/o.svg')";
            } else if (number === 2) {
                this.symbol = "url('img/x.svg')";
            }
        }
        set name(name) {
            this._name = name;
            if (name === '') {
                this._name = 'Player ' + this.number;
            }
            this.nameLi.textContent = this._name;
            this.playerLi.appendChild(this.nameLi);
        }
        set turn(turn) {
            if (turn.toLowerCase() === 'on') {
                this.playerLi.classList.add('active');
                this.nameLi.classList.add('active');
                this._turn = true;
            } else {
                this.playerLi.classList.remove('active');
                this.nameLi.classList.remove('active');
                this._turn = false;
            }
        }

        set type(nameHidden) {
            this._type = 'human';
            if (nameHidden) {
                this._type = 'computer';
            }
        }

        get turn() {
            return this._turn;
        }

        get name() {
            return this._name;
        }

        get type() {
            return this._type;
        }

        addMark(box) {
            this.marks.push(box);
        }
    }

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
    const startDiv = document.querySelector('#start');
    const player1NameInput = document.querySelector('#player-name-1');
    const player2NameInput = document.querySelector('#player-name-2');
    const player1 = new Player(1);
    const player2 = new Player(2);
    const board = new Board([player1, player2]);

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
                player2.type = player2NameInput.style.display === 'none';
                screenDisplay(startDiv, 'off', .5);
                screenDisplay(board.div, 'on', 0);
            }
        }
    });
}());
