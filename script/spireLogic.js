const spireData = require("./spireData");
const spireRender = require("./spireRender");
const spireEvents = require("./spireEvents");
const spireUseCard =require("./spireUseCard")

function initializeGame(scene) {
    console.log("Initializing game...");
    const { player, enemy, fonts } = spireData;

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
    spireRender.renderPlayerStats(scene, fonts.bold, fonts.regular);
    startBattle(scene);
}

// イベントリスナーを登録
spireEvents.on("initializeGame", (scene) => {
    initializeGame(scene);
});

console.log("spireRender:", Object.keys(spireRender));


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

function reshuffleDeck() {
    const player = spireData.player;

    if (!player) {
        console.error("Error: Player data is missing or undefined.");
        return;
    }

    player.deck.push(...player.hand, ...player.discardPile, ...player.exiled);
    player.hand = [];
    player.discardPile = [];
    player.exiled = [];

    shuffleDeck(player.deck);
    console.log("Deck reshuffled after victory.");
}

// イベント登録
spireEvents.on("reshuffleDeck", reshuffleDeck);


function startBattle(scene) {
    spireData.player.guard = 0;
    spireData.player.mana = spireData.player.maxMana;
    spireRender.renderPlayerStats(scene);
    spireRender.renderEnemyStats(scene);
    decideEnemyAction(spireData.enemy);
    spireRender.renderEnemyAction(scene);
    spireRender.renderDebugButton(scene);
    drawCards(5, scene);
}

// リスナー登録
spireEvents.on("startBattle", startBattle);

function endTurn(scene, fontBold, fontRegular) {
    const player = spireData.player;

    // 敵の行動処理
    enemyAct(scene, fontBold, fontRegular);

    // 毒によるダメージ処理
    if (player.poisoned > 0) {
        console.log(`Player is poisoned. Taking ${player.poisoned} damage.`);
        player.health -= player.poisoned;
        player.poisoned--; // 毒の値を1減少

        if (player.health <= 0) {
            console.log("Player has been defeated by poison. Showing defeat screen...");
            spireRender.renderDefeatScreen(scene, fontBold, fontRegular);
            return; // 敗北後は以降の処理を中断
        }
    }

    // プレイヤーのヘルスが0以下の場合
    if (player.health <= 0) {
        console.log("Player has been defeated. Showing defeat screen...");
        spireRender.renderDefeatScreen(scene, fontBold, fontRegular);
        return; // 敗北後は以降の処理を中断
    }

    // 手札を捨て札に移動
    player.discardPile.push(...player.hand);
    player.hand = [];

    // 次のターンの手札を引く
    drawCards(5, scene, fontBold, fontRegular);

    // マナ回復
    player.mana = player.maxMana;

    // 麻痺の処理
    if (player.paralised > 0) {
        console.log(`Player is paralised. Reducing mana by 1.`);
        player.mana = Math.max(0, player.mana - 1); // マナを1減少（最低値は0）
        player.paralised--; // 麻痺の値を1減少
    }

    player.guard = 0;

    // 敵の次のアクションを決定
    decideEnemyAction(spireData.enemy);

    // 敵の行動を描画
    spireRender.renderEnemyAction(scene, fontBold, fontRegular);
}

spireEvents.on("endTurn", (scene, fontBold, fontRegular) => {
    endTurn(scene, fontBold, fontRegular);
});

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

    // ダメージ計算: guard と armour を考慮
    const effectiveGuard = Math.min(player.guard, attackValue); // guard でダメージを軽減
    const remainingDamage = Math.max(0, attackValue - effectiveGuard); // guard を超えるダメージ
    const effectiveArmour = Math.min(player.armour, remainingDamage); // armour で残りダメージを軽減
    const finalDamage = Math.max(0, remainingDamage - effectiveArmour); // armour を超える最終ダメージ

    // プレイヤーのガードを減少
    player.guard = Math.max(0, player.guard - attackValue);

    // プレイヤーの体力を減少
    player.health -= finalDamage;

    console.log(`Enemy attacked with ${attackValue} damage.`);
    console.log(`Effective Guard: ${effectiveGuard}`);
    console.log(`Remaining Damage after Guard: ${remainingDamage}`);
    console.log(`Effective Armour: ${effectiveArmour}`);
    console.log(`Final Damage to Player: ${finalDamage}`);
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
    reshuffleDeck,
    startBattle,
    drawCards,
    endTurn,
    decideEnemyAction,
    initializeGame
};