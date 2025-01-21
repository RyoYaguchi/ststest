const spireLogic = require("./spireLogic");
const { resetGame } = require("./resetGame");

function main() {
    const scene = new g.Scene({
        game: g.game,
    });

    scene.onLoad.add(() => {
        console.log("Scene loaded.");
        spireLogic.generateDeck(scene);
        spireLogic.startBattle(scene);
    });

    g.game.pushScene(scene);
}

// 初期化時のリセット（必要に応じて追加）
function initializeGame() {
    resetGame(); // リセット処理を実行
    main(); // メイン処理を実行
}

module.exports = { main, initializeGame };