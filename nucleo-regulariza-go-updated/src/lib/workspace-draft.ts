export type WorkspaceDraft = {
  workspaceName: string;
  responsibleName: string;
  ufDefault: string;
  linkExpiration: number;
  whatsappTemplate: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  shouldAutoCreate?: boolean;
};

const WORKSPACE_DRAFT_KEY = "nrgo.workspace";

const hasBrowserStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const getWorkspaceDraft = (): WorkspaceDraft | null => {
  if (!hasBrowserStorage()) return null;
  try {
    const raw = window.localStorage.getItem(WORKSPACE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkspaceDraft;
  } catch {
    return null;
  }
};

export const saveWorkspaceDraft = (draft: WorkspaceDraft) => {
  if (!hasBrowserStorage()) return;
  window.localStorage.setItem(WORKSPACE_DRAFT_KEY, JSON.stringify(draft));
};

export const clearWorkspaceDraft = () => {
  if (!hasBrowserStorage()) return;
  window.localStorage.removeItem(WORKSPACE_DRAFT_KEY);
};

export const upsertWorkspaceDraft = (partial: Partial<WorkspaceDraft>) => {
  if (!hasBrowserStorage()) return;
  const current = getWorkspaceDraft();
  const next: WorkspaceDraft = {
    workspaceName: "",
    responsibleName: "",
    ufDefault: "GO",
    linkExpiration: 7,
    whatsappTemplate: "Olá! Segue o link do portal do Núcleo Regulariza GO. O acesso expira em {dias} dias.",
    contactEmail: "",
    contactWhatsapp: "",
    shouldAutoCreate: false,
    ...current,
    ...partial,
  };
  saveWorkspaceDraft(next);
};

export { WORKSPACE_DRAFT_KEY };
