
const discardPile = [];

const spireRender = require('./spireRender1');

function useCard(cardData, index, scene, spireRender, fontBold, fontRegular) {
    console.log(`Card used: ${cardData.name}`);
    console.log("spireRender:", spireRender); // デバッグ用

    // spireRender のメソッドが存在するか確認
    if (!spireRender || !spireRender.renewRenderPlayerStats || !spireRender.renewRenderEnemyStats) {
        throw new Error("spireRender のメソッドが正しく定義されていません。");
    }

    // プレイヤーと敵のデータを直接使用
    if (cardData.type === "攻撃") {
        // マナを消費
        player.Mana -= cardData.cost;
        if (player.Mana < 0) player.Mana = 0; // マナが負にならないように制限

        // 攻撃力から敵のガード値を引いたダメージを計算
        let damage = cardData.ValueA - enemy.Guard;

        // 敵のガード値を減少
        enemy.Guard = Math.max(0, enemy.Guard - cardData.ValueA);

        // 敵のヘルスを減少
        enemy.health = enemy.health - damage;

        console.log(`Player Mana: ${player.Mana}`);
        console.log(`Enemy Health: ${enemy.health}`);
    } else if (cardData.type === "防御") {
        // 防御タイプのカード処理
        player.Mana -= cardData.cost;
        if (player.Mana < 0) player.Mana = 0; // マナが負にならないように制限

        player.Guard += cardData.ValueA; // Guard値を増加
        console.log(`Player Mana: ${player.Mana}`);
        console.log(`Player Guard: ${player.Guard}`);
    }

    // 手札から削除して捨て札に追加
    player.hand.splice(index, 1); // 手札から削除
    discardPile.push(cardData); // 捨て札に追加

    console.log("Current discard pile:", discardPile);

    // プレイヤーと敵のステータスを更新
    spireRender.renewRenderPlayerStats(scene, player); // プレイヤーのステータスを更新
    spireRender.renewRenderEnemyStats(scene, enemy); // 敵のステータスを更新

    // 手札の再描画
    spireRender.renderHand(scene, { player, enemy }, fontBold, fontRegular);
}



// プレイヤーデータ
const player = {
    health: 20,
    Mana: 10,
    Guard: 0,
    hand: [] // handプロパティを初期化
};

// エネミーデータ
const enemy = {
    health: 15,
    Guard: 0,
    act1: {
        id: "enemyAct1",
        type: "攻撃",
        ValueA: 5,
        ValueB: 2,
        ValueC: 0,
        get effect() {
            return `${this.ValueA}の値ダメージ`;
        }
    },
    act2: {
        id: "enemyAct2",
        type: "攻撃",
        ValueA: 10,
        ValueB: 0,
        ValueC: 0,
        get effect() {
            return `${this.ValueA}の値ダメージ`;
        }
    }
};

// 現在の敵の行動を保持
let currentEnemyAction = null;

// エネミーのアクション決定
function decideEnemyAction() {
    const actions = [enemy.act1, enemy.act2];
    const chosenAction = actions[Math.floor(g.game.random.generate() * actions.length)];
    currentEnemyAction = chosenAction; // 選択したアクションを保存
    return chosenAction;
}

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

// モジュールとしてエクスポート

module.exports = {
    player,
    enemy,
    currentEnemyAction, // 現在の敵の行動をエクスポート
    decideEnemyAction,
    createAtc1,
    createDef1,
    createSup1,
    useCard,
    discardPile
};

