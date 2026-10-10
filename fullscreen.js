(() => {
  const button = document.createElement('button');
  button.id = 'game-fullscreen';
  button.type = 'button';
  button.textContent = '全画面';
  button.setAttribute('aria-label', 'ゲームを全画面にする');
  const style = document.createElement('style');
  style.textContent = `#game-fullscreen { position:fixed; right:max(12px,env(safe-area-inset-right)); bottom:max(10px,env(safe-area-inset-bottom)); z-index:20; min-height:44px; min-width:76px; padding:8px 12px; border:1px solid #a6bfa7; border-radius:8px; background:#304835; color:#f1e7ce; font:16px sans-serif; touch-action:manipulation; }
#fullscreen-help { max-width:min(420px,85vw); padding:20px; border:1px solid #a6bfa7; border-radius:12px; color:#f1e7ce; background:#304835; font:16px/1.6 sans-serif; }
#fullscreen-help::backdrop { background:#0009; }
#fullscreen-help button { min-height:44px; padding:8px 18px; font:inherit; }`;
  document.head.appendChild(style);
  document.body.appendChild(button);
  const help = document.createElement('dialog');
  help.id = 'fullscreen-help';
  const message = document.createElement('p');
  const close = document.createElement('button');
  close.textContent = '閉じる';
  close.onclick = () => help.close();
  help.append(message,close);
  document.body.appendChild(help);
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const active = () => !!(document.fullscreenElement || document.webkitFullscreenElement || standalone());
  const sync = () => {
    button.textContent = active() ? '全画面を戻す' : '全画面';
    button.hidden = standalone();
    if (api.onChange) api.onChange(active());
  };
  const guide = () => {
    message.textContent = 'このブラウザでは全画面へ切り替えられません。iPhoneではSafariの共有メニューから「ホーム画面に追加」し、追加したアイコンから開いてください。スマホを横向きにすると遊びやすくなります。';
    if (!help.open) help.showModal();
    sync();
  };
  const api = window.hitotumadeFullscreen = {
    onChange:null, active,
    async requestMode(enabled) {
      if (standalone()) return sync();
      if (enabled === active()) return sync();
      try {
        if (enabled) {
          const target = document.documentElement;
          const request = target.requestFullscreen || target.webkitRequestFullscreen;
          if (!request || document.fullscreenEnabled === false) return guide();
          // Called directly from the button gesture, never during page startup.
          await request.call(target);
          if (screen.orientation?.lock) await screen.orientation.lock('landscape').catch(() => {});
        } else {
          const exit = document.exitFullscreen || document.webkitExitFullscreen;
          if (exit) await exit.call(document);
        }
        sync();
      } catch (_) { guide(); }
    },
    toggle() { return api.requestMode(!active()); }
  };
  button.onclick = () => api.toggle();
  document.addEventListener('fullscreenchange',sync);
  document.addEventListener('webkitfullscreenchange',sync);
  sync();
})();
