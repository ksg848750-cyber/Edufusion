import Link from 'next/link';
import CinematicIntro from '@/components/layout/CinematicIntro';
import TickerBar from '@/components/layout/TickerBar';

export default function Home() {
  return (
    <main>
      <CinematicIntro />

      {/* Hero Section */}
      <section
        className="nb-page-hero min-h-screen flex flex-col items-center justify-center text-center relative nb-bg-grid"
        style={{ background: 'var(--ink)' }}
      >
        <div className="nb-scanline-overlay" />

        <h1 className="nb-display nb-glitch" style={{ color: 'var(--volt)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
          UNDERSTAND ANYTHING
          <br />
          THROUGH WHAT YOU LOVE
        </h1>

        <p
          className="nb-mono mt-4"
          style={{ fontSize: '12px', color: '#666', letterSpacing: '0.15em' }}
        >
          CRICKET. MOVIES. ANIME. GAMING. F1. — REAL SCENES. REAL LEARNING.
        </p>

        <div className="flex gap-4 mt-8">
          <Link href="/signup" className="nb-btn nb-btn-volt">
            START LEARNING →
          </Link>
          <Link href="/login" className="nb-btn nb-btn-dark">
            LOGIN
          </Link>
        </div>

        {/* Floating Example Cards */}
        <div className="flex gap-6 mt-16 flex-wrap justify-center px-4">
          {[
            {
              concept: 'DEADLOCKS',
              via: '2011 World Cup Final',
              emoji: '🏏',
              color: 'var(--volt)',
              interest: 'Cricket',
            },
            {
              concept: 'RECURSION',
              via: "Naruto's Shadow Clone Jutsu",
              emoji: '🗾',
              color: 'var(--plasma)',
              interest: 'Anime',
            },
            {
              concept: 'QUEUES',
              via: 'F1 Pit Stop Sequence',
              emoji: '🏎️',
              color: 'var(--ion)',
              interest: 'F1',
            },
          ].map((card) => (
            <div
              key={card.concept}
              className="nb-card nb-float"
              style={{
                borderTop: `4px solid ${card.color}`,
                background: 'var(--ink)',
                color: 'var(--chalk)',
                padding: '1.5rem 2rem',
                minWidth: '220px',
              }}
            >
              <span style={{ fontSize: '32px' }}>{card.emoji}</span>
              <p className="nb-display mt-2" style={{ fontSize: '22px', color: card.color }}>
                {card.concept}
              </p>
              <p className="nb-mono mt-1" style={{ fontSize: '10px', color: '#888' }}>
                explained through {card.via} {card.emoji}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Ticker */}
      <TickerBar />

      {/* Features Section */}
      <section className="py-16 px-8" style={{ borderTop: 'var(--bd)', background: 'var(--ink)' }}>
        <div className="nb-section-label" style={{ color: 'var(--volt)' }}>
          <span>FEATURES</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-8">
          {[
            {
              title: 'REAL SCENE ENGINE',
              desc: 'We use actual match moments, real movie scenes, specific anime episodes. Never generic analogies.',
              color: 'var(--volt)',
              icon: '🎯',
            },
            {
              title: 'YOUR 5 INTERESTS',
              desc: 'Choose cricket, movies, anime, gaming, F1. Switch interests mid-lesson. Learn through what excites you.',
              color: 'var(--ion)',
              icon: '🎮',
            },
            {
              title: 'THRILLER-STYLE TEXT',
              desc: 'Every explanation reads like a story you cannot put down. No textbook. No boring paragraphs.',
              color: 'var(--plasma)',
              icon: '📖',
            },
            {
              title: 'EXAM MODE',
              desc: 'When exams are near, switch to structured mode. Same scenes, but with formal definitions and key points.',
              color: 'var(--nova)',
              icon: '🎓',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="nb-card"
              style={{ borderTop: `4px solid ${feature.color}` }}
            >
              <span style={{ fontSize: '36px' }}>{feature.icon}</span>
              <h3 className="nb-display mt-3" style={{ fontSize: '20px' }}>
                {feature.title}
              </h3>
              <p className="mt-2" style={{ fontSize: '14px', color: 'var(--chalk)', opacity: 0.7 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-8" style={{ background: 'var(--ink)', borderTop: 'var(--bd)' }}>
        <div className="nb-section-label" style={{ color: 'var(--volt)' }}>
          <span>HOW IT WORKS</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-8">
          {[
            {
              step: '01',
              title: 'CHOOSE YOUR INTEREST',
              desc: 'Before every lesson, pick one of 5 interests. Cricket, Movies, Anime, Gaming, or F1.',
              color: 'var(--volt)',
            },
            {
              step: '02',
              title: 'LEARN WITH REAL SCENES',
              desc: 'Each concept explained through a real, specific moment from your chosen interest. Not generic analogies.',
              color: 'var(--ion)',
            },
            {
              step: '03',
              title: 'TEST & LEVEL UP',
              desc: 'Take interest-themed quizzes, earn XP, unlock badges, and compete on the leaderboard.',
              color: 'var(--plasma)',
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="nb-display" style={{ fontSize: '64px', color: item.color }}>
                {item.step}
              </div>
              <h3 className="nb-display mt-2" style={{ fontSize: '20px', color: 'var(--chalk)' }}>
                {item.title}
              </h3>
              <p className="mt-2" style={{ fontSize: '14px', color: 'var(--chalk)', opacity: 0.6 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/signup" className="nb-btn nb-btn-volt">
            GET STARTED FREE →
          </Link>
        </div>
      </section>
    </main>
  );
}
