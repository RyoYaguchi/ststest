const spireData = require("./spireData");
const spireUseCard = require("./spireUseCard");

const spireEvents = require("./spireEvents");

// シャッフル関数（配列をランダムに並び替える）
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(g.game.random.generate() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

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
            renderPlayerStats(scene, fontBold, fontRegular);

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

    // 既存のステータスラベルを削除
    if (player.statsLabels) {
        player.statsLabels.forEach((label) => label.destroy());
    }
    player.statsLabels = [];

    const statsX = 10; // ラベルのX位置（左上）
    const statsY = 10; // ラベルのY位置
    const lineHeight = 26; // ラベル間の高さ（背景を考慮して少し広げる）
    const labelPadding = 4; // ラベルと背景間の余白
    const bgColorMap = {
        red: "#FF6F6F",      // ヘルス (明るい赤)
        blue: "#6F9EFF",     // マナ (明るい青)
        green: "#6FFF6F",    // ガード (明るい緑)
        gold: "#FFD700",     // ストレングス (ゴールド)
        silver: "#C0C0C0",   // アーマー (シルバー)
        darkBlue: "#4A78B2", // デッキ (濃い青)
        gray: "#A9A9A9",     // 捨て札 (灰色)
        orange: "#FFA500",   // 追放 (オレンジ)
        purple: "#BA55D3",   // 歩数 (紫)
    };

    // 描画順序と設定
    const stats = [
        { label: `Health: ${player.health}/${player.maxHealth}`, color: "red" },
        { label: `Mana: ${player.mana}`, color: "blue" },
        { label: `Guard: ${player.guard}`, color: "green" },
        { label: `Strength: ${player.strength}`, color: "gold" },
        { label: `Armour: ${player.armour}`, color: "silver" },
        null, // 空白行
        { label: `Deck: ${player.deck.length}`, color: "darkBlue" },
        { label: `Discard: ${player.discardPile.length}`, color: "gray" },
        { label: `Exiled: ${player.exiled.length}`, color: "orange" },
        null, // 空白行
        { label: `Walk Count: ${player.walkCount}`, color: "purple" },
    ];

    stats.forEach((stat, index) => {
        if (stat === null) return; // 空白行はスキップして座標のみ進める

        const bgRect = new g.FilledRect({
            scene,
            cssColor: bgColorMap[stat.color],
            width: 240,
            height: 24, // 行の高さに合わせた背景サイズ
            x: statsX,
            y: statsY + lineHeight * index,
        });
        scene.append(bgRect);

        const statLabel = new g.Label({
            scene,
            font: fontRegular,
            text: stat.label,
            fontSize: 16,
            textColor: "black", // 
            x: statsX + labelPadding,
            y: statsY + lineHeight * index + labelPadding,
        });
        scene.append(statLabel);

        // 背景とラベルを一緒に管理
        player.statsLabels.push(bgRect, statLabel);
    });
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
// function renderDeckAndDiscardStats(scene, fontBold, fontRegular) {
//     const player = spireData.player;

//     if (!player) {
//         console.error("Error: Player data is undefined.");
//         return;
//     }

//     if (!scene || typeof scene.append !== "function") {
//         console.error("Error: Scene is not initialized properly.");
//         return;
//     }

//     // 既存のラベルがあれば削除
//     if (player.deckStatsLabels) {
//         player.deckStatsLabels.forEach((label) => label.destroy());
//     }
//     player.deckStatsLabels = [];

//     const statsX = 10; // ラベルのX位置（左上）
//     const statsY = 70; // ラベルのY位置
//     const lineHeight = 20; // ラベル間の高さ

//     // 山札ラベル
//     const deckLabel = new g.Label({
//         scene,
//         font: fontBold,
//         text: `Deck: ${player.deck.length}`,
//         fontSize: 16,
//         textColor: "blue",
//         x: statsX,
//         y: statsY,
//     });
//     scene.append(deckLabel);
//     player.deckStatsLabels.push(deckLabel);

//     // 捨て札ラベル
//     const discardLabel = new g.Label({
//         scene,
//         font: fontRegular,
//         text: `Discard: ${player.discardPile.length}`,
//         fontSize: 16,
//         textColor: "gray",
//         x: statsX,
//         y: statsY + lineHeight,
//     });
//     scene.append(discardLabel);
//     player.deckStatsLabels.push(discardLabel);

//     // 追放カードラベル
//     const exiledLabel = new g.Label({
//         scene,
//         font: fontRegular,
//         text: `Exiled: ${player.exiled.length}`,
//         fontSize: 16,
//         textColor: "orange",
//         x: statsX,
//         y: statsY + lineHeight * 2,
//     });
//     scene.append(exiledLabel);
//     player.deckStatsLabels.push(exiledLabel);
// }

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

    // ステータスラベルの位置
    const statsX = g.game.width - 150; // 右上
    const statsY = 10;

    // 行動カード
    const enemyActionCard = new g.FilledRect({
        scene,
        cssColor: "grey",
        width: cardWidth,
        height: cardHeight,
        x: statsX - cardWidth - 10,
        y: statsY,
        touchable: false,
    });
    scene.append(enemyActionCard);

    // ラベル: 敵の次の行動
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

    // ラベル: 行動タイプ
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

    // ラベル: 行動効果
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

    // 描画要素を格納
    spireData.enemyActionComponents = spireData.enemyActionComponents || [];
    spireData.enemyActionComponents.push(enemyActionCard, actionLabel, typeLabel, effectLabel);
}

function wrapText(text, maxWidth, fontSize) {
    const wrappedText = [];
    let currentLine = "";

    for (let char of text) {
        const testLine = currentLine + char;
        const testWidth = testLine.length * fontSize; // テキストの幅を概算
        if (testWidth > maxWidth) {
            wrappedText.push(currentLine);
            currentLine = char;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        wrappedText.push(currentLine);
    }

    return wrappedText;
}

function renderVictoryScreen(scene, fontBold, fontRegular) {
    if (!scene || typeof scene.append !== "function") {
        console.error("Error: Scene is not initialized properly.");
        return;
    }

    const gameWidth = g.game.width || 640;
    const gameHeight = g.game.height || 480;
    const player = spireData.player;

    if (!player) {
        console.error("Error: Player data is undefined.");
        return;
    }

    // 手札を削除
    if (spireData.hand && Array.isArray(spireData.hand)) {
        spireData.hand.forEach((card) => {
            if (!card.destroyed()) {
                card.destroy();
            }
        });
        spireData.hand = []; // 手札データをクリア
    }

    // 敵ステータスラベルを削除
    const enemy = spireData.enemy;
    if (enemy && Array.isArray(enemy.statsLabels)) {
        enemy.statsLabels.forEach((label) => {
            if (!label.destroyed()) {
                label.destroy();
            }
        });
        enemy.statsLabels = [];
    }

    // 敵行動ラベルを削除
    const enemyActionComponents = spireData.enemyActionComponents || [];
    enemyActionComponents.forEach((component) => {
        if (!component.destroyed()) {
            component.destroy();
        }
    });
    spireData.enemyActionComponents = []; // 削除後にリセット

    const victoryComponents = []; // 報酬画面に関連する要素を格納する配列

    // 勝利ラベル
    const youWinLabel = new g.Label({
        scene,
        font: fontBold,
        text: "You win",
        fontSize: 32,
        textColor: "blue",
        x: gameWidth / 2 - 80,
        y: gameHeight / 2 - 100,
        width: 160,
        textAlign: "center",
    });
    scene.append(youWinLabel);
    victoryComponents.push(youWinLabel);

    // 報酬選択ラベル
    const rewardPromptLabel = new g.Label({
        scene,
        font: fontRegular,
        text: "報酬を二つ選択",
        fontSize: 24,
        textColor: "black",
        x: gameWidth / 2 - 120,
        y: gameHeight / 2 - 50,
        width: 240,
        textAlign: "center",
    });
    scene.append(rewardPromptLabel);
    victoryComponents.push(rewardPromptLabel);

    const cardWidth = 100;
    const cardHeight = 150;
    const cardSpacing = 20;
    const totalCards = 4;
    const startX = (gameWidth - (totalCards * cardWidth + (totalCards - 1) * cardSpacing)) / 2;
    const startY = gameHeight / 2 + 20;

    // 報酬を選定
    const skillCards = shuffleArray([...spireData.cards]).slice(0, 2); // スキルカード2枚
    const otherRewards = shuffleArray([...spireData.winRewards]).slice(0, 2); // その他報酬2枚
    const selectedRewards = [...skillCards, ...otherRewards];

    let selectedCount = 0;

    selectedRewards.forEach((reward, i) => {
        const cardX = startX + i * (cardWidth + cardSpacing);

        const cardEntity = new g.E({
            scene,
            x: cardX,
            y: startY,
            width: cardWidth,
            height: cardHeight,
            touchable: true,
        });

        const cardBackground = new g.FilledRect({
            scene,
            cssColor: "white",
            width: cardWidth,
            height: cardHeight,
            x: 0,
            y: 0,
        });
        cardEntity.append(cardBackground);

        if (reward.name) {
            // スキルカードの場合
            const wrappedName = wrapText(reward.name, cardWidth - 10, 14);
            wrappedName.forEach((line, index) => {
                const cardNameLabel = new g.Label({
                    scene,
                    font: fontRegular,
                    text: line,
                    fontSize: 14,
                    textColor: "black",
                    x: 5,
                    y: 10 + index * 16,
                    width: cardWidth - 10,
                });
                cardEntity.append(cardNameLabel);
            });

            const effectLabel = new g.Label({
                scene,
                font: fontRegular,
                text: reward.effect,
                fontSize: 12,
                textColor: "gray",
                x: 5,
                y: cardHeight - 30,
                width: cardWidth - 10,
            });
                cardEntity.append(effectLabel);
        } else if (reward.eventName) {
            // その他報酬の場合
            const eventLabel = new g.Label({
                scene,
                font: fontRegular,
                text: reward.eventName,
                fontSize: 14,
                textColor: "blue",
                x: 5,
                y: 10,
                width: cardWidth - 10,
            });
            cardEntity.append(eventLabel);

            const effectLabel = new g.Label({
                scene,
                font: fontRegular,
                text: reward.effect,
                fontSize: 12,
                textColor: "gray",
                x: 5,
                y: cardHeight - 30,
                width: cardWidth - 10,
            });
            cardEntity.append(effectLabel);
        }

        cardEntity.onPointDown.add(() => {
            if (selectedCount < 2) {
                if (reward.apply) {
                    reward.apply(player); // イベントの効果を適用
                } else {
                    player.deck.push(reward); // スキルカードを追加
                }
                selectedCount++;
                if (!cardEntity.destroyed()) {
                    cardEntity.destroy();
                }
        
                if (selectedCount === 2) {
                    // 報酬画面の要素を削除
                    victoryComponents.forEach((component) => {
                        if (!component.destroyed()) {
                            component.destroy();
                        }
                    });
        
                    // 敵の行動描画を削除
                    if (spireData.enemyActionComponents) {
                        spireData.enemyActionComponents.forEach((component) => {
                            if (!component.destroyed()) {
                                component.destroy();
                            }
                        });
                        spireData.enemyActionComponents = [];
                    }
        
                    // 必要な描画を再描画
                    renderPlayerStats(scene, fontBold, fontRegular);
                    renderNextDestinationSelection(scene, fontBold, fontRegular);
                }
            }
        });

        scene.append(cardEntity);
        victoryComponents.push(cardEntity);
    });
}

function renderNextDestinationSelection(scene, fontBold, fontRegular) {
    if (!scene || typeof scene.append !== "function") {
        console.error("Error: Scene is not initialized properly.");
        return;
    }

    const gameWidth = g.game.width || 640;
    const gameHeight = g.game.height || 480;

    const cardWidth = 100;
    const cardHeight = 150;
    const cardSpacing = 20;
    const totalCards = 3;
    const startX = (gameWidth - (totalCards * cardWidth + (totalCards - 1) * cardSpacing)) / 2;
    const startY = gameHeight / 2;

    const nextWayOptions = shuffleArray(spireData.nextWay).slice(0, totalCards); // ランダムに3つ選択

    // "行先を選択"ラベル
    const promptLabel = new g.Label({
        scene,
        font: fontBold,
        text: "行先を選択",
        fontSize: 24,
        textColor: "black",
        x: gameWidth / 2 - 80,
        y: startY - 50,
        width: 160,
        textAlign: "center",
    });
    scene.append(promptLabel);

    const cardEntities = []; // 描画される全てのカードを格納

    nextWayOptions.forEach((option, i) => {
        const cardX = startX + i * (cardWidth + cardSpacing);

        const cardEntity = new g.E({
            scene,
            x: cardX,
            y: startY,
            width: cardWidth,
            height: cardHeight,
            touchable: true,
        });

        const cardBackground = new g.FilledRect({
            scene,
            cssColor: "white",
            width: cardWidth,
            height: cardHeight,
            x: 0,
            y: 0,
        });
        cardEntity.append(cardBackground);

        // イベント名のラベル
        const eventNameLabel = new g.Label({
            scene,
            font: fontRegular,
            text: option.eventName,
            fontSize: 14,
            textColor: "blue",
            x: 5,
            y: 10,
            width: cardWidth - 10,
        });
        cardEntity.append(eventNameLabel);

        // 効果のラベル
        const effectLabel = new g.Label({
            scene,
            font: fontRegular,
            text: option.effect,
            fontSize: 12,
            textColor: "gray",
            x: 5,
            y: cardHeight - 30,
            width: cardWidth - 10,
        });
        cardEntity.append(effectLabel);

        cardEntity.onPointDown.add(() => {
            console.log(`Event "${option.eventName}" triggered.`);

            // イベントの効果を適用
            if (option.apply) {
                option.apply(spireData.player, spireData.enemy, (newEnemy) => {
                    spireData.enemy = newEnemy;
                });
            }

            // プレイヤーの歩数を増加
            spireData.player.walkCount = (spireData.player.walkCount || 0) + 1;
            console.log(`Player walkCount: ${spireData.player.walkCount}`);

            // 他のカードを削除
            cardEntities.forEach((card) => {
                if (!card.destroyed()) {
                    card.destroy();
                }
            });

            // ラベルも削除
            if (!promptLabel.destroyed()) {
                promptLabel.destroy();
            }

            // 次の描画処理（例: renderPlayerStatsや新しいイベント）
            renderPlayerStats(scene, fontBold, fontRegular);
        });

        scene.append(cardEntity);
        cardEntities.push(cardEntity);
    });
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
        console.log("Reset button clicked. Emitting initializeGame event...");
        spireEvents.emit("initializeGame", scene, fontBold, fontRegular);
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

// イベントリスナーを登録 clearalldrawing
spireEvents.on("clearAllDrawings", (scene) => {
    console.log("clearAllDrawings event received.");
    clearAllDrawings(scene);
});

module.exports = {
    renderHand,
    renderPlayerStats,
    renderEnemyStats,
    renderDebugButton,
    renderEnemyAction,
    renderVictoryScreen,
    renderDefeatScreen,
    clearAllDrawings 
};