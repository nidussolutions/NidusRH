
import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Briefcase, DollarSign, Clock, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Funcionários', icon: Users },
  { id: 'recruitment', label: 'Recrutamento', icon: Briefcase },
  { id: 'payroll', label: 'Folha de Pag.', icon: DollarSign },
  { id: 'attendance', label: 'Controle de Ponto', icon: Clock },
];

export default function Sidebar({ currentPage, onNavigate, isAdmin }) {
  const { signOut, company } = useAuth();

  if (isAdmin) {
      return (
         <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">NidusRH</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Painel Admin</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
             <Button
              variant={"default"}
              className={`w-full justify-start bg-blue-600 text-white hover:bg-blue-700`}
            >
              <Shield className="mr-3 h-5 w-5" />
              Empresas
            </Button>
          </nav>
           <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={signOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </motion.aside>
      )
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">{company?.name || 'NidusRH'}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestão de RH</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start transition-all ${
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* The logout button in the header is now the primary one. This can be removed or kept as a secondary option. I'll remove it to avoid redundancy. */}
    </motion.aside>
  );
}
