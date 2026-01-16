import { ReactNode } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  ArrowLeft,
  HelpCircle,
  Phone
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PortalLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  caseName?: string;
}

export function PortalLayout({ children, title, showBack = false, caseName }: PortalLayoutProps) {
  const navigate = useNavigate();
  const { caseId } = useParams();

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack ? (
              <Button variant="ghost" size="icon" onClick={() => navigate(`/portal/${caseId}`)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
            )}
            <div>
              {title ? (
                <h1 className="font-semibold text-foreground text-sm">{title}</h1>
              ) : (
                <span className="font-semibold text-foreground text-sm">Núcleo Regulariza</span>
              )}
              {caseName && (
                <p className="text-xs text-muted-foreground">{caseName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="w-5 h-5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Precisa de ajuda?</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-lg mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer with support */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 safe-area-bottom">
        <div className="container max-w-lg mx-auto">
          <Button variant="outline" className="w-full gap-2" onClick={() => window.open("tel:+5562999999999")}>
            <Phone className="w-4 h-4" />
            Falar com o topógrafo
          </Button>
        </div>
      </footer>
    </div>
  );
}
