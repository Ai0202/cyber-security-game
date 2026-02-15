import { stories, components, phases } from '@/lib/data';
import StoryCard from '@/components/story/StoryCard';
import NeonBadge from '@/components/ui/NeonBadge';
import Link from 'next/link';

export default function Home() {
  const componentsByPhase = phases.map((phase) => ({
    phase,
    components: components.filter((c) => c.phaseId === phase.id),
  }));

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="font-mono text-4xl font-bold tracking-wider text-cyber-green">
          CyberGuardians
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          攻撃者の目線で学ぶ、サイバーセキュリティ体験学習
        </p>
      </div>

      {/* Story Selection */}
      <section className="mb-12">
        <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-cyan">
          ATTACK SIDE
        </h2>
        <h3 className="mb-6 text-lg font-bold text-white">
          ストーリーを選んでプレイ
        </h3>
        <div className="space-y-4">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {/* Practice Mode */}
      <section>
        <h2 className="mb-1 font-mono text-xs tracking-widest text-cyber-magenta">
          PRACTICE MODE
        </h2>
        <h3 className="mb-6 text-lg font-bold text-white">
          コンポーネント単体で練習
        </h3>
        <div className="space-y-6">
          {componentsByPhase.map(({ phase, components: phaseComponents }) => (
            <div key={phase.id}>
              <div className="mb-3 flex items-center gap-2">
                <span className="font-mono text-xs text-gray-500">
                  {phase.displayName}
                </span>
                <span className="text-xs text-gray-600">/ {phase.name}</span>
              </div>
              <div className="space-y-2">
                {phaseComponents.map((comp) => (
                  <Link
                    key={comp.id}
                    href={`/component/${comp.id}`}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-cyber-card/50 p-4 transition-colors hover:border-cyber-magenta/30"
                  >
                    <div>
                      <p className="font-mono text-sm text-white">
                        {comp.displayName}
                      </p>
                      <p className="text-xs text-gray-500">{comp.name}</p>
                    </div>
                    <NeonBadge
                      color={
                        comp.difficulty === 'easy'
                          ? 'green'
                          : comp.difficulty === 'normal'
                            ? 'yellow'
                            : 'red'
                      }
                    >
                      {comp.difficulty.toUpperCase()}
                    </NeonBadge>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
