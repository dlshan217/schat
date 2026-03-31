import { useEffect, useRef } from "react";

export default function LeftAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let w, h;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    let offset = 0;

    function draw() {
      offset += 0.3; // speed (lower = slower)

      ctx.clearRect(0, 0, w, h);

      const spacing = 18;   // distance between dots
      const baseSize = 2.5; // base dot size

      for (let y = -spacing; y < h + spacing; y += spacing) {
        for (let x = 0; x < w + spacing; x += spacing) {

          // smooth infinite upward loop
          const yPos = (y + offset) % (h + spacing);

          // slight diagonal offset (comic feel)
          const xOffset = (y / spacing) * 6;

          // subtle size variation (organic comic look)
          const size =
            baseSize +
            Math.sin((x + yPos) * 0.05) * 1.2;

          ctx.beginPath();
          ctx.arc(x + xOffset, yPos, size, 0, Math.PI * 2);

          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.fill();
        }
      }

      requestAnimationFrame(draw);
    }

    draw();

    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none" // important: don't block UI
      }}
    />
  );
}