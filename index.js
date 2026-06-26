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
const CLIENT_ID = process.env.WCL_CLIENT_ID;
const CLIENT_SECRET = process.env.WCL_CLIENT_SECRET;

const MAPA_CLASSES = {
    1: "Warrior", 2: "Paladin", 3: "Hunter", 4: "Rogue", 5: "Priest", 
    6: "Death Knight", 7: "Shaman", 8: "Mage", 9: "Warlock", 10: "Monk", 
    11: "Druid", 12: "Demon Hunter", 13: "Evoker"
};

// 1. Atualizamos a lista de opções do Menu
const LISTA_DE_RAIDES = [
    { label: "📊 RESUMO DA SEASON: Comparativo Completo", value: "summary_current" },
    { label: "Sporefall", value: "50" },
    { label: "VS / DR / MQD", value: "46" }
];

let tokenAutenticacao = null;
let tokenExpiracao = 0;

async function obterTokenWCL() {
    if (tokenAutenticacao && Date.now() < tokenExpiracao) {
        return tokenAutenticacao;
    }
    try {
        const resposta = await axios.post('https://www.warcraftlogs.com/oauth/token', 
            new URLSearchParams({ grant_type: 'client_credentials' }), 
            {
                auth: { username: CLIENT_ID, password: CLIENT_SECRET },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );
        tokenAutenticacao = resposta.data.access_token;
        tokenExpiracao = Date.now() + (resposta.data.expires_in - 60) * 1000;
        return tokenAutenticacao;
    } catch (error) {
        console.error("❌ Erro de autenticação OAuth2 no Warcraft Logs:", error.message);
        throw error;
    }
}

async function requisicaoGraphQL(query, variables) {
    const token = await obterTokenWCL();
    const resposta = await axios.post('https://www.warcraftlogs.com/api/v2/client', 
        { query, variables },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return resposta.data;
}

client.once('ready', () => {
    console.log(`🧙‍♂️ Bot atualizado com Sucesso (IDs: 50 e 46)!`);
});

function getParseEmoji(percentile) {
    const p = Number(percentile);
    if (p >= 99) return '🟧 (Lendário)';
    if (p >= 95) return '🟪 (Épico)';
    if (p >= 75) return '🟪 (Roxo)';
    if (p >= 50) return '🟦 (Azul)';
    if (p >= 25) return '🟩 (Verde)';
    return '⬜ (Cinza)';
}

// ==========================================
// PAINEL FIXO DE CHAMADA (!SETUP)
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'setup') {
        await message.delete().catch(() => {});

        const embedPainel = new EmbedBuilder()
            .setColor('#10b981')
            .setTitle('🏆 WARCRAFT LOGS - SISTEMA GRAPHQL V2 🏆')
            .setDescription('Auditoria de guilda instantânea. Extraindo a aba histórica **ALL (Spec Parse)** e o **Patch Atual** em tempo real!')
            .setImage('https://assets.rpglogs.com/images/warcraft/wcl-logo.png')
            .setFooter({ text: 'Modo de Conexão Segura Ativo' });

        const botaoBuscar = new ButtonBuilder()
            .setCustomId('abrir_modal_wcl')
            .setLabel('🔍 Iniciar Auditoria V2')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(botaoBuscar);
        message.channel.send({ embeds: [embedPainel], components: [row] });
    }
});

// ==========================================
// INTERAÇÕES DO BOT (MODAL E MENUS)
// ==========================================
client.on('interactionCreate', async (interaction) => {
    
    if (interaction.isButton() && interaction.customId === 'abrir_modal_wcl') {
        const modal = new ModalBuilder().setCustomId('modal_dados_wcl').setTitle('Dados do Personagem');
        const inputNome = new TextInputBuilder().setCustomId('char_name').setLabel('Nome do Personagem:').setStyle(TextInputStyle.Short).setRequired(true);
        const inputServidor = new TextInputBuilder().setCustomId('char_server').setLabel('Servidor (Ex: Gallywix, Azralon):').setStyle(TextInputStyle.Short).setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(inputNome), new ActionRowBuilder().addComponents(inputServidor));
        return await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'modal_dados_wcl') {
        await interaction.deferReply({ ephemeral: true });

        const charName = interaction.fields.getTextInputValue('char_name').trim();
        const serverInput = interaction.fields.getTextInputValue('char_server').trim();
        const serverSlug = serverInput.toLowerCase().replace(/\s+/g, '-');

        const selectRaid = new StringSelectMenuBuilder()
            .setCustomId(`selecionar_raid_${charName}_${serverSlug}`)
            .setPlaceholder('Escolha se quer o Resumo Geral ou uma Raide...')
            .addOptions(LISTA_DE_RAIDES);

        const embedRaid = new EmbedBuilder()
            .setColor('#3b82f6')
            .setTitle(`Menu de Opções para: ${charName}`)
            .setDescription('Selecione uma das opções abaixo para executar a consulta de dados.');

        const row = new ActionRowBuilder().addComponents(selectRaid);
        await interaction.editReply({ embeds: [embedRaid], components: [row] });
    }

    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('selecionar_raid_')) {
        await interaction.deferUpdate();

        const [,, charName, serverSlug] = interaction.customId.split('_');
        const zoneId = interaction.values[0]; 

        // -------------------------------------------------------------
        // RESUMO COMPLETO DA SEASON ATUAL
        // -------------------------------------------------------------
        if (zoneId === 'summary_current') {
            try {
                // 2. Query atualizada apenas com os IDs 50 e 46
                const queryRaidSummary = `
                query ($name: String!, $slug: String!, $region: String!) {
                  characterData {
                    character(name: $name, serverSlug: $slug, serverRegion: $region) {
                      classID
                      r50_all: zoneRankings(zoneID: 50, difficulty: 4, partition: 0)
                      r50_cur: zoneRankings(zoneID: 50, difficulty: 4)
                      r46_all: zoneRankings(zoneID: 46, difficulty: 4, partition: 0)
                      r46_cur: zoneRankings(zoneID: 46, difficulty: 4)
                    }
                  }
                }`;

                const resposta = await requisicaoGraphQL(queryRaidSummary, { name: charName, slug: serverSlug, region: 'US' });
                
                if (resposta.errors) {
                    console.error("Erros do GraphQL:", JSON.stringify(resposta.errors));
                    return await interaction.editReply({ content: '❌ O servidor do Warcraft Logs recusou a query estruturada.' });
                }

                const charData = resposta?.data?.characterData?.character;

                if (!charData) {
                    return await interaction.editReply({ 
                        embeds: [new EmbedBuilder().setColor('#ef4444').setTitle('❌ Player não encontrado').setDescription(`Nenhum dado localizado para o personagem **${charName}** no servidor **${serverSlug}**.`)]
                    });
                }

                console.log(charData.classID)
                // const nomeClasse = MAPA_CLASSES[charData.classID] || "Desconhecida";

                const embedSummary = new EmbedBuilder()
                    .setColor('#eab308')
                    .setTitle(`📊 RAIO-X DE PERFORMANCE DE GUILDA (HEROICO V2)`)
                    .setDescription(`👤 **Jogador:** **${charName} - ${serverSlug.toUpperCase()}**\n\nExibindo comparativos reais baseados em Spec Percentile:`) // Removi a linha da Classe
                    .setTimestamp()
                    .setFooter({ text: 'Alimentado via Warcraft Logs GraphQL API v2' });

                let possuiAlgumDado = false;

                // 3. Mapeamento linkando as variáveis novas da Query para exibir no Discord
                const mapeamentoRaides = [
                    { label: "Sporefall", all: charData.r50_all, cur: charData.r50_cur },
                    { label: "VS / DR / MQD", all: charData.r46_all, cur: charData.r46_cur }
                ];

                mapeamentoRaides.forEach((raid) => {
                    const rankingsAll = raid.all?.rankings || [];
                    const rankingsCur = raid.cur?.rankings || [];

                    if (rankingsAll.length === 0 && rankingsCur.length === 0) return;
                    possuiAlgumDado = true;

                    const avgAll = raid.all?.bestPerformanceAverage ? raid.all.bestPerformanceAverage.toFixed(1) : "0.0";
                    let listaBossesAll = "";
                    
                    rankingsAll.forEach(r => {
                        const nota = r.rankPercent || r.historicalPercent || 0;
                        const emoji = getParseEmoji(nota);
                        const square = emoji.split(' ')[0];
                        const nomeBoss = r.encounter?.name || "Boss Oculto";
                        listaBossesAll += `${square} *${nomeBoss}:* **${nota.toFixed(1)}%**\n`;
                    });

                    const avgCur = raid.cur?.bestPerformanceAverage ? raid.cur.bestPerformanceAverage.toFixed(1) : "0.0";
                    const totalKillsCur = rankingsCur.length;

                    embedSummary.addFields({
                        name: `🏰 ${raid.label}`,
                        value: `🌐 **Histórico Global (Aba ALL):**\n⭐ *Best Perf. Avg:* \`${avgAll}%\` ${getParseEmoji(avgAll)}\n💀 *Bosses Derrotados:* \`${rankingsAll.length}\`\n\n` +
                               `✨ **No Patch Atual:**\n⭐ *Best Perf. Avg:* \`${avgCur}%\` ${getParseEmoji(avgCur)}\n💀 *Kills Registrados:* \`${totalKillsCur}\`\n\n` +
                               `📋 **Progresso Detalhado (Melhores Notas Históricas da Spec):**\n${listaBossesAll || '*Sem bosses detalhados*'}\n━`.trim(),
                        inline: false
                    });
                });

                if (!possuiAlgumDado) {
                    return await interaction.editReply({ content: '❌ Este personagem possui a ficha limpa (sem nenhum log gravado no Heroico).' });
                }

                return await interaction.editReply({ embeds: [embedSummary], components: [] });

            } catch (err) {
                console.error(err);
                return await interaction.editReply({ content: '❌ Falha de conexão. Verifique o console do bot.' });
            }
        }

        // -------------------------------------------------------------
        // CARREGAMENTO DE BOSS INDIVIDUAL
        // -------------------------------------------------------------
        try {
            const querySingleZone = `
            query ($name: String!, $slug: String!, $region: String!, $zoneID: Int!) {
              characterData {
                character(name: $name, serverSlug: $slug, serverRegion: $region) {
                  zoneRankings(zoneID: $zoneID, difficulty: 4, partition: 0)
                }
              }
            }`;

            const resposta = await requisicaoGraphQL(querySingleZone, { name: charName, slug: serverSlug, region: 'US', zoneID: Number(zoneId) });
            const rankings = resposta?.data?.characterData?.character?.zoneRankings?.rankings || [];

            if (rankings.length === 0) {
                return await interaction.editReply({ 
                    embeds: [new EmbedBuilder().setColor('#ef4444').setTitle('❌ Sem registros').setDescription(`Esse personagem não possui logs Heroicos cadastrados nessa raide.`)]
                });
            }

            const selectBoss = new StringSelectMenuBuilder()
                .setCustomId(`selecionar_boss_${charName}_${serverSlug}_${zoneId}`)
                .setPlaceholder('Escolha o Boss Heroico para ver a análise detalhada...');

            rankings.forEach((r) => {
                const nota = r.rankPercent || r.historicalPercent || 0;
                selectBoss.addOptions({
                    label: r.encounter?.name || "Boss Oculto",
                    description: `Maior Spec Parse obtido: ${nota.toFixed(1)}%`,
                    value: String(r.encounter?.id)
                });
            });

            const targetRaidLabel = LISTA_DE_RAIDES.find(r => r.value === zoneId)?.label || "Raide Selecionada";
            const embedBoss = new EmbedBuilder()
                .setColor('#a855f7')
                .setTitle(`⚔️ Raide: ${targetRaidLabel} (Heroico)`)
                .setDescription(`Selecione um chefe para auditar os recordes históricos de **${charName}**.`);

            const row = new ActionRowBuilder().addComponents(selectBoss);
            await interaction.editReply({ embeds: [embedBoss], components: [row] });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: '❌ Erro ao listar chefes via GraphQL.' });
        }
    }

    // -------------------------------------------------------------
    // EXIBIÇÃO FINAL DO BOSS SELECIONADO
    // -------------------------------------------------------------
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('selecionar_boss_')) {
        await interaction.deferUpdate();

        const [,, charName, serverSlug, zoneId] = interaction.customId.split('_');
        const encounterIDSelected = Number(interaction.values[0]);

        try {
            const querySingleZone = `
            query ($name: String!, $slug: String!, $region: String!, $zoneID: Int!) {
              characterData {
                character(name: $name, serverSlug: $slug, serverRegion: $region) {
                  zoneRankings(zoneID: $zoneID, difficulty: 4, partition: 0)
                }
              }
            }`;

            const resposta = await requisicaoGraphQL(querySingleZone, { name: charName, slug: serverSlug, region: 'US', zoneID: Number(zoneId) });
            const rankings = resposta?.data?.characterData?.character?.zoneRankings?.rankings || [];
            const bossData = rankings.find(r => r.encounter?.id === encounterIDSelected);

            if (!bossData) {
                return await interaction.editReply({ content: '❌ Não foi possível extrair os dados desse boss.' });
            }

            const percent = bossData.rankPercent || bossData.historicalPercent || 0;
            const emoji = getParseEmoji(percent);
            const rawAmount = bossData.bestAmount || 0;
            const dpsHpsFormatted = rawAmount > 0 ? Math.floor(rawAmount).toLocaleString('pt-BR') : 'N/A';

            const embedFinal = new EmbedBuilder()
                .setColor('#22c55e')
                .setTitle(`🎯 Registro Histórico: ${bossData.encounter?.name}`)
                .setDescription(`Melhor performance absoluta computada contra a sua própria Spec na season.`)
                .addFields(
                    { name: '👤 Jogador', value: `${charName}-${serverSlug.toUpperCase()}`, inline: true },
                    { name: '📊 Maior Spec Parse', value: `**${percent.toFixed(1)}%** ${emoji}`, inline: true },
                    { name: '⚡ Recorde DPS / HPS', value: `**${dpsHpsFormatted}**`, inline: true },
                    { name: '🌍 Colocação Global', value: `#${bossData.rank || 'N/A'}`, inline: true },
                    { name: '💀 Kills Totais', value: `${bossData.totalKills || 0} eliminação(ões)`, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Dados puros validados via API v2 GraphQL' });

            await interaction.editReply({ embeds: [embedFinal] });

        } catch (error) {
            console.error(error);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);