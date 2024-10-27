import * as Shogi from "./board.js";
import * as Pieces from "./piece.js";
/**
 * @class ShogiUI
 * @classdesc The ShogiUI class manages the user interface for a Shogi game, providing board display, piece movement, and highlighting of selectable positions.
 *
 * @constructor
 * @param {HTMLTableElement} tableElement - The HTMLTableElement that represents the Shogi game board.
 * @example
 * const instance = new ShogiUI(tableElement);
 */
export class ShogiUI {
    // ボードの変化を適用する関数
    /**
     * @function applyBoardToTable
     * @description Apply the board to the table.
     *
     * @returns {void}
     */
    applyBoardToTable() {
        for (let row = 0; row < Pieces.boardSize; row++) {
            for (let col = 0; col < Pieces.boardSize; col++) {
                const piece = this.board.matrix[row][col];
                const cell = this.boardElement[row][col];
                cell.style.backgroundColor = piece.isSente === this.board.isSenteTurn ? "darkgreen" : "green";
                cell.style.backgroundImage = piece.isSente !== undefined ? "url('../../pic/shogi.gif')" : "none";
                cell.style.backgroundSize = "cover"; // 画像をセル全体に表示
                cell.style.backgroundRepeat = "no-repeat"; // 画像のリピートを無効化
                cell.textContent = piece.toString();
                cell.style.transform = piece.isSente ? "rotate(0deg)" : "rotate(180deg)";
                cell.style.color = piece.getDidPromotion() ? "red" : "black";
            }
        }
    }
    /**
     * @function move
     * @description Call the move method of the board class.
     *
     * @param {Pieces.Position} from - Source location.
     * @param {Pieces.Position} to - Destination location
     * @returns {boolean} - Returns whether the move was successful.
    */
    move(from, to) {
        return this.board.move(from, to);
    }
    // 移動可能位置を表示する
    viewCanSet([row, col]) {
        const piece = this.board.matrix[row][col];
        const availablePositions = piece.generateMovePositions([row, col]);
        this.selectedPosition = [row, col]; // 移動元位置を保持
        let skip = false;
        const pieceMoveHandler = (targetRow, targetCol) => {
            if (this.selectedPosition) {
                const [fromRow, fromCol] = this.selectedPosition;
                if (this.move([fromRow, fromCol], [targetRow, targetCol]))
                    this.applyBoardToTable(); // 移動成功後にボードを更新
                this.selectedPosition = null; // 選択位置をクリア
            }
        };
        // すべての配置可能な位置を表示
        availablePositions.forEach(([moveRow, moveCol]) => {
            var _a;
            const isValidPosition = moveRow !== -1 && moveCol !== -1;
            const targetCell = (_a = this.boardElement[moveRow]) === null || _a === void 0 ? void 0 : _a[moveCol];
            if (isValidPosition && targetCell) {
                // 配置可能な場所
                const targetPiece = this.board.matrix[moveRow][moveCol];
                // 配置先に空白が選択されていない
                if (targetPiece.isSente !== undefined) {
                    // 相手の駒だった場合配置可能
                    if (targetPiece.isSente !== this.board.isSenteTurn && !skip) {
                        targetCell.style.backgroundColor = "red";
                        targetCell.addEventListener("click", pieceMoveHandler.bind(this, moveRow, moveCol), { once: true });
                    }
                    // それ以降は配置できないので番兵が来るまでスキップ
                    skip = true;
                }
                // 道中に駒がない
                if (!skip) {
                    // 配置可能
                    targetCell.style.backgroundColor = "red";
                    targetCell.addEventListener("click", pieceMoveHandler.bind(this, moveRow, moveCol), { once: true });
                }
            }
            else {
                skip = false;
            }
        });
    }
    constructor(tableElement) {
        var _a;
        this.board = new Shogi.Board();
        this.selectedPosition = null;
        // ボードを取得
        const tbody = (_a = tableElement.getElementsByTagName('tbody')[0]) !== null && _a !== void 0 ? _a : tableElement;
        this.boardElement = Array.from(tbody.getElementsByTagName('tr')).map((tr) => Array.from(tr.getElementsByTagName('td')));
        // ボードの初期化
        this.board.defaultSet();
        // グローバルにインスタンスを公開
        window.shogiUIInstance = this;
        // 各セルにクリックイベントを追加
        this.boardElement.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                cell.addEventListener("click", () => {
                    // 所有駒の時実行
                    if (this.board.matrix[rowIndex][colIndex].isSente === this.board.isSenteTurn) {
                        this.applyBoardToTable();
                        // おける場所を表示
                        this.viewCanSet([rowIndex, colIndex]);
                    }
                });
            });
        });
        // 初期状態のボードを表示
        this.applyBoardToTable();
    }
}
// DOMがロードし終わったときオブジェクトを生成
window.addEventListener("DOMContentLoaded", () => {
    const tableElement = document.getElementById('shogiBoard');
    if (tableElement) {
        new ShogiUI(tableElement);
    }
    else {
        console.error("Shogi board table not found.");
    }
});
//# sourceMappingURL=shogiUI.js.map