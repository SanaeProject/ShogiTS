/**
 * 設計やコーディングはSanaePRJが行ったがJSDocは ChatGPT によって行われている。
 * 
 * @author SanaePRJ
 */

import * as Shogi from "./piece.js";

/**
 * Represents the Shogi board, including pieces, turns, and movement logic.
 */
export class Board {
    /** 2D array representing the board, initialized with Air pieces. */
    board: Shogi.Piece[][] = Array.from({ length: Shogi.boardSize }, () => Array(Shogi.boardSize).fill(new Shogi.Air()));

    /** Array of pieces held by the Sente player. */
    senteHave: Shogi.Piece[] = [];

    /** Array of pieces held by the Gote player. */
    goteHave: Shogi.Piece[] = [];

    /** Indicates whose turn it is (true for Sente, false for Gote). */
    isSenteTurn: boolean = true;

    constructor() {}

    /**
     * Sets the default initial positions of all pieces on the board.
     */
    defaultSet(): void {
        // Place Gote pieces
        this.board[0][0] = new Shogi.Lance(false);
        this.board[0][1] = new Shogi.Knight(false);
        this.board[0][2] = new Shogi.SilverGen(false);
        this.board[0][3] = new Shogi.GoldGen(false);
        this.board[0][4] = new Shogi.King(false);
        this.board[0][5] = new Shogi.GoldGen(false);
        this.board[0][6] = new Shogi.SilverGen(false);
        this.board[0][7] = new Shogi.Knight(false);
        this.board[0][8] = new Shogi.Lance(false);
        this.board[1][1] = new Shogi.Rook(false);
        this.board[1][7] = new Shogi.Bishop(false);
        
        // Place Gote pawns
        for (let i = 0; i < Shogi.boardSize; i++)
            this.board[2][i] = new Shogi.Pawn(false);
        
        // Place Sente pieces
        this.board[8][0] = new Shogi.Lance(true);
        this.board[8][1] = new Shogi.Knight(true);
        this.board[8][2] = new Shogi.SilverGen(true);
        this.board[8][3] = new Shogi.GoldGen(true);
        this.board[8][4] = new Shogi.King(true);
        this.board[8][5] = new Shogi.GoldGen(true);
        this.board[8][6] = new Shogi.SilverGen(true);
        this.board[8][7] = new Shogi.Knight(true);
        this.board[8][8] = new Shogi.Lance(true);
        this.board[7][7] = new Shogi.Rook(true);
        this.board[7][1] = new Shogi.Bishop(true);
        
        // Place Sente pawns
        for (let i = 0; i < Shogi.boardSize; i++)
            this.board[6][i] = new Shogi.Pawn(true);
    }

    /**
     * Moves a piece from one position to another.
     * @param from - The starting position of the piece.
     * @param to - The target position to move the piece.
     * @returns True if the move is successful, false otherwise.
     */
    public move([fromRow, fromCol]: Shogi.Position, [toRow, toCol]: Shogi.Position): boolean {
        // Check if the piece belongs to the current player
        if (this.board[fromRow][fromCol].isSente !== this.isSenteTurn) {
            console.log("I tried to move a piece that wasn't my own");
            return false;
        }

        // Check if the move attempts to capture the player's own piece
        if (this.board[toRow][toCol].isSente === this.isSenteTurn) {
            console.log("He's trying to take his piece.");
            return false;
        }

        // Get valid move positions
        let canPutPositions: Shogi.Position[] = this.board[fromRow][fromCol].generateMovePositions([fromRow, fromCol]);
        
        // Check if the target position is valid
        let putIndex: number = canPutPositions.findIndex(([row, col]) => row === toRow && col === toCol);
        
        // Check if the target position is in the valid move positions
        if (putIndex == -1) {
            console.log(`There is no place to put it.${toRow},${toCol}`);

            // Display all valid move positions
            canPutPositions.forEach(pos => {
                console.log(`{${pos[0]},${pos[1]}}`);
            });

            return false;
        }

        // Check if there are pieces blocking the way
        for (let pos: number = putIndex - 1; pos >= 0; pos--) {
            let [row, col]: Shogi.Position = canPutPositions[pos];

            // Check for a partition piece
            if (row == Shogi.partition[0] && col == Shogi.partition[1]) break;

            // Check for owned pieces blocking the path
            if (this.board[row][col].isSente !== undefined) {
                console.log(`If there is a piece with ownership set along the way, it cannot be placed.${this.board[row][col].isSente};`);
                canPutPositions.forEach(pos => {
                    console.log(`{${pos[0]},${pos[1]}}`);
                });
                return false;
            }
        }

        // Capture the piece if there is one
        if (this.board[toRow][toCol].isSente !== undefined) {
            if (this.isSenteTurn) this.senteHave.push(this.board[toRow][toCol]);
            else this.goteHave.push(this.board[toRow][toCol]);
        }

        // Move the piece
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = new Shogi.Air();

        // Change turn
        this.isSenteTurn = !this.isSenteTurn;

        return true;
    }

    /**
     * Gets the current state of the board.
     * @returns The current board as a 2D array.
     */
    public getBoard() {
        return this.board;
    }
}