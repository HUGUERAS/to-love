import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, FileCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 -z-10"
        style={{ background: 'var(--gradient-hero)' }}
      />
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 -z-10 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground/90 bg-primary-foreground/5 px-4 py-1.5 text-sm">
            <MapPin className="w-3.5 h-3.5 mr-1.5" />
            Regularização Fundiária Rural em Goiás
          </Badge>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
            Dados na mão.{" "}
            <span className="text-accent">Peça técnica</span>{" "}
            no trilho.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Colete dados, croqui e documentos no padrão SEAPA. 
            Gere dossiês completos e briefings técnicos. 
            Menos retrabalho, mais previsibilidade.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              variant="accent" 
              size="xl"
              onClick={() => navigate("/auth?mode=signup")}
              className="group"
            >
              Criar workspace
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="hero-outline" 
              size="xl"
              onClick={() => navigate("/auth?mode=login")}
            >
              Acessar minha conta
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-12 text-primary-foreground/60 text-sm">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5" />
              <span>Template SEAPA oficial</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Croqui georeferenciado</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Gestão de anuências</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
