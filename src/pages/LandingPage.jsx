
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
  ShieldCheck, BarChart, Users, DollarSign, Zap, 
  CheckCircle, ChevronDown, Award, Star, TrendingUp, Target, LifeBuoy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';


// Smooth scroll utility
const smoothScrollTo = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

const StickyHeader = ({ onLogin, onRegister }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Funcionalidades', id: 'features' },
    { name: 'Preços', id: 'pricing' },
    { name: 'Depoimentos', id: 'testimonials' },
    { name: 'FAQ', id: 'faq' },
  ];

  return (
    <header className={`fixed w-full top-0 left-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">NidusRH</h1>
        <nav className="hidden md:flex space-x-6">
          {navLinks.map(link => (
            <button key={link.id} onClick={() => smoothScrollTo(link.id)} className="font-semibold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {link.name}
            </button>
          ))}
        </nav>
        <div className="space-x-2 flex items-center">
          <Button variant="ghost" onClick={onLogin} className="hidden sm:inline-flex">Entrar</Button>
          <Button onClick={onRegister} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            Começar Agora
          </Button>
        </div>
      </div>
    </header>
  );
};


const FeatureCard = ({ icon, title, children, delay }) => {
  const Icon = icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{children}</p>
    </motion.div>
  );
};

const PricingTable = ({ onRegister }) => {
  const { toast } = useToast();
  const plans = {
    basic: { name: "Básico", price: "R$99", features: { "employees": "Até 50 funcionários", "management": true, "attendance": true, "recruitment": false, "payroll": false, "support": "Suporte Padrão" }},
    professional: { name: "Profissional", price: "R$249", features: { "employees": "Até 200 funcionários", "management": true, "attendance": true, "recruitment": true, "payroll": true, "support": "Suporte Prioritário" }},
    enterprise: { name: "Enterprise", price: "Customizado", features: { "employees": "Funcionários Ilimitados", "management": true, "attendance": true, "recruitment": true, "payroll": true, "support": "Suporte Dedicado 24/7" }},
  };

  const featureLabels = {
    "employees": "Limite de funcionários",
    "management": "Gestão de Funcionários",
    "attendance": "Controle de Ponto",
    "recruitment": "Módulo de Recrutamento",
    "payroll": "Folha de Pagamento Automatizada",
    "support": "Tipo de Suporte"
  };

  const handleCustomPlan = () => {
    toast({
      title: 'Plano Enterprise',
      description: 'Entre em contato com nossa equipe de vendas para um orçamento personalizado!',
    });
  }

  return (
     <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl overflow-x-auto"
      >
      <table className="w-full text-center">
        <thead className="border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="p-6 text-left text-lg font-semibold text-gray-900 dark:text-white">Funcionalidades</th>
            {Object.values(plans).map(plan => (
              <th key={plan.name} className="p-6 text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.keys(featureLabels).map(featureKey => (
            <tr key={featureKey} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <td className="p-4 text-left font-medium text-gray-700 dark:text-gray-300">{featureLabels[featureKey]}</td>
              {Object.values(plans).map(plan => (
                <td key={`${plan.name}-${featureKey}`} className="p-4 text-gray-600 dark:text-gray-400">
                  {typeof plan.features[featureKey] === 'boolean' ? (
                    plan.features[featureKey] ? <CheckCircle className="mx-auto h-6 w-6 text-green-500" /> : <span className="text-gray-400">-</span>
                  ) : (
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{plan.features[featureKey]}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr className="bg-gray-50 dark:bg-gray-800">
            <td className="p-6 text-left"></td>
            {Object.entries(plans).map(([key, plan]) => (
              <td key={`${key}-cta`} className="p-6">
                <p className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{plan.price}</p>
                <Button onClick={key === 'enterprise' ? handleCustomPlan : onRegister} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  {key === 'enterprise' ? 'Contatar Vendas' : 'Começar'}
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </motion.div>
  );
};


const TestimonialCard = ({ quote, author, position, delay, image }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg text-center"
  >
    <div className="flex justify-center mb-4">
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => <Star key={i} fill="currentColor" />)}
      </div>
    </div>
    <p className="text-gray-600 dark:text-gray-400 italic mb-4">"{quote}"</p>
    <div className="flex items-center justify-center">
      <img class="h-12 w-12 rounded-full mr-4 object-cover" alt={author} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
      <div>
        <h4 className="font-bold text-gray-900 dark:text-white">{author}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{position}</p>
      </div>
    </div>
  </motion.div>
);

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div 
        layout
        className="border-b border-gray-200 dark:border-gray-700 py-4"
        onClick={() => setIsOpen(!isOpen)}
    >
      <motion.div layout className="flex justify-between items-center cursor-pointer">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{question}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </motion.div>
      </motion.div>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? '1rem' : '0rem' }}
        className="overflow-hidden"
      >
        <p className="text-gray-600 dark:text-gray-400">{answer}</p>
      </motion.div>
    </motion.div>
  );
};

export default function LandingPage({ onLogin, onRegister }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 origin-left z-50" style={{ scaleX }} />
      <StickyHeader onLogin={onLogin} onRegister={onRegister} />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 text-center container mx-auto px-6 overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900/30 -z-10 rounded-full blur-3xl opacity-50"></div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-white"
          >
            A plataforma de RH que <span className="text-blue-600">transforma</span> sua empresa
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8"
          >
            Simplifique a gestão de pessoas, do recrutamento à folha de pagamento, e foque no crescimento do seu negócio.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Button onClick={onRegister} size="lg" className="bg-blue-600 text-white font-bold px-8 py-4 rounded-lg text-lg hover:bg-blue-700 transition-transform hover:scale-105">
              Comece seu teste grátis por 14 dias
            </Button>
            <p className="text-xs text-gray-500 mt-2">Não é necessário cartão de crédito.</p>
          </motion.div>
        </section>

        {/* Trust Badges Section */}
        <section className="py-12">
            <div className="container mx-auto px-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">Confiado por mais de 1,000 empresas</p>
                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
                        <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 grayscale hover:grayscale-0 transition-all">TechCorp</span>
                        <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 grayscale hover:grayscale-0 transition-all">InovaSoluções</span>
                        <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 grayscale hover:grayscale-0 transition-all">MercadoGlobal</span>
                        <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 grayscale hover:grayscale-0 transition-all">AgroForte</span>
                        <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 grayscale hover:grayscale-0 transition-all">SaúdeVital</span>
                    </div>
                </motion.div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-100 dark:bg-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-blue-600 font-semibold">Tudo em um só lugar</span>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">Funcionalidades para escalar seu RH</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">NidusRH oferece todas as ferramentas que você precisa para gerenciar seus talentos de forma eficiente.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard icon={Users} title="Gestão de Colaboradores" delay={0.1}>
                Centralize informações, documentos, e histórico de todos os seus colaboradores.
              </FeatureCard>
              <FeatureCard icon={Target} title="Recrutamento Inteligente" delay={0.2}>
                Atraia, gerencie e contrate os melhores talentos com um funil de recrutamento visual.
              </FeatureCard>
              <FeatureCard icon={DollarSign} title="Folha de Pagamento Ágil" delay={0.3}>
                Automatize cálculos de salários, impostos e benefícios, com precisão e sem estresse.
              </FeatureCard>
              <FeatureCard icon={TrendingUp} title="Avaliação de Desempenho" delay={0.4}>
                Defina metas, dê feedbacks e acompanhe o desenvolvimento profissional da sua equipe.
              </FeatureCard>
              <FeatureCard icon={BarChart} title="Relatórios e Analytics" delay={0.5}>
                Tome decisões baseadas em dados com relatórios completos sobre turnover, absenteísmo e mais.
              </FeatureCard>
              <FeatureCard icon={LifeBuoy} title="Portal do Colaborador" delay={0.6}>
                Dê autonomia para sua equipe com um portal para solicitar férias, ver holerites e atualizar dados.
              </FeatureCard>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-blue-600 font-semibold">Preços Transparentes</span>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">Escolha o plano certo para sua empresa</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-4 max-w-2xl mx-auto">Planos flexíveis que crescem com você. Comece de graça.</p>
            </div>
            <PricingTable onRegister={onRegister} />
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gray-100 dark:bg-gray-800/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-blue-600 font-semibold">O que nossos clientes dizem</span>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">Aprovação máxima de quem usa NidusRH</h2>
            </div>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              <TestimonialCard
                quote="A NidusRH revolucionou nosso departamento de RH. O que antes levava dias, agora fazemos em horas."
                author="Ana Silva"
                position="Diretora de RH, TechCorp"
                delay={0.1}
                image="Portrait of a smiling businesswoman"
              />
              <TestimonialCard
                quote="A implementação foi incrivelmente fácil e o suporte é fantástico. Finalmente temos dados centralizados e confiáveis."
                author="Carlos Souza"
                position="CEO, InovaSoluções"
                delay={0.2}
                image="Portrait of a confident CEO"
              />
              <TestimonialCard
                quote="Para uma startup em crescimento como a nossa, a NidusRH é a ferramenta perfeita. Escalável, intuitiva e com preço justo."
                author="Juliana Costa"
                position="Fundadora, MercadoGlobal"
                delay={0.3}
                image="Portrait of a happy startup founder"
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">Perguntas Frequentes</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">Tudo o que você precisa saber antes de começar.</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 shadow-xl">
              <FaqItem
                question="O que é a NidusRH?"
                answer="NidusRH é uma plataforma de gestão de Recursos Humanos completa, projetada para simplificar e automatizar processos de RH, desde o recrutamento até a folha de pagamento, permitindo que você foque no que realmente importa: seus colaboradores."
              />
              <FaqItem
                question="Meus dados estão seguros na plataforma?"
                answer="Sim. A segurança é nossa prioridade máxima. Utilizamos criptografia de ponta e infraestrutura robusta na nuvem. Além disso, nossa arquitetura multi-tenant garante que os dados da sua empresa sejam completamente isolados e acessíveis apenas por usuários autorizados da sua organização."
              />
              <FaqItem
                question="Posso cancelar meu plano a qualquer momento?"
                answer="Sim, você pode cancelar ou alterar seu plano a qualquer momento, sem burocracia. Nosso objetivo é oferecer flexibilidade para que a NidusRH se adapte às necessidades da sua empresa."
              />
              <FaqItem
                question="Como funciona o período de teste grátis?"
                answer="Oferecemos um teste grátis de 14 dias com acesso a todas as funcionalidades do plano Profissional. Não é necessário inserir um cartão de crédito. Ao final do período, você pode escolher o plano que melhor se adapta a você ou simplesmente deixar a conta expirar."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-800/50 py-10 text-center">
        <div className="container mx-auto px-6">
          <p className="text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} NidusRH. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
