export default function StatCard({ label, value, color }: {
  label: string; value: number; color: 'stone' | 'amber' | 'emerald'
}) {
  const cls = {
    stone:   'bg-stone-50 text-stone-800 border-stone-200',
    amber:   'bg-amber-50 text-amber-800 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }
  return (
    <div className={`rounded-xl border p-3 text-center ${cls[color]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold mt-0.5 opacity-70">{label}</p>
    </div>
  )
}
