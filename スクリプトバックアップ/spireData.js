// 初期データ
const initialPlayerData = {
    health: 20,
    mana: 10,
    guard: 0,
    hand: [], // 手札
    deck: [], // デッキ
    discardPile: [] // 捨て札
};

const initialEnemyData = {
    health: 15,
    guard: 0,
    acts: [
        {
            id: "enemyAct1",
            type: "攻撃",
            ValueA: 5,
            ValueB: 2,
            ValueC: 0,
            get effect() {
                return `${this.ValueA}ダメージ`;
            }
        },
        {
            id: "enemyAct2",
            type: "攻撃",
            ValueA: 10,
            ValueB: 0,
            ValueC: 0,
            get effect() {
                return `${this.ValueA}ダメージ`;
            }
        }
    ],
    currentAction: null // 現在の行動を保存
};



// プレイヤーデータ
const player = {
    health: 20,
    mana: 10,
    guard: 0,
    hand: [], // handプロパティを初期化
    deck: [], // デッキ
    discardPile: [] // 捨て札
};

// エネミーデータ
const enemy = {
    health: 15,
    guard: 0,
    acts: [
        {
            id: "enemyAct1",
            type: "攻撃",
            ValueA: 5,
            ValueB: 2,
            ValueC: 0,
            get effect() {
                return `${this.ValueA}ダメージ`;
            }
        },
        {
            id: "enemyAct2",
            type: "攻撃",
            ValueA: 10,
            ValueB: 0,
            ValueC: 0,
            get effect() {
                return `${this.ValueA}ダメージ`;
            }
        }
    ],
    currentAction: null // 現在の行動を保存
};

// エクスポート
module.exports = {
    enemy
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
    cost: 1,
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
    createAtc1,
    createDef1,
    createSup1,
    initialPlayerData,
    initialEnemyData

};