const spireData = require("./spireData");
const spireRender = require("./spireRender");
const spireLogic = require("./spireLogic");

const scene = new g.Scene({ game: g.game });

// 共通フォント設定
const fontBold = new g.DynamicFont({
    game: g.game,
    fontFamily: g.FontFamily.SansSerif,
    size: 12,
    fontWeight: "bold",
});

const fontRegular = new g.DynamicFont({
    game: g.game,
    fontFamily: g.FontFamily.SansSerif,
    size: 12,
});

const deck = spireLogic.initializeDeck(spireData);

function main() {
    scene.onLoad.add(() => {
        spireLogic.setupGame(scene, spireData, deck, fontBold, fontRegular);
    });

    g.game.pushScene(scene);
}

module.exports = main;