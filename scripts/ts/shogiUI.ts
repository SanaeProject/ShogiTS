import * as Shogi from "./board.js";
import * as Pieces from "./piece.js";

export class ShogiUI{
    private tableElement:HTMLTableElement;
    board:Shogi.Board = new Shogi.Board();

    // ボードの変化を適用する。
    private applyBoardToTable(board: Pieces.Piece[][]) {
        const tbody = this.tableElement.getElementsByTagName('tbody')[0];
        // 行を取得
        const rows = tbody.getElementsByTagName('tr');

        for (let row = 0; row < board.length; row++) {
            const cells = rows[row].getElementsByTagName('td');
            for (let col = 0; col < board[row].length; col++) {
                // 表示文字を取得
                cells[col].textContent = board[row][col].toString();

                // 奥側は逆向き
                if(!board[row][col].isSente)
                    cells[col].style.transform="rotate(180deg)";

                // 成っている場合は赤色
                if(board[row][col].getDidPromotion())
                    cells[col].style.color = "red";
            }
        }
    }

    // ボードの変更をdisplayへ適用する。
    public displayBoard(){
        let pieces : Pieces.Piece[][] = this.board.getBoard();
        this.applyBoardToTable(pieces);
    }

    // 駒を移動させる。成功したかどうかをbooleanで返す。
    public move(from:Pieces.Position,to:Pieces.Position){
        return this.board.move(from,to);
    }

    public testSet([row, col]: Pieces.Position) {
        const tbody = this.tableElement.getElementsByTagName('tbody')[0];
        const rows = tbody.getElementsByTagName('tr');
    
        // 置くことが出来る位置を取得
        let availablePositions: Pieces.Position[] = this.board.board[row][col].generateMovePositions([row, col]);
    
        // 移動可能な位置を赤色で表示
        let skip:boolean = false;
        availablePositions.forEach(([moveRow, moveCol]) => {
            if (moveRow >= 0 && moveCol >= 0) {
                const cell = rows[moveRow].getElementsByTagName('td')[moveCol];

                if(this.board.board[moveRow][moveCol].isSente !== undefined){
                    if(this.board.board[moveRow][moveCol].isSente!=this.board.isSenteTurn && !skip)
                        cell.style.backgroundColor = "red";
                    
                    skip = true;
                }
                if(!skip)
                    cell.style.backgroundColor = "red";
            }else{
                skip = false;
            }
        });
    
        // クリックしたセルを黄色で表示
        rows[row].getElementsByTagName('td')[col].style.backgroundColor = "yellow";
    }
    

    constructor(argTableElement:HTMLTableElement){
        // テーブルを登録
        this.tableElement = argTableElement;

        // デフォルトの状態へセット
        this.board.defaultSet();

        this.displayBoard();

        // グローバルにインスタンスを公開
        window.shogiUIInstance = this;

        // テーブルの各セルにクリックイベントを追加
        const cells = this.tableElement.querySelectorAll("td");
        cells.forEach((cell, index) => {
            // 行と列を計算する
            const row = Math.floor(index / this.board.getBoard().length);
            const col = index % this.board.getBoard()[0].length;

            cell.addEventListener("click", () => {
                this.testSet([row,col]);
            });
        });
    }
}

// DOMがロードし終わったときオブジェクトを生成
window.addEventListener("DOMContentLoaded", () => {
    // テーブル要素を取得
    const tableElement:HTMLTableElement = document.getElementById('shogiBoard')! as HTMLTableElement;
   
    // テーブルエレメントを正常に取得できたかチェック
    if (tableElement) {
        const ui = new ShogiUI(tableElement);
        // 必要に応じて、ここで move などを呼び出せる
    } else {
        console.error("Shogi board table not found.");
    }
});