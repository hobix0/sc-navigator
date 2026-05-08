// Animated parallax starfield. Three layers of stars drifting at different speeds,
// plus the occasional shooting star. Pauses when tab is hidden.
(function () {
  const cv = document.getElementById('bg-stars');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  let layers = [];
  let shoots = [];
  let last = performance.now();
  let mouseX = 0, mouseY = 0, tx = 0, ty = 0;

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function seed() {
    const density = (W * H) / 9000;  // tune
    layers = [
      { speed: 0.012, depth: 0.3, stars: makeStars(Math.round(density * 0.55), 0.4, 1.0, 0.35, 0.7) },
      { speed: 0.028, depth: 0.6, stars: makeStars(Math.round(density * 0.35), 0.6, 1.6, 0.55, 0.95) },
      { speed: 0.06,  depth: 1.0, stars: makeStars(Math.round(density * 0.10), 1.0, 2.4, 0.85, 1.0) },
    ];
  }

  function makeStars(n, rMin, rMax, aMin, aMax) {
    const out = [];
    for (let i = 0; i < n; i++) {
      out.push({
        x: rand(0, W), y: rand(0, H),
        r: rand(rMin, rMax),
        a: rand(aMin, aMax),
        twinkle: rand(0.0006, 0.0028),
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.08 ? rand(190, 220) : rand(200, 240),
        sat: Math.random() < 0.15 ? 70 : 12,
      });
    }
    return out;
  }

  function spawnShoot() {
    if (shoots.length > 2) return;
    if (Math.random() > 0.0025) return;
    const fromLeft = Math.random() < 0.5;
    shoots.push({
      x: fromLeft ? -50 : W + 50,
      y: rand(0, H * 0.6),
      vx: (fromLeft ? 1 : -1) * rand(420, 720),
      vy: rand(80, 200),
      life: 0,
      ttl: rand(0.6, 1.1),
    });
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // Smooth parallax based on mouse
    tx += (mouseX - tx) * 0.05;
    ty += (mouseY - ty) * 0.05;

    ctx.clearRect(0, 0, W, H);

    for (const layer of layers) {
      const px = -tx * 18 * layer.depth;
      const py = -ty * 12 * layer.depth;
      for (const s of layer.stars) {
        // drift
        s.x -= layer.speed * 60 * dt;
        if (s.x < -2) s.x = W + 2;

        s.phase += s.twinkle * 60 * dt;
        const tw = 0.7 + 0.3 * Math.sin(s.phase);
        const a = s.a * tw;

        const x = s.x + px, y = s.y + py;
        if (x < -2 || x > W + 2 || y < -2 || y > H + 2) continue;

        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, ${s.sat}%, 95%, ${a})`;
        ctx.fill();

        // bigger stars get a soft glow
        if (s.r > 1.4) {
          ctx.beginPath();
          ctx.arc(x, y, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${s.hue}, ${s.sat}%, 80%, ${a * 0.08})`;
          ctx.fill();
        }
      }
    }

    // Shooting stars
    spawnShoot();
    for (let i = shoots.length - 1; i >= 0; i--) {
      const sh = shoots[i];
      sh.life += dt;
      sh.x += sh.vx * dt; sh.y += sh.vy * dt;
      const alpha = Math.max(0, 1 - sh.life / sh.ttl);
      const grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 0.05, sh.y - sh.vy * 0.05);
      grad.addColorStop(0, `rgba(190, 230, 255, ${alpha})`);
      grad.addColorStop(1, `rgba(190, 230, 255, 0)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(sh.x - sh.vx * 0.05, sh.y - sh.vy * 0.05);
      ctx.stroke();
      if (sh.life > sh.ttl) shoots.splice(i, 1);
    }

    raf = requestAnimationFrame(tick);
  }

  let raf = 0;
  function start() { last = performance.now(); raf = requestAnimationFrame(tick); }
  function stop()  { cancelAnimationFrame(raf); }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / W) * 2 - 1;  // -1 .. 1
    mouseY = (e.clientY / H) * 2 - 1;
    // Also parallax the bg image slightly
    const bg = document.getElementById('bg-image');
    if (bg) bg.style.transform = `translate3d(${-mouseX * 12}px, ${-mouseY * 8}px, 0) scale(1.03)`;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else { last = performance.now(); start(); }
  });

  resize();
  start();
})();
