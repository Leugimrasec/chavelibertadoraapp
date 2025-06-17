// src/pages/Relatorios.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { transacaoAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  ArrowLeft, 
  BarChart3, 
  PieChart, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter
} from 'lucide-react';
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../App.css';

export default function Relatorios() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1);
  const [filtroAno, setFiltroAno] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchTransacoes = async () => {
      try {
        setLoading(true);
        const response = await transacaoAPI.listar(user.id);
        setTransacoes(response.data.transacoes || []);
      } catch (error) {
        setError('Erro ao carregar transações');
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTransacoes();
    }
  }, [user]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Filtrar transações por mês/ano
  const transacoesFiltradas = transacoes.filter(transacao => {
    const dataTransacao = new Date(transacao.data);
    return dataTransacao.getMonth() + 1 === filtroMes && 
           dataTransacao.getFullYear() === filtroAno;
  });

  // Dados para gráfico de pizza (despesas por categoria)
  const despesasPorCategoria = transacoesFiltradas
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, transacao) => {
      const categoria = transacao.categoria;
      acc[categoria] = (acc[categoria] || 0) + transacao.valor;
      return acc;
    }, {});

  const dadosPizza = Object.entries(despesasPorCategoria).map(([categoria, valor]) => ({
    name: categoria,
    value: valor,
    percentage: ((valor / Object.values(despesasPorCategoria).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
  }));

  // Cores para o gráfico de pizza
  const CORES_PIZZA = [
    '#2ecc71', // Verde Esmeralda
    '#34495e', // Azul Escuro
    '#f1c40f', // Dourado
    '#e74c3c', // Vermelho
    '#9b59b6', // Roxo
    '#3498db', // Azul
    '#e67e22', // Laranja
    '#1abc9c', // Turquesa
    '#95a5a6'  // Cinza
  ];

  // Dados para gráfico de barras (comparativo mensal)
  const obterDadosComparativoMensal = () => {
    const mesesData = [];
    const anoAtual = new Date().getFullYear();
    
    for (let mes = 1; mes <= 12; mes++) {
      const transacoesMes = transacoes.filter(t => {
        const data = new Date(t.data);
        return data.getMonth() + 1 === mes && data.getFullYear() === anoAtual;
      });
      
      const receitas = transacoesMes
        .filter(t => t.tipo === 'receita')
        .reduce((sum, t) => sum + t.valor, 0);
      
      const despesas = transacoesMes
        .filter(t => t.tipo === 'despesa')
        .reduce((sum, t) => sum + t.valor, 0);
      
      mesesData.push({
        mes: new Date(anoAtual, mes - 1).toLocaleDateString('pt-BR', { month: 'short' }),
        receitas,
        despesas,
        saldo: receitas - despesas
      });
    }
    
    return mesesData;
  };

  const dadosComparativo = obterDadosComparativoMensal();

  // Estatísticas do mês atual
  const receitasMes = transacoesFiltradas
    .filter(t => t.tipo === 'receita')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const despesasMes = transacoesFiltradas
    .filter(t => t.tipo === 'despesa')
    .reduce((sum, t) => sum + t.valor, 0);
  
  const saldoMes = receitasMes - despesasMes;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
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
              <h1 className="text-2xl font-bold text-primary">Relatórios Financeiros</h1>
              <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filtros */}
        <Card className="card-futuristic mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês</label>
                <Select
                  value={filtroMes.toString()}
                  onValueChange={(value) => setFiltroMes(parseInt(value))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Ano</label>
                <Select
                  value={filtroAno.toString()}
                  onValueChange={(value) => setFiltroAno(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const ano = new Date().getFullYear() - 2 + i;
                      return (
                        <SelectItem key={ano} value={ano.toString()}>
                          {ano}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo do Mês */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="card-futuristic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(receitasMes)}
              </div>
              <p className="text-xs text-muted-foreground">
                {transacoesFiltradas.filter(t => t.tipo === 'receita').length} transações
              </p>
            </CardContent>
          </Card>

          <Card className="card-futuristic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {formatCurrency(despesasMes)}
              </div>
              <p className="text-xs text-muted-foreground">
                {transacoesFiltradas.filter(t => t.tipo === 'despesa').length} transações
              </p>
            </CardContent>
          </Card>

          <Card className="card-futuristic">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${saldoMes >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {formatCurrency(saldoMes)}
              </div>
              <p className="text-xs text-muted-foreground">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Pizza - Despesas por Categoria */}
          <Card className="card-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Despesas por Categoria
              </CardTitle>
              <CardDescription>
                Distribuição das despesas do mês selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dadosPizza.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={dadosPizza}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dadosPizza.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma despesa encontrada para o período selecionado</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Barras - Comparativo Mensal */}
          <Card className="card-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Comparativo Mensal
              </CardTitle>
              <CardDescription>
                Receitas vs Despesas por mês ({filtroAno})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosComparativo}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="receitas" fill="#2ecc71" name="Receitas" />
                    <Bar dataKey="despesas" fill="#e74c3c" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhamento de Transações */}
        <Card className="card-futuristic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Transações do Período
            </CardTitle>
            <CardDescription>
              Lista detalhada das transações do mês selecionado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transacoesFiltradas.length > 0 ? (
              <div className="space-y-4">
                {transacoesFiltradas
                  .sort((a, b) => new Date(b.data) - new Date(a.data))
                  .map((transacao, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          transacao.tipo === 'receita' ? 'bg-primary/10' : 'bg-destructive/10'
                        }`}>
                          {transacao.tipo === 'receita' ? (
                            <TrendingUp className="h-4 w-4 text-primary" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{transacao.categoria}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transacao.data)}
                            {transacao.descricao && ` • ${transacao.descricao}`}
                          </p>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        transacao.tipo === 'receita' ? 'text-primary' : 'text-destructive'
                      }`}>
                        {transacao.tipo === 'receita' ? '+' : '-'}{formatCurrency(transacao.valor)}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma transação encontrada para o período selecionado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

