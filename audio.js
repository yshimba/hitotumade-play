(() => {
  let context = null;
  let musicReady = null;
  let lastState = null;
  const button = document.createElement('button');
  button.id = 'game-audio';
  button.textContent = '音声を開始';
  button.hidden = true;
  button.style.cssText = 'position:fixed;left:max(12px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom));z-index:20;min-height:44px;padding:8px 12px;border:1px solid #a6bfa7;border-radius:8px;background:#304835;color:#f1e7ce;font:16px sans-serif;touch-action:manipulation';
  document.body.appendChild(button);
  const update = () => {
    const state = context?.state;
    button.hidden = !context || state === 'running' || state === 'closed';
    if (state === 'running' && lastState !== 'running' && musicReady) musicReady();
    lastState = state;
  };
  function unlock() {
    // iOS's default ambient session can mute Web Audio with the ringer switch.
    // Only request playback after the player deliberately interacts with the game.
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (_) {}
    if (!context || context.state === 'closed') return;
    if (context.state !== 'running') context.resume().then(update).catch(update);
  }
  window.hitotumadeAudio = {
    registerMusicReady(callback) {
      musicReady = callback;
      if (context?.state === 'running') callback();
    },
    unregisterMusicReady() { musicReady = null; },
    attach(value) {
      context = value;
      context.addEventListener('statechange', update);
      update();
    }
  };
  // Keep listeners: returning from another app can interrupt mobile audio again.
  for (const event of ['touchend', 'pointerup', 'keydown']) {
    document.addEventListener(event, unlock, { capture: true, passive: true });
  }
  button.addEventListener('click', unlock);
})();
