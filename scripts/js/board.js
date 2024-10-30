/**
 * @author SanaePRJ
 */
import * as Pieces from "./piece.js";
/**
 * @class Board
 * @classdesc Represents the Shogi board, including pieces, turns, and movement logic.
 */
export class Board {
    constructor() {
        /**
         * @description 2D array representing the board, initialized with Air pieces.
         * @type {Pieces.Piece}
         */
        this.matrix = Array.from({ length: Pieces.boardSize }, () => Array(Pieces.boardSize).fill(new Pieces.Air()));
        /**
         * @description Array of pieces captured by the Sente player.
         * @type {Pieces.Piece}
         */
        this.senteCapturedPieces = [];
        /**
         * @description Array of pieces captured by the Gote player.
         * @type {Pieces.Piece}
         */
        this.goteCapturedPieces = [];
        /**
         * @description Indicates whose turn it is (true for Sente, false for Gote).
         * @type {boolean}
         */
        this.isSenteTurn = true;
        /**
         * @description A function that queries whether
         * @type {boolean} is allowed.
         */
        this.isPromotionAllowed = () => { return confirm("成りますか?"); };
    }
    /**
     * @function defaultSet
     * @description Sets the default initial positions of all pieces on the board.
     *
     * @param {void}
     * @returns {void}
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
     * @function move
     * @description Moves a piece from one position to another.
     *
     * @param {Pieces.Piece} from - The starting position of the piece.
     * @param {Pieces.Piece} to - The target position to move the piece.
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
            if (this.matrix[toRow][toCol].getIsPromoted())
                this.matrix[toRow][toCol].changePromotionStatus();
            if (this.isSenteTurn)
                this.senteCapturedPieces.push(this.matrix[toRow][toCol]);
            else
                this.goteCapturedPieces.push(this.matrix[toRow][toCol]);
        }
        // Move the piece
        this.matrix[toRow][toCol] = this.matrix[fromRow][fromCol];
        this.matrix[fromRow][fromCol] = new Pieces.Air();
        let notOutOfRange = (this.isSenteTurn && toRow < 3) || (!this.isSenteTurn && toRow > 5);
        let piece = this.matrix[toRow][toCol];
        // can set Promotion
        if (notOutOfRange && piece.canPromotion && !piece.getIsPromoted() && !piece.getRefusedPromotion()) {
            if (this.isPromotionAllowed())
                piece.changePromotionStatus();
            else
                piece.setRefusePromotion();
        }
        return true;
    }
    /**
     * @function goNext
     * @description Change turn.
     * @returns The current turn.
     */
    goNext() {
        return this.isSenteTurn = !this.isSenteTurn; // Change turn  
    }
    /**
     * @function getBoard
     * @description Gets the current state of the board.
     * @returns {ReadonlyArray<ReadonlyArray<Pieces.Piece>>} - The current board as a 2D array.
     */
    getBoard() {
        return (this.matrix);
    }
}
//# sourceMappingURL=board.js.map