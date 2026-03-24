import Link from 'next/link';
import CinematicIntro from '@/components/layout/CinematicIntro';
import TickerBar from '@/components/layout/TickerBar';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  return (
    <main>
      <CinematicIntro />
      <Navbar />

      {/* Hero Section */}
      <section
        className="min-h-screen flex flex-col items-center justify-center text-center relative nb-bg-grid overflow-hidden"
        style={{ background: 'var(--app-bg)' }}
      >
        <div className="absolute inset-0 bg-[#00FF9D]/5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        <div className="nb-scanline-overlay" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-20">
          <h1 className="nb-display leading-[0.85] tracking-tighter" style={{ color: 'var(--chalk)', fontSize: 'clamp(4rem, 12vw, 150px)', textShadow: '6px 6px 0 var(--volt)' }}>
            UNDERSTAND
            <br />
            ANYTHING
          </h1>

          <p
            className="nb-mono mt-8 uppercase tracking-widest text-white/80"
            style={{ fontSize: '16px' }}
          >
            THROUGH CRICKET, MOVIES, ANIME, GAMING & F1.
          </p>

          <div className="flex justify-center gap-6 mt-12">
            <Link href="/signup" className="nb-display font-bold text-black border-[4px] border-volt shadow-[8px_8px_0_var(--plasma)] hover:-translate-y-2 hover:translate-x-2 transition-transform px-12 py-6 text-3xl bg-volt uppercase tracking-wider">
              START LEARNING
            </Link>
          </div>
        </div>

        {/* Floating Example Cards */}
        <div className="flex gap-6 mt-20 flex-wrap justify-center px-4 relative z-10">
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
              className="nb-float relative p-8 flex flex-col items-start text-left"
              style={{
                border: `4px solid ${card.color}`,
                background: 'rgba(0,0,0,0.8)',
                boxShadow: `0 0 20px ${card.color}40`,
                minWidth: '260px',
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
      <section className="py-16 px-8 relative" style={{ borderTop: 'var(--bd)', background: 'var(--app-bg)' }}>
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <div className="relative z-10">
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
              className="p-8 border-[4px] flex flex-col transition-transform hover:-translate-y-2"
              style={{ borderColor: feature.color, background: 'var(--ink)', boxShadow: `0 0 20px ${feature.color}40` }}
            >
              <span className="text-[50px] drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{feature.icon}</span>
              <h3 className="nb-display mt-6 tracking-wider text-white" style={{ fontSize: '24px' }}>
                {feature.title}
              </h3>
              <p className="mt-4 nb-mono font-bold" style={{ fontSize: '13px', color: 'var(--chalk)', opacity: 0.8, lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-8 relative" style={{ background: 'var(--app-bg)', borderTop: 'var(--bd)' }}>
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />
        <div className="relative z-10">
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
        </div>
      </section>
    </main>
  );
}
