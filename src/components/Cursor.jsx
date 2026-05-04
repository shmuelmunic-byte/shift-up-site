import { useEffect, useRef, useState } from 'react';

export default function Cursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const mouse    = useRef({ x: -200, y: -200 });
  const ringPos  = useRef({ x: -200, y: -200 });
  const rafRef   = useRef(null);
  const [isHover,  setIsHover]  = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const SIZE     = 8;   // dot diameter
    const RING_SIZE = 42; // ring diameter

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    const onDown = () => setIsActive(true);
    const onUp   = () => setIsActive(false);
    const onOver = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setIsHover(true);
    };
    const onOut = (e) => {
      if (e.target.closest('a, button, [data-cursor]')) setIsHover(false);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup',   onUp);
    document.addEventListener('mouseover',  onOver);
    document.addEventListener('mouseout',   onOut);

    const lerp = (a, b, n) => a + (b - a) * n;

    const tick = () => {
      const dot  = dotRef.current;
      const ring = ringRef.current;
      if (!dot || !ring) { rafRef.current = requestAnimationFrame(tick); return; }

      // dot: instant follow, centred on cursor
      const dx = mouse.current.x - SIZE  / 2;
      const dy = mouse.current.y - SIZE  / 2;
      dot.style.transform = `translate(${dx}px, ${dy}px)`;

      // ring: lagged follow, centred on cursor
      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.1);
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.1);
      const rx = ringPos.current.x - RING_SIZE / 2;
      const ry = ringPos.current.y - RING_SIZE / 2;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup',   onUp);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout',  onOut);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const dotSize = isActive ? 5 : 8;

  return (
    <>
      {/* dot */}
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{
          width:  dotSize,
          height: dotSize,
          marginLeft: isActive ? 1.5 : 0,
          marginTop:  isActive ? 1.5 : 0,
          transition: 'width 0.2s, height 0.2s',
        }}
      />

      {/* ring */}
      <div
        ref={ringRef}
        className={`cursor-ring${isActive ? ' active' : ''}${isHover ? ' hover' : ''}`}
      />
    </>
  );
}
