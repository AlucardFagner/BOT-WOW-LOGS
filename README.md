⚔️ WCL-Guild-Auditor-Bot (API v2 GraphQL)
Este é um bot de Discord de alta performance projetado para realizar auditorias de raide em tempo real. Ele utiliza a API v2 do Warcraft Logs (GraphQL) para extrair dados precisos de performance (Spec Parse), comparativos de season e registros históricos de personagens.

🚀 Funcionalidades
Consulta via GraphQL: Extração de dados otimizada e rápida.

Aba Histórica (ALL): Auditoria baseada no melhor desempenho histórico da Spec.

Resumo de Season: Comparativo entre o histórico global e o desempenho no patch atual.

Interface Interativa: Uso de modais e menus de seleção nativos do Discord.js.

🛠️ Tecnologias
Node.js

Discord.js (v14+)

Axios (para requisições OAuth2 e GraphQL)

Warcraft Logs API v2 (GraphQL)

📋 Pré-requisitos
Antes de rodar, certifique-se de ter:

Node.js instalado na máquina.

Um Client ID e Client Secret gerados na aba "Web API" das suas configurações no site Warcraft Logs.

Um token do seu bot criado no Discord Developer Portal.

⚙️ Configuração
Clone este repositório:

Bash
git clone https://github.com/AlucardFagner/BOT-WOW-LOGS
Instale as dependências:

Bash
npm install discord.js axios dotenv
Crie um arquivo .env na raiz do projeto com as seguintes chaves:

Snippet de código
DISCORD_TOKEN=seu_token_do_discord
PREFIX=!
WCL_CLIENT_ID=seu_client_id_do_wcl
WCL_CLIENT_SECRET=seu_client_secret_do_wcl
Inicie o bot:

Bash
node index.js
🎮 Como Usar
No canal do Discord, digite !setup.

O bot enviará um painel fixo.

Clique em "Iniciar Auditoria V2" e preencha os dados do personagem e servidor.

Escolha entre o Resumo Geral ou selecione uma Raide específica para ver a análise detalhada de cada boss.

📜 Licença
Este projeto é de código aberto e está sob a licença MIT.

Dica de amigo: Se você quiser que o bot fique online 24/7 sem precisar deixar seu PC ligado, recomendo hospedar em plataformas como a Discloud ou Render.