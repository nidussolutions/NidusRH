
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchUserAndCompanyData = useCallback(async (currentUser) => {
    if (!currentUser) {
      setCompany([]);
      setSubscription([]);
      setIsAdmin(false);
      return;
    }

    console.log("Fetching data for user:", currentUser.id);

    const { data: companyUserData, error: companyUserError } = await supabase
      .from('company_users')
      .select('company_id')
      .eq('user_id', currentUser.id);

    if (companyUserError) {
      console.error("Error fetching company_user mapping:", companyUserError.message);
      setCompany([]);
      setSubscription([]);
      return;
    }

    if (!companyUserData || companyUserData.length === 0) {
      setCompany([]);
      setSubscription([]);
      return;
    }

    const companyIds = companyUserData.map(item => item.company_id);

    const { data: companies, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .in('id', companyIds);

    if (companyError) {
      console.error("Error fetching companies:", companyError.message);
      setCompany([]);
    } else {
      setCompany(companies);
    }

    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .in('company_id', companyIds);

    if (subscriptionError) {
      console.error("Error fetching subscriptions:", subscriptionError.message);
      setSubscription([]);
    } else {
      setSubscription(subscriptions);
    }

}, []);


  useEffect(() => {
    setLoading(true);
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      await fetchUserAndCompanyData(session?.user);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        await fetchUserAndCompanyData(session?.user);
        if(event !== 'INITIAL_SESSION') setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchUserAndCompanyData]);

  const signUp = useCallback(async (email, password, companyName) => {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: 'Owner'
        }
      }
    });

    if (signUpError) {
      toast({ variant: "destructive", title: "Falha no Cadastro", description: signUpError.message });
      return { user: null, error: signUpError };
    }
    
    if (!user) {
        toast({ variant: "destructive", title: "Falha no Cadastro", description: "Não foi possível criar o usuário." });
        return { user: null, error: { message: "User creation failed" } };
    }

    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({ name: companyName, owner_id: user.id })
      .select()
      .single();

    if (companyError) {
        toast({ variant: "destructive", title: "Falha ao criar empresa", description: companyError.message });
        return { user, error: companyError };
    }

    const { error: mappingError } = await supabase
        .from('company_users')
        .insert({ user_id: user.id, company_id: newCompany.id });
    
    if (mappingError) {
        toast({ variant: "destructive", title: "Falha ao associar usuário", description: mappingError.message });
        return { user, error: mappingError };
    }
    
    setCompany(newCompany);
    return { user, error: null };
  }, [toast]);

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({ variant: "destructive", title: "Falha no Login", description: error.message });
    }
    return { error };
  }, [toast]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ variant: "destructive", title: "Falha no Logout", description: error.message });
    } else {
      setCompany(null);
      setSubscription(null);
      setIsAdmin(false);
    }
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    company,
    subscription,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    refreshData: () => fetchUserAndCompanyData(user)
  }), [user, session, company, subscription, loading, isAdmin, signUp, signIn, signOut, fetchUserAndCompanyData]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
