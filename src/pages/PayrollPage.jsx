
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function PayrollPage() {
  const { company } = useAuth();
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const { toast } = useToast();

  const fetchPayrollData = useCallback(async () => {
    if (!company) return;
    const { data: employeesData, error: employeesError } = await supabase.from('employees').select('*');
    if (employeesError) {
      toast({ title: 'Erro ao buscar funcionários', description: employeesError.message, variant: 'destructive' });
      return;
    }
    setEmployees(employeesData);

    const { data: payrollData, error: payrollError } = await supabase.from('payroll').select('*, employees(name, position)');
    if (payrollError) {
      toast({ title: 'Erro ao buscar folha de pagamento', description: payrollError.message, variant: 'destructive' });
    } else {
        const formattedData = payrollData.map(p => ({
            ...p,
            employeeName: p.employees?.name || 'Funcionário Desconhecido',
            position: p.employees?.position || 'Cargo Desconhecido',
        }))
      setPayrollRecords(formattedData);
    }
  }, [toast, company]);

  useEffect(() => {
    fetchPayrollData();
    const channel = supabase.channel('payroll_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll' }, payload => { fetchPayrollData(); }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchPayrollData]);

  const totalPayroll = payrollRecords.reduce((sum, record) => sum + record.net_pay, 0);

  const handleProcessPayroll = async () => {
    if (!company) return;
    const currentMonth = new Date().toLocaleString('pt-BR', { month: 'long' });
    const currentYear = new Date().getFullYear();

    const recordsToInsert = employees.map(emp => {
      const bonus = Math.floor(Math.random() * 1000);
      const deductions = Math.floor(Math.random() * 500);
      return {
        employee_id: emp.id,
        company_id: company.id,
        month: currentMonth,
        year: currentYear,
        base_salary: emp.salary,
        bonus,
        deductions,
        net_pay: emp.salary + bonus - deductions
      }
    });

    const { error } = await supabase.from('payroll').upsert(recordsToInsert, { onConflict: 'employee_id,month,year' });

    if (error) {
      toast({ title: 'Erro ao processar folha', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: "Folha de Pagamento Processada",
        description: `Folha processada com sucesso para ${employees.length} funcionários.`,
      });
      fetchPayrollData();
    }
  };

  const handleExport = () => { toast({ title: "🚧 Funcionalidade não implementada", description: "Você pode solicitar no próximo prompt!" }); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestão da Folha de Pagamento</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Processe e gerencie a remuneração</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="dark:border-gray-600"><Download className="mr-2 h-4 w-4" />Exportar Relatório</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleProcessPayroll}><DollarSign className="mr-2 h-4 w-4" />Processar Folha</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2"><span className="text-blue-100">Total da Folha</span><DollarSign className="h-8 w-8 text-blue-100" /></div>
          <p className="text-3xl font-bold">R$ {totalPayroll.toLocaleString('pt-BR')}</p><p className="text-sm text-blue-100 mt-2">Este mês</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2"><span className="text-green-100">Funcionários Pagos</span><Calendar className="h-8 w-8 text-green-100" /></div>
          <p className="text-3xl font-bold">{payrollRecords.length}</p><p className="text-sm text-green-100 mt-2">Este mês</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2"><span className="text-purple-100">Salário Médio</span><DollarSign className="h-8 w-8 text-purple-100" /></div>
          <p className="text-3xl font-bold">R$ {payrollRecords.length > 0 ? Math.round(totalPayroll / payrollRecords.length).toLocaleString('pt-BR') : 0}</p>
          <p className="text-sm text-purple-100 mt-2">Por funcionário</p>
        </motion.div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Funcionário</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cargo</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Salário Base</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Bônus</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Deduções</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Pag. Líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {payrollRecords.map((record, index) => (
                <motion.tr key={record.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.employeeName}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{record.position}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">R$ {record.base_salary.toLocaleString('pt-BR')}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">+R$ {record.bonus.toLocaleString('pt-BR')}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">-R$ {record.deductions.toLocaleString('pt-BR')}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">R$ {record.net_pay.toLocaleString('pt-BR')}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {payrollRecords.length === 0 && (<div className="text-center py-12 text-gray-500 dark:text-gray-400">Nenhum registro encontrado. Processe a folha para gerar.</div>)}
        </div>
      </div>
    </div>
  );
}
