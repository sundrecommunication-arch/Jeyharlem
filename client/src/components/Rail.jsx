import React, { useEffect, useRef, useState } from 'react';

const SECTIONS = [
  ['hero', '01 — Arrival'],
  ['bestsellers-top', '02 — Bestsellers'],
  ['categories', '03 — Collections'],
  ['new-in', '04 — New In'],
  ['finder', '05 — Your Match'],
  ['more-categories', '06 — The Edit'],
  ['editorial', '07 — Philosophy'],
  ['about-teaser', '08 — Atelier'],
  ['voices', '09 — Voices'],
  ['join', '10 — Join'],
];

export default function Rail() {
  const [active, setActive] = useState('hero');
  const [scrolling, setScrolling] = useState(false);
  const idleTimer = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter(Boolean);
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolling(true);
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setScrolling(false), 900);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <nav className={`rail${scrolling ? ' is-scrolling' : ''}`}>
      {SECTIONS.map(([id, label]) => (
        <button
          key={id}
          className={active === id ? 'active' : ''}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
        >
          <i />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
