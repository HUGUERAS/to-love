import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  ExternalLink, 
  FileDown, 
  Copy,
  Eye,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data
const cases = [
  { 
    id: "1", 
    name: "Fazenda Santa Maria", 
    municipality: "Cristalina",
    client: "José Santos",
    phone: "(62) 99999-1111",
    status: "active",
    statusLabel: "Em preenchimento",
    progress: 65,
    lastActivity: "2024-01-15T10:30:00",
    createdAt: "2024-01-10T09:00:00"
  },
  { 
    id: "2", 
    name: "Sítio Boa Vista", 
    municipality: "Luziânia",
    client: "Maria Oliveira",
    phone: "(62) 99999-2222",
    status: "pending",
    statusLabel: "Aguardando cliente",
    progress: 30,
    lastActivity: "2024-01-12T14:00:00",
    createdAt: "2024-01-08T11:00:00"
  },
  { 
    id: "3", 
    name: "Chácara São Pedro", 
    municipality: "Formosa",
    client: "Carlos Pereira",
    phone: "(62) 99999-3333",
    status: "complete",
    statusLabel: "Pronto para exportar",
    progress: 100,
    lastActivity: "2024-01-14T16:00:00",
    createdAt: "2024-01-05T08:00:00"
  },
  { 
    id: "4", 
    name: "Fazenda Esperança", 
    municipality: "Planaltina",
    client: "Ana Costa",
    phone: "(62) 99999-4444",
    status: "review",
    statusLabel: "Em revisão",
    progress: 85,
    lastActivity: "2024-01-15T08:00:00",
    createdAt: "2024-01-03T10:00:00"
  },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "complete": return "complete";
    case "pending": return "pending";
    case "review": return "active";
    default: return "active";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const Cases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                         c.client.toLowerCase().includes(search.toLowerCase()) ||
                         c.municipality.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (caseId: string, caseName: string) => {
    const link = `${window.location.origin}/portal/${caseId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copiado!",
      description: `Link do portal para "${caseName}" copiado para a área de transferência.`
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Casos</h2>
            <p className="text-muted-foreground">Gerencie todos os casos de regularização</p>
          </div>
          <Button onClick={() => navigate("/dashboard/cases/new")} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Caso
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por caso, cliente ou município..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Em preenchimento</SelectItem>
                  <SelectItem value="pending">Aguardando cliente</SelectItem>
                  <SelectItem value="review">Em revisão</SelectItem>
                  <SelectItem value="complete">Pronto para exportar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Caso</TableHead>
                    <TableHead>Município</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Última atividade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id} className="cursor-pointer hover:bg-secondary/30">
                      <TableCell className="font-medium">
                        <button 
                          onClick={() => navigate(`/dashboard/cases/${caseItem.id}`)}
                          className="hover:text-primary transition-colors text-left"
                        >
                          {caseItem.name}
                        </button>
                      </TableCell>
                      <TableCell>{caseItem.municipality}</TableCell>
                      <TableCell>
                        <div>
                          <p>{caseItem.client}</p>
                          <p className="text-xs text-muted-foreground">{caseItem.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(caseItem.status)}>
                          {caseItem.statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                caseItem.progress === 100 ? "bg-success" : "bg-primary"
                              }`}
                              style={{ width: `${caseItem.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{caseItem.progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(caseItem.lastActivity)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/dashboard/cases/${caseItem.id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Abrir caso
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyLink(caseItem.id, caseItem.name)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar link do portal
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/portal/${caseItem.id}`, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Abrir portal do cliente
                            </DropdownMenuItem>
                            {caseItem.status === "complete" && (
                              <DropdownMenuItem onClick={() => navigate(`/dashboard/exports?case=${caseItem.id}`)}>
                                <FileDown className="w-4 h-4 mr-2" />
                                Exportar dossiê
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir caso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCases.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground">Nenhum caso encontrado</p>
                <Button variant="link" onClick={() => { setSearch(""); setStatusFilter("all"); }}>
                  Limpar filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Cases;
