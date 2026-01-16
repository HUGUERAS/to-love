import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FolderOpen, 
  Users, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Clock,
  FileText,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data
const stats = [
  {
    label: "Casos ativos",
    value: "12",
    icon: FolderOpen,
    trend: "+2 esta semana",
    color: "text-info",
    path: "/dashboard/cases"
  },
  {
    label: "Aguardando cliente",
    value: "5",
    icon: Clock,
    trend: "3 há mais de 7 dias",
    color: "text-warning",
    path: "/dashboard/cases"
  },
  {
    label: "Pendências abertas",
    value: "8",
    icon: AlertCircle,
    trend: "2 críticas",
    color: "text-destructive",
    path: "/dashboard/pending"
  },
  {
    label: "Prontos para exportar",
    value: "3",
    icon: CheckCircle,
    trend: "Dossiê completo",
    color: "text-success",
    path: "/dashboard/exports"
  },
];

const recentCases = [
  { 
    id: "1", 
    name: "Fazenda Santa Maria", 
    municipality: "Cristalina", 
    status: "active",
    statusLabel: "Em preenchimento",
    lastActivity: "Há 2 horas",
    client: "José Santos"
  },
  { 
    id: "2", 
    name: "Sítio Boa Vista", 
    municipality: "Luziânia", 
    status: "pending",
    statusLabel: "Aguardando cliente",
    lastActivity: "Há 3 dias",
    client: "Maria Oliveira"
  },
  { 
    id: "3", 
    name: "Chácara São Pedro", 
    municipality: "Formosa", 
    status: "complete",
    statusLabel: "Pronto para exportar",
    lastActivity: "Há 1 dia",
    client: "Carlos Pereira"
  },
];

const nextActions = [
  { 
    type: "pending",
    title: "Documento de identidade ausente",
    case: "Fazenda Santa Maria",
    date: "Há 2 dias"
  },
  { 
    type: "review",
    title: "Croqui precisa de revisão",
    case: "Sítio Boa Vista",
    date: "Há 1 dia"
  },
  { 
    type: "export",
    title: "Dossiê pronto para exportar",
    case: "Chácara São Pedro",
    date: "Agora"
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Bom dia, João!</h2>
            <p className="text-muted-foreground">Você tem 3 casos que precisam de atenção.</p>
          </div>
          <Button onClick={() => navigate("/dashboard/cases/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Caso
          </Button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(stat.path)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.trend}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent cases */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Casos recentes</CardTitle>
                <CardDescription>Últimas atualizações dos seus casos</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/cases")}>
                Ver todos
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCases.map((caseItem) => (
                  <div 
                    key={caseItem.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/dashboard/cases/${caseItem.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{caseItem.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {caseItem.municipality} • {caseItem.client}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={
                          caseItem.status === "complete" ? "complete" : 
                          caseItem.status === "pending" ? "pending" : 
                          "active"
                        }
                      >
                        {caseItem.statusLabel}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{caseItem.lastActivity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next actions */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas ações</CardTitle>
              <CardDescription>Itens que precisam da sua atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nextActions.map((action, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      action.type === "pending" ? "bg-warning" :
                      action.type === "review" ? "bg-info" :
                      "bg-success"
                    }`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {action.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {action.case} • {action.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/dashboard/pending")}>
                Ver todas as pendências
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Empty state - for new users */}
        {/* Uncomment to show empty state */}
        {/* 
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Primeiro caso em 3 minutos
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Crie seu primeiro caso, envie o link ao cliente e acompanhe o preenchimento do dossiê SEAPA em tempo real.
            </p>
            <Button size="lg" onClick={() => navigate("/dashboard/cases/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro caso
            </Button>
          </CardContent>
        </Card>
        */}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
