// src/pages/Configuracoes.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { configAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { 
  ArrowLeft, 
  Settings, 
  Globe, 
  DollarSign, 
  Moon, 
  Sun, 
  Trash2,
  Save,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  User,
  Shield
} from 'lucide-react';
import '../App.css';

export default function Configuracoes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [config, setConfig] = useState({
    moeda: 'BRL',
    idioma: 'pt-BR',
    tema: 'light',
    notificacoes: true,
    backup_automatico: true
  });
  
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const response = await configAPI.obter(user.id);
        setConfig(response.data);
      } catch (error) {
        // Se não há configuração, usar padrões
        console.log('Usando configurações padrão');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConfig();
    }
  }, [user]);

  const handleSalvarConfig = async () => {
    try {
      setSalvando(true);
      setError('');
      
      await configAPI.atualizar(user.id, config);
      setSuccess('Configurações salvas com sucesso!');
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      setError(error.response?.data?.erro || 'Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  const handleResetDados = async () => {
    try {
      setSalvando(true);
      setError('');
      
      await configAPI.resetarDados(user.id);
      setSuccess('Dados resetados com sucesso!');
      setShowResetDialog(false);
      
      // Redirecionar para dashboard após reset
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      setError(error.response?.data?.erro || 'Erro ao resetar dados');
    } finally {
      setSalvando(false);
    }
  };

  const handleExportarDados = async () => {
    try {
      const response = await configAPI.exportarDados(user.id);
      
      // Criar e baixar arquivo
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chave-financeira-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Dados exportados com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      setError('Erro ao exportar dados');
    }
  };

  const moedas = [
    { value: 'BRL', label: 'Real Brasileiro (R$)' },
    { value: 'USD', label: 'Dólar Americano ($)' },
    { value: 'EUR', label: 'Euro (€)' }
  ];

  const idiomas = [
    { value: 'pt-BR', label: 'Português (Brasil)' },
    { value: 'en', label: 'English' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando configurações...</p>
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
              <h1 className="text-2xl font-bold text-primary">Configurações</h1>
              <p className="text-muted-foreground">Personalize sua experiência no aplicativo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Mensagens de Erro e Sucesso */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
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

        <div className="space-y-6">
          {/* Configurações Gerais */}
          <Card className="card-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Ajuste as configurações básicas do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Moeda */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Moeda
                </Label>
                <Select
                  value={config.moeda}
                  onValueChange={(value) => setConfig({ ...config, moeda: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {moedas.map((moeda) => (
                      <SelectItem key={moeda.value} value={moeda.value}>
                        {moeda.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Escolha a moeda para exibição de valores
                </p>
              </div>

              {/* Idioma */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Idioma
                </Label>
                <Select
                  value={config.idioma}
                  onValueChange={(value) => setConfig({ ...config, idioma: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {idiomas.map((idioma) => (
                      <SelectItem key={idioma.value} value={idioma.value}>
                        {idioma.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Selecione o idioma da interface
                </p>
              </div>

              {/* Tema */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  {config.tema === 'dark' ? (
                    <Moon className="h-4 w-4 text-primary" />
                  ) : (
                    <Sun className="h-4 w-4 text-primary" />
                  )}
                  Tema
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.tema === 'dark'}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, tema: checked ? 'dark' : 'light' })
                    }
                  />
                  <span className="text-sm">
                    {config.tema === 'dark' ? 'Modo Escuro' : 'Modo Claro'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alterne entre modo claro e escuro
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notificações e Backup */}
          <Card className="card-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacidade e Backup
              </CardTitle>
              <CardDescription>
                Configure notificações e backup automático
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notificações */}
              <div className="space-y-2">
                <Label>Notificações Push</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.notificacoes}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, notificacoes: checked })
                    }
                  />
                  <span className="text-sm">
                    {config.notificacoes ? 'Ativadas' : 'Desativadas'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Receba lembretes e notificações de progresso
                </p>
              </div>

              {/* Backup Automático */}
              <div className="space-y-2">
                <Label>Backup Automático</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.backup_automatico}
                    onCheckedChange={(checked) => 
                      setConfig({ ...config, backup_automatico: checked })
                    }
                  />
                  <span className="text-sm">
                    {config.backup_automatico ? 'Ativado' : 'Desativado'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Backup automático dos seus dados na nuvem
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dados e Exportação */}
          <Card className="card-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                Gerenciar Dados
              </CardTitle>
              <CardDescription>
                Exporte ou reset seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleExportarDados}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar Dados
                </Button>
                
                <Button
                  onClick={() => setShowResetDialog(true)}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Resetar Dados
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Exporte seus dados para backup ou reset todos os dados do aplicativo
              </p>
            </CardContent>
          </Card>

          {/* Informações da Conta */}
          <Card className="card-futuristic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome</Label>
                  <p className="text-sm text-muted-foreground">{user?.nome}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <Button
                onClick={logout}
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Sair da Conta
              </Button>
            </CardContent>
          </Card>

          {/* Botão Salvar */}
          <div className="flex justify-center">
            <Button
              onClick={handleSalvarConfig}
              disabled={salvando}
              className="btn-primary flex items-center gap-2 px-8"
            >
              {salvando ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {salvando ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </div>

        {/* Dialog de Confirmação de Reset */}
        {showResetDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Confirmar Reset
                </CardTitle>
                <CardDescription>
                  Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={handleResetDados}
                    disabled={salvando}
                    variant="destructive"
                    className="flex-1"
                  >
                    {salvando ? 'Resetando...' : 'Confirmar Reset'}
                  </Button>
                  <Button
                    onClick={() => setShowResetDialog(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

