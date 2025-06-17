// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { transacaoAPI, metaAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Plus, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target,
  LogOut,
  Settings,
  Trophy
} from 'lucide-react';
import '../App.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados do dashboard
        const dashboardResponse = await transacaoAPI.getDashboard(user.id);
        setDashboardData(dashboardResponse.data);
        
        // Buscar meta atual
        try {
          const metaResponse = await metaAPI.getMetaAtual(user.id);
          setMetaData(metaResponse.data);
        } catch (metaError) {
          // Se não há meta definida, não é um erro crítico
          console.log('Nenhuma meta definida para o mês atual');
        }
        
      } catch (error) {
        setError('Erro ao carregar dados do dashboard');
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-accent'; // Dourado
    if (progress >= 80) return 'bg-primary'; // Verde
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Hoje é dia de plantar sua liberdade financeira! Lance seus gastos.",
      "Cada centavo economizado é um passo rumo à sua independência!",
      "Sua disciplina financeira de hoje é a liberdade de amanhã!",
      "Continue firme! Você está construindo seu futuro financeiro!",
      "Pequenos passos diários levam a grandes conquistas financeiras!"
    ];
    
    const today = new Date().getDate();
    return messages[today % messages.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">Chave Financeira Libertadora</h1>
              <p className="text-muted-foreground">Bem-vindo, {user?.nome}!</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/configuracoes')}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurações
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Mensagem Motivacional */}
        <Alert className="mb-6 gold-border">
          <Trophy className="h-4 w-4" />
          <AlertDescription className="font-semibold text-accent-foreground">
            {getMotivationalMessage()}
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="card-futuristic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                dashboardData?.saldo_atual >= 0 ? 'text-primary' : 'text-destructive'
              }`}>
                {formatCurrency(dashboardData?.saldo_atual || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Receitas - Despesas do mês
              </p>
            </CardContent>
          </Card>

          <Card className="card-futuristic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(dashboardData?.total_receita || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Entradas do mês atual
              </p>
            </CardContent>
          </Card>

          <Card className="card-futuristic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(dashboardData?.total_despesa || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Saídas do mês atual
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Termômetro de Meta */}
          <Card className="card-futuristic lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Meta de Economia Mensal
              </CardTitle>
              <CardDescription>
                {metaData ? 
                  `Meta: ${formatCurrency(metaData.meta.valor_meta)}` : 
                  'Nenhuma meta definida para este mês'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metaData ? (
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span className="font-semibold">
                      {metaData.progresso_percentual.toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Termômetro Vertical */}
                  <div className="flex items-end justify-center h-48">
                    <div className="relative w-8 h-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`absolute bottom-0 w-full rounded-full transition-all duration-1000 thermometer-progress ${getProgressColor(metaData.progresso_percentual)}`}
                        style={{ height: `${Math.min(metaData.progresso_percentual, 100)}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-background rounded-full border-2 border-border" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Economia atual: {formatCurrency(metaData.economia_atual)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Faltam: {formatCurrency(Math.max(0, metaData.meta.valor_meta - metaData.economia_atual))}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Defina uma meta mensal para acompanhar seu progresso
                  </p>
                  <Button 
                    onClick={() => navigate('/metas')}
                    className="btn-primary"
                  >
                    Definir Meta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="card-futuristic">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Gerencie suas finanças
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate('/nova-transacao')}
                className="btn-primary w-full flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar Transação
              </Button>
              
              <Button 
                onClick={() => navigate('/relatorios')}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Ver Relatórios
              </Button>
              
              <Button 
                onClick={() => navigate('/metas')}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Gerenciar Metas
              </Button>
              
              <Button 
                onClick={() => navigate('/missoes')}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Ver Missões
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

