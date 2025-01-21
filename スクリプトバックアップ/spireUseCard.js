//spireLogicに入れたいが、循環依存問題の解決のために仮に置く。
//UseCardその他をいろいろ

const spireData = require("./spireData");
const spireEvents = require("./spireEvents");
console.log("Calling main...");




// カード使用処理
function useCard(cardData, index, scene, fontBold, fontRegular) {
    const player = spireData.player;
    const enemy = spireData.enemy;

    if (!player || !enemy) {
        console.error("Error: Player or Enemy data is undefined.");
        return;
    }

    if (player.mana < cardData.cost) {
        console.warn(`Not enough mana to use the card: ${cardData.name}`);
        return;
    }

    console.log(`Card used: ${cardData.name}`);
    player.mana -= cardData.cost;

    if (cardData.type === "攻撃") {
        let damage = cardData.ValueA;
        const damageAfterGuard = Math.max(0, damage - enemy.guard);
        enemy.health -= damageAfterGuard;
        enemy.guard = Math.max(0, enemy.guard - damage);

        console.log(`Enemy Guard: ${enemy.guard}`);
        console.log(`Enemy Health: ${enemy.health}`);
        checkEnemyDefeat(scene, fontBold, fontRegular);
    } else if (cardData.type === "防御") {
        player.guard += cardData.ValueA;
        console.log(`Player Guard: ${player.guard}`);
    } else if (cardData.type === "支援") {
        const drawCards = require("./spireLogic").drawCards;
        drawCards(cardData.ValueA, scene, fontBold, fontRegular);
    }

    player.hand.splice(index, 1);
    player.discardPile.push(cardData);
}

// 敵の勝利判定
function checkEnemyDefeat() {
    const enemy = spireData.enemy;

    if (!enemy) {
        console.error("Error: Enemy data is undefined.");
        return false;
    }

    if (enemy.health <= 0) {
        console.log("Enemy has been defeated.");
        return true;
    }

    return false;
}

// イベントリスナーを登録
spireEvents.on("resetGame", (scene) => {
    console.log("resetGame event received with scene:", scene);
    if (!scene || typeof scene.children === "undefined") {
        console.error("Error: Invalid scene passed to resetGame from event.", scene);
        return;
    }

    resetGame(scene);
});

module.exports = {
    useCard,
    checkEnemyDefeat,
};