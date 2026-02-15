import { notFound } from 'next/navigation';
import { getStory, stories } from '@/lib/data';
import StoryDetail from '@/components/story/StoryDetail';

interface StoryPageProps {
  params: Promise<{ storyId: string }>;
}

export function generateStaticParams() {
  return stories.map((story) => ({ storyId: story.id }));
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { storyId } = await params;
  const story = getStory(storyId);

  if (!story) {
    notFound();
  }

  return <StoryDetail story={story} />;
}
