const player = require("play-sound")();

// 播放声音函数
function playSound(url) {
  return player.play(url, (error) => {
    if (error) {
      console.error("无法播放声音:", error);
    }
  });
}

// 在特定条件下调用播放声音函数
function playDidi() {
  const soundUrl = "./2825.wav";
  const audio = playSound(soundUrl);
  setTimeout(() => {
    audio.kill();
  }, 500);
}

module.exports = { playDidi };
