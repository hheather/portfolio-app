/* ============================================================
   GRID BACKGROUND — grid.js
   Interactive dot/line grid powered by p5.js.
   Loaded after p5.js in index.html.
   ============================================================ */

new p5(function (p) {
  const GRID      = 15;
  const SHOW_DOTS = true;
  const SHOW_LINES = false;
  let dots = [];
  let cols, rows;

  function buildDots() {
    dots = [];
    cols = Math.floor(p.width / GRID) + 1;
    rows = Math.floor(p.height / GRID) + 1;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = c * GRID;
        const y = r * GRID;
        dots.push({ hx: x, hy: y, x, y, vx: 0, vy: 0, affected: false });
      }
    }
  }

  p.setup = function () {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.style('position', 'fixed');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-1');
    canvas.style('pointer-events', 'none');
    canvas.parent(document.body);
    buildDots();
  };

  p.draw = function () {
    p.clear();

    const mx = p.mouseX;
    const my = p.mouseY;
    const RADIUS = 100;

    // Update positions
    for (const dot of dots) {
      const dx = mx - dot.x;
      const dy = my - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      if (dist < RADIUS) {
        const strength = 1 - dist / RADIUS;
        dot.vx += (dx / dist) * 1.2 * strength;
        dot.vy += (dy / dist) * 1.2 * strength;
        dot.affected = true;
      } else {
        dot.affected = false;
      }

      dot.vx += (dot.hx - dot.x) * 0.04;
      dot.vy += (dot.hy - dot.y) * 0.04;
      dot.vx *= 0.92;
      dot.vy *= 0.92;
      dot.x += dot.vx;
      dot.y += dot.vy;
    }

    // Draw lines between neighbours
    if (SHOW_LINES) {
      p.strokeWeight(0.5);
      p.noFill();
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const dot = dots[c * rows + r];
          if (c < cols - 1) {
            const right = dots[(c + 1) * rows + r];
            p.stroke(dot.affected || right.affected ? [0, 0, 255, 120] : [0, 0, 0, 50]);
            p.line(dot.x, dot.y, right.x, right.y);
          }
          if (r < rows - 1) {
            const below = dots[c * rows + r + 1];
            p.stroke(dot.affected || below.affected ? [0, 0, 255, 120] : [0, 0, 0, 50]);
            p.line(dot.x, dot.y, below.x, below.y);
          }
        }
      }
    }

    // Draw dots on top
    if (SHOW_DOTS) {
      p.noStroke();
      for (const dot of dots) {
        p.fill(dot.affected ? [255, 0, 255] : [0, 0, 0, 90]);
        p.circle(dot.x, dot.y, 2);
      }
    }
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    buildDots();
  };
});
