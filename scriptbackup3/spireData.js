const initialPlayerData = {
    maxHealth: 20,
    health: 20,
    mana: 10,
    guard: 0,
    armour: 0,
    strength: 0,
    hand: [], // 手札
    deck: [], // デッキ
    discardPile: [], // 捨て札
    exiled: [], // 追放
    walkCount: 0,
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
            },
        },
        {
            id: "enemyAct2",
            type: "攻撃",
            ValueA: 10,
            ValueB: 0,
            ValueC: 0,
            get effect() {
                return `${this.ValueA}ダメージ`;
            },
        },
    ],
    currentAction: null, // 現在の行動を保存
};

const enemyData2 = {
    health: 25,
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
            },
        },
        {
            id: "enemyAct2",
            type: "攻撃",
            ValueA: 10,
            ValueB: 0,
            ValueC: 0,
            get effect() {
                return `${this.ValueA}ダメージ`;
            },
        },
    ],
    currentAction: null, // 現在の行動を保存
};

const enemyData3 = {
    health: 50,
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
            },
        },
        {
            id: "enemyAct2",
            type: "攻撃",
            ValueA: 10,
            ValueB: 0,
            ValueC: 0,
            get effect() {
                return `${this.ValueA}ダメージ`;
            },
        },
    ],
    currentAction: null, // 現在の行動を保存
};

const enemyData4 = {
    health: 50,
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
            },
        },
        {
            id: "enemyAct2",
            type: "攻撃",
            ValueA: 10,
            ValueB: 0,
            ValueC: 0,
            get effect() {
                return `${this.ValueA}ダメージ`;
            },
        },
    ],
    currentAction: null, // 現在の行動を保存
};

const enemyDatas= [initialEnemyData, enemyData2, enemyData3, enemyData4];

const getRandomEnemy = function () {
    const randomEnemy = enemyDatas[Math.floor(g.game.random.generate() * enemyDatas.length)];
    return { ...randomEnemy }; 
    console.log(randomEnemy);
};


// プレイヤーデータ
const player = { ...initialPlayerData };

// エネミーデータ
const enemy = { ...initialEnemyData };

// カードデータ
const createAtc1 = {
    id: "Atc1",
    cost: 1,
    type: "攻撃",
    ValueA: 3,
    ValueB: 0,
    ValueC: 0,
    ValueD: 0,
    effect: "3ダメージ",
    name: "通常攻撃",
};

const createDef1 = {
    id: "Def1",
    cost: 1,
    type: "防御",
    ValueA: 0,
    ValueB: 3,
    ValueC: 0,
    ValueD: 0,
    effect: "G値+3",
    name: "防御",
};

const createSup1 = {
    id: "Sup1",
    cost: 1,
    type: "支援",
    ValueA: 0,
    ValueB: 0,
    ValueC: 2,
    ValueD: 0,
    effect: "2枚引く",
    name: "戦術",
};

const createAtc2 = {
    id: "Atc2",
    cost: 2,
    type: "攻撃",
    ValueA: 5,
    ValueB: 0,
    ValueC: 0,
    ValueD: 0,
    effect: "5ダメージ",
    name: "強攻撃",
};

const createAtc3 = {
    id: "Atc3",
    cost: 1,
    type: "攻撃",
    ValueA: 10,
    ValueB: -10,
    ValueC: 0,
    ValueD: 0,
    effect: "10ダメージ",
    effect2: "-10G値",
    name: "捨て身",
};

const createDef2 = {
    id: "Def2",
    cost: 1,
    type: "防御",
    ValueA: 2,
    ValueB: 0,
    ValueC: 1, //
    ValueD: 0,
    effect: "G値+2",
    effect2: "1枚引く",
    name: "立て直し",
};

const createSup2 = {
    id: "Sup2",
    cost: 0,
    type: "支援",
    ValueA: 0,
    ValueB: 0,
    ValueC: 0,
    ValueD: 3, // マナ+3
    effect: "マナ+3",
    effect2: "戦闘時一回のみ",
    name: "覚醒",
    exile: true, // 戦闘時一回のみのため追放
};

// カード配列
const cards = [
    createAtc1,
    createDef1,
    createSup1,
    createAtc2,
    createAtc3,
    createDef2,
    createSup2,
];

// その他報酬データ
const winRewards = [
    {
        id: "strengthUp",
        eventName: "筋力増加",
        effect: "strが1増加",
        apply: (player) => player.strength += 1,
    },
    {
        id: "armourUp",
        eventName: "鎧強化",
        effect: "armが1増加",
        apply: (player) => player.armour += 1,
    },
    {
        id: "maxHealthUp",
        eventName: "体力増加",
        effect: "最大体力が5増加",
        apply: (player) => player.maxHealth += 5,
    },
    {
        id: "healing",
        eventName: "休憩",
        effect: "体力を半分回復",
        apply: (player) => {
            const healingAmount = Math.floor(player.maxHealth / 2);
            player.health = Math.min(player.health + healingAmount, player.maxHealth);
        },
    },
];



const nextWay = [
    {
        id: 1,
        eventName: "敵と遭遇する",
        effect: "戦闘を開始します。",
        apply: (player, enemy, setEnemy) => {
            const randomEnemy = getRandomEnemy();
            if (setEnemy) {
                setEnemy(randomEnemy);
            }
            console.log(`New enemy encountered: ${randomEnemy.name || "Unknown Enemy"}`);
        },
    },
    {
        id: 2,
        eventName: "休憩する",
        effect: "ヘルスが回復します。",
        apply: (player) => {
            player.health = Math.min(player.maxHealth, player.health + 10); // 回復量を10と仮定
            console.log(`Player health restored to: ${player.health}`);
        },
    },
    {
        id: 3,
        eventName: "カードを廃棄する",
        effect: "デッキからカードを削除します。",
        apply: (player) => {
            if (player.deck.length > 0) {
                const removedCard = player.deck.pop(); // 最後のカードを削除
                console.log(`Card removed from deck: ${removedCard.name || "Unknown Card"}`);
            } else {
                console.log("No cards in deck to remove.");
            }
        },
    },
    {
        id: 4,
        eventName: "追加カードを得る",
        effect: "新しいカードをデッキに追加します。",
        apply: (player) => {
            const newCard = { name: "New Card", type: "攻撃", cost: 1 }; // 仮の新カード
            player.deck.push(newCard);
            console.log(`Card added to deck: ${newCard.name}`);
        },
    },
];

// モジュールエクスポート
module.exports = {
    player,
    enemy,
    createAtc1,
    createDef1,
    createSup1,
    createAtc2,
    createAtc3,
    createDef2,
    createSup2,
    cards,
    winRewards,
    initialPlayerData,
    initialEnemyData,
    nextWay, 
    enemyData2,
    enemyData3,
    enemyData4,
    nextWay,
    getRandomEnemy
};
