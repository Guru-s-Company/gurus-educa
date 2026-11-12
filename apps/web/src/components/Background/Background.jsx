import { useEffect, useRef } from "react";
import "./background.css";

/*
  Formas que vagam de forma aleatória e, ao sair por um lado da tela,
  reaparecem pelo lado oposto (efeito "Pac-Man").

  - x / y: posição inicial (fração da tela, centro da forma)
  - rot:   rotação inicial em graus
  - shadow: true = sombra dura que se mantém apontando p/ baixo-direita
*/
const SHAPES = [
  { name: "circle", rot: 0, shadow: true },
  { name: "square-a", rot: 32, shadow: true },
  { name: "square-b", rot: -12, shadow: true },
  { name: "square-c", rot: 35, shadow: true },
  { name: "circle", rot: 0, shadow: true },
];

// Ajuste aqui a "energia" do movimento
const SPEED = { min: 40, max: 110 };     // px por segundo
const SPIN = { min: 12, max: 40 };       // graus por segundo
const TURN_EVERY = { min: 2, max: 6 };   // segundos entre mudanças de rumo
const STEERING = 0.9;                    // quão rápido muda de rumo (maior = mais brusco)
const SHADOW_DISTANCE = 6;               // px da sombra dura
const SHADOW_COLOR = "#1a1226";

const rand = (min, max) => min + Math.random() * (max - min);
const randomPosition = (width, height) => ({
  x: rand(0.05, 0.95) * width,
  y: rand(0.05, 0.95) * height,
});
const randomVelocity = () => {
  const angle = rand(0, Math.PI * 2);
  const speed = rand(SPEED.min, SPEED.max);
  return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed };
};
const wrap = (value, min, max) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

export default function BackgroundShapes() {
  const refs = useRef([]);

  useEffect(() => {

    let width = window.innerWidth;
    let height = window.innerHeight;

    const states = SHAPES.map((shape) => {
      const position = randomPosition(width, height);
      const velocity = randomVelocity();
      const target = randomVelocity();
      return {
        x: position.x,
        y: position.y,
        vx: velocity.vx,
        vy: velocity.vy,
        tvx: target.vx,
        tvy: target.vy,
        nextTurn: rand(TURN_EVERY.min, TURN_EVERY.max),
        rot: shape.rot,
        spin: (Math.random() < 0.5 ? -1 : 1) * rand(SPIN.min, SPIN.max),
        size: 0,
      };
    });

    const measure = () => {
      refs.current.forEach((el, i) => {
        if (el) states[i].size = el.offsetWidth; // 0 quando display: none
      });
    };

    const draw = () => {
      refs.current.forEach((el, i) => {
        const s = states[i];
        if (!el || !s.size) return;

        el.style.transform = `translate(${s.x - s.size / 2}px, ${
          s.y - s.size / 2
        }px) rotate(${s.rot}deg)`;

        if (SHAPES[i].shadow) {
          // Desfaz a rotação no vetor da sombra: ela fica sempre p/ baixo-direita
          const t = (s.rot * Math.PI) / 180;
          const d = SHADOW_DISTANCE;
          const lx = d * Math.cos(t) + d * Math.sin(t);
          const ly = d * Math.cos(t) - d * Math.sin(t);
          el.style.boxShadow = `${lx.toFixed(2)}px ${ly.toFixed(
            2
          )}px 0 ${SHADOW_COLOR}`;
        }
      });
    };

    const handleResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      states.forEach((s) => {
        s.x = (s.x / width) * newWidth;
        s.y = (s.y / height) * newHeight;
      });
      width = newWidth;
      height = newHeight;
      measure();
      draw();
    };

    measure();
    draw();
    window.addEventListener("resize", handleResize);

    let frame;
    let last = performance.now();

    const tick = (now) => {
      // limita o dt (ex.: aba voltou do segundo plano)
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      states.forEach((s) => {
        if (!s.size) return;

        // Troca o rumo de tempos em tempos e suaviza a transição
        s.nextTurn -= dt;
        if (s.nextTurn <= 0) {
          const target = randomVelocity();
          s.tvx = target.vx;
          s.tvy = target.vy;
          s.nextTurn = rand(TURN_EVERY.min, TURN_EVERY.max);
        }
        const k = Math.min(1, dt * STEERING);
        s.vx += (s.tvx - s.vx) * k;
        s.vy += (s.tvy - s.vy) * k;

        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.rot += s.spin * dt;

        // Wrap: só teleporta quando a forma já saiu totalmente da tela
        const margin = s.size;
        s.x = wrap(s.x, -margin, width + margin);
        s.y = wrap(s.y, -margin, height + margin);
      });

      draw();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="background" aria-hidden="true">
      {SHAPES.map((shape, i) => (
        <span
          key={`${shape.name}-${i}`}
          ref={(el) => (refs.current[i] = el)}
          className={`background__shape background__shape--${shape.name}`}
        />
      ))}
    </div>
  );
}