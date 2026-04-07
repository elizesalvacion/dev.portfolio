// ── Theme Toggle ──
const themeBtn = document.getElementById("themeBtn");
let isLight = false;
themeBtn.addEventListener("click", () => {
  isLight = !isLight;
  document.body.classList.toggle("light-mode", isLight);
  themeBtn.textContent = isLight ? "Dark" : "Light";
});

// ── Smooth Scroll ──
document.querySelectorAll("[data-scroll]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.scroll);
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

// ── Diamond Cluster ──
(function () {
  const cluster = document.getElementById("diamondCluster");
  const trigger = document.getElementById("diamondTrigger");
  if (!cluster || !trigger) return;

  const cards = Array.from(cluster.querySelectorAll(".diamond-card"));
  const destinations = {
    tl: { top: 0, left: 0 },
    tr: { top: 0, left: 210 },
    bl: { top: 210, left: -2 },
    br: { top: 210, left: 210 },
  };
  const origin = { top: 105, left: 105 };
  let revealed = false;

  // Set all cards to center, hidden, on load
  cards.forEach((card) => {
    card.style.top = origin.top + "px";
    card.style.left = origin.left + "px";
    card.style.margin = "0";
    card.style.opacity = "0";
    card.style.transform = "rotate(45deg) scale(0.55)";
    card.style.transition = "none";
  });

  function reveal() {
    revealed = true;
    cluster.classList.add("revealed");
    cards.forEach((card, i) => {
      const dest = destinations[card.dataset.slot];
      const delay = i * 90;
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
        card.style.transition = `top    0.55s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms,
           left   0.55s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms,
           opacity 0.3s ease ${delay}ms,
           transform 0.55s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms,
           background 0.3s ease, box-shadow 0.3s ease`;
        card.style.top = dest.top + "px";
        card.style.left = dest.left + "px";
        card.style.transform = "rotate(45deg) scale(1)";
      }, 10);
    });
  }

  function collapse() {
    revealed = false;
    cluster.classList.remove("revealed");
    cards.forEach((card, i) => {
      const delay = i * 55;
      setTimeout(() => {
        card.style.transition = `top    0.38s cubic-bezier(0.55,0,1,0.45) ${delay}ms,
           left   0.38s cubic-bezier(0.55,0,1,0.45) ${delay}ms,
           opacity 0.22s ease ${delay}ms,
           transform 0.38s cubic-bezier(0.55,0,1,0.45) ${delay}ms`;
        card.style.top = origin.top + "px";
        card.style.left = origin.left + "px";
        card.style.opacity = "0";
        card.style.transform = "rotate(45deg) scale(0.55)";
        card.style.pointerEvents = "none";
      }, 10);
    });
  }

  trigger.addEventListener("click", () => (revealed ? collapse() : reveal()));
})();

// ── Hero Pulsing Grid ──
(function () {
  const CELL = 36,
    COLS = 9,
    ROWS = 9;
  const W = COLS * CELL,
    H = ROWS * CELL;
  const ACCENT1 = "#05F2DB",
    ACCENT2 = "#D8048D";

  function hexAlpha(hex, a) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  function buildCells(cols, rows, corner) {
    const cells = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const dx = corner === "tl" ? col : cols - 1 - col;
        const dy = corner === "tl" ? row : rows - 1 - row;
        const dist = Math.sqrt(dx * dx + dy * dy);
        cells.push({
          col,
          row,
          dist,
          phase: dist * 0.45,
          speed: 0.0006 + Math.random() * 0.0002,
          accent: Math.random() < 0.15 ? ACCENT2 : ACCENT1,
          dotChance: Math.random(),
        });
      }
    }
    return cells;
  }

  function setupCanvas(id, corner) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    canvas.width = W;
    canvas.height = H;
    return {
      canvas,
      ctx: canvas.getContext("2d"),
      cells: buildCells(COLS, ROWS, corner),
      corner,
    };
  }

  function drawGrid(ctx, cells, corner, now) {
    ctx.clearRect(0, 0, W, H);
    const maxDist = Math.sqrt((COLS - 1) ** 2 + (ROWS - 1) ** 2);
    cells.forEach((cell) => {
      const t = now * cell.speed + cell.phase;
      const pulse = (Math.sin(t) + 1) / 2;
      const edgePulse = (Math.sin(t * 0.5) + 1) / 2;
      const x = cell.col * CELL,
        y = cell.row * CELL;
      const proximity = 1 - cell.dist / maxDist;
      const fade = Math.pow(proximity, 1.6);

      ctx.fillStyle = hexAlpha(cell.accent, fade * (0.08 + pulse * 0.22));
      ctx.fillRect(x, y, CELL, CELL);

      ctx.strokeStyle = hexAlpha(cell.accent, fade * (0.12 + edgePulse * 0.35));
      ctx.lineWidth = 0.75;
      ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);

      if (cell.dist < 3.5) {
        const cs = 6,
          ba = fade * (0.3 + pulse * 0.5);
        ctx.strokeStyle = hexAlpha(cell.accent, ba);
        ctx.lineWidth = 1.2;
        [
          [0, cs, 0, 0, cs, 0],
          [CELL - cs, 0, CELL, 0, CELL, cs],
          [CELL, CELL - cs, CELL, CELL, CELL - cs, CELL],
          [cs, CELL, 0, CELL, 0, CELL - cs],
        ].forEach(([x1, y1, x2, y2, x3, y3]) => {
          ctx.beginPath();
          ctx.moveTo(x + x1, y + y1);
          ctx.lineTo(x + x2, y + y2);
          ctx.lineTo(x + x3, y + y3);
          ctx.stroke();
        });
      }

      if (cell.dotChance > 0.7 && pulse > 0.6) {
        ctx.fillStyle = hexAlpha(cell.accent, fade * (pulse - 0.6) * 2.2);
        ctx.beginPath();
        ctx.arc(x + CELL / 2, y + CELL / 2, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  const grids = [
    setupCanvas("hero-grid-tl", "tl"),
    setupCanvas("hero-grid-br", "br"),
  ].filter(Boolean);
  if (!grids.length) return;
  function animate(now) {
    grids.forEach((g) => drawGrid(g.ctx, g.cells, g.corner, now));
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();

// ── Cyberpunk Cursor + Grid Trail ──
(function () {
  const ACCENT1 = "#05F2DB",
    ACCENT2 = "#D8048D";
  const GRID_SIZE = 25,
    TRAIL_DURATION = 800,
    MAX_TRAIL = 24;

  document.documentElement.style.cursor = "none";

  // Custom cursor SVG
  const cursor = document.createElement("div");
  cursor.id = "cyb-cursor";
  cursor.innerHTML = `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="4,4 4,22 10,16 14,24 17,23 13,15 22,15" fill="${ACCENT1}" opacity="0.95"/>
    <polygon points="4,4 4,22 10,16 14,24 17,23 13,15 22,15" fill="none" stroke="${ACCENT2}" stroke-width="0.8" opacity="0.7"/>
    <circle cx="4" cy="4" r="1.5" fill="${ACCENT2}"/>
  </svg>`;
  Object.assign(cursor.style, {
    position: "fixed",
    top: "0",
    left: "0",
    pointerEvents: "none",
    zIndex: "99999",
    transform: "translate(-2px,-2px)",
    transition: "opacity 0.15s ease",
    willChange: "transform",
    mixBlendMode: "screen",
  });
  document.body.appendChild(cursor);

  // Lagging ring
  const ring = document.createElement("div");
  ring.id = "cyb-ring";
  Object.assign(ring.style, {
    position: "fixed",
    width: "36px",
    height: "36px",
    border: `1px solid ${ACCENT1}`,
    borderRadius: "2px",
    top: "0",
    left: "0",
    pointerEvents: "none",
    zIndex: "99998",
    transform: "translate(-18px,-18px) rotate(45deg)",
    opacity: "0.4",
    transition: "opacity 0.15s ease",
    willChange: "transform",
  });
  document.body.appendChild(ring);

  // Trail canvas
  const canvas = document.createElement("canvas");
  canvas.id = "cyb-canvas";
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    pointerEvents: "none",
    zIndex: "99990",
    mixBlendMode: "screen",
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const trail = [];
  let mx = -200,
    my = -200,
    lastGx = -1,
    lastGy = -1;

  function hexToRgb(hex) {
    return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`;
  }

  function drawFrame(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = trail.length - 1; i >= 0; i--) {
      const cell = trail[i];
      const age = now - cell.born;
      if (age > TRAIL_DURATION) {
        trail.splice(i, 1);
        continue;
      }
      const progress = age / TRAIL_DURATION;
      const alpha = (1 - progress) * 0.55;
      const rgb = hexToRgb(cell.color);
      const x = cell.gx * GRID_SIZE,
        y = cell.gy * GRID_SIZE;

      ctx.fillStyle = `rgba(${rgb},${alpha * 0.18})`;
      ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
      ctx.strokeStyle = `rgba(${rgb},${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.strokeRect(x + 0.5, y + 0.5, GRID_SIZE - 1, GRID_SIZE - 1);

      const cs = 5,
        ca = Math.min(alpha * 1.6, 1);
      ctx.strokeStyle = `rgba(${rgb},${ca})`;
      ctx.lineWidth = 1.2;
      [
        [0, cs, 0, 0, cs, 0],
        [GRID_SIZE - cs, 0, GRID_SIZE, 0, GRID_SIZE, cs],
        [
          GRID_SIZE,
          GRID_SIZE - cs,
          GRID_SIZE,
          GRID_SIZE,
          GRID_SIZE - cs,
          GRID_SIZE,
        ],
        [cs, GRID_SIZE, 0, GRID_SIZE, 0, GRID_SIZE - cs],
      ].forEach(([x1, y1, x2, y2, x3, y3]) => {
        ctx.beginPath();
        ctx.moveTo(x + x1, y + y1);
        ctx.lineTo(x + x2, y + y2);
        ctx.lineTo(x + x3, y + y3);
        ctx.stroke();
      });

      if (progress < 0.3) {
        ctx.fillStyle = `rgba(${rgb},${(1 - progress / 0.3) * 0.9})`;
        ctx.beginPath();
        ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(drawFrame);
  }
  requestAnimationFrame(drawFrame);

  // Ring lerp
  let ringX = -200,
    ringY = -200;
  function lerpRing() {
    ringX += (mx - ringX) * 0.12;
    ringY += (my - ringY) * 0.12;
    ring.style.transform = `translate(${ringX - 18}px,${ringY - 18}px) rotate(45deg)`;
    requestAnimationFrame(lerpRing);
  }
  lerpRing();

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx - 2}px,${my - 2}px)`;
    const gx = Math.floor(mx / GRID_SIZE);
    const gy = Math.floor(my / GRID_SIZE);
    if (gx !== lastGx || gy !== lastGy) {
      lastGx = gx;
      lastGy = gy;
      if (trail.length >= MAX_TRAIL) trail.shift();
      trail.push({
        gx,
        gy,
        born: performance.now(),
        color: Math.random() < 0.75 ? ACCENT1 : ACCENT2,
      });
    }
  });

  document.addEventListener("mouseleave", () => {
    cursor.style.opacity = "0";
    ring.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
    ring.style.opacity = "0.4";
  });

  window.addEventListener("click", (e) => {
    const cx = Math.floor(e.clientX / GRID_SIZE);
    const cy = Math.floor(e.clientY / GRID_SIZE);
    const now = performance.now();
    [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, 1],
      [-1, 1],
      [1, -1],
    ].forEach(([dx, dy]) => {
      if (trail.length >= MAX_TRAIL + 8) trail.shift();
      trail.push({ gx: cx + dx, gy: cy + dy, born: now, color: ACCENT2 });
    });
  });
})();
