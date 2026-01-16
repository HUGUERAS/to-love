import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "nrgo.workspace";

export default function Settings() {
  const { toast } = useToast();

  const initial = useMemo(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const [officeName, setOfficeName] = useState(initial.officeName || "");
  const [ufDefault, setUfDefault] = useState(initial.ufDefault || "GO");
  const [contactName, setContactName] = useState(initial.contactName || "");
  const [contactEmail, setContactEmail] = useState(initial.contactEmail || "");
  const [contactWhatsapp, setContactWhatsapp] = useState(initial.contactWhatsapp || "");

  const save = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ officeName, ufDefault, contactName, contactEmail, contactWhatsapp })
    );
    toast({
      title: "Configurações salvas",
      description: "As preferências do workspace foram atualizadas.",
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Configurações</h2>
            <p className="text-muted-foreground mt-1">
              Ajustes do workspace. No MVP, as configurações são locais (localStorage) e serão migradas para banco na Fase 2.
            </p>
          </div>
          <Badge variant="outline">MVP</Badge>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Workspace</CardTitle>
            <CardDescription>Informações do escritório e contato padrão.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="officeName">Nome do escritório</Label>
              <Input id="officeName" value={officeName} onChange={(e) => setOfficeName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ufDefault">UF padrão</Label>
              <Input id="ufDefault" value={ufDefault} onChange={(e) => setUfDefault(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Contato (nome)</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactWhatsapp">WhatsApp</Label>
              <Input id="contactWhatsapp" value={contactWhatsapp} onChange={(e) => setContactWhatsapp(e.target.value)} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="contactEmail">E-mail</Label>
              <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button onClick={save}>Salvar alterações</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
