require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Embed } = require('discord.js');

const client = new Client(
    {
        intents: [GatewayIntentBits.GuildMembers,
            GatewayIntentBits.Guilds,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessages
        ]
    }
);

const quests = [
    { id: 1,  question: 'What is the name of the powerful being who wanted to rule everything?', answer: 'morvath', reward: 10 },
    { id: 2,  question: 'What is the name of the dark soul-stealing sword Morvath created?', answer: 'lagota', reward: 10 },
    { id: 3,  question: 'What did Morvath sacrifice to power the Lagota?', answer: 'gloamhusks', reward: 10 },
    { id: 4,  question: 'Who did Morvath use the Lagota to attack?', answer: 'great one', reward: 10 },
    { id: 5,  question: 'What happened to the stars and worlds during their fight?', answer: 'broke', reward: 10 },
    { id: 6,  question: 'Who won the battle between Morvath and the Great One?', answer: 'great one', reward: 10 },
    { id: 7,  question: 'Where was Morvath smashed back down to after his defeat?', answer: 'duskmoor', reward: 10 },
    { id: 8,  question: "Why did Morvath's sword explode?", answer: 'souls', reward: 10 },
    { id: 9,  question: "What is the name of the ghostly curse Morvath's spirit became?", answer: 'withered echo', reward: 10 },
    { id: 10, question: 'How does The Withered Echo torment people?', answer: 'wind', reward: 10 },
    { id: 11, question: 'What is the event called that caused the chain reaction ruining three kingdoms?', answer: 'great expulsion', reward: 10 },
    { id: 12, question: 'Name one of the three gods who lost their divine status.', answer: ['seraphine', 'nyxar', 'solmara'], reward: 10 },
    { id: 13, question: 'What happened to the three gods as a consequence?', answer: 'mortal', reward: 10 },
    { id: 14, question: 'Who shaped the Great One?', answer: ['no one', 'formless'], reward: 10 },
    { id: 15, question: 'What two beings did the Great One create?', answer: ['soul-less', 'spright'], reward: 10 },
    { id: 16, question: 'Which realms did the Spright create?', answer: ['astravale', 'umbrafall'], reward: 10 },
    { id: 17, question: 'Which realms did the Soul-less create?', answer: ['duskmoor', 'dawnmoor'], reward: 10 },
    { id: 18, question: 'Who rules Umbrafall?', answer: 'nyxar', reward: 10 },
    { id: 19, question: 'What does the Keen Keeper use to record deeds?', answer: 'star etcher', reward: 10 },
    { id: 20, question: 'What is the role of the Gremlin Seer?', answer: 'watcher', reward: 10 },
];

const userQuests = {};
const userExp = {};
const userDesc = {};
const userColor = {};
const userQuestHistory = {};
const userWrongAttempts = {};
const awaitingName = new Set();
const awaitingDesc = new Set();
const awaitingColor = new Set();

function getDailyQuests(userId) {
    const today = new Date().toDateString();

    if (userQuests[userId] && userQuests[userId].date === today) {
        return userQuests[userId].quests;
    }

    const shuffled = [...quests].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5).map(q => ({
        ...q,
        completed: false
    }));

    userQuests[userId] = { date: today, quests: selected };
    return selected;
}

function getLevel(exp) {
    if (exp >= 2000) return { level: 20, threshold: 2000, next: null };
    else if (exp >= 1900) return { level: 19, threshold: 1900, next: 2000 };
    else if (exp >= 1800) return { level: 18, threshold: 1800, next: 1900 };
    else if (exp >= 1700) return { level: 17, threshold: 1700, next: 1800 };
    else if (exp >= 1600) return { level: 16, threshold: 1600, next: 1700 };
    else if (exp >= 1500) return { level: 15, threshold: 1500, next: 1600 };
    else if (exp >= 1400) return { level: 14, threshold: 1400, next: 1500 };
    else if (exp >= 1300) return { level: 13, threshold: 1300, next: 1400 };
    else if (exp >= 1200) return { level: 12, threshold: 1200, next: 1300 };
    else if (exp >= 1100) return { level: 11, threshold: 1100, next: 1200 };
    else if (exp >= 1000) return { level: 10, threshold: 1000, next: 1100 };
    else if (exp >= 900) return { level: 9, threshold: 900, next: 1000 };
    else if (exp >= 800) return { level: 8, threshold: 800, next: 900 };
    else if (exp >= 700) return { level: 7, threshold: 700, next: 800 };
    else if (exp >= 600) return { level: 6, threshold: 600, next: 700 };
    else if (exp >= 500) return { level: 5, threshold: 500, next: 600 };
    else if (exp >= 400) return { level: 4, threshold: 400, next: 500 };
    else if (exp >= 300) return { level: 3, threshold: 300, next: 400 };
    else if (exp >= 200) return { level: 2, threshold: 200, next: 300 };
    else if (exp >= 100) return { level: 1, threshold: 100, next: 200 };
    else return { level: 0, threshold: 0, next: 100 };
}

client.on('clientReady', () => {
    console.log(`Your bot ${client.user.username} is up and running!`);
    client.user.setPresence({ status: 'online' });
});

const commands = ['god is good', 'i seek guidance', 'i seek quests', 'i seek my level', 'i seek info', 'I wish to be reborn', 'i seek my description', 'set color'];

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // GOD IS GOOD
    if (message.content.toLowerCase() === 'god is good') {
        message.reply('He truly is.');
    }

    // HELP
    if (message.content.toLowerCase() === 'i seek guidance') {
        const embed = new EmbedBuilder()
            .setTitle('The Great One Speaks.')
            .setDescription('*"You have sought guidance. Here is what has been written."*')
            .setFields(
                { name: '⏫ LEVELs', value: `**I seek my level** : shows your current level.\n**I wish to be reborn** : shows/sets your profile.\n**set color [hex-code]** : Sets your profile embed color.`, inline: false },
                { name: '🗺️ QUESTs', value: '**I seek quests** : shows your daily quests.\n**I seek my history** : Shows how many total quests you have completed.', inline: false },
                { name: '🎲 Misc.', value: '**I seek info** : shows you information about anything from characters to places, to events.', inline: false },
            )
            .setColor('#FFFFFF')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }

    // QUESTS
    if (message.content.toLowerCase() === 'i seek quests') {
        const dailyQuests = getDailyQuests(message.author.id);

        const questList = dailyQuests.map((q, i) =>
            `${q.completed ? '✅' : '❌'} **Quest ${i + 1}:** ${q.question}`
        ).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('📖 Your Daily Quests')
            .setDescription(questList)
            .setColor('#FFFFFF')
            .setFooter({ text: 'Answer by typing your answer in chat.' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
        return;
    }

    // LEVEL
    if (message.content.toLowerCase() === 'i seek my level') {
        const exp = userExp[message.author.id] || 0;
        const { level, threshold, next } = getLevel(exp);

        const filled = next ? Math.floor(((exp - threshold) / (next - threshold)) * 10) : 10;
        const bar = '🟨'.repeat(filled) + '⬛'.repeat(10 - filled);

        const expNeeded = next ? next - exp : 0;
        const footerText = next ? `You still need ${expNeeded} EXP to reach level ${level + 1}!` : 'You are at max level!';

        const embed = new EmbedBuilder()
            .setTitle(`ــــــــــﮩ٨ـ YOUR LEVEL IS : ${level}`)
            .setDescription(`**EXP:** ${exp}\n\n${bar}`)
            .setColor('#FFFFFF')
            .setFooter({ text: footerText })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }

    // SET DESCRIPTION
    if (message.content.toLowerCase() === 'i seek my description') {
        awaitingDesc.add(message.author.id);
        message.reply('Type your description.');
        return;
    }

    if (awaitingDesc.has(message.author.id)) {
        awaitingDesc.delete(message.author.id);
        userDesc[message.author.id] = message.content;
        message.reply('Your description has been set!');
        return;
    }

    // SET COLOR
    if (message.content.toLowerCase().startsWith('set color')) {
        const hex = message.content.split(' ')[2];
        if (!hex || !hex.startsWith('#') || hex.length !== 7) {
            message.reply('Please provide a valid hex color like `#FF0000`');
            return;
        }
        userColor[message.author.id] = hex;
        message.reply(`Your profile color has been set to ${hex}!`);
        return;
    }

    // PROFILE
    if (message.content.toLowerCase() === 'i wish to be reborn') {
        const exp = userExp[message.author.id] || 0;
        const { level } = getLevel(exp);
        const color = userColor[message.author.id] || '#FFFFFF';
        const desc = userDesc[message.author.id] || 'No description set. Use **I seek my description** to set one.';

        const embed = new EmbedBuilder()
            .setTitle(`***Profile :***`)
            .setThumbnail(message.author.displayAvatarURL())
            .setColor(color)
            .setDescription(desc)
            .addFields(
                { name: 'Level', value: `${level}`, inline: true },
                { name: 'EXP', value: `${exp}`, inline: true },
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
        return;
    }

    if(message.content.toLowerCase() === 'i seek my history'){
        message.reply(`You've completed a total of **${userQuestHistory[message.author.id] || 0}** quests!`);
    }
    // ANSWER CHECKING
    if (!commands.includes(message.content.toLowerCase()) && !message.content.toLowerCase().startsWith('set color')) {
        const userActiveQuests = userQuests[message.author.id];
        if (userActiveQuests) {
            const quest = userActiveQuests.quests.find(q => {
                if (q.completed) return false;
                const userMessage = message.content.toLowerCase();

                if (Array.isArray(q.answer)) {
                    return q.answer.some(a => userMessage.includes(a));
                }

                const answerWords = q.answer.toLowerCase().split(' ');
                return answerWords.every(word => userMessage.includes(word));
            });

            if (quest) {
                quest.completed = true;
                userWrongAttempts[message.author.id] = 0;
                if (!userExp[message.author.id]) userExp[message.author.id] = 0;
                userExp[message.author.id] += quest.reward;
                if (!userQuestHistory[message.author.id]) userQuestHistory[message.author.id] = 0;
                userQuestHistory[message.author.id] += 1;
                message.reply(`✅ Quest complete! You earned **${quest.reward} XP**.`);

                const allDone = userActiveQuests.quests.every(q => q.completed);
                if (allDone) {
                    message.channel.send(`🎉 ${message.author.username} has completed all daily quests!`);
                }
            }
            else {
                if (!userWrongAttempts[message.author.id]) userWrongAttempts[message.author.id] = 0;
    userWrongAttempts[message.author.id] += 1;

    if (userWrongAttempts[message.author.id] <= 3) {
        userExp[message.author.id] -= 10;
        message.reply(`❌ Wrong! You lost **5 XP**.`);
    }
            }
            
        }
    }

    if (message.content.length >= 7) {
        if (!userExp[message.author.id]) userExp[message.author.id] = 0;
        userExp[message.author.id] += 5;
    }

    // INFO
    if (message.content.toLowerCase() === 'i seek info') {
        awaitingName.add(message.author.id);
        message.reply('Whose information do you seek Primordian? Bestow me with their name.');
        const embed = new EmbedBuilder()
            .setTitle(' 📋***Information Board***💡 ')
            .setDescription('Look at detailed biographies of characters, break downs of story events and more!\n')
            .addFields(
                { name: 'Characters\n', value: `The Great One\nKeen Keeper\nGremlin Seer\nMorvath\nNyxar\nSeraphine\nSolmara` },
                { name: 'Events\n', value: `The Great Expulsion` }
            )
            .setColor('#FFFFFF')
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
        return;
    }

    if (awaitingName.has(message.author.id)) {
        awaitingName.delete(message.author.id);
        if (message.content.toLowerCase() === 'morvath') {
            const embed = new EmbedBuilder()
                .setTitle('🌒 Morvath ⚚')
                .setDescription('***Biography*** : Morvath the Hollow was once the ruler of Duskmoor, a being of immense power driven by an insatiable hunger to stand above all creation. He is now nothing but a whisper in the ruins — a ghostly curse called the Withered Echo, broken by the very ambition that defined him.')
                .addFields(
                    { name: 'Title', value: 'The Hollow' },
                    { name: 'Realm', value: 'Duskmoor' },
                    { name: 'Race', value: 'Soul-less Gloamhusk' },
                    { name: 'Status', value: 'Cursed / Destroyed' },
                    { name: 'Current Form', value: 'The Withered Echo' },
                )
                .setColor('#000000')
                .setThumbnail('https://c.tenor.com/YVvY50bJM_sAAAAd/tenor.gif')
                .setFooter({ text: 'Cause of Fall: Great One / Lagota Shatter' });

            message.channel.send({ embeds: [embed] });
        }
        else if (message.content.toLowerCase() === 'great one' || message.content.toLowerCase() === 'the great one') {
            const embed = new EmbedBuilder()
                .setTitle('👼 The Great One 🕊️')
                .setDescription('***Biography*** : The Great One was shaped from nothing, a being that existed before creation itself and set all realms into motion. He does not rule loudly — his presence alone is law, and to stand against him is to invite your own unmaking.')
                .addFields(
                    { name: 'Title', value: 'The Formless' },
                    { name: 'Realm', value: 'Above All' },
                    { name: 'Race', value: 'None' },
                    { name: 'Status', value: 'Eternal' },
                    { name: 'Current Form', value: 'Beyond Classification' },
                )
                .setColor('#FFFFFF')
                .setThumbnail('https://cdn.dribbble.com/userupload/23869078/file/original-f85b1fb5a62385e81ada5db12d23c8a0.gif')
                .setFooter({ text: 'He who can never be slain?' });

            message.channel.send({ embeds: [embed] });
        }
        else if (message.content.toLowerCase() === 'seraphine') {
            const embed = new EmbedBuilder()
                .setTitle('✨👼 Seraphine 𝄞🗡')
                .setDescription('***Biography*** : Seraphine was once the divine ruler of Astravale, a being of celestial authority whose power was second only to the Great One himself. The Great Expulsion stripped her of her godhood and cast her into a mortal body — she still carries her power, but now she bleeds, ages, and feels the weight of existence like never before.')
                .addFields(
                    { name: 'Title', value: 'The Tarnished Halo' },
                    { name: 'Realm', value: 'Astravale' },
                    { name: 'Race', value: 'Spright' },
                    { name: 'Status', value: 'Displaced/Stripped' },
                    { name: 'Current Form', value: 'Mortal' },
                    { name: 'Known Associates', value: 'Nyxar & Solmara' },
                )
                .setColor('#fff7b3')
                .setThumbnail('https://i.makeagif.com/media/8-15-2016/q5Vsy0.gif')
                .setFooter({ text: 'The one who once held Astravale, now holds her breath.' });

            message.channel.send({ embeds: [embed] });
        }
        else if (message.content.toLowerCase() === 'nyxar') {
            const embed = new EmbedBuilder()
                .setTitle('🦇 Nyxar 🕷️')
                .setDescription('***Biography*** : Nyxar the Veiled was the enigmatic ruler of Umbrafall, a being shrouded in shadow whose presence inspired as much dread as reverence. The Great Expulsion tore his divinity from him and buried him in a mortal shell — he endures, but the veil that once made him untouchable grows thinner every day.')
                .addFields(
                    { name: 'Title', value: 'The Veiled' },
                    { name: 'Realm', value: 'Umbrafall' },
                    { name: 'Race', value: 'Spright' },
                    { name: 'Status', value: 'Displaced/Stripped' },
                    { name: 'Current Form', value: 'Mortal' },
                    { name: 'Known Associates', value: 'Seraphine & Solmara' },
                )
                .setColor('#292929')
                .setThumbnail('https://64.media.tumblr.com/ca430bfaa1c614b28ab651977b3b0c33/tumblr_mhs11080JP1rgpdifo1_400.gifv')
                .setFooter({ text: 'The one who was unseen is now seen by all.' });

            message.channel.send({ embeds: [embed] });
        }
        else if (message.content.toLowerCase() === 'solmara') {
            const embed = new EmbedBuilder()
                .setTitle('🤍 Solmara 🔥')
                .setDescription('**Biography*** : Solmara the Pale Flame was the radiant ruler of Dawnmoor, a being of quiet but consuming power whose light marked the boundary between creation and the void. The Great Expulsion dimmed her flame and forced her into mortal flesh — she still burns, but now that fire has an end.')
                .addFields(
                    { name: 'Title', value: 'The Pale Flame' },
                    { name: 'Realm', value: 'Dawnmoor/Unknown' },
                    { name: 'Race', value: 'Soul-less' },
                    { name: 'Status', value: 'Displaced/Stripped' },
                    { name: 'Current Form', value: 'Mortal' },
                    { name: 'Known Associates', value: 'Seraphine & Nyxar' },
                )
                .setColor('#ffffff')
                .setThumbnail('https://media.discordapp.net/attachments/1376542084529655808/1489986814755340298/solmara.gif?ex=69d269db&is=69d1185b&hm=eeda6c541670e6081863b1e8a699f2b24f140b602d680d4f19bb1bac1a37e977&=&width=263&height=368')
                .setFooter({ text: 'The brightening light now flickers..' });

            message.channel.send({ embeds: [embed] });
        }
        else if (message.content.toLowerCase() === 'keen keeper') {
            const embed = new EmbedBuilder()
                .setTitle('📝 Keen Keeper ✍🏻')
                .setDescription('**Biography*** : The Keen Keeper is the Soul-less Archivist born of the Great One himself, a being untouched by emotion or bias whose sole purpose is to record the deeds of all who exist. She carries the Star-Etcher, a pen carved from a dying star, and nothing that has ever happened escapes her record.')
                .addFields(
                    { name: 'Title', value: 'Soul-less Archivist' },
                    { name: 'Realm', value: 'Above All' },
                    { name: 'Race', value: 'Soul-less' },
                    { name: 'Status', value: 'Active' },
                    { name: 'Current Form', value: 'Primordial' },
                    { name: 'Known Associates', value: 'The Great One & Gremlin Seer' },
                )
                .setColor('#ff9a03')
                .setThumbnail('https://w.wallhaven.cc/full/g8/wallhaven-g8xjzd.jpg')
                .setFooter({ text: 'She has written your name, She has written your end..' });

            message.channel.send({ embeds: [embed] });
        }
        else if (message.content.toLowerCase() === 'gremlin seer') {
            const embed = new EmbedBuilder()
                .setTitle('🧿 Gremlin Seer ⚙️')
                .setDescription('**Biography*** : The Gremlin Seer is the First-Draft Spright, an ancient mechanical watcher whose singular eye scans every ripple across all realms without rest. He holds no power of his own but sees everything — a frantic, tireless alarm that screams into the void when disaster stirs and the powerful refuse to listen.')
                .addFields(
                    { name: 'Title', value: 'Cosmic Alarm Clock' },
                    { name: 'Realm', value: 'Above All' },
                    { name: 'Race', value: 'Spright' },
                    { name: 'Status', value: 'Active' },
                    { name: 'Current Form', value: 'Primordial' },
                    { name: 'Known Associates', value: 'The Great One & Keen Keeper' },
                )
                .setColor('#8e03ff')
                .setThumbnail('https://i.pinimg.com/originals/bf/27/de/bf27de7c22f370a729c74c91b0791c59.gif')
                .setFooter({ text: 'He screams into the void, watches it unfold, and can do nothing but scream again.' });

            message.channel.send({ embeds: [embed] });
        }
        else if (message.content.toLowerCase() === 'expulsion' || message.content.toLowerCase() === 'great expulsion' || message.content.toLowerCase() === 'the great expulsion') {
            const embed = new EmbedBuilder()
                .setTitle('˗ˏˋThe Great ✸ Expulsionˎˊ˗')
                .setDescription(`The Great Expulsion was not a war, not a battle — it was a consequence. When the Great One drove Morvath back to Duskmoor and the Lagota finally shattered under the weight of every soul it had ever stolen, the explosion did not just destroy a world. It rippled. It tore through the boundaries between realms like a crack through glass, and three kingdoms that had nothing to do with Morvath's ambition paid the price for it. The gods who ruled those lands — Seraphine, Nyxar, and Solmara — felt their divinity ripped from them in an instant, not as punishment, but as collateral. The Great One did not cause the Expulsion. Morvath did. And the universe is still recovering from it.`)
                .addFields(
                    { name: 'Event', value: 'The Great Expulsion' },
                    { name: 'Trigger', value: 'Morvath the Hollow' },
                    { name: 'Status', value: 'Ongoing' },
                    { name: 'Impact', value: 'Cosmic Level' },
                    { name: 'Casualties', value: 'Unknown - Entire populations unaccounted for.' },
                    { name: 'Started', value: 'GE 1' },
                    { name: 'Ended', value: '---' },
                )
                .setColor('#290000');

            message.channel.send({ embeds: [embed] });
        }
        else {
            message.reply('That name is unknown to the Keen Keeper..');
        }
    }
});

client.login(process.env.TOKEN);