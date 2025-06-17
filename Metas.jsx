// src/pages/Metas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { metaAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { 
  ArrowLeft, 
  Target, 
  DollarSign, 
  TrendingUp,
  Trophy,
  Calendar,
  Save,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import '../App.css';

export default function Metas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [metaAtual, setMetaAtual] = useState(null);
  const [novaMetaValor, setNovaMetaValor] = useState('');
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    const fetchMetaAtual = async () => {
      try {
        setLoading(true);
        const response = await metaAPI.getMetaAtual(user.id);
        setMetaAtual(response.data);
      } catch (error) {
        // Se não há meta definida, não é um erro crítico
        if (error.response?.status !== 404) {
          setError('Erro ao carregar meta atual');
        }
        console.log('Nenhuma meta definida para o mês atual');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMetaAtual();
    }
  }, [user]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCurrencyInput = (value) => {
    // Remove tudo que não é número ou vírgula/ponto
    const numericValue = value.replace(/[^\d.,]/g, '');
    
    // Converte vírgula para ponto para cálculos
    const normalizedValue = numericValue.replace(',', '.');
    
    return normalizedValue;
  };

  const handleValueChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatCurrencyInput(value);
    setNovaMetaValor(formattedValue);
  };

  const handleSalvarMeta = async () => {
    if (!novaMetaValor || parseFloat(novaMetaValor) <= 0) {
      setError('Por favor, insira um valor válido maior que zero');
      return;
    }

    try {
      setSalvando(true);
      setError('');
      
      const valorMeta = parseFloat(novaMetaValor);
      
      if (metaAtual) {
        // Atualizar meta existente
        await metaAPI.atualizar(user.id, metaAtual.meta.id, { valor_meta: valorMeta });
        setSuccess('Meta atualizada com sucesso!');
      } else {
        // Criar nova meta
        await metaAPI.criar(user.id, { valor_meta: valorMeta });
        setSuccess('Meta criada com sucesso!');
      }
      
      // Recarregar dados da meta
      const response = await metaAPI.getMetaAtual(user.id);
      setMetaAtual(response.data);
      
      setEditando(false);
      setNovaMetaValor('');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      setError(error.response?.data?.erro || 'Erro ao salvar meta');
    } finally {
      setSalvando(false);
    }
  };

  const handleEditarMeta = () => {
    setEditando(true);
    setNovaMetaValor(metaAtual?.meta?.valor_meta?.toString() || '');
    setError('');
    setSuccess('');
  };

  const handleCancelarEdicao = () => {
    setEditando(false);
    setNovaMetaValor('');
    setError('');
    setSuccess('');
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return 'bg-accent'; // Dourado
    if (progress >= 80) return 'bg-primary'; // Verde
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getProgressMessage = (progress) => {
    if (progress >= 100) {
      return {
        icon: <Trophy className="h-5 w-5 text-accent" />,
        message: "🎉 Parabéns! Você atingiu sua meta mensal!",
        color: "text-accent"
      };
    } else if (progress >= 80) {
      return {
        icon: <CheckCircle className="h-5 w-5 text-primary" />,
        message: "🔥 Excelente! Você está quase lá!",
        color: "text-primary"
      };
    } else if (progress >= 50) {
      return {
        icon: <TrendingUp className="h-5 w-5 text-yellow-500" />,
        message: "💪 Boa! Você já passou da metade!",
        color: "text-yellow-600"
      };
    } else {
      return {
        icon: <Target className="h-5 w-5 text-muted-foreground" />,
        message: "🚀 Continue firme! Cada economia conta!",
        color: "text-muted-foreground"
      };
    }
  };

  const progressInfo = metaAtual ? getProgressMessage(metaAtual.progresso_percentual) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando metas...</p>
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
              <h1 className="text-2xl font-bold text-primary">Metas Financeiras</h1>
              <p className="text-muted-foreground">Defina e acompanhe suas metas de economia</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Mensagens de Erro e Sucesso */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-primary bg-primary/10 mb-6">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary font-semibold">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meta Atual */}
          <Card className="card-futuristic lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Meta de Economia Mensal
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {metaAtual ? (
                <div className="space-y-6">
                  {/* Informações da Meta */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Meta</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(metaAtual.meta.valor_meta)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Economia Atual</p>
                      <p className="text-2xl font-bold text-accent">
                        {formatCurrency(metaAtual.economia_atual)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Falta</p>
                      <p className="text-2xl font-bold text-muted-foreground">
                        {formatCurrency(Math.max(0, metaAtual.meta.valor_meta - metaAtual.economia_atual))}
                      </p>
                    </div>
                  </div>

                  {/* Termômetro de Progresso */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm font-semibold">
                        {metaAtual.progresso_percentual.toFixed(1)}%
                      </span>
                    </div>
                    
                    {/* Termômetro Vertical */}
                    <div className="flex items-end justify-center h-64">
                      <div className="relative w-12 h-full bg-muted rounded-full overflow-hidden border-4 border-border">
                        <div 
                          className={`absolute bottom-0 w-full rounded-full transition-all duration-1000 thermometer-progress ${getProgressColor(metaAtual.progresso_percentual)}`}
                          style={{ height: `${Math.min(metaAtual.progresso_percentual, 100)}%` }}
                        />
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                          <div className="w-8 h-8 bg-background rounded-full border-2 border-border flex items-center justify-center">
                            <Target className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de Progresso Horizontal (alternativa) */}
                    <div className="space-y-2">
                      <Progress 
                        value={Math.min(metaAtual.progresso_percentual, 100)} 
                        className="h-3"
                      />
                    </div>
                  </div>

                  {/* Mensagem de Progresso */}
                  {progressInfo && (
                    <Alert className="border-primary bg-primary/5">
                      <div className="flex items-center gap-2">
                        {progressInfo.icon}
                        <AlertDescription className={`font-semibold ${progressInfo.color}`}>
                          {progressInfo.message}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}

                  {/* Botão de Editar */}
                  <div className="flex justify-center">
                    <Button
                      onClick={handleEditarMeta}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar Meta
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma meta definida</h3>
                  <p className="text-muted-foreground mb-6">
                    Defina uma meta mensal para acompanhar seu progresso rumo à liberdade financeira
                  </p>
                  <Button 
                    onClick={() => setEditando(true)}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Target className="h-4 w-4" />
                    Definir Meta
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário de Meta */}
          <Card className="card-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                {editando ? (metaAtual ? 'Editar Meta' : 'Nova Meta') : 'Ações'}
              </CardTitle>
              <CardDescription>
                {editando ? 'Defina o valor da sua meta mensal' : 'Gerencie suas metas'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {editando ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="valor-meta">Valor da Meta *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input
                        id="valor-meta"
                        type="text"
                        placeholder="0,00"
                        value={novaMetaValor}
                        onChange={handleValueChange}
                        className="pl-12 text-lg font-semibold"
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Defina quanto você quer economizar este mês
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSalvarMeta}
                      disabled={salvando}
                      className="btn-primary flex-1 flex items-center gap-2"
                    >
                      {salvando ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {salvando ? 'Salvando...' : 'Salvar'}
                    </Button>
                    
                    <Button
                      onClick={handleCancelarEdicao}
                      variant="outline"
                      disabled={salvando}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button 
                    onClick={() => navigate('/nova-transacao')}
                    className="btn-primary w-full flex items-center gap-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    Adicionar Transação
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/relatorios')}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Ver Relatórios
                  </Button>
                  
                  {metaAtual && (
                    <Button 
                      onClick={handleEditarMeta}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar Meta
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dicas para Atingir a Meta */}
        <Card className="card-futuristic mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              Dicas para Atingir sua Meta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">📊 Acompanhe seus gastos</h4>
                <p className="text-sm text-muted-foreground">
                  Registre todas as transações para ter controle total das suas finanças
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">🎯 Seja realista</h4>
                <p className="text-sm text-muted-foreground">
                  Defina metas alcançáveis baseadas na sua renda e gastos essenciais
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">💡 Corte gastos desnecessários</h4>
                <p className="text-sm text-muted-foreground">
                  Analise seus relatórios e identifique onde pode economizar
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">🏆 Celebre conquistas</h4>
                <p className="text-sm text-muted-foreground">
                  Reconheça seu progresso e mantenha-se motivado na jornada
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

