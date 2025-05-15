import { type LucideIcon } from 'lucide-react'

interface ActionButtonProps {
  icon: LucideIcon
  children: React.ReactNode
}

export function ActionButton({ icon: Icon, children }: ActionButtonProps) {
  return (
    <button className="w-full bg-[#0357f8] text-white rounded-xl p-4 flex items-center justify-between hover:bg-[#0357f8]/90 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-lg font-medium">{children}</span>
      </div>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 12H19M19 12L12 5M19 12L12 19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

