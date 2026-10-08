import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const videoId = "KiqqxNh6-Jo";

export default function GlobalMusicControl() {
  const [musicOn, setMusicOn] = useState(false);
  return <>
    <button className="global-music-btn" type="button" onClick={() => setMusicOn(value => !value)} aria-label={musicOn ? "إيقاف أغنية تحيا مصر" : "تشغيل أغنية تحيا مصر"} title={musicOn ? "إيقاف أغنية تحيا مصر" : "تشغيل أغنية تحيا مصر"}>
      {musicOn ? <Volume2 size={19} /> : <VolumeX size={19} />}
    </button>
    {musicOn && <iframe className="music-frame" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`} title="أغنية تحيا مصر" allow="autoplay; encrypted-media" />}
  </>;
}
