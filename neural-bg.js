// neural-bg.js

(function () {
  const canvas = document.getElementById("neural-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  // particle setup
  const NUM_PARTICLES = 120;
  const particles = [];

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: randomBetween(-0.25, 0.25),
      vy: randomBetween(-0.25, 0.25),
      radius: randomBetween(3, 7)
    });
  }

  const mouse = {
    x: null,
    y: null,
    active: false
  };

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  function applyMouseForce(p) {
    if (!mouse.active) return;

    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist2 = dx * dx + dy * dy;
    const radius = 150;
    if (dist2 > radius * radius) return;

    const dist = Math.sqrt(dist2) || 0.0001;
    const force = (radius - dist) / radius * 0.04; // slightly subtle repulsion
    p.vx += (dx / dist) * force;
    p.vy += (dy / dist) * force;
  }

  function update() {
    for (const p of particles) {
      applyMouseForce(p);

      p.x += p.vx;
      p.y += p.vy;

      // bounce off edges
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
    }
  }

  function draw() {
    // plain white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // draw connections (light grey lines)
    const maxDist = 140;
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < maxDist * maxDist) {
          const dist = Math.sqrt(dist2);
          const alpha = 1 - dist / maxDist; // closer = darker
          ctx.globalAlpha = alpha * 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#bbbbbb"; // mid-grey
          ctx.stroke();
        }
      }
    }

    // draw mouse connections (slightly darker) if active
    if (mouse.active) {
      const mMaxDist = 180;
      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < mMaxDist * mMaxDist) {
          const dist = Math.sqrt(dist2);
          const alpha = 1 - dist / mMaxDist;
          ctx.globalAlpha = alpha * 0.8;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#888888"; // darker grey near cursor
          ctx.stroke();
        }
      }
    }

    
    ctx.globalAlpha = 0.5;

    // draw particles (dark grey/black nodes)
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#777777";
      ctx.fill();
    }
  }
    
    ctx.globalAlpha = 1.;

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  loop();
})();
