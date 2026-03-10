/* ============================================================
   BACKGROUND — grid.js
   Ethereal cloud effect: white cloud bodies, cyan + pink edges.
   ============================================================ */

new p5(function (p) {
  const STEP  = 6;    // pixel resolution of each noise cell
  const SCALE = 0.001; // noise spatial zoom (lower = smoother blobs)
  const SPEED = 0.005; // animation speed (higher = faster flow)
  let t = 0;
  let cyan, white, pink;

  p.setup = function () {
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.style('position', 'fixed');
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '-1');
    canvas.style('pointer-events', 'none');
    canvas.parent(document.body);
    p.noStroke();
    cyan  = p.color(0, 255, 255);
    white = p.color(255);
    pink  = p.color(255, 0, 255);
  };

  p.draw = function () {
    p.clear();

    for (let x = 0; x < p.width; x += STEP) {
      for (let y = 0; y < p.height; y += STEP) {
        const n = p.noise(x * SCALE, y * SCALE, t);

        // Cyan at low noise (leading edges) → white (cloud body) → pink at high noise (trailing edges)
        const col = n < 0.5
          ? p.lerpColor(cyan,  white, n * 2)
          : p.lerpColor(white, pink,  (n - 0.5) * 2);

        // sin curve peaks at n=0.5 → cloud centres are opaque, edges fade to transparent
        const alpha = Math.sin(n * Math.PI) * 210;
        col.setAlpha(alpha);

        p.fill(col);
        p.rect(x, y, STEP, STEP);
      }
    }

    t += SPEED;
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };
});
