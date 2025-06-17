// src/pages/NovaTransacao.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { transacaoAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  Tag, 
  FileText,
  TrendingUp,
  TrendingDown,
  Save,
  X
} from 'lucide-react';
import '../App.css';

export default function NovaTransacao() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    tipo: 'despesa',
    valor: '',
    categoria: '',
    data: new Date().toISOString().split('T')[0],
    descricao: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Categorias predefinidas
  const categorias = {
    receita: [
      'Salário',
      'Freelance',
      'Investimentos',
      'Vendas',
      'Presente',
      'Outros'
    ],
    despesa: [
      'Alimentação',
      'Transporte',
      'Moradia',
      'Saúde',
      'Educação',
      'Lazer',
      'Roupas',
      'Tecnologia',
      'Outros'
    ]
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar categoria quando mudar o tipo
    if (field === 'tipo') {
      setFormData(prev => ({
        ...prev,
        categoria: ''
      }));
    }
  };

  const formatCurrency = (value) => {
    // Remove tudo que não é número ou vírgula/ponto
    const numericValue = value.replace(/[^\d.,]/g, '');
    
    // Converte vírgula para ponto para cálculos
    const normalizedValue = numericValue.replace(',', '.');
    
    return normalizedValue;
  };

  const handleValueChange = (e) => {
    const value = e.target.value;
    const formattedValue = formatCurrency(value);
    handleInputChange('valor', formattedValue);
  };

  const validateForm = () => {
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      setError('Por favor, insira um valor válido maior que zero');
      return false;
    }
    
    if (!formData.categoria) {
      setError('Por favor, selecione uma categoria');
      return false;
    }
    
    if (!formData.data) {
      setError('Por favor, selecione uma data');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      const transacaoData = {
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        categoria: formData.categoria,
        data: formData.data,
        descricao: formData.descricao || null
      };
      
      await transacaoAPI.criar(user.id, transacaoData);
      
      setSuccess(`${formData.tipo === 'receita' ? 'Receita' : 'Despesa'} adicionada com sucesso!`);
      
      // Limpar formulário
      setFormData({
        tipo: 'despesa',
        valor: '',
        categoria: '',
        data: new Date().toISOString().split('T')[0],
        descricao: ''
      });
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.erro || 'Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

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
              <h1 className="text-2xl font-bold text-primary">Nova Transação</h1>
              <p className="text-muted-foreground">Adicione uma receita ou despesa</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <Card className="card-futuristic">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Detalhes da Transação
            </CardTitle>
            <CardDescription>
              Preencha os campos abaixo para registrar sua transação
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Transação */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.tipo === 'receita'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleInputChange('tipo', 'receita')}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="font-semibold">Receita</h3>
                      <p className="text-sm text-muted-foreground">Dinheiro que entra</p>
                    </div>
                  </div>
                </div>
                
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.tipo === 'despesa'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleInputChange('tipo', 'despesa')}
                >
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-6 w-6 text-destructive" />
                    <div>
                      <h3 className="font-semibold">Despesa</h3>
                      <p className="text-sm text-muted-foreground">Dinheiro que sai</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="valor" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="valor"
                    type="text"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={handleValueChange}
                    className="pl-12 text-lg font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categoria *
                </Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => handleInputChange('categoria', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias[formData.tipo].map((categoria) => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data *
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleInputChange('data', e.target.value)}
                  required
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="descricao"
                  placeholder="Adicione uma descrição para esta transação..."
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Mensagens de Erro e Sucesso */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-primary bg-primary/10">
                  <AlertDescription className="text-primary font-semibold">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading ? 'Salvando...' : 'Salvar Transação'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

