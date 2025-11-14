
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, DollarSign, CheckCircle } from 'lucide-react';
import StatCard from '@/components/StatCard';
import RecentActivity from '@/components/RecentActivity';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function Dashboard() {
  const { company } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeRecruitment: 0,
    monthlyPayroll: 0,
    attendance: 0
  });

  const fetchDashboardData = useCallback(async () => {
    if (!company) return;

    const { count: employeesCount, error: empError } = await supabase.from('employees').select('*', { count: 'exact', head: true });
    const { count: jobsCount, error: jobError } = await supabase.from('job_postings').select('*', { count: 'exact', head: true }).eq('status', 'active');
    
    // For payroll, we can sum it up
    const { data: payrollData, error: payrollError } = await supabase.from('payroll').select('net_pay');
    const totalPayroll = payrollData ? payrollData.reduce((sum, p) => sum + p.net_pay, 0) : 0;
    
    // For attendance
    const today = new Date().toISOString().split('T')[0];
    const { count: presentCount, error: attError } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'present');

    if (empError || jobError || payrollError || attError) {
      toast({ title: 'Erro ao carregar dados do dashboard', variant: 'destructive' });
    }

    setStats({
      totalEmployees: employeesCount || 0,
      activeRecruitment: jobsCount || 0,
      monthlyPayroll: totalPayroll,
      attendance: employeesCount > 0 ? Math.round((presentCount / employeesCount) * 100) : 0
    });
  }, [company, toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const statCards = [
    {
      title: 'Total de Funcionários',
      value: stats.totalEmployees,
      icon: Users,
      color: 'blue',
      trend: '+12%'
    },
    {
      title: 'Vagas Ativas',
      value: stats.activeRecruitment,
      icon: Briefcase,
      color: 'green',
      trend: '+5%'
    },
    {
      title: 'Folha de Pag. Mensal',
      value: `R$${stats.monthlyPayroll.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: 'purple',
      trend: '+8%'
    },
    {
      title: 'Taxa de Presença',
      value: `${stats.attendance}%`,
      icon: CheckCircle,
      color: 'orange',
      trend: '+3%'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Visão geral das suas métricas de RH</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <button className="w-full text-left p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <p className="font-semibold text-blue-900 dark:text-blue-300">Adicionar Funcionário</p>
              <p className="text-sm text-blue-700 dark:text-blue-400">Cadastre um novo membro na equipe</p>
            </button>
            <button className="w-full text-left p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <p className="font-semibold text-green-900 dark:text-green-300">Publicar Vaga</p>
              <p className="text-sm text-green-700 dark:text-green-400">Crie uma nova oportunidade de emprego</p>
            </button>
            <button className="w-full text-left p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <p className="font-semibold text-purple-900 dark:text-purple-300">Processar Folha</p>
              <p className="text-sm text-purple-700 dark:text-purple-400">Execute a folha de pagamento mensal</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
