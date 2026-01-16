import { Card, CardContent } from "@/components/ui/card";
import { 
  MapPin, 
  FileText, 
  Users, 
  ClipboardCheck, 
  Download, 
  Shield 
} from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Croqui Preliminar no Mapa",
    description: "Desenhe ou importe KML do polígono. Adicione pontos de referência e observações. Versionamento automático."
  },
  {
    icon: FileText,
    title: "Questionário SEAPA Completo",
    description: "Template oficial com todas as seções: identificação, imóvel, histórico de posse, confrontações e declarações."
  },
  {
    icon: ClipboardCheck,
    title: "Gestão de Pendências",
    description: "Solicite complementação com um clique. Acompanhe o status de cada item e mantenha a trilha de auditoria."
  },
  {
    icon: Users,
    title: "Portal do Cliente Seguro",
    description: "Link único por caso. O cliente responde, anexa documentos e acompanha o progresso pelo celular."
  },
  {
    icon: Download,
    title: "Dossiê SEAPA + Briefing",
    description: "Exporte PDF pronto com capa institucional, todas as respostas, documentos e trilha de auditoria."
  },
  {
    icon: Shield,
    title: "Multi-tenant e LGPD",
    description: "Cada topógrafo tem seu workspace. Links com token e expiração. Logs completos para rastreabilidade."
  }
];

export function Features() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tudo que você precisa para{" "}
            <span className="text-primary">destravar casos</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Do croqui preliminar à exportação do dossiê, com governança e rastreabilidade em cada etapa.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group bg-card border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 lg:p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
