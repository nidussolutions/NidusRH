
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { ShieldCheck } from 'lucide-react';

export default function PlanSelectionPage() {
  const { company, refreshData } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectPlan = async (plan) => {
    if (!company) {
      toast({ title: 'Erro', description: 'Nenhuma empresa encontrada.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    const { error } = await supabase
      .from('subscriptions')
      .insert({ company_id: company.id, plan });

    if (error) {
      toast({ title: 'Erro ao selecionar plano', description: error.message, variant: 'destructive' });
      setLoading(false);
    } else {
      toast({ title: 'Plano selecionado!', description: 'Bem-vindo ao NidusRH!' });
      await refreshData();
      // The auth context will handle redirection
    }
  };

  const PricingCard = ({ plan, price, features, planKey, recommended = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 + (features.length * 0.05) }}
      className={`bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-2 ${recommended ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan}</h3>
      <p className="text-4xl font-extrabold my-4 text-gray-900 dark:text-white">
        {price} <span className="text-lg font-normal text-gray-500 dark:text-gray-400">/mês</span>
      </p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center text-gray-600 dark:text-gray-400">
            <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={() => handleSelectPlan(planKey)}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 ${recommended ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
      >
        {loading ? 'Selecionando...' : 'Selecionar Plano'}
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Bem-vindo(a) ao NidusRH!</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-2">Escolha um plano para começar a gerenciar sua equipe.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <PricingCard
          plan="Básico"
          planKey="basic"
          price="R$99"
          features={['Até 50 funcionários', 'Gestão de Funcionários', 'Controle de Ponto']}
        />
        <PricingCard
          plan="Profissional"
          planKey="professional"
          price="R$249"
          features={['Até 200 funcionários', 'Tudo do Básico', 'Recrutamento', 'Folha de Pagamento']}
          recommended
        />
        <PricingCard
          plan="Enterprise"
          planKey="enterprise"
          price="Customizado"
          features={['Funcionários ilimitados', 'Tudo do Profissional', 'Suporte Prioritário', 'Integrações API']}
        />
      </div>
    </div>
  );
}
