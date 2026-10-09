import { useState } from "react";
import { ExternalLink, Volume2, VolumeX } from "lucide-react";

const videoId = "KiqqxNh6-Jo";
const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

export default function GlobalMusicControl() {
  const [musicOn, setMusicOn] = useState(false);

  return (
    <>
      <button
        className="global-music-btn"
        type="button"
        onClick={() => setMusicOn(value => !value)}
        aria-label={musicOn ? "إيقاف أغنية تحيا مصر" : "تشغيل أغنية تحيا مصر"}
        title={musicOn ? "إيقاف أغنية تحيا مصر" : "تشغيل أغنية تحيا مصر"}
      >
        {musicOn ? <Volume2 size={19} /> : <VolumeX size={19} />}
      </button>
      {musicOn && (
        <div className="music-player-shell" role="region" aria-label="مشغل أغنية تحيا مصر">
          <iframe
            className="music-frame"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
            title="أغنية تحيا مصر — أحمد جمال"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <a className="music-open-link" href={youtubeUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={14} />
            فتح الأغنية على YouTube
          </a>
        </div>
      )}
    </>
  );
}
