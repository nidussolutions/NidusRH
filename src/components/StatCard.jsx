
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, color, trend, index }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow-lg p-6 text-white`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/80 text-sm font-medium">{title}</span>
        <Icon className="h-8 w-8 text-white/80" />
      </div>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <div className="flex items-center text-sm text-white/80">
        <TrendingUp className="h-4 w-4 mr-1" />
        <span>{trend} from last month</span>
      </div>
    </motion.div>
  );
}
