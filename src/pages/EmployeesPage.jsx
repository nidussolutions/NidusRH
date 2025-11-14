
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { DialogFormEmployee } from '@/components/employees/DialogFormEmployee';

export default function EmployeesPage() {
  const { company } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    salary: ''
  });
  const { toast } = useToast();

  const fetchEmployees = useCallback(async () => {
    if (!company) return;
    const { data, error } = await supabase.from('employees').select('*').order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Erro ao buscar funcionários', description: error.message, variant: 'destructive' });
    } else {
      setEmployees(data);
    }
  }, [toast, company]);

  useEffect(() => {
    fetchEmployees();

    const channel = supabase.channel('employees_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, payload => {
        fetchEmployees();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEmployees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company) return;
    const { error } = await supabase
      .from('employees')
      .insert([{
        ...formData,
        company_id: company.id,
        join_date: new Date().toISOString().split('T')[0]
      }]);

    if (error) {
      toast({ title: 'Erro ao adicionar funcionário', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: "Funcionário Adicionado",
        description: `${formData.name} foi adicionado(a) com sucesso.`,
      });
      setIsDialogOpen(false);
      setFormData({ name: '', email: '', position: '', department: '', salary: '' });
    }
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erro ao remover funcionário', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: "Funcionário Removido",
        description: "O funcionário foi removido do sistema.",
      });
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.position && emp.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Funcionários</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie sua força de trabalho</p>
        </div>
        <DialogFormEmployee
          mode="create"
          company={company}
          onSuccess={() => fetchEmployees()}
          triggerButton={
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Adicionar Funcionário
            </Button>
          }
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="Buscar funcionários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 dark:bg-gray-800"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Departamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Salário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmployees.map((employee, index) => (
                <motion.tr
                  key={employee.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{employee.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{employee.position}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">R$ {parseInt(employee.salary || 0).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <DialogFormEmployee
                      mode="edit"
                      employee={employee}
                      company={company}
                      onSuccess={() => fetchEmployees()}
                      triggerButton={
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <Edit className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredEmployees.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Nenhum funcionário encontrado. Adicione para começar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
