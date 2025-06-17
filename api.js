// src/lib/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  cadastro: (nome, email, senha) => api.post('/auth/cadastro', { nome, email, senha }),
  perfil: (userId) => api.get(`/auth/perfil/${userId}`),
  updatePerfil: (userId, data) => api.put(`/auth/perfil/${userId}`, data),
};

// Transações API
export const transacaoAPI = {
  getTransacoes: (userId) => api.get(`/transacoes/${userId}`),
  criarTransacao: (data) => api.post('/transacoes', data),
  atualizarTransacao: (transacaoId, data) => api.put(`/transacoes/${transacaoId}`, data),
  deletarTransacao: (transacaoId) => api.delete(`/transacoes/${transacaoId}`),
  getDashboard: (userId) => api.get(`/dashboard/${userId}`),
  getRelatorios: (userId) => api.get(`/relatorios/${userId}`),
};

// Metas API
export const metaAPI = {
  getMetas: (userId) => api.get(`/metas/${userId}`),
  criarMeta: (data) => api.post('/metas', data),
  atualizarMeta: (metaId, data) => api.put(`/metas/${metaId}`, data),
  getMetaAtual: (userId) => api.get(`/metas/atual/${userId}`),
  calcularProgresso: (metaId) => api.get(`/metas/${metaId}/progresso`),
};

// Missões API
export const missaoAPI = {
  getMissoes: (userId) => api.get(`/missoes/${userId}`),
  getMissoesAtivas: (userId) => api.get(`/missoes/ativas/${userId}`),
  criarMissao: (data) => api.post('/missoes', data),
  concluirMissao: (missaoId) => api.put(`/missoes/${missaoId}/concluir`),
  gerarMissoesSemanais: (userId) => api.post(`/missoes/semanais/${userId}`),
};

// Configurações API
export const configAPI = {
  getConfiguracoes: (userId) => api.get(`/configuracoes/${userId}`),
  atualizarConfiguracoes: (userId, data) => api.put(`/configuracoes/${userId}`, data),
  resetDados: (userId) => api.post(`/configuracoes/${userId}/reset`),
  getCategorias: () => api.get('/categorias'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;

