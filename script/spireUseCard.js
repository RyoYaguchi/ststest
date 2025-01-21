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

     //ボスに勝ってたらこれ以降の処理をスキップ
    if (spireData.gameWon) {
        console.log("Game already won. Skipping useCard.");
        return;
    }
     //敵に勝っていたら処理をスキップ
     if (enemy.health <= 0) {
        return;
    }
    player.hand.splice(index, 1);
     // カードの移動処理
    if (cardData.exile) {
        player.exiled.push(cardData); // exileタグ付きカードはexiledへ
        console.log(`Card ${cardData.name} added to exiled.`);
    } else {
        player.discardPile.push(cardData); // それ以外は捨て札へ
        console.log(`Card ${cardData.name} added to discard pile.`);
    }
}

// 勝利判定
function checkEnemyDefeat(scene) {
    const enemy = spireData.enemy;

    if (!enemy) {
        console.error("Error: Enemy data is undefined.");
        return false;
    }

    if (enemy.health <= 0) {
        console.log("Enemy has been defeated.");
        spireEvents.emit("reshuffleDeck"); // デッキのリシャッフルを発火

        // ボスが倒された場合
        if (enemy.boss) {
            console.log("Boss defeated. You win the game!");
            spireEvents.emit("winGame", scene); // 勝利イベントを発火
        }
        return true;
    }

    return false;
}

//デッキ表示
function createDeckDisplayScene(scene, isInteractive = false) {
    const deckScene = new g.Scene({ game: g.game });

    deckScene.loaded.add(() => {
        const player = spireData.player;

        if (!player || player.deck.length === 0) {
            console.error("Deck is empty or player data is missing.");
            return;
        }

        const cardWidth = 120;
        const cardHeight = 160;
        const cardSpacing = 10;
        const columns = 5; // 一列のカード数
        const marginX = 10;
        const marginY = 10;

        player.deck.forEach((card, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);

            const cardEntity = new g.FilledRect({
                scene: deckScene,
                cssColor: "#FFFFFF",
                width: cardWidth,
                height: cardHeight,
                x: marginX + col * (cardWidth + cardSpacing),
                y: marginY + row * (cardHeight + cardSpacing),
                touchable: isInteractive, // インタラクティブモードの場合のみタッチ可能
            });

            const cardLabel = new g.Label({
                scene: deckScene,
                font: spireData.fonts.regular,
                text: card.name || "Unknown Card",
                fontSize: 16,
                textColor: "black",
                x: 10,
                y: 10,
            });

            cardEntity.append(cardLabel);

            if (isInteractive) {
                // カードをクリックした際にデッキから削除
                cardEntity.pointDown.add(() => {
                    const index = player.deck.indexOf(card);
                    if (index !== -1) {
                        player.deck.splice(index, 1); // デッキから削除
                        console.log(`Removed card: ${card.name || "Unknown Card"}`);
                        createDeckDisplayScene(scene, true); // 再描画
                    }
                });
            }

            deckScene.append(cardEntity);
        });

        if (!isInteractive) {
            // 戻るボタン（インタラクティブモードでない場合のみ表示）
            const backButton = new g.FilledRect({
                scene: deckScene,
                cssColor: "#FF0000",
                width: 100,
                height: 40,
                x: g.game.width - 110,
                y: g.game.height - 50,
                touchable: true,
            });

            const backLabel = new g.Label({
                scene: deckScene,
                font: spireData.fonts.bold,
                text: "戻る",
                fontSize: 20,
                textColor: "white",
                x: 10,
                y: 8,
            });

            backButton.append(backLabel);

            backButton.pointDown.add(() => {
                g.game.popScene();
            });

            deckScene.append(backButton);
        }
    });

    g.game.pushScene(deckScene);
}
//デッキひょうじイベント
spireEvents.on("deckDisplayRequested", () => {
    createDeckDisplayScene(g.game.scene()); // 現在のシーンを渡して新しいシーンを表示
});

module.exports = {
    useCard,
    checkEnemyDefeat,
};