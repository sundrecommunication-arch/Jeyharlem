import React, { useEffect, useState } from 'react';

// Placeholder testimonials — no real client reviews were supplied for this build.
// Replace every line below with an actual IBCOCO client quote (and their real name/
// location, with permission) before this section goes live. Do not ship invented reviews.
const DATA = [
  ['Placeholder review #1 — replace with a real IBCOCO client testimonial.', 'Client name', 'Client location'],
  ['Placeholder review #2 — replace with a real IBCOCO client testimonial.', 'Client name', 'Client location'],
  ['Placeholder review #3 — replace with a real IBCOCO client testimonial.', 'Client name', 'Client location'],
];

export default function Testimonials() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % DATA.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="spot section" id="voices">
      <div className="wrap">
        <div className="spot-mark">"</div>
        <div className="spot-quote">
          <div className="spot-stars">★★★★★</div>
          <p>“{DATA[i][0]}”</p>
          <div className="spot-who">
            <strong>{DATA[i][1]}</strong>
            <span>{DATA[i][2]}</span>
          </div>
        </div>
        <div className="spot-dots">
          {DATA.map((_, n) => (
            <button key={n} className={i === n ? 'active' : ''} onClick={() => setI(n)} />
          ))}
        </div>
      </div>
    </section>
  );
}
