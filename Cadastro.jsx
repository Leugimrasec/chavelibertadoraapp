// src/pages/Cadastro.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Loader2, User, Mail, Lock, Rocket, Sprout } from 'lucide-react';
import '../App.css';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { cadastro } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (senha !== confirmarSenha) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    const result = await cadastro(nome, email, senha);
    
    if (result.success) {
      setSuccess('Cadastro realizado com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen cadastro-background flex items-center justify-center p-4">
      {/* Grid overlay for spreadsheet effect */}
      <div className="cadastro-grid-overlay"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Hero Title Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="h-8 w-8 text-primary animate-pulse" />
            <h1 className="text-3xl font-bold text-foreground">
              Bem-vindo à Sua Nova
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">
            Jornada Financeira
          </h2>
          <p className="text-lg text-muted-foreground font-medium">
            Desperte sua liberdade com cada decisão.
          </p>
        </div>

        {/* Form Card */}
        <div className="cadastro-form-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950">
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-primary bg-primary/10">
                <AlertDescription className="text-primary font-medium">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-semibold text-foreground">
                Nome Completo
              </Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="cadastro-input pl-12"
                  required
                />
              </div>
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="cadastro-input pl-12"
                  required
                />
              </div>
            </div>
            
            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm font-semibold text-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="senha"
                  type="password"
                  placeholder="Crie uma senha forte"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="cadastro-input pl-12"
                  required
                />
              </div>
            </div>
            
            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-sm font-semibold text-foreground">
                Confirmar Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmarSenha"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="cadastro-input pl-12"
                  required
                />
              </div>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="cadastro-button w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando conta...
                </>
              ) : (
                'Cadastrar'
              )}
            </Button>
          </form>
          
          {/* Motivational Message */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sprout className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground font-medium">
                A liberdade financeira começa com o primeiro passo. Vamos juntos.
              </p>
            </div>
          </div>
          
          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link 
                to="/login" 
                className="cadastro-link font-semibold hover:underline transition-all duration-200"
              >
                Entrar Aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

