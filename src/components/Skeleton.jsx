export default function Skeleton({ count = 8 }) {
  return (
    <div className="flex gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[150px]">
          <div className="w-full aspect-[2/3] bg-surface border border-border rounded-sm animate-pulse" />
          <div className="h-3 bg-surface rounded mt-2 w-4/5 animate-pulse" />
          <div className="h-2.5 bg-surface rounded mt-1.5 w-1/3 animate-pulse" />
        </div>
      ))}
    </div>
  )
}
