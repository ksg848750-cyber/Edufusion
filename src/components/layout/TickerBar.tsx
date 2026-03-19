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
    <div className="nb-ticker">
      <div className="nb-ticker-inner">
        {[...items, ...items].map((item, i) => (
          <span key={i}>
            {item} //
          </span>
        ))}
      </div>
    </div>
  );
}
