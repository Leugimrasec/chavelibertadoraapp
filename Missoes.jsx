// src/pages/Missoes.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { missaoAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  CheckCircle,
  Clock,
  Star,
  Gift,
  Zap,
  Calendar,
  TrendingUp,
  DollarSign,
  Award
} from 'lucide-react';
import '../App.css';

export default function Missoes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [missoes, setMissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [completandoMissao, setCompletandoMissao] = useState(null);

  useEffect(() => {
    const fetchMissoes = async () => {
      try {
        setLoading(true);
        const response = await missaoAPI.listar(user.id);
        setMissoes(response.data.missoes || []);
      } catch (error) {
        setError('Erro ao carregar missões');
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMissoes();
    }
  }, [user]);

  const handleCompletarMissao = async (missaoId) => {
    try {
      setCompletandoMissao(missaoId);
      await missaoAPI.completar(user.id, missaoId);
      
      // Atualizar a lista de missões
      const response = await missaoAPI.listar(user.id);
      setMissoes(response.data.missoes || []);
      
    } catch (error) {
      setError('Erro ao completar missão');
      console.error('Erro:', error);
    } finally {
      setCompletandoMissao(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completada':
        return <CheckCircle className="h-5 w-5 text-primary" />;
      case 'pendente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Target className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completada':
        return <Badge className="bg-primary text-primary-foreground">Completada</Badge>;
      case 'pendente':
        return <Badge variant="secondary">Pendente</Badge>;
      default:
        return <Badge variant="outline">Disponível</Badge>;
    }
  };

  const getMissaoIcon = (tipo) => {
    switch (tipo) {
      case 'transacao':
        return <DollarSign className="h-6 w-6 text-primary" />;
      case 'economia':
        return <TrendingUp className="h-6 w-6 text-accent" />;
      case 'meta':
        return <Target className="h-6 w-6 text-blue-500" />;
      case 'sequencia':
        return <Zap className="h-6 w-6 text-yellow-500" />;
      default:
        return <Star className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const missoesCompletadas = missoes.filter(m => m.status === 'completada').length;
  const totalMissoes = missoes.length;
  const progressoGeral = totalMissoes > 0 ? (missoesCompletadas / totalMissoes) * 100 : 0;

  // Missões de exemplo caso não haja dados do backend
  const missoesExemplo = [
    {
      id: 1,
      titulo: "Primeiro Registro",
      descricao: "Registre sua primeira transação no aplicativo",
      tipo: "transacao",
      status: "completada",
      progresso: 100,
      meta: 1,
      recompensa: "10 pontos"
    },
    {
      id: 2,
      titulo: "Sequência de 5 Dias",
      descricao: "Registre transações por 5 dias consecutivos",
      tipo: "sequencia",
      status: "pendente",
      progresso: 60,
      meta: 5,
      recompensa: "50 pontos"
    },
    {
      id: 3,
      titulo: "Meta Mensal",
      descricao: "Atinja 50% da sua meta de economia mensal",
      tipo: "meta",
      status: "pendente",
      progresso: 30,
      meta: 50,
      recompensa: "100 pontos"
    },
    {
      id: 4,
      titulo: "Economizador",
      descricao: "Economize R$ 200 em um mês",
      tipo: "economia",
      status: "pendente",
      progresso: 25,
      meta: 200,
      recompensa: "Medalha de Ouro"
    }
  ];

  const missoesParaExibir = missoes.length > 0 ? missoes : missoesExemplo;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando missões...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Missões</h1>
              <p className="text-muted-foreground">Complete desafios e ganhe recompensas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progresso Geral */}
        <Card className="card-futuristic mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Progresso Geral
            </CardTitle>
            <CardDescription>
              Seu desempenho nas missões
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {missoesCompletadas}
                </div>
                <p className="text-sm text-muted-foreground">Missões Completadas</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {totalMissoes - missoesCompletadas}
                </div>
                <p className="text-sm text-muted-foreground">Missões Pendentes</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground mb-2">
                  {progressoGeral.toFixed(0)}%
                </div>
                <p className="text-sm text-muted-foreground">Progresso Total</p>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-sm text-muted-foreground">
                  {missoesCompletadas}/{totalMissoes}
                </span>
              </div>
              <Progress value={progressoGeral} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Missões */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Suas Missões</h2>
          
          {missoesParaExibir.map((missao) => (
            <Card key={missao.id} className="card-futuristic">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Ícone da Missão */}
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-full bg-muted">
                      {getMissaoIcon(missao.tipo)}
                    </div>
                  </div>
                  
                  {/* Conteúdo da Missão */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{missao.titulo}</h3>
                        <p className="text-muted-foreground text-sm">{missao.descricao}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(missao.status)}
                        {getStatusBadge(missao.status)}
                      </div>
                    </div>
                    
                    {/* Progresso da Missão */}
                    {missao.status !== 'completada' && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progresso</span>
                          <span className="text-sm text-muted-foreground">
                            {missao.progresso || 0}%
                          </span>
                        </div>
                        <Progress value={missao.progresso || 0} className="h-2" />
                      </div>
                    )}
                    
                    {/* Recompensa */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4 text-accent" />
                        <span className="text-sm font-medium text-accent">
                          Recompensa: {missao.recompensa}
                        </span>
                      </div>
                      
                      {/* Botão de Ação */}
                      {missao.status === 'pendente' && missao.progresso >= 100 && (
                        <Button
                          onClick={() => handleCompletarMissao(missao.id)}
                          disabled={completandoMissao === missao.id}
                          className="btn-primary flex items-center gap-2"
                          size="sm"
                        >
                          {completandoMissao === missao.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          ) : (
                            <Award className="h-4 w-4" />
                          )}
                          Resgatar
                        </Button>
                      )}
                      
                      {missao.status === 'completada' && (
                        <Badge className="bg-primary text-primary-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluída
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Motivação */}
        <Card className="card-futuristic mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Dica Motivacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-lg font-semibold text-primary mb-2">
                🎯 "Cada pequena conquista te aproxima da liberdade financeira!"
              </p>
              <p className="text-muted-foreground">
                Complete suas missões diárias e construa hábitos financeiros saudáveis. 
                Lembre-se: consistência é a chave para o sucesso!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Button 
            onClick={() => navigate('/nova-transacao')}
            className="btn-primary flex items-center gap-2 h-12"
          >
            <DollarSign className="h-5 w-5" />
            Adicionar Transação
          </Button>
          
          <Button 
            onClick={() => navigate('/metas')}
            variant="outline"
            className="flex items-center gap-2 h-12"
          >
            <Target className="h-5 w-5" />
            Ver Metas
          </Button>
        </div>
      </main>
    </div>
  );
}

