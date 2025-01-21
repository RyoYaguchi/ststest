const spireData = require("./spireData1.js");
const main = require("./main1.js");

console.log("spireData:", spireData);


let healthLabel = null;
let manaLabel = null;
let guardLabel = null;

let enemyHealthLabel = null;
let enemyGuardLabel = null;

function renderHand(scene, { player }, fontBold, fontRegular) {
    const cardWidth = 100; // カードの幅
    const cardHeight = 150; // カードの高さ

    // 手札のカードを一度削除
    scene.children
        .filter((child) => child.tag === "handCard") // 手札タグを持つ要素を選択
        .forEach((card) => scene.remove(card)); // 削除

    // 手札のカードを新しく描画
    player.hand.forEach((cardData, index) => {
        if (!cardData) return;

        const xOffset = 10 + index * (cardWidth + 10); // 左詰めの配置
        const yOffset = (g.game.height - cardHeight) / 2;

        // カード背景
        const card = new g.FilledRect({
            scene: scene,
            cssColor: "white",
            width: cardWidth,
            height: cardHeight,
            x: xOffset,
            y: yOffset,
            touchable: true,
            tag: "handCard" // 手札用のタグを付与
        });
        scene.append(card);

        card.onPointDown.add(() => {
            // カードを使用
            spireData.useCard(cardData, index, scene, fontBold, fontRegular);
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
            width: cardWidth - 10,
            lineBreak: true,
            tag: "handCard" // 手札用のタグを付与
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
            width: cardWidth - 10,
            lineBreak: true,
            tag: "handCard" // 手札用のタグを付与
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
            width: cardWidth - 10,
            lineBreak: true,
            tag: "handCard" // 手札用のタグを付与
        });
        scene.append(effectLabel);
    });
}

// ステータス描画（プレイヤー）

function renderPlayerStats(scene, spireData, fontBold, fontRegular) {
    // spireData.player の存在を確認
    if (!spireData || !spireData.player) {
        console.error("spireData または player オブジェクトが未定義です。");
        return;
    }

    const { health, Mana, Guard } = spireData.player;

    if (!healthLabel) {
        healthLabel = new g.Label({
            scene: scene,
            text: `Health: ${health}`,
            font: fontBold,
            fontSize: 16,
            textColor: "black",
            x: 10,
            y: 10
        });
        scene.append(healthLabel);
    } else {
        healthLabel.text = `Health: ${health}`;
        healthLabel.invalidate(); // 描画を更新
    }

    if (!manaLabel) {
        manaLabel = new g.Label({
            scene: scene,
            text: `Mana: ${Mana}`,
            font: fontRegular,
            fontSize: 16,
            textColor: "black",
            x: 10,
            y: 30
        });
        scene.append(manaLabel);
    } else {
        manaLabel.text = `Mana: ${Mana}`;
        manaLabel.invalidate(); // 描画を更新
    }

    if (!guardLabel) {
        guardLabel = new g.Label({
            scene: scene,
            text: `Guard: ${Guard}`,
            font: fontRegular,
            fontSize: 16,
            textColor: "black",
            x: 10,
            y: 50
        });
        scene.append(guardLabel);
    } else {
        guardLabel.text = `Guard: ${Guard}`;
        guardLabel.invalidate(); // 描画を更新
    }
}

//player更新
function renewRenderPlayerStats(scene, spireData) {
    if (spireData?.player?.health === undefined) {
        console.error("Error: spireData.player.health is undefined.");
        return;
    }
    if (healthLabel) {
        healthLabel.text = `Health: ${spireData.player.health}`;
        healthLabel.invalidate(); // 描画を更新
    }
    if (manaLabel) {
        manaLabel.text = `Mana: ${spireData.player.Mana}`;
        manaLabel.invalidate(); // 描画を更新
    }
    if (guardLabel) {
        guardLabel.text = `Guard: ${spireData.player.Guard}`;
        guardLabel.invalidate(); // 描画を更新
    }
}

// ステータス描画（敵）
function renderEnemyStats(scene, spireData, fontBold, fontRegular) {
    // spireData.enemy の存在を確認
    if (!spireData || !spireData.enemy) {
        console.error("spireData または spireData.enemy が未定義です:", spireData);
        return;
    }

    const { health, Guard } = spireData.enemy;

    // 初回描画時のみラベルを作成
    if (!enemyHealthLabel) {
        enemyHealthLabel = new g.Label({
            scene: scene,
            text: `Enemy Health: ${health}`,
            font: fontBold,
            fontSize: 16,
            textColor: "black",
            x: g.game.width - 150,
            y: 10
        });
        scene.append(enemyHealthLabel);
    } else {
        enemyHealthLabel.text = `Enemy Health: ${health}`;
        enemyHealthLabel.invalidate(); // 描画を更新
    }

    if (!enemyGuardLabel) {
        enemyGuardLabel = new g.Label({
            scene: scene,
            text: `Enemy Guard: ${Guard}`,
            font: fontRegular,
            fontSize: 16,
            textColor: "black",
            x: g.game.width - 150,
            y: 30
        });
        scene.append(enemyGuardLabel);
    } else {
        enemyGuardLabel.text = `Enemy Guard: ${Guard}`;
        enemyGuardLabel.invalidate(); // 描画を更新
    }
}

// ステータス更新用（敵）
function renewRenderEnemyStats(scene, enemy) {
    if (enemy?.health === undefined) {
        console.error("Error: enemy.health is undefined.");
        return;
    }
    if (enemyHealthLabel) {
        enemyHealthLabel.text = `Enemy Health: ${enemy.health}`;
        enemyHealthLabel.invalidate(); // 描画を更新
    }
    if (enemyGuardLabel) {
        enemyGuardLabel.text = `Enemy Guard: ${enemy.Guard || 0}`;
        enemyGuardLabel.invalidate(); // 描画を更新
    }
}

function renderEnemyActionCard(scene, fontBold, fontRegular, action) {
    const cardWidth = 120;
    const cardHeight = 160;
    const xOffset = g.game.width - 300; // `enemyStats` の左隣に配置
    const yOffset = 10;

    // 次回行動カードの背景とフチの色の変更(thickness)
    const borderThickness = 4;
    const borderCard = new g.FilledRect({
        scene: scene,
        cssColor: "red", // フチの色
        width: cardWidth + borderThickness * 2,
        height: cardHeight + borderThickness * 2,
        x: xOffset - borderThickness,
        y: yOffset - borderThickness,
        touchable: false
    });
    scene.append(borderCard);

    // カードの中身
    const actionCard = new g.FilledRect({
        scene: scene,
        cssColor: "white",
        width: cardWidth,
        height: cardHeight,
        x: xOffset,
        y: yOffset,
        touchable: false
    });
    scene.append(actionCard);    

    // 次の行動
    const nextEnemyLabel = new g.Label({
        scene: scene,
        font: fontBold,
        text: "敵の次回行動",
        fontSize: 16,
        textColor: "black",
        x: xOffset + 5,
        y: yOffset + 5,
        width: cardWidth - 10,
        lineBreak: true
    });
    scene.append(nextEnemyLabel);

    // カードのタイプを表示
    const typeLabel = new g.Label({
        scene: scene,
        font: fontRegular,
        text: action.type,
        fontSize: 14,
        textColor: "black",
        x: xOffset + 5,
        y: yOffset + 30,
        width: cardWidth - 10,
        lineBreak: true
    });
    scene.append(typeLabel);

    // カードの効果を表示
    const effectLabel = new g.Label({
        scene: scene,
        font: fontRegular,
        text: action.effect,
        fontSize: 14,
        textColor: "black",
        x: xOffset + 5,
        y: yOffset + 60,
        width: cardWidth - 10,
        lineBreak: true
    });
    scene.append(effectLabel);

    return actionCard; // 後で削除するため、返り値として返す
}

// モジュールとしてエクスポート
module.exports = {
    renderPlayerStats,
    renewRenderPlayerStats,
    renderEnemyStats,
    renewRenderEnemyStats,
    renderEnemyActionCard,
    renderHand
};