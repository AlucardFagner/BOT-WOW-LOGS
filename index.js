// require('dotenv').config();
// const { 
//     Client, 
//     GatewayIntentBits, 
//     EmbedBuilder, 
//     ActionRowBuilder, 
//     ButtonBuilder, 
//     ButtonStyle, 
//     ModalBuilder, 
//     TextInputBuilder, 
//     TextInputStyle, 
//     StringSelectMenuBuilder 
// } = require('discord.js');
// const axios = require('axios');

// const client = new Client({
//     intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent
//     ]
// });

// const PREFIX = process.env.PREFIX || '!';
// const WCL_API_KEY = process.env.WCL_API_KEY;

// // ==========================================
// // CONFIGURAÇÃO DAS RAIDES (ZONES) DO WOW
// // ==========================================
// // Você pode consultar esses IDs na própria API ou na URL do Warcraft Logs
// const LISTA_DE_RAIDES = [
//     { label: "Palácio Nerub'ar (TWW)", value: "38" },
//     { label: "Libertação de Inframina (TWW)", value: "40" },
//     { label: "Amirdrassil (DF)", value: "35" },
//     { label: "VS/DR/MQD", value: "46" },
//     { label: "Sporefall", value: "50" }
// ];

// client.once('ready', () => {
//     console.log(`🧙‍♂️ Painel Avançado de Logs Online!`);
// });

// function getParseEmoji(percentile) {
//     if (percentile >= 99) return '🟧 (Lendário)';
//     if (percentile >= 95) return '🟪 (Épico)';
//     if (percentile >= 75) return '🟪 (Roxo)';
//     if (percentile >= 50) return '🟦 (Azul)';
//     if (percentile >= 25) return '🟩 (Verde)';
//     return '⬜ (Cinza)';
// }

// // ==========================================
// // 1. CRIANDO O PAINEL FIXO (COMANDO !SETUP)
// // ==========================================
// client.on('messageCreate', async (message) => {
//     if (message.author.bot || !message.content.startsWith(PREFIX)) return;

//     const args = message.content.slice(PREFIX.length).trim().split(/ +/);
//     const command = args.shift().toLowerCase();

//     if (command === 'setup') {
//         await message.delete().catch(() => {});

//         const embedPainel = new EmbedBuilder()
//             .setColor('#f5a623')
//             .setTitle('🏆 WARCRAFT LOGS - FILTRO AVANÇADO 🏆')
//             .setDescription('Consulte seus parses filtrando por **Raide específica** e **Boss específico**. Clique no botão abaixo para iniciar.')
//             .setImage('https://assets.rpglogs.com/images/warcraft/wcl-logo.png')
//             .setFooter({ text: 'Consultas precisas por personagem' });

//         const botaoBuscar = new ButtonBuilder()
//             .setCustomId('abrir_modal_wcl')
//             .setLabel('🔍 Filtrar Meu Parse')
//             .setStyle(ButtonStyle.Primary);

//         const row = new ActionRowBuilder().addComponents(botaoBuscar);
//         message.channel.send({ embeds: [embedPainel], components: [row] });
//     }
// });

// // ==========================================
// // 2. SISTEMA DE INTERAÇÕES MULTI-ESTÁGIOS
// // ==========================================
// client.on('interactionCreate', async (interaction) => {
    
//     // PASSO A: Clicou no botão principal -> Abre o formulário
//     // if (interaction.isButton() && interaction.customId === 'abrir_modal_wcl') {
//     //     const modal = new ModalBuilder()
//     //         .setCustomId('modal_dados_wcl')
//     //         .setTitle('Dados do Personagem');

//     //     const inputNome = new TextInputBuilder()
//     //         .setCustomId('char_name')
//     //         .setLabel('Nome do Personagem:')
//     //         .setStyle(TextInputStyle.Short)
//     //         .setRequired(true);

//     //     const inputServidor = new TextInputBuilder()
//     //         .setCustomId('char_server')
//     //         .setLabel('Servidor (Use hífen se houver espaço):')
//     //         .setStyle(TextInputStyle.Short)
//     //         .setRequired(true);
            

//     //     modal.addComponents(
//     //         new ActionRowBuilder().addComponents(inputNome),
//     //         new ActionRowBuilder().addComponents(inputServidor)
//     //     );
        

//     //     return await interaction.showModal(modal);
//     // }
//     if (interaction.isButton() && interaction.customId === 'abrir_modal_wcl') {
//         const modal = new ModalBuilder()
//             .setCustomId('modal_dados_wcl')
//             .setTitle('Buscar Dados no Warcraft Logs');

//         const inputNome = new TextInputBuilder()
//             .setCustomId('char_name')
//             .setLabel('Nome do Personagem:')
//             .setStyle(TextInputStyle.Short)
//             .setPlaceholder('Ex: Illidan')
//             .setRequired(true);

//         const inputServidor = new TextInputBuilder()
//             .setCustomId('char_server')
//             .setLabel('Servidor (Use hífen se tiver espaço):')
//             .setStyle(TextInputStyle.Short)
//             .setPlaceholder('Ex: Azralon ou Area-52')
//             .setRequired(true);

//         modal.addComponents(
//             new ActionRowBuilder().addComponents(inputNome),
//             new ActionRowBuilder().addComponents(inputServidor)
//         );

//         return await interaction.showModal(modal);
//     }

//     // PASSO B: Enviou o modal -> Apresenta o menu de seleção da RAIDE
//     if (interaction.isModalSubmit() && interaction.customId === 'modal_dados_wcl') {
//         await interaction.deferReply({ ephemeral: true });

//         const charName = interaction.fields.getTextInputValue('char_name').trim();
//         const serverName = interaction.fields.getTextInputValue('char_server').trim();

//         // Menu para selecionar a Raide
//         const selectRaid = new StringSelectMenuBuilder()
//             .setCustomId(`selecionar_raid_${charName}_${serverName}`)
//             .setPlaceholder('Escolha a Raide/Expansão que quer analisar...')
//             .addOptions(LISTA_DE_RAIDES);

//         const embedRaid = new EmbedBuilder()
//             .setColor('#3b82f6')
//             .setTitle(`Raides disponíveis para: ${charName}`)
//             .setDescription('Selecione abaixo qual expansão ou raide você deseja carregar os históricos de logs.');

//         const row = new ActionRowBuilder().addComponents(selectRaid);
//         await interaction.editReply({ embeds: [embedRaid], components: [row] });
//     }

//     // PASSO C: Escolheu a Raide -> Puxa os dados daquela "zone" e mostra os BOSSES
//     if (interaction.isStringSelectMenu() && interaction.customId.startsWith('selecionar_raid_')) {
//         await interaction.deferUpdate();

//         const [,, charName, serverName] = interaction.customId.split('_');
//         const zoneId = interaction.values[0]; 

//         try {
//             // Buscando os dados adicionando o parâmetro &zone= contendo a raide escolhida
//             const url = `https://www.warcraftlogs.com:443/v1/rankings/character/${encodeURIComponent(charName)}/${encodeURIComponent(serverName)}/US?zone=${zoneId}&api_key=${WCL_API_KEY}`;
//             const response = await axios.get(url);
//             const rankings = response.data;

//             if (!rankings || rankings.length === 0) {
//                 return await interaction.editReply({ 
//                     embeds: [new EmbedBuilder().setColor('#ef4444').setTitle('❌ Sem registros').setDescription(`Esse personagem não possui nenhuma luta registrada nessa raide específica.`)]
//                 });
//             }

//             // Cria o menu de seleção de Bosses filtrados
//             const selectBoss = new StringSelectMenuBuilder()
//                 .setCustomId(`selecionar_boss_${charName}_${serverName}_${zoneId}`)
//                 .setPlaceholder('Escolha o Boss para ver a análise cirúrgica...');

//             const bossesAdicionados = new Set();
//             rankings.forEach((rank) => {
//                 if (!bossesAdicionados.has(rank.encounterName) && bossesAdicionados.size < 25) {
//                     bossesAdicionados.add(rank.encounterName);
//                     selectBoss.addOptions({
//                         label: rank.encounterName,
//                         description: `Ver a melhor performance nesse boss`,
//                         value: String(rank.encounterID)
//                     });
//                 }
//             });

//             const targetRaidLabel = LISTA_DE_RAIDES.find(r => r.value === zoneId)?.label || "Raide Selecionada";

//             const embedBoss = new EmbedBuilder()
//                 .setColor('#a855f7')
//                 .setTitle(`⚔️ Raide: ${targetRaidLabel}`)
//                 .setDescription(`Selecione um dos chefes abaixo para detalhar o desempenho de **${charName}**.`);

//             const row = new ActionRowBuilder().addComponents(selectBoss);
//             await interaction.editReply({ embeds: [embedBoss], components: [row] });

//         } catch (error) {
//             console.error(error);
//             await interaction.editReply({ content: '❌ Erro ao buscar os chefes dessa raide.' });
//         }
//     }

//     // PASSO D: Escolheu o Boss -> Mostra a pancada final com os números reais
//     if (interaction.isStringSelectMenu() && interaction.customId.startsWith('selecionar_boss_')) {
//         await interaction.deferUpdate();

//         const [,, charName, serverName, zoneId] = interaction.customId.split('_');
//         const encounterIDSelected = Number(interaction.values[0]);

//         try {
//             const url = `https://www.warcraftlogs.com:443/v1/rankings/character/${encodeURIComponent(charName)}/${encodeURIComponent(serverName)}/US?zone=${zoneId}&api_key=${WCL_API_KEY}`;
//             const response = await axios.get(url);
//             const rankings = response.data;

//             const bossData = rankings.find(rank => rank.encounterID === encounterIDSelected);

//             if (!bossData) {
//                 return await interaction.editReply({ content: '❌ Dados do boss não localizados.' });
//             }

//             const emoji = getParseEmoji(bossData.percentile);
//             const rawAmount = bossData.amount || bossData.total || 0;
//             const dpsHpsFormatted = rawAmount > 0 ? Math.floor(rawAmount).toLocaleString('pt-BR') : 'N/A';

//             const embedFinal = new EmbedBuilder()
//                 .setColor('#22c55e')
//                 .setTitle(`🎯 Análise Final: ${bossData.encounterName}`)
//                 .setDescription(`Análise de raide extraída com precisão cirúrgica.`)
//                 .addFields(
//                     { name: '👤 Player', value: `${charName}-${serverName}`, inline: true },
//                     { name: '🛡️ Spec', value: `**${bossData.spec}** (${bossData.class})`, inline: true },
//                     { name: '📊 Parse Geral', value: `**${Math.floor(bossData.percentile)}%** ${emoji}`, inline: true },
//                     { name: '⚡ DPS / HPS', value: `**${dpsHpsFormatted}**`, inline: true },
//                     { name: '🌍 Posição Rank', value: `#${bossData.rank}`, inline: true },
//                     { name: '👥 Tamanho Raide', value: `${bossData.size} players`, inline: true }
//                 )
//                 .setTimestamp()
//                 .setFooter({ text: 'Filtro por Raide & Boss Ativo' });

//             await interaction.editReply({ embeds: [embedFinal] });

//         } catch (error) {
//             console.error(error);
//         }
//     }
// });

// client.login(process.env.DISCORD_TOKEN);

// require('dotenv').config();
// const { 
//     Client, 
//     GatewayIntentBits, 
//     EmbedBuilder, 
//     ActionRowBuilder, 
//     ButtonBuilder, 
//     ButtonStyle, 
//     ModalBuilder, 
//     TextInputBuilder, 
//     TextInputStyle, 
//     StringSelectMenuBuilder 
// } = require('discord.js');
// const axios = require('axios');

// const client = new Client({
//     intents: [
//         GatewayIntentBits.Guilds,
//         GatewayIntentBits.GuildMessages,
//         GatewayIntentBits.MessageContent
//     ]
// });

// const PREFIX = process.env.PREFIX || '!';
// const WCL_API_KEY = process.env.WCL_API_KEY;

// // ==========================================
// // CONFIGURAÇÃO DAS RAIDES (ZONES) DO WOW
// // ==========================================
// const LISTA_DE_RAIDES = [
//     // ESSA É A NOVA OPÇÃO MÁGICA:
//     { label: "📊 RESUMO DA SEASON: Média Geral (Atual)", value: "summary_current" },
    
//     { label: "Palácio Nerub'ar (TWW)", value: "38" },
//     { label: "Libertação de Inframina (TWW)", value: "40" },
//     { label: "Amirdrassil (DF)", value: "35" }
// ];

// client.once('ready', () => {
//     console.log(`🧙‍♂️ Painel de Logs Avançado com Resumo de Season Online!`);
// });

// function getParseEmoji(percentile) {
//     if (percentile >= 99) return '🟧 (Lendário)';
//     if (percentile >= 95) return '🟪 (Épico)';
//     if (percentile >= 75) return '🟪 (Roxo)';
//     if (percentile >= 50) return '🟦 (Azul)';
//     if (percentile >= 25) return '🟩 (Verde)';
//     return '⬜ (Cinza)';
// }

// // ==========================================
// // 1. CRIANDO O PAINEL FIXO (COMANDO !SETUP)
// // ==========================================
// client.on('messageCreate', async (message) => {
//     if (message.author.bot || !message.content.startsWith(PREFIX)) return;

//     const args = message.content.slice(PREFIX.length).trim().split(/ +/);
//     const command = args.shift().toLowerCase();

//     if (command === 'setup') {
//         await message.delete().catch(() => {});

//         const embedPainel = new EmbedBuilder()
//             .setColor('#f5a623')
//             .setTitle('🏆 WARCRAFT LOGS - SISTEMA DE AUDITORIA 🏆')
//             .setDescription('Monitore o desempenho da guilda. Escolha entre ver a **Média Geral da Season Atual** ou destrinchar raides passadas boss por boss!')
//             .setImage('https://assets.rpglogs.com/images/warcraft/wcl-logo.png')
//             .setFooter({ text: 'Selecione a opção desejada após clicar' });

//         const botaoBuscar = new ButtonBuilder()
//             .setCustomId('abrir_modal_wcl')
//             .setLabel('🔍 Iniciar Consulta')
//             .setStyle(ButtonStyle.Primary);

//         const row = new ActionRowBuilder().addComponents(botaoBuscar);
//         message.channel.send({ embeds: [embedPainel], components: [row] });
//     }
// });

// // ==========================================
// // 2. SISTEMA DE INTERAÇÕES MULTI-ESTÁGIOS
// // ==========================================
// client.on('interactionCreate', async (interaction) => {
    
//     // PASSO A: Clicou no botão principal -> Abre o formulário
//     if (interaction.isButton() && interaction.customId === 'abrir_modal_wcl') {
//         const modal = new ModalBuilder()
//             .setCustomId('modal_dados_wcl')
//             .setTitle('Dados do Personagem');

//         const inputNome = new TextInputBuilder()
//             .setCustomId('char_name')
//             .setLabel('Nome do Personagem:')
//             .setStyle(TextInputStyle.Short)
//             .setRequired(true);

//         const inputServidor = new TextInputBuilder()
//             .setCustomId('char_server')
//             .setLabel('Servidor (Use hífen se houver espaço):')
//             .setStyle(TextInputStyle.Short)
//             .setRequired(true);

//         modal.addComponents(
//             new ActionRowBuilder().addComponents(inputNome),
//             new ActionRowBuilder().addComponents(inputServidor)
//         );

//         return await interaction.showModal(modal);
//     }

//     // PASSO B: Enviou o modal -> Apresenta o menu de seleção da RAIDE / RESUMO
//     if (interaction.isModalSubmit() && interaction.customId === 'modal_dados_wcl') {
//         await interaction.deferReply({ ephemeral: true });

//         const charName = interaction.fields.getTextInputValue('char_name').trim();
//         const serverName = interaction.fields.getTextInputValue('char_server').trim();

//         const selectRaid = new StringSelectMenuBuilder()
//             .setCustomId(`selecionar_raid_${charName}_${serverName}`)
//             .setPlaceholder('Escolha se quer o Resumo Geral ou uma Raide específica...')
//             .addOptions(LISTA_DE_RAIDES);

//         const embedRaid = new EmbedBuilder()
//             .setColor('#3b82f6')
//             .setTitle(`Menu de Opções para: ${charName}`)
//             .setDescription('Selecione a primeira opção para ver o comportamento do player na Season inteira, ou selecione uma raide abaixo para ver lutas específicas.');

//         const row = new ActionRowBuilder().addComponents(selectRaid);
//         await interaction.editReply({ embeds: [embedRaid], components: [row] });
//     }

//     // PASSO C: Escolheu a Raide OU o Resumo Geral
//     if (interaction.isStringSelectMenu() && interaction.customId.startsWith('selecionar_raid_')) {
//         await interaction.deferUpdate();

//         const [,, charName, serverName] = interaction.customId.split('_');
//         const zoneId = interaction.values[0]; 

//         // -------------------------------------------------------------
//         // NOVO SUB-SISTEMA: SE ELE ESCOLHEU O RESUMO DA SEASON ATUAL
//         // -------------------------------------------------------------
//         if (zoneId === 'summary_current') {
//             try {
//                 // Chamada sem passar o parâmetro zone = Puxa automaticamente a season atual inteira
//                 const url = `https://www.warcraftlogs.com:443/v1/rankings/character/${encodeURIComponent(charName)}/${encodeURIComponent(serverName)}/US?api_key=${WCL_API_KEY}`;
//                 const response = await axios.get(url);
//                 const rankings = response.data;

//                 if (!rankings || rankings.length === 0) {
//                     return await interaction.editReply({ 
//                         embeds: [new EmbedBuilder().setColor('#ef4444').setTitle('❌ Sem registros').setDescription(`Esse personagem não possui nenhum log registrado na Season atual.`)]
//                     });
//                 }

//                 let totalPercentile = 0;
//                 let totalDpsHps = 0;
//                 let count = rankings.length;
//                 let bossListText = "";

//                 // Varre todos os bosses que ele matou na season para calcular a média real
//                 rankings.forEach((rank) => {
//                     totalPercentile += rank.percentile;
//                     const rawAmount = rank.amount || rank.total || 0;
//                     totalDpsHps += rawAmount;

//                     // Formata a mini-lista para colocar na descrição do Embed
//                     const emoji = getParseEmoji(rank.percentile);
//                     const parsedNumber = rawAmount > 0 ? Math.floor(rawAmount).toLocaleString('pt-BR') : 'N/A';
//                     // Pega apenas o quadrado colorido do emoji para economizar espaço
//                     const squareEmoji = emoji.split(' ')[0]; 
                    
//                     bossListText += `${squareEmoji} **${rank.encounterName}**: Parse ${Math.floor(rank.percentile)}% | *(DPS/HPS: ${parsedNumber})*\n`;
//                 });

//                 // Matemática das médias aritméticas
//                 const avgPercentile = totalPercentile / count;
//                 const avgDpsHps = totalDpsHps / count;
//                 const emojiGeral = getParseEmoji(avgPercentile);

//                 const embedSummary = new EmbedBuilder()
//                     .setColor('#eab308') // Dourado de conquista
//                     .setTitle(`📊 BALANÇO DE PERFORMANCE: Season Atual`)
//                     .setDescription(`Dados consolidados de todos os chefes enfrentados por **${charName} - ${serverName}**:\n\n${bossListText}`)
//                     .addFields(
//                         { name: '🛡️ Classe / Spec', value: `**${rankings[0].spec}** (${rankings[0].class})`, inline: true },
//                         { name: '📈 Média de Parse', value: `**${Math.floor(avgPercentile)}%** ${emojiGeral}`, inline: true },
//                         { name: '⚡ Média DPS / HPS', value: `**${Math.floor(avgDpsHps).toLocaleString('pt-BR')}**`, inline: true },
//                         { name: '🏰 Progressão Detectada', value: `**${count}** Bosses com registro`, inline: true }
//                     )
//                     .setTimestamp()
//                     .setFooter({ text: 'Análise de Média Geral Calculada com Sucesso' });

//                 // Retorna diretamente a resposta final limpando os componentes (já que não precisa escolher boss)
//                 return await interaction.editReply({ embeds: [embedSummary], components: [] });

//             } catch (error) {
//                 console.error(error);
//                 return await interaction.editReply({ content: '❌ Erro ao processar o balanço da season.' });
//             }
//         }

//         // -------------------------------------------------------------
//         // Lógica antiga (normal): Se escolheu uma Raid específica, lista os bosses
//         // -------------------------------------------------------------
//         try {
//             const url = `https://www.warcraftlogs.com:443/v1/rankings/character/${encodeURIComponent(charName)}/${encodeURIComponent(serverName)}/US?zone=${zoneId}&api_key=${WCL_API_KEY}`;
//             const response = await axios.get(url);
//             const rankings = response.data;

//             if (!rankings || rankings.length === 0) {
//                 return await interaction.editReply({ 
//                     embeds: [new EmbedBuilder().setColor('#ef4444').setTitle('❌ Sem registros').setDescription(`Esse personagem não possui nenhuma luta registrada nessa raide específica.`)]
//                 });
//             }

//             const selectBoss = new StringSelectMenuBuilder()
//                 .setCustomId(`selecionar_boss_${charName}_${serverName}_${zoneId}`)
//                 .setPlaceholder('Escolha o Boss para ver a análise cirúrgica...');

//             const bossesAdicionados = new Set();
//             rankings.forEach((rank) => {
//                 if (!bossesAdicionados.has(rank.encounterName) && bossesAdicionados.size < 25) {
//                     bossesAdicionados.add(rank.encounterName);
//                     selectBoss.addOptions({
//                         label: rank.encounterName,
//                         description: `Ver a melhor performance nesse boss`,
//                         value: String(rank.encounterID)
//                     });
//                 }
//             });

//             const targetRaidLabel = LISTA_DE_RAIDES.find(r => r.value === zoneId)?.label || "Raide Selecionada";

//             const embedBoss = new EmbedBuilder()
//                 .setColor('#a855f7')
//                 .setTitle(`⚔️ Raide: ${targetRaidLabel}`)
//                 .setDescription(`Selecione um dos chefes abaixo para detalhar o desempenho de **${charName}**.`);

//             const row = new ActionRowBuilder().addComponents(selectBoss);
//             await interaction.editReply({ embeds: [embedBoss], components: [row] });

//         } catch (error) {
//             console.error(error);
//             await interaction.editReply({ content: '❌ Erro ao buscar os chefes dessa raide.' });
//         }
//     }

//     // PASSO D: Escolheu o Boss específico (Mantido idêntico)
//     if (interaction.isStringSelectMenu() && interaction.customId.startsWith('selecionar_boss_')) {
//         await interaction.deferUpdate();

//         const [,, charName, serverName, zoneId] = interaction.customId.split('_');
//         const encounterIDSelected = Number(interaction.values[0]);

//         try {
//             const url = `https://www.warcraftlogs.com:443/v1/rankings/character/${encodeURIComponent(charName)}/${encodeURIComponent(serverName)}/US?zone=${zoneId}&api_key=${WCL_API_KEY}`;
//             const response = await axios.get(url);
//             const rankings = response.data;

//             const bossData = rankings.find(rank => rank.encounterID === encounterIDSelected);

//             if (!bossData) {
//                 return await interaction.editReply({ content: '❌ Dados do boss não localizados.' });
//             }

//             const emoji = getParseEmoji(bossData.percentile);
//             const rawAmount = bossData.amount || bossData.total || 0;
//             const dpsHpsFormatted = rawAmount > 0 ? Math.floor(rawAmount).toLocaleString('pt-BR') : 'N/A';

//             const embedFinal = new EmbedBuilder()
//                 .setColor('#22c55e')
//                 .setTitle(`🎯 Análise Final: ${bossData.encounterName}`)
//                 .setDescription(`Análise de raide extraída com precisão cirúrgica.`)
//                 .addFields(
//                     { name: '👤 Player', value: `${charName}-${serverName}`, inline: true },
//                     { name: '🛡️ Spec', value: `**${bossData.spec}** (${bossData.class})`, inline: true },
//                     { name: '📊 Parse Geral', value: `**${Math.floor(bossData.percentile)}%** ${emoji}`, inline: true },
//                     { name: '⚡ DPS / HPS', value: `**${dpsHpsFormatted}**`, inline: true },
//                     { name: '🌍 Posição Rank', value: `#${bossData.rank}`, inline: true },
//                     { name: '👥 Tamanho Raide', value: `${bossData.size} players`, inline: true }
//                 )
//                 .setTimestamp()
//                 .setFooter({ text: 'Filtro por Raide & Boss Ativo' });

//             await interaction.editReply({ embeds: [embedFinal] });

//         } catch (error) {
//             console.error(error);
//         }
//     }
// });

// client.login(process.env.DISCORD_TOKEN);

require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    StringSelectMenuBuilder 
} = require('discord.js');
const axios = require('axios');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = process.env.PREFIX || '!';
const WCL_API_KEY = process.env.WCL_API_KEY;

// ==========================================
// CONFIGURAÇÃO DAS RAIDES (ZONES) DO WOW
// ==========================================
const LISTA_DE_RAIDES = [
    { label: "📊 RESUMO DA SEASON: Média Geral (Atual)", value: "summary_current" },
    { label: "Palácio Nerub'ar (TWW)", value: "38" },
    { label: "Libertação de Inframina (TWW)", value: "40" },
    { label: "Amirdrassil (DF)", value: "35" }
];

client.once('ready', () => {
    console.log(`🧙‍♂️ Painel de Logs Avançado com Best Perf. Avg Online!`);
});

function getParseEmoji(percentile) {
    if (percentile >= 99) return '🟧 (Lendário)';
    if (percentile >= 95) return '🟪 (Épico)';
    if (percentile >= 75) return '🟪 (Roxo)';
    if (percentile >= 50) return '🟦 (Azul)';
    if (percentile >= 25) return '🟩 (Verde)';
    return '⬜ (Cinza)';
}

// ==========================================
// 1. CRIANDO O PAINEL FIXO (COMANDO !SETUP)
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'setup') {
        await message.delete().catch(() => {});

        const embedPainel = new EmbedBuilder()
            .setColor('#f5a623')
            .setTitle('🏆 WARCRAFT LOGS - SISTEMA DE AUDITORIA 🏆')
            .setDescription('Monitore o desempenho da guilda. Escolha entre ver o **Best Perf. Avg da Season Atual** ou destrinchar raides passadas boss por boss!')
            .setImage('https://assets.rpglogs.com/images/warcraft/wcl-logo.png')
            .setFooter({ text: 'Selecione a opção desejada após clicar' });

        const botaoBuscar = new ButtonBuilder()
            .setCustomId('abrir_modal_wcl')
            .setLabel('🔍 Iniciar Consulta')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(botaoBuscar);
        message.channel.send({ embeds: [embedPainel], components: [row] });
    }
});

// ==========================================
// 2. SISTEMA DE INTERAÇÕES MULTI-ESTÁGIOS
// ==========================================
client.on('interactionCreate', async (interaction) => {
    
    // if (interaction.isButton() && interaction.customId === 'abrir_modal_wcl') {
    //     const modal = new ModalBuilder()
    //         .setCustomId('modal_dados_wcl')
    //         .setTitle('Dados do Personagem');

    //     const inputNome = new TextInputBuilder()
    //         .setCustomId('char_name')
    //         .setLabel('Nome do Personagem:')
    //         .setStyle(TextInputStyle.Short)
    //         .setRequired(true);

    //     const inputServidor = new TextInputBuilder()
    //         .setCustomId('char_server')
    //         .setLabel('Servidor (Use hífen se houver espaço):')
    //         .setStyle(TextInputStyle.Short)
    //         .setRequired(true);

    //     modal.addComponents(
    //         new ActionRowBuilder().addComponents(inputNome),
    //         new ActionRowBuilder().addComponents(inputServidor)
    //     );

    //     return await interaction.showModal(modal);
    // }
    if (interaction.isButton() && interaction.customId === 'abrir_modal_wcl') {
        const modal = new ModalBuilder()
            .setCustomId('modal_dados_wcl')
            .setTitle('Buscar Dados no Warcraft Logs');

        const inputNome = new TextInputBuilder()
            .setCustomId('char_name')
            .setLabel('Nome do Personagem:')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Illidan')
            .setRequired(true);

        const inputServidor = new TextInputBuilder()
            .setCustomId('char_server')
            .setLabel('Servidor (Use hífen se tiver espaço):')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Azralon ou Area-52')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(inputNome),
            new ActionRowBuilder().addComponents(inputServidor)
        );

        return await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_dados_wcl') {
        await interaction.deferReply({ ephemeral: true });

        const charName = interaction.fields.getTextInputValue('char_name').trim();
        const serverName = interaction.fields.getTextInputValue('char_server').trim();

        const selectRaid = new StringSelectMenuBuilder()
            .setCustomId(`selecionar_raid_${charName}_${serverName}`)
            .setPlaceholder('Escolha se quer o Resumo Geral ou uma Raide específica...')
            .addOptions(LISTA_DE_RAIDES);

        const embedRaid = new EmbedBuilder()
            .setColor('#3b82f6')
            .setTitle(`Menu de Opções para: ${charName}`)
            .setDescription('Selecione a primeira opção para ver o comportamento do player na Season inteira, ou selecione uma raide abaixo para ver lutas específicas.');

        const row = new ActionRowBuilder().addComponents(selectRaid);
        await interaction.editReply({ embeds: [embedRaid], components: [row] });
    }

    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('selecionar_raid_')) {
        await interaction.deferUpdate();

        const [,, charName, serverName] = interaction.customId.split('_');
        const zoneId = interaction.values[0]; 

        // -------------------------------------------------------------
        // SUB-SISTEMA: RESUMO DA SEASON ATUAL (COM BEST PERF. AVG DECIMAL)
        // -------------------------------------------------------------
        if (zoneId === 'summary_current') {
            try {
                const url = `https://www.warcraftlogs.com:443/v1/rankings/character/${encodeURIComponent(charName)}/${encodeURIComponent(serverName)}/US?api_key=${WCL_API_KEY}`;
                const response = await axios.get(url);
                const rankings = response.data;

                if (!rankings || rankings.length === 0) {
                    return await interaction.editReply({ 
                        embeds: [new EmbedBuilder().setColor('#ef4444').setTitle('❌ Sem registros').setDescription(`Esse personagem não possui nenhum log registrado na Season atual.`)]
                    });
                }

                let totalPercentile = 0;
                let totalDpsHps = 0;
                let count = rankings.length;
                let bossListText = "";

                rankings.forEach((rank) => {
                    totalPercentile += rank.percentile;
                    const rawAmount = rank.amount || rank.total || 0;
                    totalDpsHps += rawAmount;

                    const emoji = getParseEmoji(rank.percentile);
                    const parsedNumber = rawAmount > 0 ? Math.floor(rawAmount).toLocaleString('pt-BR') : 'N/A';
                    const squareEmoji = emoji.split(' ')[0]; 
                    
                    // Mostra as notas individuais de cada boss com uma casa decimal também pra ficar padrão
                    bossListText += `${squareEmoji} **${rank.encounterName}**: Parse **${rank.percentile.toFixed(1)}%** | *(DPS/HPS: ${parsedNumber})*\n`;
                });

                // O PULO DO GATO: Cálculo com uma casa decimal idêntico ao site (.toFixed(1))
                const avgPercentile = totalPercentile / count;
                const bestPerfAvgFormatted = avgPercentile.toFixed(1); 
                
                const avgDpsHps = totalDpsHps / count;
                const emojiGeral = getParseEmoji(avgPercentile);

                const embedSummary = new EmbedBuilder()
                    .setColor('#eab308') 
                    .setTitle(`📊 BALANÇO DE PERFORMANCE: Season Atual`)
                    .setDescription(`Dados consolidados de todos os chefes enfrentados por **${charName} - ${serverName}**:\n\n${bossListText}`)
                    .addFields(
                        { name: '🛡️ Classe / Spec', value: `**${rankings[0].spec}** (${rankings[0].class})`, inline: true },
                        { name: '⭐ Best Perf. Avg', value: `**${bestPerfAvgFormatted}%** ${emojiGeral}`, inline: true },
                        { name: '⚡ Média DPS / HPS', value: `**${Math.floor(avgDpsHps).toLocaleString('pt-BR')}**`, inline: true },
                        { name: '🏰 Progressão Detectada', value: `**${count}** Bosses com registro`, inline: true }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Métricas sincronizadas com o Warcraft Logs' });

                return await interaction.editReply({ embeds: [embedSummary], components: [] });

            } catch (error) {
                console.error(error);
                return await interaction.editReply({ content: '❌ Erro ao processar o balanço da season.' });
            }
        }

        // Lógica normal para listar os bosses de uma Raid específica
        try {
            const url = `https://www.warcraftlogs.com:443/v1/rankings/character/${encodeURIComponent(charName)}/${encodeURIComponent(serverName)}/US?zone=${zoneId}&api_key=${WCL_API_KEY}`;
            const response = await axios.get(url);
            const rankings = response.data;

            if (!rankings || rankings.length === 0) {
                return await interaction.editReply({ 
                    embeds: [new EmbedBuilder().setColor('#ef4444').setTitle('❌ Sem registros').setDescription(`Esse personagem não possui nenhuma luta registrada nessa raide específica.`)]
                });
            }

            const selectBoss = new StringSelectMenuBuilder()
                .setCustomId(`selecionar_boss_${charName}_${serverName}_${zoneId}`)
                .setPlaceholder('Escolha o Boss para ver a análise cirúrgica...');

            const bossesAdicionados = new Set();
            rankings.forEach((rank) => {
                if (!bossesAdicionados.has(rank.encounterName) && bossesAdicionados.size < 25) {
                    bossesAdicionados.add(rank.encounterName);
                    selectBoss.addOptions({
                        label: rank.encounterName,
                        description: `Ver a melhor performance nesse boss`,
                        value: String(rank.encounterID)
                    });
                }
            });

            const targetRaidLabel = LISTA_DE_RAIDES.find(r => r.value === zoneId)?.label || "Raide Selecionada";

            const embedBoss = new EmbedBuilder()
                .setColor('#a855f7')
                .setTitle(`⚔️ Raide: ${targetRaidLabel}`)
                .setDescription(`Selecione um dos chefes abaixo para detalhar o desempenho de **${charName}**.`);

            const row = new ActionRowBuilder().addComponents(selectBoss);
            await interaction.editReply({ embeds: [embedBoss], components: [row] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Erro ao buscar os chefes dessa raide.' });
        }
    }

    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('selecionar_boss_')) {
        await interaction.deferUpdate();

        const [,, charName, serverName, zoneId] = interaction.customId.split('_');
        const encounterIDSelected = Number(interaction.values[0]);

        try {
            const url = `https://www.warcraftlogs.com:443/v1/rankings/character/${encodeURIComponent(charName)}/${encodeURIComponent(serverName)}/US?zone=${zoneId}&api_key=${WCL_API_KEY}`;
            const response = await axios.get(url);
            const rankings = response.data;

            const bossData = rankings.find(rank => rank.encounterID === encounterIDSelected);

            if (!bossData) {
                return await interaction.editReply({ content: '❌ Dados do boss não localizados.' });
            }

            const emoji = getParseEmoji(bossData.percentile);
            const rawAmount = bossData.amount || bossData.total || 0;
            const dpsHpsFormatted = rawAmount > 0 ? Math.floor(rawAmount).toLocaleString('pt-BR') : 'N/A';

            const embedFinal = new EmbedBuilder()
                .setColor('#22c55e')
                .setTitle(`🎯 Análise Final: ${bossData.encounterName}`)
                .setDescription(`Análise de raide extraída com precisão cirúrgica.`)
                .addFields(
                    { name: '👤 Player', value: `${charName}-${serverName}`, inline: true },
                    { name: '🛡️ Spec', value: `**${bossData.spec}** (${bossData.class})`, inline: true },
                    { name: '📊 Parse Geral', value: `**${bossData.percentile.toFixed(1)}%** ${emoji}`, inline: true },
                    { name: '⚡ DPS / HPS', value: `**${dpsHpsFormatted}**`, inline: true },
                    { name: '🌍 Posição Rank', value: `#${bossData.rank}`, inline: true },
                    { name: '👥 Tamanho Raide', value: `${bossData.size} players`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Filtro por Raide & Boss Ativo' });

            await interaction.editReply({ embeds: [embedFinal] });

        } catch (error) {
            console.error(error);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);