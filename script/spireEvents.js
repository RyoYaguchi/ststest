//循環参照を回避するためのファイル
class SpireEvents {
    constructor() {
        this.events = {}; // イベント名をキーとし、リスナー関数の配列を保持
    }

    /**
     * イベントリスナーを登録します
     * @param {string} eventName イベント名
     * @param {function} callback イベントが発火した際に呼び出される関数
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * イベントリスナーを解除します
     * @param {string} eventName イベント名
     * @param {function} callback 解除するリスナー関数
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter((cb) => cb !== callback);
    }

    /**
     * イベントを発火します
     * @param {string} eventName イベント名
     * @param  {...any} args 発火時に渡す引数
     */
    emit(eventName, ...args) {
        if (this.events[eventName]) {
            this.events[eventName].forEach((callback) => {
                try {
                    callback(...args); // リスナーに引数を渡して実行
                } catch (error) {
                    console.error(`Error in event "${eventName}":`, error);
                }
            });
        }
    }

    /**
     * イベントリスナーをすべて解除します
     * @param {string} [eventName] イベント名（省略した場合はすべてのイベント）
     */
    clear(eventName) {
        if (eventName) {
            delete this.events[eventName];
        } else {
            this.events = {};
        }
    }
}

// シングルトンインスタンスを作成
const spireEvents = new SpireEvents();
module.exports = spireEvents;