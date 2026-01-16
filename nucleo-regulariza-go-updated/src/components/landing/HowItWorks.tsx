import { Badge } from "@/components/ui/badge";

const steps = [
  {
    number: "01",
    title: "Crie o caso",
    description: "Informe município, dados do cliente e escolha o template SEAPA. Gere um link seguro para o cliente."
  },
  {
    number: "02",
    title: "Cliente preenche",
    description: "Pelo celular, o cliente desenha o croqui, responde o questionário e anexa documentos."
  },
  {
    number: "03",
    title: "Revise e solicite pendências",
    description: "Identifique lacunas, solicite complementação com um clique e acompanhe a resolução."
  },
  {
    number: "04",
    title: "Exporte o dossiê",
    description: "Gere o Dossiê SEAPA e o Briefing Técnico em PDF, prontos para o processo ou para elaborar as peças."
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Como funciona
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Do caso ao dossiê em 4 passos
          </h2>
          <p className="text-lg text-muted-foreground">
            Fluxo simples e guiado para você e seu cliente.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex gap-6 lg:gap-8 items-start group"
              >
                {/* Number */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <span className="text-xl font-bold text-primary">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="pt-2">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
