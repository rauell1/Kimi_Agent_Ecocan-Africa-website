export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* Equalizer bars animation */}
      <div className="flex items-end gap-1.5 h-12 mb-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 rounded-full ${
              i % 2 === 0 ? "bg-purple-500" : "bg-cyan-400"
            } eq-bar-${i + 1}`}
          />
        ))}
      </div>
      <p className="text-foreground/50 text-sm font-medium tracking-widest uppercase">
        Loading...
      </p>
    </div>
  );
}
