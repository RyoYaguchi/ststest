const { createDeckDisplayScene } = require("./spireScenes");


const fonts = {
    bold: new g.DynamicFont({
        game: g.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 16,
    }),
    regular: new g.DynamicFont({
        game: g.game,
        fontFamily: g.FontFamily.SansSerif,
        size: 12,
    }),
};

const gameWon = false;

const initialPlayerData = {
    maxHealth: 30,
    health: 30,
    maxMana: 4,
    mana: 4,
    guard: 0,
    armour: 0,
    strength: 0,
    hand: [], // 手札
    deck: [], // デッキ
    discardPile: [], // 捨て札
    exiled: [], // 追放
    walkCount: 0,
    gold: 0,
    //ステート異常
    decreaseDmg : 0,
    increaseDmg : 0,
    decreaseGetDmg : 0,
    increaseGetDmg :0,
    poisoned :0,
    paralised:0,
};

const initialEnemyData = {
    name: "敵1",
    health: 15,
    guard: 0,
    acts: [
        {
            id: "enemyAct1",
            type: "攻撃",
            ValueA: 5,
            ValueB: 0,
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
    name: "敵2",
    health: 20,
    guard: 0,
    acts: [
        {
            id: "enemyAct1",
            type: "毒攻撃",
            ValueA: 3,
            ValueB: 0,
            ValueC: 0,
            poison: 3,

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
    name: "敵3",
    health: 30,
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
    name: "敵4",
    health: 40,
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

const enemyDataBoss = {
    name: "ボス",
    boss:true,
    health: 40,
    guard: 0,
    acts: [
        {
            id: "enemyAct1",
            type: "攻撃",
            ValueA: 15,
            ValueB: 2,
            ValueC: 0,
            get effect() {
                return `${this.ValueA}ダメージ`;
            },
        },
        {
            id: "enemyAct2",
            type: "攻撃",
            ValueA: 20,
            ValueB: 0,
            ValueC: 0,
            get effect() {
                return `${this.ValueA}ダメージ`;
            },
        },
    ],
    currentAction: null, 
};

const enemyDatas= [initialEnemyData, enemyData2, enemyData3, enemyData4];

const getRandomEnemy = function () {
    const randomEnemy = enemyDatas[Math.floor(g.game.random.generate() * enemyDatas.length)];
    console.log("Selected random enemy:", randomEnemy); // 先にログを出力
    return { ...randomEnemy }; // データをコピーして返す
};


// プレイヤーデータ
const player = { ...initialPlayerData };

// エネミーデータ
const enemy = { ...initialEnemyData };

// カードデータ
const createAtc1 = {
    id: "Atc1",
    startCard: true,
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
    startCard: true,
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
    startCard: true,
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
    effect: "G値+3",
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
    // createAtc1,
    // createDef1,
    // createSup1,
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
        eventName: "手当",
        effect: "体力を10回復",
        apply: (player) => {
            player.health = Math.min(player.maxHealth, player.health + 10);
        },
    },
    {
        id: "getGold",
        eventName: "金銭獲得",
        effect: "", // 初期値は空
        initialize: function () { //インスタンスの生成時に必ず実行したい処理
            const goldEarned = Math.floor(g.game.random.generate() * 16) + 5; // 5 ~ 20
            this.goldEarned = goldEarned; // 金額を保存
            this.effect = `${goldEarned} Gold`; // effect を更新
        },
        apply: function (player) {
            player.gold += this.goldEarned; // 保存した金額を適用
            console.log(`You earned ${this.goldEarned} Gold!`);
        },
    }
];



const generateRandomCost = () => Math.floor(g.game.random.generate() * 11) + 5; // 5~15のランダムな値

const nextWay = [
    {
        id: 1,
        eventName: "敵と遭遇する",
        effect: "戦闘を開始します。",
        cost: 0, 
        apply: (player, enemy, setEnemy) => {
            const randomEnemy = getRandomEnemy();
            if (setEnemy) {
                setEnemy(randomEnemy);
            }
            console.log(`New enemy encountered: ${randomEnemy.name || "Unknown Enemy"}`);
            console.log("Enemy details:", randomEnemy); 
        },
    },
    {
        id: 2,
        eventName: "休憩する",
        effect: "ヘルスが回復します。",
        cost: generateRandomCost(),
        apply: (player) => {
            player.health = Math.min(player.maxHealth, player.health + 10); // 回復量を10と仮定
            console.log(`Player health restored to: ${player.health}`);
        },
    },
    {
        id: 3,
        eventName: "カードを廃棄する",
        effect: "デッキからカードを削除します。",
        cost: generateRandomCost(),
        apply: (player) => {
            if (player.deck.length > 0) {
                createDeckDisplayScene(g.game.scene(), player, true); // プレイヤーデータを渡す
            } else {
                console.log("No cards in deck to remove.");
            }
        },
    },
    {
        id: 4,
        eventName: "追加カードを得る",
        effect: "新しいカードをデッキに追加します。",
        cost: generateRandomCost(),
        apply: (player) => {
            const newCard = { name: "New Card", type: "攻撃", cost: 1 }; // 仮の新カード　これなんだ?
            player.deck.push(newCard);
            console.log(`Card added to deck: ${newCard.name}`);
        },
    },
    {
        id: 5,
        eventName: "休憩",
        effect: "ヘルス半分回復",
        cost: generateRandomCost(),
        apply: (player) => {
            const healingAmount = Math.floor(player.maxHealth / 2);
            player.health = Math.min(player.health + healingAmount, player.maxHealth);
                },
    },
    {
        id: 6,
        eventName: "strength",
        effect: "strength+1",
        cost: generateRandomCost(),
        apply: (player) => {
            player.strength = (player.strength || 0) + 1;
            console.log(`Player strength increased by 1. Current strength: ${player.strength}`);
        },
    },
    {
        id: 7,
        eventName: "armourを1得る",
        effect: "armour+1",
        cost: generateRandomCost(),
        apply: (player) => {
            player.armour = (player.armour || 0) + 1;
            console.log(`Player armour increased by 1. Current armour: ${player.armour}`);
        },
    },
];

// モジュールエクスポート おおくね
module.exports = {
    gameWon,
    fonts,
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
    enemyDataBoss,
    nextWay,
    getRandomEnemy,
    generateRandomCost
};
