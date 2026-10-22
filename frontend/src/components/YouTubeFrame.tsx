export function YouTubeFrame({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-line bg-ink">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
