
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Briefcase, DollarSign, Clock } from 'lucide-react';

const activities = [
  {
    icon: UserPlus,
    title: 'New Employee Added',
    description: 'John Smith joined as Senior Developer',
    time: '2 hours ago',
    color: 'blue'
  },
  {
    icon: Briefcase,
    title: 'Job Posted',
    description: 'Marketing Manager position opened',
    time: '5 hours ago',
    color: 'green'
  },
  {
    icon: DollarSign,
    title: 'Payroll Processed',
    description: 'Monthly payroll completed successfully',
    time: '1 day ago',
    color: 'purple'
  },
  {
    icon: Clock,
    title: 'Attendance Marked',
    description: '45 employees checked in today',
    time: '2 days ago',
    color: 'orange'
  }
];

export default function RecentActivity() {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className={`p-2 rounded-lg ${colorClasses[activity.color]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">{activity.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
