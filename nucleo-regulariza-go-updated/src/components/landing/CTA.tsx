import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground">
            Regularização sem guerra de confrontante
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
            Trilha clara, governança e documentação. Menos retrabalho, mais previsibilidade para seu escritório.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              variant="accent" 
              size="xl"
              onClick={() => navigate("/auth?mode=signup")}
              className="group"
            >
              Começar agora
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="hero-outline" 
              size="xl"
              onClick={() => window.open("https://wa.me/5562999999999", "_blank")}
            >
              <MessageCircle className="w-5 h-5" />
              Falar com especialista
            </Button>
          </div>

          <p className="text-sm text-primary-foreground/60 pt-4">
            Teste grátis por 14 dias. Sem cartão de crédito.
          </p>
        </div>
      </div>
    </section>
  );
}
