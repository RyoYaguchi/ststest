const spireEvents = require("./spireEvents");
const { initializeGame } = require("./gameInitializer");

function main() {
    // 新しいシーンを作成
    const scene = new g.Scene({
        game: g.game,
    });

    // フォントの準備
    let fontBold, fontRegular;
    scene.onLoad.add(() => {
        console.log("Scene loaded.");

        // フォントを作成
        fontBold = new g.DynamicFont({
            game: g.game,
            fontFamily: g.FontFamily.SansSerif,
            size: 32,
            fontWeight: g.FontWeight.Bold,
        });

        fontRegular = new g.DynamicFont({
            game: g.game,
            fontFamily: g.FontFamily.SansSerif,
            size: 24,
            fontWeight: g.FontWeight.Normal,
        });

        // `initializeGame` イベントを発火
        spireEvents.emit("initializeGame", scene, fontBold, fontRegular);
    });

    // 初期シーンをプッシュ
    g.game.pushScene(scene);

    // シーンの状態を確認するログ
    console.log("Scenes after pushing initial scene:", g.game.scenes);
}

// デフォルトエクスポートとして `main` をエクスポート
module.exports = main;