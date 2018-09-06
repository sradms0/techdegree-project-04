class Board {
    constructor(players) {
        this.players = players;
        this.currentPlayer = players[0];
        this.winnerType = '';
        this.winnerNumber = 0;
        this.winner = '';
        this.tie = false;
        this.isTerminal = false
        this.sides = 3;
        this.currentPlayer.turn = 'on';
    }

    clone() {
        const copy = new Board(
            [
                this.players[0].clone(),
                this.players[1].clone()
            ]
        );

        let idx = 0;
        if (this.currentPlayer.number === 2) idx = 1;
        copy.currentPlayer = copy.players[idx];

        copy.grid = [];
        this.grid.forEach(i => {
            const cellCopy = {
                x: i.x,
                y: i.y,
                loc: i.loc,
                set: i.set
            }
            copy.grid.push(cellCopy);
        });

        return copy;
    }

    newState() {
        return this.clone();
    }

    indexOf(coords) {
        const cellIdx = this.grid.reduce((acc, curr) => {
            if (curr.x === (coords.x) && curr.y === (coords.y)) {
                acc = curr.loc;
            }
            return acc;
        }, -1);
        return cellIdx;
    }

    initiate() {
        let i = 0;
        let j = 0;
        let k = 0;
        // emulate matrix by assigning each box coordinates
        this.grid = [];
        for (let l = 0; l < Math.pow(this.sides, 2); l++) {
            if (j === this.sides) {
                j = 0;
                i++;
            }
            this.grid.push({x: i, y: j++, loc: k++, set: false});
        };
    };

    availableCells() {
        return this.grid.filter(i => !i.set)
    }

    movesCount(playerType) {
        return this.players
            .reduce((acc, curr) => {
                if (curr.type === playerType) acc = Array.from(curr.marks).length;
                return acc
            }, 0);
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
        const validator = {
            marks: Array.from(this.currentPlayer.marks),
            rows: [],
            cols: [],

            straight: (i) => {
                validator.rows = validator.marks.filter((j) => j.x === i);
                validator.cols = validator.marks.filter((j) => j.y === i);
            },
            leftDiagonal: (i) => {
                validator.rows = [...validator.rows, ...validator.marks.filter(
                    (j) => j.x === i && j.y === i)];
            },
            rightDiagonal: (i) => {
                validator.rows = [...validator.rows, ...validator.marks.filter(
                    (j) => j.x === i && 
                           (this.sides - 1) - i === j.y)];
            },
            win: () => {
                return (
                    validator.rows.length === this.sides || 
                    validator.cols.length === this.sides
                );
            },
            tie: () => {
                return (
                    this.players[0].marks.size + 
                    this.players[1].marks.size
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
            this.isTerminal = true;
            this.winnerNumber = this.currentPlayer.number;
            this.winnerType = this.currentPlayer.type;
            this.winner = this.currentPlayer.name;
        } else if (validator.tie()) {
            this.isTerminal = true;
            this.tie = true;
        }
    }

    setCell(idx) {
        const cell = this.grid[idx];
        if (!cell.set) {
            cell.set = true;
            this.currentPlayer.addMark(cell);

            this.checkStatus();
            this.changePlayer();
        }
    }

    changePlayer() {
        let idx = 0;
        this.currentPlayer.turn = 'off';

        if (this.currentPlayer.number === 1) idx = 1;
        this.currentPlayer = this.players[idx];
        this.currentPlayer.turn = 'on';
    }

    reset() {
        this.winnerType = '';
        this.winnerNumber = 0;
        this.winner = '';
        this.tie = false;
        this.isTerminal = false

        this.players[0].marks = new Set();
        this.players[1].marks = new Set();
        this.grid.forEach(i => i.set = false);

        this.currentPlayer = this.players[0];
    }

    display() {
        const checkMatches = (player, i) => {
            // get player marks, set accordingly to grid display
            return data[player].marks.reduce((acc, curr) => {
                if (i === curr.loc) acc = data[player].symbol;
                return acc;
            }, undefined);
        }
        const replace = (match, box) => {
            if (match) box = box.replace('_', match);
            return box;
        }

        const data = [
            {'symbol': this.players[0].symbol, 'marks': Array.from(this.players[0].marks)},
            {'symbol': this.players[1].symbol, 'marks': Array.from(this.players[1].marks)}
        ];

        let out = '';
        let x = 0;
        let across = '   ';
        for (let y = 0; y < this.sides; y++) across += y + '  ';
        for (let i = 0; i < this.grid.length; i++) {
            let box = `|_|`;

            box = replace(checkMatches(0, i), box);
            box = replace(checkMatches(1, i), box);

            if ((i + 1) % 3 === 1) box = Math.floor((i + 1) / 3) + ' ' + box;
            out += box;
            if ((i + 1) % 3 === 0) out += '\n';

        }
        console.log(across);
        console.log(out);
    }
}

