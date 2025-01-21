const spireData = require("./spireData");
const spireRender = require("./spireRender");
const spireEvents = require("./spireEvents");

function initializeGame(scene, fontBold, fontRegular) {
    console.log("Initializing game...");
    const player = spireData.player;
    const enemy = spireData.enemy;

    // プレイヤーと敵のデータを初期化
    Object.assign(player, spireData.initialPlayerData);
    Object.assign(enemy, spireData.initialEnemyData);

    // Labelや描画を初期化
    player.statsLabels = [];
    player.handCards = [];
    enemy.statsLabels = [];
    player.deckStatsLabels = [];
    player.hand = [];
    player.deck = [];
    player.discardPile = [];


    // 描画をクリアし、ゲームを初期化
    spireRender.clearAllDrawings(scene);
    generateDeck(scene);
    spireRender.renderPlayerStats(scene, fontBold, fontRegular);
    startBattle(scene);
}

// イベントリスナーを登録
spireEvents.on("initializeGame", (scene, fontBold, fontRegular) => {
    console.log("initializeGame event received.");
    initializeGame(scene, fontBold, fontRegular);
});

console.log("spireRender:", Object.keys(spireRender));

const fontBold = new g.DynamicFont({
    game: g.game,
    fontFamily: g.FontFamily.SansSerif,
    size: 16,
});

const fontRegular = new g.DynamicFont({
    game: g.game,
    fontFamily: g.FontFamily.SansSerif,
    size: 12,
});


spireEvents.on("endTurn", (scene, fontBold, fontRegular) => {
    endTurn(scene, fontBold, fontRegular);
});

function generateDeck() {
    const deck = spireData.player.deck;
    deck.length = 0;

    for (let i = 0; i < 5; i++) {
        deck.push({ ...spireData.createAtc1 });
    }
    for (let i = 0; i < 3; i++) {
        deck.push({ ...spireData.createDef1 });
    }
    for (let i = 0; i < 2; i++) {
        deck.push({ ...spireData.createSup1 });
    }
    shuffleDeck(deck);
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(g.game.random.generate() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function startBattle(scene) {

    spireRender.renderPlayerStats(scene, fontBold, fontRegular);
    spireRender.renderEnemyStats(scene, fontBold, fontRegular);
    decideEnemyAction(spireData.enemy); // 敵の次回アクションを決定
    spireRender.renderEnemyAction(scene, fontBold, fontRegular); // 敵の行動カードを描画
    spireRender.renderDebugButton(scene, fontBold, fontRegular);

    drawCards(5, scene, fontBold, fontRegular);

}

function drawCards(num, scene, fontBold, fontRegular) {
    const player = spireData.player;

    if (!Array.isArray(player.hand)) {
        console.warn("Initializing player.hand as an empty array.");
        player.hand = [];
    }
    if (!Array.isArray(player.deck)) {
        console.warn("Initializing player.deck as an empty array.");
        player.deck = [];
    }
    if (!Array.isArray(player.discardPile)) {
        console.warn("Initializing player.discardPile as an empty array.");
        player.discardPile = [];
    }

    for (let i = 0; i < num; i++) {
        if (player.deck.length === 0) {
            console.info("Deck is empty. Shuffling discard pile into deck.");
            shuffleDeck(player.discardPile);
            player.deck.push(...player.discardPile);
            player.discardPile = [];
        }

        if (player.deck.length > 0) {
            const drawnCard = player.deck.pop();
            if (drawnCard) {
                console.info(`Drew card: ${drawnCard.name || drawnCard.id}`);
                player.hand.push(drawnCard);
            } else {
                console.warn("Attempted to draw a card, but it was undefined.");
            }
        }
    }

    // 再描画処理
    spireRender.renderHand(scene, fontBold, fontRegular);
    spireRender.renderPlayerStats(scene, fontBold, fontRegular);
}

function endTurn(scene, fontBold, fontRegular) {
    const player = spireData.player;

    // 敵の行動処理
    enemyAct(scene, fontBold, fontRegular);

    // プレイヤーのヘルスが0以下の場合
    if (player.health <= 0) {
        console.log("Player has been defeated. Showing defeat screen...");

        // 敗北画面を描画
        spireRender.renderDefeatScreen(scene, fontBold, fontRegular);

        // 敗北後は以降の処理を中断
        return;
    }

    // 手札を捨て札に移動
    player.discardPile.push(...player.hand);
    player.hand = [];

    // 次のターンの手札を引く
    drawCards(5, scene, fontBold, fontRegular);

    // 敵の次のアクションを決定
    decideEnemyAction(spireData.enemy);

    // 敵の行動を描画
    spireRender.renderEnemyAction(scene, fontBold, fontRegular);
}

// 敵の次回行動を決定する関数
function decideEnemyAction(enemy) {
    if (!enemy || !Array.isArray(enemy.acts) || enemy.acts.length === 0) {
        console.error("Error: Enemy actions are not defined properly.");
        return;
    }

    // ランダムにアクションを選択
    const randomIndex = Math.floor(g.game.random.generate() * enemy.acts.length);
    enemy.currentAction = enemy.acts[randomIndex];

    console.log(`Enemy chose action: ${enemy.currentAction.id}`);
}

function enemyAct(scene, fontBold, fontRegular) {
    const player = spireData.player;
    const enemy = spireData.enemy;

    if (!player || !enemy) {
        console.error("Error: Player or Enemy data is undefined.");
        return;
    }

    if (!enemy.currentAction || enemy.currentAction.type !== "攻撃") {
        console.warn("Enemy has no valid attack action.");
        return;
    }

    // 攻撃処理
    const attackValue = enemy.currentAction.ValueA;
    const damageAfterGuard = Math.max(0, attackValue - player.guard);

    // プレイヤーのガードを減少
    player.guard = Math.max(0, player.guard - attackValue);

    // プレイヤーにダメージを与える
    player.health -= damageAfterGuard;

    console.log(`Enemy attacked with ${attackValue} damage.`);
    console.log(`Player Guard: ${player.guard}`);
    console.log(`Player Health: ${player.health}`);

    // ステータスを再描画
    spireRender.renderPlayerStats(scene, fontBold, fontRegular);
    spireRender.renderEnemyStats(scene, fontBold, fontRegular);

    // 次の行動を決定
    decideEnemyAction(enemy);
}


module.exports = {
    enemyAct,
};

module.exports = {
    generateDeck,
    shuffleDeck,
    startBattle,
    drawCards,
    endTurn,
    decideEnemyAction,
    initializeGame
};