/**
 * @author SanaePRJ
 */
import * as Pieces from "./piece.js";
/**
 * Represents the Shogi board, including pieces, turns, and movement logic.
 */
export class Board {
    constructor() {
        /** 2D array representing the board, initialized with Air pieces. */
        this.matrix = Array.from({ length: Pieces.boardSize }, () => Array(Pieces.boardSize).fill(new Pieces.Air()));
        /** Array of pieces held by the Sente player. */
        this.senteHave = [];
        /** Array of pieces held by the Gote player. */
        this.goteHave = [];
        /** Indicates whose turn it is (true for Sente, false for Gote). */
        this.isSenteTurn = true;
    }
    /**
     * Sets the default initial positions of all pieces on the board.
     */
    defaultSet() {
        // Place Gote pieces
        this.matrix[0][0] = new Pieces.Lance(false);
        this.matrix[0][1] = new Pieces.Knight(false);
        this.matrix[0][2] = new Pieces.SilverGen(false);
        this.matrix[0][3] = new Pieces.GoldGen(false);
        this.matrix[0][4] = new Pieces.King(false);
        this.matrix[0][5] = new Pieces.GoldGen(false);
        this.matrix[0][6] = new Pieces.SilverGen(false);
        this.matrix[0][7] = new Pieces.Knight(false);
        this.matrix[0][8] = new Pieces.Lance(false);
        this.matrix[1][1] = new Pieces.Rook(false);
        this.matrix[1][7] = new Pieces.Bishop(false);
        // Place Gote pawns
        for (let i = 0; i < Pieces.boardSize; i++)
            this.matrix[2][i] = new Pieces.Pawn(false);
        // Place Sente pieces
        this.matrix[8][0] = new Pieces.Lance(true);
        this.matrix[8][1] = new Pieces.Knight(true);
        this.matrix[8][2] = new Pieces.SilverGen(true);
        this.matrix[8][3] = new Pieces.GoldGen(true);
        this.matrix[8][4] = new Pieces.King(true);
        this.matrix[8][5] = new Pieces.GoldGen(true);
        this.matrix[8][6] = new Pieces.SilverGen(true);
        this.matrix[8][7] = new Pieces.Knight(true);
        this.matrix[8][8] = new Pieces.Lance(true);
        this.matrix[7][7] = new Pieces.Rook(true);
        this.matrix[7][1] = new Pieces.Bishop(true);
        // Place Sente pawns
        for (let i = 0; i < Pieces.boardSize; i++)
            this.matrix[6][i] = new Pieces.Pawn(true);
    }
    /**
     * Moves a piece from one position to another.
     * @param from - The starting position of the piece.
     * @param to - The target position to move the piece.
     * @returns True if the move is successful, false otherwise.
     */
    move([fromRow, fromCol], [toRow, toCol]) {
        // Check if the piece belongs to the current player
        if (this.matrix[fromRow][fromCol].isSente !== this.isSenteTurn) {
            console.log("I tried to move a piece that wasn't my own");
            return false;
        }
        // Check if the move attempts to capture the player's own piece
        if (this.matrix[toRow][toCol].isSente === this.isSenteTurn) {
            console.log("He's trying to take his piece.");
            return false;
        }
        // Get valid move positions
        let canPutPositions = this.matrix[fromRow][fromCol].generateMovePositions([fromRow, fromCol]);
        // Check if the target position is valid
        let putIndex = canPutPositions.findIndex(([row, col]) => row === toRow && col === toCol);
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
        for (let pos = putIndex - 1; pos >= 0; pos--) {
            let [row, col] = canPutPositions[pos];
            // Check for a partition piece
            if (row == Pieces.partition[0] && col == Pieces.partition[1])
                break;
            // Check for owned pieces blocking the path
            if (this.matrix[row][col].isSente !== undefined) {
                console.log(`If there is a piece with ownership set along the way, it cannot be placed.${this.matrix[row][col].isSente};`);
                canPutPositions.forEach(pos => {
                    console.log(`{${pos[0]},${pos[1]}}`);
                });
                return false;
            }
        }
        // Capture the piece if there is one
        if (this.matrix[toRow][toCol].isSente !== undefined) {
            // Change owner
            this.matrix[toRow][toCol].isSente = this.isSenteTurn;
            // unPromote
            if (this.matrix[toRow][toCol].getDidPromotion())
                this.matrix[toRow][toCol].changePromotion();
            if (this.isSenteTurn)
                this.senteHave.push(this.matrix[toRow][toCol]);
            else
                this.goteHave.push(this.matrix[toRow][toCol]);
        }
        // Move the piece
        this.matrix[toRow][toCol] = this.matrix[fromRow][fromCol];
        this.matrix[fromRow][fromCol] = new Pieces.Air();
        // set Promotion
        if (((this.isSenteTurn && toRow < 3) || (!this.isSenteTurn && toRow > 5)) && this.matrix[toRow][toCol].canPromotion && !this.matrix[toRow][toCol].getDidPromotion())
            this.matrix[toRow][toCol].changePromotion();
        return true;
    }
    /**
     * Change turn.
     * @returns The current turn.
     */
    goNext() {
        return this.isSenteTurn = !this.isSenteTurn; // Change turn  
    }
    /**
     * Gets the current state of the board.
     * @returns The current board as a 2D array.
     */
    getBoard() {
        return (this.matrix);
    }
}
//# sourceMappingURL=board.js.map