const spireData = require("./spireData");
const spireRender = require("./spireRender");
const { generateDeck, startBattle } = require("./spireLogic"); // 必要な関数のみインポート

function initializeGame(scene, fontBold, fontRegular) {
    const player = spireData.player;
    const enemy = spireData.enemy;

    // プレイヤーと敵のデータを初期化
    Object.assign(player, spireData.initialPlayerData);
    Object.assign(enemy, spireData.initialEnemyData);

    // 描画をクリアし、ゲームを初期化
    spireRender.clearAllDrawings(scene);
    generateDeck(scene); // spireLogic の関数を使用
    spireRender.renderPlayerStats(scene, fontBold, fontRegular);
    startBattle(scene); // spireLogic の関数を使用
}

module.exports = { initializeGame };