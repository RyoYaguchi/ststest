const spireEvents = require("./spireEvents");

// デッキ表示
function createDeckDisplayScene(scene, isInteractive = false) {
    const spireData = require("./spireData"); // 遅延読み込み ナイステクニック
    const player = spireData.player;
    const fonts = spireData.fonts;
    const deckScene = new g.Scene({ game: g.game });

    deckScene.loaded.add(() => {
        const player = spireData.player;
        const fonts = spireData.fonts; // グローバルなフォントオブジェクトを取得

        if (!player || !fonts || player.deck.length === 0) {
            console.error("Deck is empty, player data is missing, or fonts are not initialized.");
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
                font: fonts.regular, // グローバルなフォントを使用
                text: card.name || "Unknown Card",
                fontSize: 16,
                textColor: "black",
                x: 10,
                y: 10,
            });

            cardEntity.append(cardLabel);

            if (isInteractive) { //廃棄/spiredata.nextway
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
                font: fonts.bold, // グローバルなフォントを使用
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
