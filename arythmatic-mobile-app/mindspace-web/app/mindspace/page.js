import BreathingLight from '../../components/calmplay/BreathingLight';
import FlowMaze from '../../components/calmplay/FlowMaze';
import EmotionMatch from '../../components/calmplay/EmotionMatch';
import RainGarden from '../../components/calmplay/RainGarden';
import ReadingCorner from '../../components/nourish/ReadingCorner';
import GroundMe from '../../components/reconnect/GroundMe';
import Journal from '../../components/reconnect/Journal';
import AffirmationWheel from '../../components/reconnect/AffirmationWheel';
import Soundscapes from '../../components/reconnect/Soundscapes';
import KindnessQuest from '../../components/reconnect/KindnessQuest';
import Meditations from '../../components/Meditations';
import { featuredReads } from '../../data/content';

import HeaderBar from '../../components/HeaderBar';

export default function MindSpacePage(){
  return (
    <div className="p-4 pb-20 max-w-xl mx-auto grid gap-4">
      <HeaderBar />
      <section id="calm-play" className="grid gap-3">
        <h2 className="text-lg font-semibold">🫧 Calm Play</h2>
        <BreathingLight />
        <FlowMaze />
        <EmotionMatch />
        <RainGarden />
      </section>

      <section id="nourish" className="grid gap-3">
        <h2 className="text-lg font-semibold">📖 Nourish Mind</h2>
        <ReadingCorner items={featuredReads} />
        <a href="/books" className="button w-fit">Open Book Lounge</a>
        <a href="/music" className="button w-fit">🎧 Music Space</a>
      </section>

      <section id="reconnect" className="grid gap-3">
        <h2 className="text-lg font-semibold">🌸 Reconnect Self</h2>
        <GroundMe />
        <Meditations />
        <Journal />
        <AffirmationWheel />
        <Soundscapes />
        <KindnessQuest />
      </section>
    </div>
  );
}
