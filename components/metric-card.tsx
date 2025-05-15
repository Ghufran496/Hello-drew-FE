import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface MetricCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  children: React.ReactNode
  growth?: string
}

export function MetricCard({ icon: Icon, title, value, children, growth }: MetricCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border-borderColor border-[1px] p-4 pb-6 shadow-sm h-[180px] flex flex-col"
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex-grow flex flex-col justify-between"
      >
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="flex items-center gap-2 mb-2"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center"
          >
            <Icon className="w-4 h-4 text-white" />
          </motion.div>
          <span className="text-gray-600 text-sm">{title}</span>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex items-baseline gap-2 mb-2"
        >
          <span className="text-2xl font-semibold">{value}</span>
          {growth && (
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="text-green-500 text-sm"
            >
              +{growth}
            </motion.span>
          )}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="mt-auto"
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
