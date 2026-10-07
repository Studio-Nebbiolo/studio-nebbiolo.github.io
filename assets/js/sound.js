// 아주 작은 WebAudio 효과음. 파일 없이 그때그때 합성한다.
// 사용자가 무언가를 눌렀을 때만 울리고, 내비의 🔊 버튼으로 끌 수 있다.
(function (root) {
  let ctx = null;
  let on = true;
  try { on = localStorage.getItem('nb.sound') !== 'off'; } catch (e) {}

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone({ f = 440, f2 = null, dur = 0.12, type = 'sine', vol = 0.18, delay = 0 }) {
    if (!on) return;
    const a = ac();
    if (!a) return;
    const t = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  function noise({ dur = 0.2, vol = 0.2, freq = 1200, delay = 0 }) {
    if (!on) return;
    const a = ac();
    if (!a) return;
    const t = a.currentTime + delay;
    const len = Math.floor(a.sampleRate * dur);
    const buf = a.createBuffer(1, len, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = a.createBufferSource();
    src.buffer = buf;
    const filt = a.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = freq;
    const g = a.createGain();
    g.gain.value = vol;
    src.connect(filt).connect(g).connect(a.destination);
    src.start(t);
  }

  const rnd = (a, b) => a + Math.random() * (b - a);

  root.Sfx = {
    get on() { return on; },
    set on(v) {
      on = !!v;
      try { localStorage.setItem('nb.sound', on ? 'on' : 'off'); } catch (e) {}
    },
    // level 이 오를수록(빠르게 연달아 터뜨릴수록) 음이 올라간다
    pop(level = 0) {
      const f = 520 + Math.min(level, 14) * 42 + rnd(-30, 30);
      tone({ f, f2: f * 0.28, dur: 0.08, type: 'sine', vol: 0.24 });
      noise({ dur: 0.025, vol: 0.18, freq: 2600 });
    },
    boing() { tone({ f: 180, f2: 520, dur: 0.22, type: 'triangle', vol: 0.18 }); tone({ f: 520, f2: 260, dur: 0.18, type: 'sine', vol: 0.1, delay: 0.18 }); },
    tick() { tone({ f: rnd(1200, 1600), dur: 0.03, type: 'square', vol: 0.04 }); },
    coin() { tone({ f: 988, dur: 0.08, type: 'square', vol: 0.07 }); tone({ f: 1319, dur: 0.22, type: 'square', vol: 0.07, delay: 0.08 }); },
    dig() { noise({ dur: 0.08, vol: 0.35, freq: rnd(700, 1100) }); tone({ f: rnd(120, 160), dur: 0.06, type: 'square', vol: 0.06 }); },
    gem() { [1047, 1319, 1568, 2093].forEach((f, i) => tone({ f, dur: 0.14, type: 'triangle', vol: 0.09, delay: i * 0.06 })); },
    roll() { noise({ dur: 0.5, vol: 0.12, freq: 220 }); },
    crash(n = 1) { for (let i = 0; i < Math.min(6, n); i++) noise({ dur: 0.12, vol: 0.3, freq: rnd(1500, 3500), delay: i * 0.035 }); },
    strike() { [523, 659, 784, 1047].forEach((f, i) => tone({ f, dur: 0.18, type: 'square', vol: 0.07, delay: i * 0.09 })); },
    bell() { tone({ f: 1760, dur: 0.9, type: 'sine', vol: 0.12 }); tone({ f: 2637, dur: 0.6, type: 'sine', vol: 0.05 }); },
    whoosh() { noise({ dur: 0.25, vol: 0.12, freq: 600 }); },
  };
})(window);
