import { ShogiUI } from "./shogiUI";
export{};

declare global {
    interface Window {
        shogiUIInstance: ShogiUI; // ShogiUIクラスのインスタンスをプロパティとして追加
    }
}