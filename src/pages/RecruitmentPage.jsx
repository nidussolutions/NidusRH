
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, MapPin, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export default function RecruitmentPage() {
  const { company } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '',
    department: '',
    location: '',
    salary: '',
    description: ''
  });
  const { toast } = useToast();

  const fetchJobs = useCallback(async () => {
    if (!company) return;
    const { data, error } = await supabase.from('job_postings').select('*').order('posted_date', { ascending: false });
    if (error) {
      toast({ title: 'Erro ao buscar vagas', description: error.message, variant: 'destructive' });
    } else {
      setJobs(data);
    }
  }, [toast, company]);

  useEffect(() => {
    fetchJobs();
    const channel = supabase.channel('job_postings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_postings' }, payload => {
        fetchJobs();
      }).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJobs]);

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!company) return;
    const { error } = await supabase.from('job_postings').insert([{ ...jobFormData, company_id: company.id, status: 'ativa', posted_date: new Date().toISOString() }]);

    if (error) {
      toast({ title: 'Erro ao publicar vaga', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: "Vaga Publicada",
        description: `A vaga de ${jobFormData.title} foi publicada com sucesso.`,
      });
      setIsJobDialogOpen(false);
      setJobFormData({ title: '', department: '', location: '', salary: '', description: '' });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recrutamento</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie vagas e candidatos</p>
        </div>
        <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Publicar Nova Vaga
            </Button>
          </DialogTrigger>
          <DialogContent className="dark:bg-gray-800">
            <DialogHeader>
              <DialogTitle>Publicar Nova Vaga</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleJobSubmit} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="title">Título da Vaga</Label><Input id="title" value={jobFormData.title} onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })} required className="dark:bg-gray-700"/></div>
              <div className="space-y-2"><Label htmlFor="department">Departamento</Label><Input id="department" value={jobFormData.department} onChange={(e) => setJobFormData({ ...jobFormData, department: e.target.value })} required className="dark:bg-gray-700"/></div>
              <div className="space-y-2"><Label htmlFor="location">Localização</Label><Input id="location" value={jobFormData.location} onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })} required className="dark:bg-gray-700"/></div>
              <div className="space-y-2"><Label htmlFor="salary">Faixa Salarial</Label><Input id="salary" value={jobFormData.salary} onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })} placeholder="ex: R$4.000 - R$6.000" required className="dark:bg-gray-700"/></div>
              <div className="space-y-2"><Label htmlFor="description">Descrição</Label><Input id="description" value={jobFormData.description} onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })} required className="dark:bg-gray-700"/></div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Publicar Vaga</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList className="dark:bg-gray-800"><TabsTrigger value="jobs">Vagas Publicadas</TabsTrigger><TabsTrigger value="candidates">Candidatos</TabsTrigger></TabsList>
        <TabsContent value="jobs" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg"><Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" /></div>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-semibold rounded-full">{job.status}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{job.department}</p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center"><MapPin className="h-4 w-4 mr-2" />{job.location}</div>
                  <div className="flex items-center"><DollarSign className="h-4 w-4 mr-2" />{job.salary}</div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.applicants || 0} candidatos</p>
                </div>
              </motion.div>
            ))}
          </div>
          {jobs.length === 0 && (<div className="text-center py-12 text-gray-500 dark:text-gray-400">Nenhuma vaga publicada. Crie uma para começar a recrutar.</div>)}
        </TabsContent>
        <TabsContent value="candidates">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <p className="text-center text-gray-500 dark:text-gray-400">🚧 Esta funcionalidade ainda não foi implementada. Você pode solicitá-la no próximo prompt! 🚀</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
