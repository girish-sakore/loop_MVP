/** Imperative spark burst + strike sound. Creates one fixed canvas on first use; no provider needed. */
interface P { x: number; y: number; vx: number; vy: number; s: number; c: string; l: number; dc: number }

let canvas: HTMLCanvasElement | null = null;
let audio: AudioContext | null = null;
let particles: P[] = [];
let running = false;

function getCanvas() {
  if (canvas && canvas.isConnected) return canvas;
  canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:99';
  document.body.appendChild(canvas);
  return canvas;
}

function sound() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ac = (audio = audio || new AC());
    const n = Math.floor(ac.sampleRate * 0.15), b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const s = ac.createBufferSource(); s.buffer = b;
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 900;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.35, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.15);
    s.connect(f); f.connect(g); g.connect(ac.destination); s.start();
  } catch { /* audio is optional */ }
}

function frame() {
  const cv = getCanvas(), cx = cv.getContext('2d');
  if (!cx) { running = false; return; }
  cx.clearRect(0, 0, cv.width, cv.height);
  particles = particles.filter((p) => p.l > 0);
  particles.forEach((p) => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.l -= p.dc;
    cx.globalAlpha = Math.max(p.l, 0); cx.fillStyle = p.c;
    cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, 7); cx.fill();
  });
  if (particles.length) requestAnimationFrame(frame);
  else { cx.clearRect(0, 0, cv.width, cv.height); running = false; }
}

export function burst(x: number, y: number, n = 26) {
  if (typeof window === 'undefined') return;
  const cv = getCanvas();
  cv.width = innerWidth; cv.height = innerHeight;
  sound();
  const st = getComputedStyle(document.documentElement);
  const v = (k: string, d: string) => st.getPropertyValue(k).trim() || d;
  const pal = [v('--mb-yel', '#e2a732'), v('--mb-red', '#c83727'), '#fff', v('--mb-lyel', '#f5cd68')];
  for (let i = 0; i < n; i++) particles.push({ x, y, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.7) * 8 - 2, s: Math.random() * 4 + 2, c: pal[i % 4], l: 1, dc: Math.random() * 0.04 + 0.02 });
  if (!running) { running = true; requestAnimationFrame(frame); }
}
