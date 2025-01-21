const spireEvents = require("./spireEvents");

// デッキ表示
function createDeckDisplayScene(scene, isInteractive = false, discardGoal = 1) {
    const spireData = require("./spireData"); // 遅延読み込み ナイステクニック
    const player = spireData.player;
    const fonts = spireData.fonts;

    let discardedCount = 0; // 廃棄済みカード数を追跡

    const deckScene = new g.Scene({ game: g.game });

    deckScene.loaded.add(() => {
        if (!player || player.deck.length === 0) {
            console.error("Deck is empty, player data is missing, or fonts are not initialized.");
            return;
        }

        // ヘッダーラベル: 「廃棄するカードを選択」
        const headerLabel = new g.Label({
            scene: deckScene,
            font: fonts.bold,
            text: "廃棄するカードを選択",
            fontSize: 24,
            textColor: "black",
            x: 20,
            y: 10,
        });
        deckScene.append(headerLabel);

        // 残り枚数ラベル
        const remainingLabel = new g.Label({
            scene: deckScene,
            font: fonts.regular,
            text: `残り ${discardGoal - discardedCount} 枚`,
            fontSize: 16,
            textColor: "black",
            x: 20,
            y: 50,
        });
        deckScene.append(remainingLabel);

        const cardWidth = 120;
        const cardHeight = 160;
        const cardSpacing = 10;
        const columns = 5;
        const marginX = 10;
        const marginY = 100;

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
                touchable: isInteractive,
            });

            const cardLabel = new g.Label({
                scene: deckScene,
                font: fonts.regular,
                text: card.name || "Unknown Card",
                fontSize: 16,
                textColor: "black",
                x: 10,
                y: 10,
            });

            cardEntity.append(cardLabel);

            if (isInteractive) {
                // カードをクリックした際の処理
                cardEntity.pointDown.add(() => {
                    const index = player.deck.indexOf(card);
                    if (index !== -1) {
                        player.deck.splice(index, 1); // デッキから削除
                        discardedCount++; // 廃棄数を増加
                        console.log(`Removed card: ${card.name || "Unknown Card"}`);
                        console.log(`Discarded count: ${discardedCount} / ${discardGoal}`);

                        // 残り枚数を更新
                        remainingLabel.text = `残り ${discardGoal - discardedCount} 枚`;
                        remainingLabel.invalidate();

                        // 廃棄数が目標に達したらシーンを戻す
                        if (discardedCount >= discardGoal) {
                            g.game.popScene();
                        }
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
                font: fonts.bold,
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

// デッキひょうじイベント
spireEvents.on("deckDisplayRequested", () => {
    createDeckDisplayScene(g.game.scene()); // 現在のシーンを渡して新しいシーンを表示
});

module.exports = {
    createDeckDisplayScene,
};
