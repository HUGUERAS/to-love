import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useLogin } from '@/hooks/useLogin';
import { useSignUp, useResetPassword } from '@/hooks/useAuthMutations';
import { useCreateWorkspace } from '@/hooks/useCreateWorkspace';
import { useSession, useProfile } from '@/hooks/useSessionProfile';
import { clearWorkspaceDraft, getWorkspaceDraft, saveWorkspaceDraft, WorkspaceDraft } from "@/lib/workspace-draft";

type AuthMode = "login" | "signup" | "forgot";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
  workspaceName: string;
  responsibleName: string;
  ufDefault: string;
  linkExpiration: number;
  whatsappTemplate: string;
  termsAccepted: boolean;
  resetEmail: string;
  createWorkspaceNow: boolean;
};

type WorkspaceProvisionResult = "no-intent" | "created" | "error";

const initialState: FormState = {
  email: "",
  password: "",
  confirmPassword: "",
  workspaceName: "",
  responsibleName: "",
  ufDefault: "GO",
  linkExpiration: 7,
  whatsappTemplate: "Olá! Segue o link do portal do Núcleo Regulariza GO. O acesso expira em {dias} dias.",
  termsAccepted: false,
  resetEmail: "",
  createWorkspaceNow: false,
};

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>((searchParams.get("mode") as AuthMode) || "login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormState>(initialState);
  const draftLoadedRef = useRef(false);

  useEffect(() => {
    if (draftLoadedRef.current) return;
    const draft = getWorkspaceDraft();
    if (draft) {
      setFormData(prev => ({
        ...prev,
        workspaceName: draft.workspaceName || prev.workspaceName,
        responsibleName: draft.responsibleName || prev.responsibleName,
        ufDefault: draft.ufDefault || prev.ufDefault,
        linkExpiration: draft.linkExpiration ?? prev.linkExpiration,
        whatsappTemplate: draft.whatsappTemplate || prev.whatsappTemplate,
        email: draft.contactEmail || prev.email,
        createWorkspaceNow: draft.shouldAutoCreate ?? true,
      }));
    }
    draftLoadedRef.current = true;
  }, []);

  useEffect(() => {
    if (mode !== "signup" || !formData.createWorkspaceNow) return;
    if (
      !formData.workspaceName.trim() &&
      !formData.responsibleName.trim() &&
      !formData.whatsappTemplate.trim()
    ) {
      return;
    }

    saveWorkspaceDraft({
      workspaceName: formData.workspaceName,
      responsibleName: formData.responsibleName,
      ufDefault: formData.ufDefault,
      linkExpiration: formData.linkExpiration,
      whatsappTemplate: formData.whatsappTemplate,
      contactEmail: formData.email,
      shouldAutoCreate: true,
    });
  }, [mode, formData.createWorkspaceNow, formData.workspaceName, formData.responsibleName, formData.ufDefault, formData.linkExpiration, formData.whatsappTemplate, formData.email]);

  useEffect(() => {
    if (!draftLoadedRef.current) return;
    if (!formData.createWorkspaceNow) {
      clearWorkspaceDraft();
    }
  }, [formData.createWorkspaceNow]);

  const createWorkspace = useCreateWorkspace();
  const tryProvisionWorkspace = async (draftOverride?: WorkspaceDraft | null): Promise<WorkspaceProvisionResult> => {
    const draft = draftOverride ?? getWorkspaceDraft();
    if (!draft || !draft.workspaceName.trim()) return "no-intent";
    const wantsWorkspace = draft.shouldAutoCreate ?? true;
    if (!wantsWorkspace) return "no-intent";
    const linkExpiration = Number.isFinite(draft.linkExpiration)
      ? Math.min(Math.max(draft.linkExpiration, 1), 30)
      : 7;
    const payload = {
      workspace_name: draft.workspaceName.trim(),
      responsible_name: (draft.responsibleName || draft.workspaceName).trim(),
      uf_default: draft.ufDefault?.trim() || "GO",
      link_expiration: linkExpiration,
      whatsapp_template: draft.whatsappTemplate?.trim() ||
        "Olá! Segue o link do portal do Núcleo Regulariza GO. O acesso expira em {dias} dias.",
    };
    try {
      await createWorkspace.mutateAsync(payload);
      clearWorkspaceDraft();
      return "created";
    } catch {
      return "error";
    }
  };

  useEffect(() => {
    const modeParam = searchParams.get("mode") as AuthMode;
    if (modeParam && ["login", "signup", "forgot"].includes(modeParam)) {
      setMode(modeParam);
      setFormErrors({});
      setStatusMessage(null);
    }
  }, [searchParams]);

  const validateEmail = (value: string) => /.+@.+\..+/.test(value.trim());

  const getAuthErrorMessage = (rawMessage: string | null) => {
    if (!rawMessage) return "Erro inesperado.";
    const message = rawMessage.toLowerCase();
    if (message.includes("invalid login credentials")) return "Credenciais inválidas.";
    if (message.includes("email already registered") || message.includes("user already registered")) {
      return "E-mail já cadastrado.";
    }
    if (message.includes("password should be")) return "Senha muito curta.";
    if (message.includes("email not confirmed")) return "Confirme seu e-mail para continuar.";
    if (message.includes("email rate limit")) return "Muitas tentativas. Aguarde e tente novamente.";
    return "Erro inesperado.";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "linkExpiration" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, termsAccepted: checked }));
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormErrors({});
    setStatusMessage(null);
    setShowPassword(false);

    const params = new URLSearchParams(searchParams);
    if (nextMode === "login") {
      params.delete("mode");
    } else {
      params.set("mode", nextMode);
    }
    setSearchParams(params);
  };

  const login = useLogin();
  const signUp = useSignUp();
  const resetPassword = useResetPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({});
    setStatusMessage(null);

    try {
      const errors: Record<string, string> = {};

      if (mode === "login") {
        if (!formData.email.trim() || !validateEmail(formData.email)) {
          errors.email = "E-mail inválido.";
        }
        if (!formData.password.trim()) {
          errors.password = "Senha obrigatória.";
        }
        if (Object.keys(errors).length) {
          setFormErrors(errors);
          setIsLoading(false);
          return;
        }
        const data = await login.mutateAsync({
          email: formData.email.trim(),
          password: formData.password,
        });
        const user = data.user;
        if (!user) {
          setFormErrors({ general: "Não foi possível acessar sua conta." });
          setIsLoading(false);
          return;
        }
        // Aqui você pode usar useProfile(user.id) se quiser buscar perfil via React Query
        // ...
        setStatusMessage("Login realizado.");
        navigate("/dashboard");
        setIsLoading(false);
        return;
      }

      if (mode === "signup") {
        const wantsWorkspace = formData.createWorkspaceNow;
        if (wantsWorkspace && formData.workspaceName.trim().length < 3) {
          errors.workspaceName = "Informe ao menos 3 caracteres.";
        }
        if (wantsWorkspace && formData.responsibleName.trim().length < 3) {
          errors.responsibleName = "Informe ao menos 3 caracteres.";
        }
        if (!validateEmail(formData.email)) {
          errors.email = "E-mail inválido.";
        }
        if (!formData.password.trim()) {
          errors.password = "Senha obrigatória.";
        } else if (formData.password.length < 8) {
          errors.password = "Senha mínima: 8.";
        }
        if (formData.confirmPassword.trim() !== formData.password.trim()) {
          errors.confirmPassword = "Senhas diferentes.";
        }
        if (wantsWorkspace) {
          const expiration = Number(formData.linkExpiration);
          if (Number.isNaN(expiration) || expiration < 1 || expiration > 30) {
            errors.linkExpiration = "Informe entre 1 e 30 dias.";
          }
        }
        if (!formData.termsAccepted) {
          errors.termsAccepted = "Aceite os Termos.";
        }
        if (Object.keys(errors).length) {
          setFormErrors(errors);
          setIsLoading(false);
          return;
        }
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth?mode=login` : undefined;
        const signUpData = await signUp.mutateAsync({
          email: formData.email.trim(),
          password: formData.password.trim(),
        });
        const user = signUpData.user;
        if (!formData.createWorkspaceNow) {
          clearWorkspaceDraft();
          if (signUpData.session) {
            setStatusMessage("Conta criada. Você ainda não está vinculado a um workspace. Aguarde convite ou crie o seu depois em Configurações.");
            navigate("/dashboard");
            setIsLoading(false);
            return;
          }
          setStatusMessage("Enviamos um e-mail de confirmação. Após confirmar, faça login e peça acesso a um workspace existente ou crie o seu quando estiver pronto.");
          switchMode("login");
          setIsLoading(false);
          return;
        }
        if (!user) {
          setStatusMessage("Enviamos um e-mail de confirmação. Confirme para continuar o cadastro do workspace.");
          setIsLoading(false);
          return;
        }
        const draft: WorkspaceDraft = {
          workspaceName: formData.workspaceName,
          responsibleName: formData.responsibleName,
          ufDefault: formData.ufDefault,
          linkExpiration: formData.linkExpiration,
          whatsappTemplate: formData.whatsappTemplate,
          contactEmail: formData.email,
          shouldAutoCreate: true,
        };
        saveWorkspaceDraft(draft);
        if (signUpData.session) {
          const provisionNow = await tryProvisionWorkspace(draft);
          if (provisionNow === "created") {
            setStatusMessage("Workspace criado com sucesso.");
            navigate("/dashboard");
            setIsLoading(false);
            return;
          }
          setFormErrors({ general: "Não foi possível criar o workspace automaticamente. Tente novamente." });
          setIsLoading(false);
          return;
        }
        setStatusMessage(
          "Enviamos um e-mail de confirmação. Após confirmar no e-mail, volte, faça login e finalize os dados do workspace."
        );
        switchMode("login");
        setIsLoading(false);
        return;
      }

      if (mode === "forgot") {
        if (!formData.resetEmail.trim() || !validateEmail(formData.resetEmail)) {
          errors.resetEmail = "E-mail inválido.";
        }
        if (Object.keys(errors).length) {
          setFormErrors(errors);
          setIsLoading(false);
          return;
        }
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth?mode=login` : undefined;
        await resetPassword.mutateAsync({
          email: formData.resetEmail.trim(),
          redirectTo,
        });
        setStatusMessage("Enviamos um link para o seu e-mail.");
        setFormData(prev => ({ ...prev, email: prev.resetEmail }));
        switchMode("login");
        setIsLoading(false);
        return;
      }
    } catch (error) {
      const fallback = error instanceof Error ? error.message : String(error);
      setFormErrors({ general: `Erro inesperado. (${fallback})` });
      setIsLoading(false);
    }
  };

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

      <Card className="w-full max-w-md animate-fade-in shadow-xl border-0">
        <CardHeader className="text-center space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>

          <div className="flex items-center justify-center gap-2 pt-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
          </div>

          <div>
            <CardTitle className="text-2xl">
              {mode === "login" && "Entrar na plataforma"}
              {mode === "signup" && "Criar conta"}
              {mode === "forgot" && "Recuperar senha"}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {mode === "login" && "Use seu e-mail corporativo ou o e-mail que recebeu no convite."}
              {mode === "signup" && "Crie sua conta pessoal. Você pode configurar um workspace depois."}
              {mode === "forgot" && "Vamos enviar um link seguro para o seu e-mail."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {statusMessage && (
            <div className="mb-4 rounded-lg border border-success/40 bg-success/10 px-4 py-2 text-sm text-success">
              {statusMessage}
            </div>
          )}
          {formErrors.general && (
            <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              {formErrors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="rounded-lg border border-border/70 bg-secondary/20 px-4 py-3 text-sm text-left">
                  <p className="font-medium text-foreground">Primeiro, crie sua conta.</p>
                  <p className="text-muted-foreground mt-1">
                    O workspace é opcional e serve apenas para quem administra o próprio escritório e vai convidar clientes.
                  </p>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/80 px-3 py-3">
                  <Checkbox
                    id="createWorkspaceNow"
                    checked={formData.createWorkspaceNow}
                    onCheckedChange={value =>
                      setFormData(prev => ({ ...prev, createWorkspaceNow: Boolean(value) }))
                    }
                  />
                  <div className="text-sm leading-tight text-left">
                    <Label htmlFor="createWorkspaceNow" className="font-medium text-foreground">
                      Quero criar um workspace agora
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deixe desmarcado se você foi convidado para um workspace existente ou ainda está aguardando acesso.
                    </p>
                  </div>
                </div>
              </>
            )}

            {mode === "signup" && formData.createWorkspaceNow && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="workspaceName">Nome do escritório</Label>
                  <Input
                    id="workspaceName"
                    name="workspaceName"
                    placeholder="Ex: Topografia Silva"
                    value={formData.workspaceName}
                    onChange={handleInputChange}
                  />
                  {formErrors.workspaceName && (
                    <p className="text-xs text-destructive">{formErrors.workspaceName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsibleName">Nome do responsável</Label>
                  <Input
                    id="responsibleName"
                    name="responsibleName"
                    placeholder="Ex: João Silva"
                    value={formData.responsibleName}
                    onChange={handleInputChange}
                  />
                  {formErrors.responsibleName && (
                    <p className="text-xs text-destructive">{formErrors.responsibleName}</p>
                  )}
                </div>
              </>
            )}

            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="contato@seunegocio.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
              </div>
            )}

            {mode === "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="resetEmail">E-mail</Label>
                <Input
                  id="resetEmail"
                  name="resetEmail"
                  type="email"
                  placeholder="contato@seunegocio.com"
                  value={formData.resetEmail}
                  onChange={handleInputChange}
                />
                {formErrors.resetEmail && <p className="text-xs text-destructive">{formErrors.resetEmail}</p>}
              </div>
            )}

            {(mode === "login" || mode === "signup") && (
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(prev => !prev)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-between text-sm">
                <span />
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => switchMode("forgot")}
                >
                  Esqueci a senha
                </button>
              </div>
            )}

            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{formErrors.confirmPassword}</p>
                  )}
                </div>

                {formData.createWorkspaceNow && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="ufDefault">UF padrão</Label>
                        <Input id="ufDefault" name="ufDefault" value={formData.ufDefault} disabled />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkExpiration">Expiração do link (dias)</Label>
                        <Input
                          id="linkExpiration"
                          name="linkExpiration"
                          type="number"
                          min={1}
                          max={30}
                          value={formData.linkExpiration}
                          onChange={handleInputChange}
                        />
                        {formErrors.linkExpiration && (
                          <p className="text-xs text-destructive">{formErrors.linkExpiration}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsappTemplate">Texto padrão WhatsApp</Label>
                      <Textarea
                        id="whatsappTemplate"
                        name="whatsappTemplate"
                        rows={3}
                        value={formData.whatsappTemplate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-start gap-3 rounded-lg border border-border/80 bg-secondary/20 px-3 py-3">
                  <Checkbox
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onCheckedChange={value => handleCheckboxChange(Boolean(value))}
                  />
                  <div className="text-sm leading-tight text-left">
                    <Label htmlFor="termsAccepted" className="font-medium text-foreground">
                      Li e aceito os Termos
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ao prosseguir, você concorda com os Termos de Uso e a Política de Privacidade.
                    </p>
                    {formErrors.termsAccepted && (
                      <p className="mt-2 text-xs text-destructive">{formErrors.termsAccepted}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-3">
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === "login" && "Entrando..."}
                    {mode === "signup" && "Criando..."}
                    {mode === "forgot" && "Enviando..."}
                  </>
                ) : (
                  <>
                    {mode === "login" && "Entrar"}
                    {mode === "signup" && "Criar conta"}
                    {mode === "forgot" && "Enviar link"}
                  </>
                )}
              </Button>

              {mode === "login" && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => switchMode("signup")}
                >
                  Criar conta gratuita
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" && (
              <>
                Ainda não tem conta?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="text-primary hover:underline font-medium"
                >
                  Criar conta gratuita
                </button>
              </>
            )}

            {mode === "signup" && (
              <>
                Já tem acesso?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Entrar
                </button>
              </>
            )}

            {mode === "forgot" && (
              <>
                Lembrou a senha?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-primary hover:underline font-medium"
                >
                  Voltar para Entrar
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
