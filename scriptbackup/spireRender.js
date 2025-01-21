const spireData = require("./spireData");
const spireUseCard = require("./spireUseCard");

const spireEvents = require("./spireEvents");



// 手札を描画する関数
function renderHand(scene, fontBold, fontRegular) {
    const player = spireData.player;

    if (!player || !player.hand) {
        console.error("Error: player or player.hand is undefined.");
        return;
    }

    if (!scene || typeof scene.append !== "function") {
        console.error("Error: scene is not initialized properly.");
        return;
    }

    if (!Array.isArray(player.handCards)) {
        player.handCards = [];
    }

    const cardWidth = 100;
    const cardHeight = 150;
    const gameHeight = g.game.height || 480; // デフォルト値を設定

    // 手札のカードを一度削除（タグで管理）
    player.handCards.forEach((card) => card.destroy());
    player.handCards = []; // 手札カードリストをリセット

    // 手札のカードを新しく描画
    player.hand.forEach((cardData, index) => {
        if (!cardData) return;

        const xOffset = 10 + index * (cardWidth + 10); // 左詰めの配置
        const yOffset = gameHeight - cardHeight - 20; // 画面下部

        // カード背景
        const card = new g.FilledRect({
            scene,
            cssColor: "white",
            width: cardWidth,
            height: cardHeight,
            x: xOffset,
            y: yOffset,
            touchable: true,
        });
        scene.append(card);

        // タグを付けて手札カードリストに追加
        player.handCards.push(card);

        card.onPointDown.add(() => {
            // カードを使用する処理を呼び出す
            // ステータスもここで更新しておく
            spireUseCard.useCard(cardData, index, scene, fontBold, fontRegular);
            renderPlayerStats(scene, fontBold, fontRegular);
            renderEnemyStats(scene, fontBold, fontRegular);
            renderDeckAndDiscardStats(scene, fontBold, fontRegular);

            // 敵が敗北した場合、勝利画面を描画
            const { checkEnemyDefeat } = require("./spireUseCard");
            if (checkEnemyDefeat()) {
                const { renderVictoryScreen } = require("./spireRender");
                renderVictoryScreen(scene, fontBold, fontRegular);
                return; // 勝利画面を描画した場合は、以降の処理を停止
            }

            // 手札を再描画
            renderHand(scene, fontBold, fontRegular);
        });

        // カード名を表示
        const nameLabel = new g.Label({
            scene,
            font: fontBold,
            text: cardData.name,
            fontSize: 12,
            textColor: "black",
            x: xOffset + 5,
            y: yOffset + 5,
            width: cardWidth - 10,
            lineBreak: true,
        });
        scene.append(nameLabel);

        // カードの効果を表示
        const effectLabel = new g.Label({
            scene,
            font: fontRegular,
            text: cardData.effect,
            fontSize: 12,
            textColor: "black",
            x: xOffset + 5,
            y: yOffset + 25,
            width: cardWidth - 10,
            lineBreak: true,
        });
        scene.append(effectLabel);

        // 手札カードリストにもラベルを追加
        player.handCards.push(nameLabel, effectLabel);
    });
}

function renderPlayerStats(scene, fontBold, fontRegular) {
    const player = spireData.player;

    if (!player) {
        console.error("Error: Player data is undefined.");
        return;
    }

    if (!scene || typeof scene.append !== "function") {
        console.error("Error: Scene is not initialized properly.");
        return;
    }

    // 既存のステータスラベルがあれば削除
    if (player.statsLabels) {
        player.statsLabels.forEach((label) => label.destroy());
    }
    player.statsLabels = [];

    const statsX = 10; // ステータスラベルのX位置（画面左上）
    const statsY = 10; // ステータスラベルのY位置
    const lineHeight = 20; // ラベル間の高さ

    // ヘルスラベル
    const healthLabel = new g.Label({
        scene,
        font: fontBold,
        text: `Health: ${player.health}`,
        fontSize: 16,
        textColor: "red",
        x: statsX,
        y: statsY,
    });
    scene.append(healthLabel);
    player.statsLabels.push(healthLabel);

    // ガードラベル
    const guardLabel = new g.Label({
        scene,
        font: fontRegular,
        text: `Guard: ${player.guard}`,
        fontSize: 16,
        textColor: "green",
        x: statsX,
        y: statsY + lineHeight,
    });
    scene.append(guardLabel);
    player.statsLabels.push(guardLabel);

    // マナラベルを追加
    const manaLabel = new g.Label({
        scene,
        font: fontRegular,
        text: `Mana: ${player.mana}`, 
        fontSize: 16,
        textColor: "blue",
        x: statsX,
        y: statsY + lineHeight * 2,
    });
    scene.append(manaLabel);
    player.statsLabels.push(manaLabel);
}

//てきのすてーたすびょうが
function renderEnemyStats(scene, fontBold, fontRegular) {
    const enemy = spireData.enemy;

    if (!enemy) {
        console.error("Error: Enemy data is undefined.");
        return;
    }

    if (!scene || typeof scene.append !== "function") {
        console.error("Error: Scene is not initialized properly.");
        return;
    }

    // 既存のステータスラベルがあれば削除
    if (enemy.statsLabels) {
        enemy.statsLabels.forEach((label) => label.destroy());
    }
    enemy.statsLabels = [];

    const statsX = g.game.width - 150; // ステータスラベルのX位置（右上）
    const statsY = 10; // ステータスラベルのY位置
    const lineHeight = 20; // ラベル間の高さ

    // ヘルスラベル
    const healthLabel = new g.Label({
        scene,
        font: fontBold,
        text: `Health: ${enemy.health}`,
        fontSize: 16,
        textColor: "red",
        x: statsX,
        y: statsY,
    });
    scene.append(healthLabel);
    enemy.statsLabels.push(healthLabel);

    // ガードラベル
    const guardLabel = new g.Label({
        scene,
        font: fontRegular,
        text: `Guard: ${enemy.guard}`,
        fontSize: 16,
        textColor: "green",
        x: statsX,
        y: statsY + lineHeight,
    });
    scene.append(guardLabel);
    enemy.statsLabels.push(guardLabel);
}

//プレイヤーのステータスと統合可能ではある
function renderDeckAndDiscardStats(scene, fontBold, fontRegular) {
    const player = spireData.player;

    if (!player) {
        console.error("Error: Player data is undefined.");
        return;
    }

    if (!scene || typeof scene.append !== "function") {
        console.error("Error: Scene is not initialized properly.");
        return;
    }

    // 既存のラベルがあれば削除
    if (player.deckStatsLabels) {
        player.deckStatsLabels.forEach((label) => label.destroy());
    }
    player.deckStatsLabels = [];

    const statsX = 10; // ラベルのX位置（左上）
    const statsY = 70; // ラベルのY位置
    const lineHeight = 20; // ラベル間の高さ

    // 山札ラベル
    const deckLabel = new g.Label({
        scene,
        font: fontBold,
        text: `Deck: ${player.deck.length}`,
        fontSize: 16,
        textColor: "blue",
        x: statsX,
        y: statsY,
    });
    scene.append(deckLabel);
    player.deckStatsLabels.push(deckLabel);

    // 捨て札ラベル
    const discardLabel = new g.Label({
        scene,
        font: fontRegular,
        text: `Discard: ${player.discardPile.length}`,
        fontSize: 16,
        textColor: "gray",
        x: statsX,
        y: statsY + lineHeight,
    });
    scene.append(discardLabel);
    player.deckStatsLabels.push(discardLabel);
}

function renderDebugButton(scene, fontBold, fontRegular) {
    if (!scene || typeof scene.append !== "function") {
        console.error("Error: Scene is not initialized properly.");
        return;
    }

    const buttonWidth = 100;
    const buttonHeight = 40;

    // デバッグボタン 手札の上に配置
    const debugButton = new g.FilledRect({
        scene,
        cssColor: "red",
        width: buttonWidth,
        height: buttonHeight,
        x: 10, 
        y: 500,
        touchable: true,
    });
    scene.append(debugButton);

    // ボタン上のラベル
    const buttonLabel = new g.Label({
        scene,
        font: fontBold, // 渡された fontBold を使用
        text: "End Turn",
        fontSize: 16,
        textColor: "white",
        x: debugButton.x + 10,
        y: debugButton.y + 10,
    });
    scene.append(buttonLabel);

    // ボタンのクリックイベント
    debugButton.onPointDown.add(() => {
        console.log("Debug Button Clicked: Ending Turn");
        spireEvents.emit("endTurn", scene, fontBold, fontRegular);
        });
}

function renderEnemyAction(scene, fontBold, fontRegular) {
    const enemy = spireData.enemy;

    if (!scene || typeof scene.append !== "function") {
        console.error("Error: Scene is not initialized properly.");
        return;
    }

    if (!enemy || !enemy.currentAction) {
        console.warn("Warning: Enemy current action is not defined.");
        return;
    }

    const cardWidth = 100;
    const cardHeight = 160;

    // 
    const statsX = g.game.width - 150; // ステータスラベルのX位置（右上）
    const statsY = 10; // ステータスラベルのY位置
    const lineHeight = 20; // ステータスラベル間の高さ

    // 行動カードをステータス表示の下に配置
    const enemyActionCard = new g.FilledRect({
        scene,
        cssColor: "grey",
        width: cardWidth,
        height: cardHeight,
        x: statsX - cardWidth - 10, // ステータスの左側
        y: statsY, // 同じY座標
        touchable: false,
    });
    scene.append(enemyActionCard);

    // 一行目: 敵の次の行動
    const actionLabel = new g.Label({
        scene,
        font: fontBold,
        text: `敵の次の行動`,
        fontSize: 14,
        textColor: "white",
        x: enemyActionCard.x + 10,
        y: enemyActionCard.y + 10,
        width: cardWidth - 20,
        lineBreak: true,
    });
    scene.append(actionLabel);

    // 二行目: 行動のタイプ
    const typeLabel = new g.Label({
        scene,
        font: fontRegular,
        text: `${enemy.currentAction.type}`,
        fontSize: 12,
        textColor: "white",
        x: enemyActionCard.x + 10,
        y: enemyActionCard.y + 35,
        width: cardWidth - 20,
        lineBreak: true,
    });
    scene.append(typeLabel);

    // 三行目: 行動の効果
    const effectLabel = new g.Label({
        scene,
        font: fontRegular,
        text: `${enemy.currentAction.effect}`,
        fontSize: 12,
        textColor: "white",
        x: enemyActionCard.x + 10,
        y: enemyActionCard.y + 60,
        width: cardWidth - 20,
        lineBreak: true,
    });
    scene.append(effectLabel);

    // カード全体をまとめるためのオブジェクト
    return {
        card: enemyActionCard,
        labels: [actionLabel, typeLabel, effectLabel],
    };
}

function renderVictoryScreen(scene, fontBold, fontRegular) {
    if (!scene || typeof scene.append !== "function") {
        console.error("Error: Scene is not initialized properly.");
        return;
    }

    const gameWidth = g.game.width || 640; // デフォルト値
    const gameHeight = g.game.height || 480; // デフォルト値

    // "You win" テキスト
    const youWinLabel = new g.Label({
        scene,
        font: fontBold,
        text: "You win",
        fontSize: 32,
        textColor: "blue",
        x: gameWidth / 2 - 80, // 中央付近に配置
        y: gameHeight / 2 - 100,
        width: 160, // テキストの幅を設定
        textAlign: "center", // テキストを中央揃え
    });
    scene.append(youWinLabel);

    // "報酬を二つ選択" テキスト
    const rewardPromptLabel = new g.Label({
        scene,
        font: fontRegular,
        text: "報酬を二つ選択",
        fontSize: 24,
        textColor: "black",
        x: gameWidth / 2 - 120, // 中央付近に配置
        y: gameHeight / 2 - 50,
        width: 240, // テキストの幅を設定
        textAlign: "center", // テキストを中央揃え
    });
    scene.append(rewardPromptLabel);

    // 報酬カードを描画
    const rewardCards = [];
    const cardWidth = 100;
    const cardHeight = 150;
    const cardSpacing = 20;
    const totalCards = 4;

    const startX = (gameWidth - (totalCards * cardWidth + (totalCards - 1) * cardSpacing)) / 2;
    const startY = gameHeight / 2 + 20;

    for (let i = 0; i < totalCards; i++) {
        const cardX = startX + i * (cardWidth + cardSpacing);

        // 報酬カード（空のカード）
        const card = new g.FilledRect({
            scene,
            cssColor: "white",
            width: cardWidth,
            height: cardHeight,
            x: cardX,
            y: startY,
            touchable: true,
        });

        // 報酬カードをクリックした場合の処理
        card.onPointDown.add(() => {
            console.log(`Reward card ${i + 1} selected.`);
            // TODO: 報酬カード選択時の処理を追加
        });

        scene.append(card);
        rewardCards.push(card);
    }
}

function renderDefeatScreen(scene, fontBold, fontRegular) {
    if (!scene || typeof scene.append !== "function") {
        console.error("Error: Scene is not initialized properly.");
        return;
    }

    const gameWidth = g.game.width || 640;
    const gameHeight = g.game.height || 480;

    const youLoseLabel = new g.Label({
        scene,
        font: fontBold,
        text: "You Lose",
        fontSize: 32,
        textColor: "red",
        x: gameWidth / 2 - 80,
        y: gameHeight / 2 - 100,
        width: 160,
        textAlign: "center",
    });
    scene.append(youLoseLabel);

    const resetPromptLabel = new g.Label({
        scene,
        font: fontRegular,
        text: "クリックでリセット",
        fontSize: 24,
        textColor: "white",
        x: gameWidth / 2 - 120,
        y: gameHeight / 2 - 50,
        width: 240,
        textAlign: "center",
    });
    scene.append(resetPromptLabel);

    const resetOverlay = new g.FilledRect({
        scene,
        cssColor: "transparent",
        width: gameWidth,
        height: gameHeight,
        x: 0,
        y: 0,
        touchable: true,
    });

    resetOverlay.onPointDown.add(() => {
        console.log("Resetting the game...");
        console.log("Scene in renderDefeatScreen:", scene); // デバッグ用ログ
        spireEvents.emit("resetGame", scene); // シーンを渡す
    });

    scene.append(resetOverlay);
}

function clearAllDrawings(scene) {
    if (!scene) {
        console.error("Error: Scene is not provided or is undefined.");
        return;
    }

    if (typeof scene.children === "undefined") {
        console.error("Error: Scene does not have a 'children' property. Scene:", scene);
        return;
    }

    // シーン内のすべての描画要素を削除
    while (scene.children.length > 0) {
        scene.children[0].destroy(); // 先頭の描画要素を破棄
    }

    console.log("All drawings cleared.");
}

// イベントリスナーを登録
spireEvents.on("clearAllDrawings", (scene) => {
    console.log("clearAllDrawings event received.");
    clearAllDrawings(scene);
});

module.exports = {
    renderHand,
    renderPlayerStats,
    renderEnemyStats,
    renderDeckAndDiscardStats,
    renderDebugButton,
    renderEnemyAction,
    renderVictoryScreen,
    renderDefeatScreen,
    clearAllDrawings 
};