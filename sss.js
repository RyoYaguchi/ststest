// プレイヤーデータ
const player = {
    health: 10,
    Mana: 3,
    Guard: 0,
    hand: [],
    discardPile: []
};

// エネミーデータ
const enemy = {
    health: 20,
    enemyID: 1,
    Guard: 0,
    actions: {
        act1: {
            type: "攻撃",
            effect: "1ダメージを与える",
            ValueA: 1,
            ValueB: 0
        }
    },
    takeTurn: function() {
        // 敵のターン処理を乱数を用いて決定
        const action = g.game.random.uniform(0, 1) < 0.5 ? this.actions.act1 : this.actions.act1; // act1のみ使用
        return action;
    }
};

// カードデータ
const createAtc1 = {
    id: "Atc1",
    cost: 1,
    type: "攻撃",
    ValueA: 2,
    ValueB: 0,
    effect: "2ダメージ",
    name: "通常攻撃"
};

const createDef1 = {
    id: "Def1",
    cost: 1,
    type: "防御",
    ValueA: 1,
    ValueB: 0,
    effect: "ガード値+1",
    name: "防御"
};

const createSup1 = {
    id: "Sup1",
    ValueA: 2,
    ValueB: 0,
    type: "支援",
    effect: "カードを2枚引く",
    name: "立て直し"
};

// デッキの生成
const deck = [];
for (let i = 0; i < 5; i++) {
    deck.push({ ...createAtc1 });
}
for (let i = 0; i < 3; i++) {
    deck.push({ ...createDef1 });
}
for (let i = 0; i < 2; i++) {
    deck.push({ ...createSup1 });
}

// デッキをシャッフルする関数
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(g.game.random.uniform(0, 1) * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// カードを引く処理
function drawCards(number) {
    let cardsToDraw = number; // 引く予定のカードの枚数を設定
    while (cardsToDraw > 0) { // 引き終わるまで繰り返す
        if (deck.length === 0) { 
            // 山札が空なら、捨て札を山札に補充しシャッフル
            console.log("Deck is empty. Refilling from discard pile.");
            refillDeck();
        }
        if (deck.length > 0) { 
            // 山札にカードがあれば、1枚引いて手札に追加
            const card = deck.pop();
            if (card) {
                player.hand.push(card);
                cardsToDraw--; // 引く予定の枚数を1減らす
            }
        } else {
            // 山札も捨て札も空の場合
            console.log("No cards left to draw.");
            break; // ループを終了
        }
    }
    // 結果をコンソールに表示
    console.log(`Drew ${number - cardsToDraw} cards. Current hand:`, player.hand);
}

// プレイヤーのHealth、Mana、Guardを描画する関数
function drawPlayerStats(scene) {
    const font = new g.DynamicFont({
        game: g.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
    });

    // プレイヤーのHealth
    const healthLabel = new g.Label({
        scene: scene,
        font: font,
        text: `Player Health: ${player.health}`,
        fontSize: 18,
        textColor: "black",
        x: 10,
        y: 10
    });
    scene.append(healthLabel);

    // プレイヤーのMana
    const manaLabel = new g.Label({
        scene: scene,
        font: font,
        text: `Mana: ${player.Mana}`,
        fontSize: 18,
        textColor: "black",
        x: 10,
        y: 40
    });
    scene.append(manaLabel);

    // プレイヤーのGuard
    const guardLabel = new g.Label({
        scene: scene,
        font: font,
        text: `Guard: ${player.Guard}`,
        fontSize: 18,
        textColor: "black",
        x: 10,
        y: 70
    });
    scene.append(guardLabel);
}

// 敵のHealth、Guardを描画する関数
function drawEnemyStats(scene) {
    const font = new g.DynamicFont({
        game: g.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 18
    });

    // 敵のHealth
    const enemyHealthLabel = new g.Label({
        scene: scene,
        font: font,
        text: `Enemy Health: ${enemy.health}`,
        fontSize: 18,
        textColor: "black",
        x: g.game.width - 200,
        y: 10
    });
    scene.append(enemyHealthLabel);

    // 敵のGuard
    const enemyGuardLabel = new g.Label({
        scene: scene,
        font: font,
        text: `Enemy Guard: ${enemy.Guard}`,
        fontSize: 18,
        textColor: "black",
        x: g.game.width - 200,
        y: 40
    });
    scene.append(enemyGuardLabel);
}

// 手札のカードを描画する関数
function drawHandCards(scene) {
    const cardWidth = 100;
    const cardHeight = 140;
    player.hand.forEach((cardData, index) => {
        if (!cardData) {
            console.warn(`Card at index ${index} is undefined. Skipping.`);
            return;
        }

        const xOffset = 10 + index * (cardWidth + 10); // カードの横位置
        const yOffset = (g.game.height - cardHeight) / 2; // カードの縦位置

        // カード背景
        const card = new g.FilledRect({
            scene: scene,
            cssColor: "white",
            width: cardWidth,
            height: cardHeight,
            x: xOffset,
            y: yOffset
        });
        scene.append(card);

        // カードテキスト
        const fontBold = new g.DynamicFont({
            game: g.game,
            fontFamily: g.FontFamily.SansSerif,
            size: 12,
            fontWeight: "bold"
        });

        const fontRegular = new g.DynamicFont({
            game: g.game,
            fontFamily: g.FontFamily.SansSerif,
            size: 12
        });

        // カード名を表示
        const nameLabel = new g.Label({
            scene: scene,
            font: fontBold,
            text: cardData.name,
            fontSize: 12,
            textColor: "black",
            x: xOffset + 5,
            y: yOffset + 5,
            width: cardWidth - 10, // カードの幅に合わせてテキスト幅を制限
            lineBreak: true // 自動改行を有効にする
        });
        scene.append(nameLabel);

        // カードのタイプを表示
        const typeLabel = new g.Label({
            scene: scene,
            font: fontRegular,
            text: cardData.type,
            fontSize: 12,
            textColor: "black",
            x: xOffset + 5,
            y: yOffset + 25,
            width: cardWidth - 10, // カードの幅に合わせてテキスト幅を制限
            lineBreak: true // 自動改行を有効にする
        });
        scene.append(typeLabel);

        // カードの効果を表示
        const effectLabel = new g.Label({
            scene: scene,
            font: fontRegular,
            text: cardData.effect,
            fontSize: 12,
            textColor: "black",
            x: xOffset + 5,
            y: yOffset + 45,
            width: cardWidth - 10, // カードの幅に合わせてテキスト幅を制限
            lineBreak: true // 自動改行を有効にする
        });
        scene.append(effectLabel);
    });
}

// ターン終了処理
function endTurn() {
    // Enemy action during end turn
    const enemyAction = enemy.takeTurn();
    console.log("Enemy action:", enemyAction);

    // Reset Guard to 0 at the end of each turn
    player.Guard = 0;

    // Regenerate 1 Mana if less than the maximum (3 in this case)
    if (player.Mana < 3) {
        player.Mana += 1;
    }

    // Discard all cards in hand
    player.discardPile.push(...player.hand);
    player.hand = [];
    console.log("Hand discarded. Current discard pile:", player.discardPile);

    // Draw 5 cards
    drawCards(5);

    console.log("End of turn:", player);
}

// ゲームの初期化
function main() {
    const scene = new g.Scene({ game: g.game });

    scene.onLoad.add(() => {
        // 初期デッキをシャッフル
        shuffleDeck(deck);

        // プレイヤーと敵のステータスを描画
        drawPlayerStats(scene);
        drawEnemyStats(scene);

        // 手札を描画
        drawHandCards(scene);

        // ターン終了ボタンを描画
        const endTurnButton = new g.Sprite({
            scene: scene,
            src: g.game.resource.get("buttonImage"), // ボタン画像のリソースを指定
            x: g.game.width - 100,
            y: g.game.height - 50,
            width: 80,
            height: 40
        });
        endTurnButton.onClick.add(endTurn);
        scene.append(endTurnButton);
    });

    g.game.pushScene(scene);
}

module.exports = main;
