# 🌐 Frontend - Aplicação de Autenticação com React

Este é o frontend da aplicação de autenticação desenvolvida com React + Vite, que consome uma API Flask.

A aplicação cobre o fluxo completo de autenticação, incluindo:

- Cadastro com validação de e-mail real
- Login com token JWT
- Recuperação de senha por e-mail
- Acesso a rotas protegidas

---

## 🧰 Tecnologias

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [React Router DOM](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Tailwind CSS](https://tailwindcss.com/) (opcional)

---

## 💻 Funcionalidades

- ✅ Cadastro de usuário com envio de e-mail de confirmação
- ✅ Confirmação de e-mail com redirecionamento automático
- ✅ Login com token JWT salvo no localStorage
- ✅ Recuperação de senha com envio de link por e-mail
- ✅ Redefinição de senha via link recebido
- ✅ Acesso a rotas protegidas apenas para usuários autenticados
- ✅ Mensagens de erro e sucesso em tempo real

---

## 🏁 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/nome-do-projeto.git
cd frontend


Instale as dependências:

bash
Copiar
Editar
npm install
Configure a URL da API:

Você pode alterar a URL da API nas chamadas do axios, ou criar um arquivo .env com:

env
Copiar
Editar
VITE_API_URL=http://localhost:5000
E usar no código:

js
Copiar
Editar
axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, ...)
Inicie o servidor:

bash
Copiar
Editar
npm run dev
O frontend estará disponível em: http://localhost:5173

📁 Estrutura de diretórios
bash
Copiar
Editar
src/
├── pages/              # Telas principais: Login, Cadastro, Redefinição
├── components/         # Componentes reutilizáveis (Navbar, Forms etc)
├── App.jsx             # Roteamento principal
├── main.jsx            # Ponto de entrada da aplicação
└── styles/             # (opcional) Estilos globais
🔄 Fluxo de autenticação
Cadastro
Envia POST para /users

Backend envia link de confirmação por e-mail

Link abre o frontend com rota /confirm-email/:token

Confirmação de e-mail
Front envia GET para /auth/confirm-email/:token

Exibe feedback de sucesso ou falha

Login
Envia POST para /auth/login

Salva token JWT no localStorage

Recuperação de senha
Envia POST para /auth/forgot-password

E-mail é enviado com link contendo token

Link abre /reset-password/:token no frontend

Redefinição de senha
Formulário envia nova senha com token via POST para /auth/reset-password/:token

🔐 Proteção de rotas
Você pode proteger rotas com lógica baseada na presença de um token JWT:

js
Copiar
Editar
const isAuthenticated = !!localStorage.getItem('token');

<Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
📦 Build para produção
bash
Copiar
Editar
npm run build