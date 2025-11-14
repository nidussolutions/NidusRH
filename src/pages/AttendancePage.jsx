
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function AttendancePage() {
  const { company } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];

  const fetchAttendanceData = useCallback(async () => {
    if (!company) return;
    const { data: employeesData, error: employeesError } = await supabase.from('employees').select('id, name');
    if (employeesError) {
      toast({ title: 'Erro ao buscar funcionários', description: employeesError.message, variant: 'destructive' });
      return;
    }
    setEmployees(employeesData);

    const { data: attendanceData, error: attendanceError } = await supabase.from('attendance').select('*, employees(name)').eq('date', today);
    if (attendanceError) {
      toast({ title: 'Erro ao buscar presenças', description: attendanceError.message, variant: 'destructive' });
    } else {
      const formattedData = attendanceData.map(a => ({...a, employeeName: a.employees?.name || 'Funcionário Desconhecido'}))
      setAttendanceRecords(formattedData);
    }
  }, [toast, today, company]);

  useEffect(() => {
    fetchAttendanceData();
    const channel = supabase.channel('attendance_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => { fetchAttendanceData(); }).subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchAttendanceData]);

  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const attendanceRate = employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 0;

  const handleMarkAttendance = async () => {
    if (!company) return;
    const recordsToInsert = employees.map(emp => {
      const isPresent = Math.random() > 0.2;
      return {
        employee_id: emp.id,
        company_id: company.id,
        date: today,
        status: isPresent ? 'present' : 'absent',
        check_in: isPresent ? '09:00' : null,
        check_out: isPresent ? '17:00' : null,
      }
    });

    const { error } = await supabase.from('attendance').upsert(recordsToInsert, { onConflict: 'employee_id, date' });
    if (error) {
      toast({ title: 'Erro ao marcar presença', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: "Presença Marcada", description: "A presença de hoje foi registrada." });
      fetchAttendanceData();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Controle de Ponto</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitore a presença dos funcionários hoje ({new Date(today).toLocaleDateString('pt-BR')})</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleMarkAttendance}><Clock className="mr-2 h-4 w-4" />Marcar Presença do Dia</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2"><span className="text-green-100">Presentes Hoje</span><CheckCircle className="h-8 w-8 text-green-100" /></div>
          <p className="text-3xl font-bold">{presentCount}</p><p className="text-sm text-green-100 mt-2">de {employees.length} funcionários</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2"><span className="text-red-100">Ausentes Hoje</span><XCircle className="h-8 w-8 text-red-100" /></div>
          <p className="text-3xl font-bold">{absentCount}</p><p className="text-sm text-red-100 mt-2">de {employees.length} funcionários</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2"><span className="text-blue-100">Taxa de Presença</span><Calendar className="h-8 w-8 text-blue-100" /></div>
          <p className="text-3xl font-bold">{attendanceRate}%</p><p className="text-sm text-blue-100 mt-2">Taxa geral de hoje</p>
        </motion.div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Funcionário</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Entrada</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Saída</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {attendanceRecords.map((record, index) => (
                <motion.tr key={record.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{record.employeeName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                      {record.status === 'present' ? 'Presente' : 'Ausente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{record.check_in || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{record.check_out || '-'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {attendanceRecords.length === 0 && (<div className="text-center py-12 text-gray-500 dark:text-gray-400">Nenhum registro de presença para hoje.</div>)}
        </div>
      </div>
    </div>
  );
}
