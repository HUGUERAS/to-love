import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, ArrowLeft } from "lucide-react";
import { useSession, useProfile } from '@/hooks/useSessionProfile';
import { useCreateWorkspace } from '@/hooks/useCreateWorkspace';
import { clearWorkspaceDraft, getWorkspaceDraft, saveWorkspaceDraft, WorkspaceDraft } from "@/lib/workspace-draft";

type FormErrors = Record<string, string>;

const DEFAULT_DRAFT: WorkspaceDraft = {
  workspaceName: "",
  responsibleName: "",
  ufDefault: "GO",
  linkExpiration: 7,
  whatsappTemplate: "Olá! Segue o link do portal do Núcleo Regulariza GO. O acesso expira em {dias} dias.",
  contactEmail: "",
  contactWhatsapp: "",
  shouldAutoCreate: true,
};

type Profile = {
  workspace_id?: string;
  // add other properties as needed
};

export default function WorkspaceOnboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const initialDraft = useMemo<WorkspaceDraft>(() => {
    const stored = getWorkspaceDraft();
    return {
      ...DEFAULT_DRAFT,
      ...stored,
    };
  }, []);

  const [form, setForm] = useState<WorkspaceDraft>(initialDraft);
  const [saving, setSaving] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  useEffect(() => {
    saveWorkspaceDraft(form);
  }, [form]);

  type Session = {
    user?: {
      id?: string;
      // add other user properties as needed
    };
    // add other session properties as needed
  };

  const { data: session, isLoading: loadingSession } = useSession() as { data: Session | null, isLoading: boolean };
  const { data: profile, isLoading: loadingProfile } = useProfile(session?.user?.id) as { data: Profile | null, isLoading: boolean };
  useEffect(() => {
    if (loadingSession || loadingProfile) return;
    if (!session) {
      navigate("/auth?mode=login");
      return;
    }
    if (profile?.workspace_id) {
      navigate("/dashboard");
      return;
    }
    setCheckingAccess(false);
  }, [session, profile, loadingSession, loadingProfile, navigate]);

  const update = (key: keyof WorkspaceDraft, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "linkExpiration" ? Number(value) : value,
    }));
  };

  const validate = () => {
    const errors: FormErrors = {};
    if (!form.workspaceName.trim()) errors.workspaceName = "Informe o nome do escritório.";
    if (!form.responsibleName.trim()) errors.responsibleName = "Informe o responsável.";
    if (!form.contactEmail?.trim()) {
      errors.contactEmail = "E-mail obrigatório.";
    } else if (!/.+@.+\..+/.test(form.contactEmail)) {
      errors.contactEmail = "E-mail inválido.";
    }

    if (form.linkExpiration < 1 || form.linkExpiration > 30) {
      errors.linkExpiration = "Informe entre 1 e 30 dias.";
    }

    return errors;
  };

  const createWorkspace = useCreateWorkspace();
  const handleSave = async () => {
    setSubmitError(null);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setSaving(true);
    try {
      await createWorkspace.mutateAsync();
      clearWorkspaceDraft();
      toast({
        title: "Workspace configurado.",
        description: "Agora você pode criar seu primeiro caso em poucos minutos.",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Workspace onboarding error:", error);
      setSubmitError("Não foi possível criar o workspace. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "var(--gradient-hero)" }}>
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <p className="text-white/80">Verificando acesso ao workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 opacity-5 pointer-events-none -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <Card className="w-full max-w-xl shadow-xl border-0 animate-fade-in">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Configurar workspace (opcional)</CardTitle>
              <CardDescription className="text-base mt-1">
                Crie um workspace apenas se estiver montando seu próprio escritório. Clientes convidados podem pular esta etapa.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {submitError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {submitError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="workspaceName">Nome do escritório</Label>
              <Input
                id="workspaceName"
                placeholder="Ex: Biomas Geodesia"
                value={form.workspaceName}
                onChange={(e) => update("workspaceName", e.target.value)}
              />
              {fieldErrors.workspaceName && (
                <p className="text-xs text-destructive">{fieldErrors.workspaceName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibleName">Responsável</Label>
              <Input
                id="responsibleName"
                placeholder="Ex: Hugo França"
                value={form.responsibleName}
                onChange={(e) => update("responsibleName", e.target.value)}
              />
              {fieldErrors.responsibleName && (
                <p className="text-xs text-destructive">{fieldErrors.responsibleName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactEmail">E-mail do escritório</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contato@seudominio.com"
                value={form.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
              />
              {fieldErrors.contactEmail && (
                <p className="text-xs text-destructive">{fieldErrors.contactEmail}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactWhatsapp">WhatsApp</Label>
              <Input
                id="contactWhatsapp"
                placeholder="(62) 9 9999-9999"
                value={form.contactWhatsapp}
                onChange={(e) => update("contactWhatsapp", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ufDefault">UF padrão</Label>
              <Input
                id="ufDefault"
                value={form.ufDefault}
                onChange={(e) => update("ufDefault", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Recomendado: GO (Goiás).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkExpiration">Expiração do link (dias)</Label>
              <Input
                id="linkExpiration"
                type="number"
                min={1}
                max={30}
                value={String(form.linkExpiration)}
                onChange={(e) => update("linkExpiration", e.target.value)}
              />
              {fieldErrors.linkExpiration && (
                <p className="text-xs text-destructive">{fieldErrors.linkExpiration}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="whatsappTemplate">Mensagem do WhatsApp</Label>
              <Textarea
                id="whatsappTemplate"
                rows={3}
                value={form.whatsappTemplate}
                onChange={(e) => update("whatsappTemplate", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Use {"{dias}"} para inserir o prazo automaticamente.</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Pular por enquanto
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Concluir e ir para o dashboard"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
