'use client';

export default function TickerBar() {
  const items = [
    'REAL SCENES',
    'REAL LEARNING',
    '1000+ CONCEPTS',
    'CRICKET × CODE',
    'ANIME × ALGORITHMS',
    'MOVIES × MATH',
    'GAMING × GRAPHS',
    'F1 × FUNCTIONS',
    'SCENES THAT TEACH',
    'STORIES THAT STICK',
  ];

  return (
    <div className="nb-ticker" style={{ background: 'var(--theme-accent)', color: 'var(--theme-bg)' }}>
      <div className="nb-ticker-inner">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="nb-display" style={{ fontSize: '14px', fontWeight: 'bold' }}>
            {item} <span className="opacity-30">⚡</span>
          </span>
        ))}
      </div>
    </div>
  );
}
