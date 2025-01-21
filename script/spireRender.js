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
    const { bold, regular } = spireData.fonts;
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
    player.handCards.forEach((card) => {
        if (card && typeof card.destroy === "function" && !card.destroyed()) {
            card.destroy();
        }
    });
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
            spireUseCard.useCard(cardData, index, scene, fontBold, fontRegular);

            // ボスに勝っていたら処理をスキップ
            if (spireData.gameWon) {
                console.log("Game already won. Skipping useCard.");
                return;
            }

            renderPlayerStats(scene, fontBold, fontRegular);
            renderEnemyStats(scene, fontBold, fontRegular);

            // 敵が敗北した場合、勝利画面を描画
            const { checkEnemyDefeat } = require("./spireUseCard");
            if (checkEnemyDefeat()) {
                const { renderVictoryScreen } = require("./spireRender");
                clearAllDrawings(scene);
                renderVictoryScreen(scene, fontBold, fontRegular);
                return; // 勝利画面を描画した場合は、以降の処理を停止
            }

            // 手札を再描画
            renderHand(scene, fontBold, fontRegular);
        });

        // カード名を表示
        const nameLabel = new g.Label({
            scene,
            font: bold,
            text: cardData.name,
            fontSize: 12,
            textColor: "black",
            x: xOffset + 5,
            y: yOffset + 5,
            width: cardWidth - 10,
            lineBreak: true,
        });
        scene.append(nameLabel);

        // カードの効果を表示 (effect)
        const effectLabel = new g.Label({
            scene,
            font: regular,
            text: cardData.effect || "",
            fontSize: 12,
            textColor: "black",
            x: xOffset + 5,
            y: yOffset + 25,
            width: cardWidth - 10,
            lineBreak: true,
        });
        scene.append(effectLabel);

        // カードの追加効果を表示 (effect2)
        if (cardData.effect2) {
            const effect2Label = new g.Label({
                scene,
                font: regular,
                text: cardData.effect2,
                fontSize: 12,
                textColor: "gray",
                x: xOffset + 5,
                y: yOffset + 45,
                width: cardWidth - 10,
                lineBreak: true,
            });
            scene.append(effect2Label);
            player.handCards.push(effect2Label);
        }

        // 手札カードリストにもラベルを追加
        player.handCards.push(nameLabel, effectLabel);
    });
}

function renderPlayerStats(scene) {
    const { bold, regular } = spireData.fonts;
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
        player.statsLabels.forEach((label) => {
            if (label && !label.destroyed()) {
                label.destroy();
            }
        });
    }
    player.statsLabels = [];

    const statsX = 10;
    const statsY = 10;
    const lineHeight = 26;
    const labelPadding = 4;
    const bgColorMap = {
        red: "#FF6F6F",
        blue: "#6F9EFF",
        green: "#6FFF6F",
        gold: "#FFD700",
        silver: "#C0C0C0",
        darkBlue: "#4A78B2",
        gray: "#A9A9A9",
        orange: "#FFA500",
        purple: "#BA55D3",
    };

    // 描画順序と設定
    const stats = [
        { label: `Health: ${player.health}/${player.maxHealth}`, color: "red" },
        { label: `Mana: ${player.mana}`, color: "blue" },
        { label: `Guard: ${player.guard}`, color: "green" },
        { label: `Strength: ${player.strength}`, color: "gold" },
        { label: `Armour: ${player.armour}`, color: "silver" },
        null, // 空白行
        { label: `Deck: ${player.deck.length}`, color: "darkBlue", clickable: true }, // 山札はクリック可能
        { label: `Discard: ${player.discardPile.length}`, color: "gray" },
        { label: `Exiled: ${player.exiled.length}`, color: "orange" },
        null, // 空白行
        { label: `Gold: ${player.gold}`, color: "gold" },
        { label: `Walk Count: ${player.walkCount}`, color: "purple" },
    ];

    stats.forEach((stat, index) => {
        if (stat === null) return;

        const bgRect = new g.FilledRect({
            scene,
            cssColor: bgColorMap[stat.color],
            width: 240,
            height: 24,
            x: statsX,
            y: statsY + lineHeight * index,
            touchable: !!stat.clickable, // clickableがtrueの場合タッチ可能
        });
        scene.append(bgRect);

        const statLabel = new g.Label({
            scene,
            font: regular,
            text: stat.label,
            fontSize: 16,
            textColor: "black",
            x: statsX + labelPadding,
            y: statsY + lineHeight * index + labelPadding,
        });
        scene.append(statLabel);

        // 背景とラベルを一緒に管理
        player.statsLabels.push(bgRect, statLabel);

        // クリックイベントを設定
        if (stat.clickable) {
            bgRect.pointDown.add(() => {
                spireEvents.emit("deckDisplayRequested"); // 山札表示イベントを発火
            });
        }
    });

    // 異常ステータスの描画
    const abnormalStats = [
        { label: `Poisoned: ${player.poisoned}`, value: player.poisoned },
        { label: `Paralised: ${player.paralised}`, value: player.paralised },
        { label: `Decrease Dmg: ${player.decreaseDmg}`, value: player.decreaseDmg },
        { label: `Increase Dmg: ${player.increaseDmg}`, value: player.increaseDmg },
        { label: `Decrease Get Dmg: ${player.decreaseGetDmg}`, value: player.decreaseGetDmg },
        { label: `Increase Get Dmg: ${player.increaseGetDmg}`, value: player.increaseGetDmg },
    ];

    let abnormalStatsX = statsX + 260; // 通常ステータスの右側
    let abnormalStatsY = statsY;

    abnormalStats.forEach((stat) => {
        if (stat.value > 0) {
            const abnormalLabel = new g.Label({
                scene,
                font: regular,
                text: stat.label,
                fontSize: 16,
                textColor: "black",
                x: abnormalStatsX,
                y: abnormalStatsY,
            });
            scene.append(abnormalLabel);
            player.statsLabels.push(abnormalLabel);
            abnormalStatsY += lineHeight; // 次の行に描画
        }
    });

    // 山札・捨て札・追放札のカード表示
    const pileStats = [
        { label: "Deck", count: player.deck.length, color: "darkBlue" },
        { label: "Discard", count: player.discardPile.length, color: "gray" },
        { label: "Exiled", count: player.exiled.length, color: "orange" },
    ];

    const pileCardWidth = 80;
    const pileCardHeight = 120;
    const pileCardSpacing = 10;

    let pileX = statsX;
    let pileY = statsY + lineHeight * stats.length + 20; // 通常ステータスの下

    pileStats.forEach((pile) => {
        const cardEntity = new g.E({
            scene,
            x: pileX,
            y: pileY,
            width: pileCardWidth,
            height: pileCardHeight,
            touchable: pile.label === "Deck", // 山札はクリック可能
        });

        const cardBackground = new g.FilledRect({
            scene,
            cssColor: bgColorMap[pile.color],
            width: pileCardWidth,
            height: pileCardHeight,
        });
        cardEntity.append(cardBackground);

        const cardLabel = new g.Label({
            scene,
            font: bold,
            text: pile.label,
            fontSize: 16,
            textColor: "black",
            x: 5,
            y: 5,
        });
        cardEntity.append(cardLabel);

        const cardCountLabel = new g.Label({
            scene,
            font: regular,
            text: `Count: ${pile.count}`,
            fontSize: 14,
            textColor: "black",
            x: 5,
            y: 30,
        });
        cardEntity.append(cardCountLabel);

        // 山札クリックイベント
        if (pile.label === "Deck") {
            cardEntity.pointDown.add(() => {
                spireEvents.emit("deckDisplayRequested");
            });
        }

        scene.append(cardEntity);
        player.statsLabels.push(cardEntity);

        pileX += pileCardWidth + pileCardSpacing; // 次のカードの位置
    });
}
//てきのすてーたすびょうが
function renderEnemyStats(scene, fontBold, fontRegular) {
    const { bold, regular } = spireData.fonts;
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
        font: bold,
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
        font: regular,
        text: `Guard: ${enemy.guard}`,
        fontSize: 16,
        textColor: "green",
        x: statsX,
        y: statsY + lineHeight,
    });
    scene.append(guardLabel);
    enemy.statsLabels.push(guardLabel);
}

function renderDebugButton(scene, fontBold, fontRegular) {
    const { bold, regular } = spireData.fonts;

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
        font: bold, // 渡された fontBold を使用
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
    const { bold, regular } = spireData.fonts;
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

    // ラベル: 敵の名前
    const nameLabel = new g.Label({
        scene,
        font: bold,
        text: `${enemy.name || "Unknown Enemy"}`,
        fontSize: 16,
        textColor: "white",
        x: enemyActionCard.x + 10,
        y: enemyActionCard.y + 5,
        width: cardWidth - 20,
        lineBreak: true,
    });
    scene.append(nameLabel);

    // ラベル: 敵の次の行動
    const actionLabel = new g.Label({
        scene,
        font: bold,
        text: `次の行動`,
        fontSize: 14,
        textColor: "white",
        x: enemyActionCard.x + 10,
        y: enemyActionCard.y + 35,
        width: cardWidth - 20,
        lineBreak: true,
    });
    scene.append(actionLabel);

    // ラベル: 行動タイプ
    const typeLabel = new g.Label({
        scene,
        font: regular,
        text: `${enemy.currentAction.type}`,
        fontSize: 12,
        textColor: "white",
        x: enemyActionCard.x + 10,
        y: enemyActionCard.y + 60,
        width: cardWidth - 20,
        lineBreak: true,
    });
    scene.append(typeLabel);

    // ラベル: 行動効果
    const effectLabel = new g.Label({
        scene,
        font: regular,
        text: `${enemy.currentAction.effect}`,
        fontSize: 12,
        textColor: "white",
        x: enemyActionCard.x + 10,
        y: enemyActionCard.y + 85,
        width: cardWidth - 20,
        lineBreak: true,
    });
    scene.append(effectLabel);

    // 描画要素を格納
    spireData.enemyActionComponents = spireData.enemyActionComponents || [];
    spireData.enemyActionComponents.push(enemyActionCard, nameLabel, actionLabel, typeLabel, effectLabel);
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
    const { bold, regular } = spireData.fonts;
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

    // 手札と敵ステータスラベルを削除
    if (spireData.hand) {
        spireData.hand.forEach((card) => !card.destroyed() && card.destroy());
        spireData.hand = [];
    }
    if (spireData.enemy?.statsLabels) {
        spireData.enemy.statsLabels.forEach((label) => !label.destroyed() && label.destroy());
        spireData.enemy.statsLabels = [];
    }
    if (spireData.enemyActionComponents) {
        spireData.enemyActionComponents.forEach((component) => !component.destroyed() && component.destroy());
        spireData.enemyActionComponents = [];
    }

    const victoryComponents = [];

    // 勝利ラベル
    const youWinLabel = new g.Label({
        scene,
        font: bold,
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
        font: regular,
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

    // 報酬設定
    const cardWidth = 100;
    const cardHeight = 150;
    const cardSpacing = 20;
    const totalCards = 4;
    const startX = (gameWidth - (totalCards * cardWidth + (totalCards - 1) * cardSpacing)) / 2;
    const startY = gameHeight / 2 + 20;

    // 報酬候補を選択
    const skillCards = shuffleArray([...spireData.cards]).slice(0, 2);
    const goldReward = spireData.winRewards.find((reward) => reward.id === "getGold");
    if (goldReward && typeof goldReward.initialize === "function") {
        goldReward.initialize();
    }
    const otherWinRewards = shuffleArray(spireData.winRewards.filter((reward) => reward.id !== "getGold")).slice(0, 1);

    const selectedRewards = [...skillCards, goldReward, ...otherWinRewards];

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
            // スキルカード
            const wrappedName = wrapText(reward.name, cardWidth - 10, 14);
            wrappedName.forEach((line, index) => {
                cardEntity.append(
                    new g.Label({
                        scene,
                        font: regular,
                        text: line,
                        fontSize: 14,
                        textColor: "black",
                        x: 5,
                        y: 10 + index * 16,
                        width: cardWidth - 10,
                    })
                );
            });

            // effect描画
            cardEntity.append(
                new g.Label({
                    scene,
                    font: regular,
                    text: reward.effect || "",
                    fontSize: 12,
                    textColor: "gray",
                    x: 5,
                    y: cardHeight - 50, // 高さを調整
                    width: cardWidth - 10,
                })
            );

            // effect2が存在する場合の描画
            if (reward.effect2) {
                cardEntity.append(
                    new g.Label({
                        scene,
                        font: regular,
                        text: reward.effect2,
                        fontSize: 10, // 小さいフォントサイズ
                        textColor: "gray",
                        x: 5,
                        y: cardHeight - 30, // effectの下に配置
                        width: cardWidth - 10,
                    })
                );
            }
        } else if (reward.eventName) {
            // その他報酬
            cardEntity.append(
                new g.Label({
                    scene,
                    font: regular,
                    text: reward.eventName,
                    fontSize: 14,
                    textColor: "blue",
                    x: 5,
                    y: 10,
                    width: cardWidth - 10,
                })
            );
            cardEntity.append(
                new g.Label({
                    scene,
                    font: regular,
                    text: reward.effect,
                    fontSize: 12,
                    textColor: "gray",
                    x: 5,
                    y: cardHeight - 30,
                    width: cardWidth - 10,
                })
            );
        }

        // 報酬選択時の処理
        cardEntity.onPointDown.add(() => {
            if (selectedCount < 2) {
                if (reward.apply) {
                    reward.apply(player); // イベントの効果を適用
                } else {
                    player.deck.push(reward); // スキルカードを追加
                }
                selectedCount++;
        
                renderPlayerStats(scene);
        
                if (!cardEntity.destroyed()) {
                    cardEntity.destroy();
                }
        
                if (selectedCount === 2) {
                    victoryComponents.forEach((component) => !component.destroyed() && component.destroy());
                    renderNextDestinationSelection(scene, spireData.fonts.bold, spireData.fonts.regular);
                }
            }
        });

        scene.append(cardEntity);
        victoryComponents.push(cardEntity);
    });

    // プレイヤーステータスの表示を維持
    renderPlayerStats(scene, fontBold, fontRegular);
}

function renderNextDestinationSelection(scene, fontBold, fontRegular) {
    const { bold, regular } = spireData.fonts;

    if (!scene || typeof scene.append !== "function") {
        console.error("Error: Scene is not initialized properly.");
        return;
    }

    const gameWidth = g.game.width || 640;
    const gameHeight = g.game.height || 480;

    const cardWidth = 100;
    const cardHeight = 150;

    // プレイヤーの歩数をチェック
    if (spireData.player.walkCount === 10) {
        const bossLabel = new g.Label({
            scene,
            font: bold,
            text: "ボスと遭遇!",
            fontSize: 24,
            textColor: "black",
            x: gameWidth / 2 - 80,
            y: gameHeight / 2 - 50,
            width: 160,
            textAlign: "center",
        });
        scene.append(bossLabel);

        const bossCard = new g.E({
            scene,
            x: (gameWidth - cardWidth) / 2,
            y: gameHeight / 2,
            width: cardWidth,
            height: cardHeight,
            touchable: true,
        });

        const bossCardBackground = new g.FilledRect({
            scene,
            cssColor: "white",
            width: cardWidth,
            height: cardHeight,
            x: 0,
            y: 0,
        });
        bossCard.append(bossCardBackground);

        const bossTextLabel = new g.Label({
            scene,
            font: regular,
            text: "ボス戦開始",
            fontSize: 16,
            textColor: "red",
            x: 10,
            y: cardHeight / 2 - 8,
            width: cardWidth - 20,
            textAlign: "center",
        });
        bossCard.append(bossTextLabel);

        bossCard.onPointDown.add(() => {
            console.log("Boss encounter started.");
            spireData.enemy = spireData.enemyDataBoss; // ボスデータを設定
            spireEvents.emit("startBattle", scene); // ボス戦を開始

            // 描画された要素を削除
            if (!bossLabel.destroyed()) {
                bossLabel.destroy();
            }
            if (!bossCard.destroyed()) {
                bossCard.destroy();
            }
        });

        scene.append(bossCard);
        return;
    }

    const cardSpacing = 20;
    const totalCards = 3;
    const startX = (gameWidth - (totalCards * cardWidth + (totalCards - 1) * cardSpacing)) / 2;
    const startY = gameHeight / 2;

    const nextWayOptions = shuffleArray(spireData.nextWay);
    const enemyOption = nextWayOptions.find((option) => option.eventName === "敵と遭遇する");
    const otherOptions = nextWayOptions.filter((option) => option.eventName !== "敵と遭遇する").slice(0, totalCards - 1);
    const finalOptions = shuffleArray([enemyOption, ...otherOptions]);

    const promptLabel = new g.Label({
        scene,
        font: bold,
        text: "行先を選択",
        fontSize: 24,
        textColor: "black",
        x: gameWidth / 2 - 80,
        y: startY - 50,
        width: 160,
        textAlign: "center",
    });
    scene.append(promptLabel);

    const cardEntities = [];

    finalOptions.forEach((option, i) => {
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

        const eventNameLabel = new g.Label({
            scene,
            font: regular,
            text: option.eventName,
            fontSize: 14,
            textColor: "blue",
            x: 5,
            y: 10,
            width: cardWidth - 10,
        });
        cardEntity.append(eventNameLabel);

        const effectLabel = new g.Label({
            scene,
            font: regular,
            text: option.effect,
            fontSize: 12,
            textColor: "gray",
            x: 5,
            y: cardHeight - 50,
            width: cardWidth - 10,
        });
        cardEntity.append(effectLabel);

        const costLabel = new g.Label({
            scene,
            font: regular,
            text: `Cost: ${option.cost}`,
            fontSize: 12,
            textColor: "black",
            x: 5,
            y: cardHeight - 30,
            width: cardWidth - 10,
        });
        cardEntity.append(costLabel);

        if (spireData.player.gold < option.cost && option.cost > 0) {
            const insufficientGoldLabel = new g.Label({
                scene,
                font: regular,
                text: "金が足りない",
                fontSize: 12,
                textColor: "red",
                x: 5,
                y: cardHeight - 15,
                width: cardWidth - 10,
            });
            cardEntity.append(insufficientGoldLabel);
        }

        cardEntity.onPointDown.add(() => {
            if (spireData.player.gold < option.cost && option.cost > 0) {
                console.log(`Not enough gold for "${option.eventName}".`);
                return;
            }

            console.log(`Event "${option.eventName}" triggered.`);

            if (option.apply) {
                option.apply(spireData.player, spireData.enemy, (newEnemy) => {
                    spireData.enemy = newEnemy;
                });
            }

            if (option.eventName === "敵と遭遇する") {
                console.log("Starting battle...");
                spireEvents.emit("startBattle", scene); // 戦闘開始イベント
            }

            spireData.player.gold -= option.cost;
            console.log(`Gold spent: ${option.cost}. Remaining gold: ${spireData.player.gold}`);

            spireData.player.walkCount = (spireData.player.walkCount || 0) + 1;
            renderPlayerStats(scene);//ここでステ更新
            console.log(`Player walkCount: ${spireData.player.walkCount}`);

            cardEntities.forEach((card) => {
                if (!card.destroyed()) {
                    card.destroy();
                }
            });

            if (!promptLabel.destroyed()) {
                promptLabel.destroy();
            }

            if (option.eventName !== "敵と遭遇する") {
                renderNextDestinationSelection(scene, fontBold, fontRegular);
            } else {
                renderPlayerStats(scene, fontBold, fontRegular);
            }
        });

        scene.append(cardEntity);
        cardEntities.push(cardEntity);
    });
}
function renderDefeatScreen(scene, fontBold, fontRegular) {
    const { bold, regular } = spireData.fonts;

    const gameWidth = g.game.width || 640;
    const gameHeight = g.game.height || 480;

    const youLoseLabel = new g.Label({
        scene,
        font: bold,
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
        font: regular,
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

function renderWinGame(scene) {
    spireData.gameWon = true;
    // すべての描画要素を削除
    clearAllDrawings(scene)

    // 勝利メッセージを表示
    const winLabel = new g.Label({
        scene,
        font: spireData.fonts.bold,
        text: "You Win This Game",
        fontSize: 48,
        textColor: "gold",
        x: g.game.width / 2 - 200,
        y: g.game.height / 2 - 24,
        width: 400,
        textAlign: "center",
    });
    scene.append(winLabel);
}

spireEvents.on("winGame", (scene) => {
    renderWinGame(scene);
});

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
    clearAllDrawings ,
    renderWinGame
};