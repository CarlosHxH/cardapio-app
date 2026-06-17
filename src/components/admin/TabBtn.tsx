export default function TabBtn({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string
}) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition border-b-2 whitespace-nowrap ${active ? 'bg-stone-100 text-brand-700 border-brand-400' : 'text-brand-200 hover:text-white border-transparent'}`}>
      {icon} {label}
    </button>
  )
}
