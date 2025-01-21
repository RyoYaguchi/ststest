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

    // 共通処理
    if (cardData.type === "攻撃") {
        // ダメージ処理
        let damage = cardData.ValueA+player.strength;
        const damageAfterGuard = Math.max(0, damage - enemy.guard);
        enemy.health -= damageAfterGuard;
        enemy.guard = Math.max(0, enemy.guard - damage);

        console.log(`Enemy Guard: ${enemy.guard}`);
        console.log(`Enemy Health: ${enemy.health}`);
        checkEnemyDefeat(scene, fontBold, fontRegular);
    } else if (cardData.type === "防御" || cardData.type === "支援") {
        // 防御と支援の共通処理
        console.log(`Card Type: ${cardData.type}`);
    }

    // プレイヤーのガード増加
    if (cardData.ValueB) {
        player.guard += cardData.ValueB;
        console.log(`Player Guard: ${player.guard}`);
    }

    // 手札を増加
    if (cardData.ValueC) {
        const drawCards = require("./spireLogic").drawCards;
        drawCards(cardData.ValueC, scene, fontBold, fontRegular);
    }

    // マナの増加
    if (cardData.ValueD) {
        player.mana += cardData.ValueD;
        console.log(`Player Mana: ${player.mana}`);
    }

    // カードの移動処理
    player.hand.splice(index, 1);

    if (cardData.exile) {
        player.exiled.push(cardData); // exileタグ付きカードはexiledへ
        console.log(`Card ${cardData.name} added to exiled.`);
    } else {
        player.discardPile.push(cardData); // それ以外は捨て札へ
        console.log(`Card ${cardData.name} added to discard pile.`);
    }
}

// 勝利判定
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


module.exports = {
    useCard,
    checkEnemyDefeat,
};