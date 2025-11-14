import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

export function DialogFormEmployee({
    mode = "create",     // "create" | "edit"
    employee = null,     // dados do funcionário ao editar
    company,
    triggerButton = null, // permite customizar o botão disparador
    onSuccess = () => { }, // callback após criar/editar
}) {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        position: '',
        department: '',
        salary: ''
    });

    // Preenche dados ao editar
    useEffect(() => {
        if (mode === "edit" && employee) {
            setFormData({
                name: employee.name || "",
                email: employee.email || "",
                position: employee.position || "",
                department: employee.department || "",
                salary: employee.salary || ""
            });
        }
    }, [mode, employee]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!company) return;

        let response;

        console.log(company.id);

        if (mode === "create") {
            response = await supabase.from('employees').insert([
                {
                    ...formData,
                    company_id: company.id,
                    join_date: new Date().toISOString().split('T')[0]
                }
            ]);
        } else {
            response = await supabase
                .from('employees')
                .update(formData)
                .eq('id', employee.id);
        }

        const { error } = response;

        if (error) {
            toast({ title: 'Erro', description: error.message, variant: 'destructive' });
            return;
        }

        toast({
            title: mode === "create" ? "Funcionário Adicionado" : "Funcionário Atualizado",
            description:
                mode === "create"
                    ? `${formData.name} foi adicionado(a) com sucesso.`
                    : `${formData.name} foi atualizado(a) com sucesso.`,
        });

        setIsDialogOpen(false);
        onSuccess();
    };

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

            <DialogTrigger asChild>
                {triggerButton || (
                    <Button className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Funcionário
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Adicionar Novo Funcionário" : "Editar Funcionário"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="dark:bg-gray-700" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="dark:bg-gray-700" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="position">Cargo</Label>
                        <Input id="position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} required className="dark:bg-gray-700" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="department">Departamento</Label>
                        <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} required className="dark:bg-gray-700" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="salary">Salário</Label>
                        <Input id="salary" type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} required className="dark:bg-gray-700" />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                        {mode === "create" ? "Adicionar Funcionário" : "Salvar Alterações"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
