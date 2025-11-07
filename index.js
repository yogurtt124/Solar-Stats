// 1️⃣ Importuri
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const express = require('express');

// 2️⃣ Server Express pentru keep-alive
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("Bot is alive ✅"));
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// 3️⃣ Creezi clientul Discord
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
  ] 
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const STATUS_CHANNEL_ID = "1432904664826908724";
const MAIN_SITE_URL = "https://www.logged.tg/auth/corrupt";
const MAIN_SITE_NAME = "MAIN SITE";

const TOP_BANNER = "https://cdn.discordapp.com/attachments/1436416072252260362/1436418034352001124/standard-3.gif";
const BOTTOM_BANNER = "https://cdn.discordapp.com/attachments/1436416072252260362/1436417921894060072/standard-4.gif";

function formatNumber(num) {
  try { 
    return num.toLocaleString(); 
  } catch { 
    return "0"; 
  }
}

function formatDuration(ms) {
  let sec = Math.floor(ms / 1000);
  let min = Math.floor(sec / 60);
  let hr = Math.floor(min / 60);
  sec %= 60;
  min %= 60;
  return `${hr}h ${min}m ${sec}s`;
}

client.on('ready', () => {
  console.log(`✅ Bot ready as ${client.user.tag}`);
});

// ------ !stats ------
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const targetUser = message.mentions.users.first() || message.author;
  const targetId = targetUser.id;

  if (message.content.startsWith('!stats')) {
    const res = await fetch(`https://api.injuries.lu/v1/public/user?userId=${targetId}`);
    const data = await res.json();
    if (!data.success || !data.Normal) return message.reply("❌ No stats found.");

    const n = data.Normal;
    const userName = data.Profile?.userName || targetUser.username;

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setDescription(`
${TOP_BANNER}

<a:Black_hear:1435093893061541920> **NORMAL STATS**

<a:blackverified:1435093657010176071> **User:** ${userName}

<a:blackverified:1435093657010176071> **TOTAL STATS**
\`\`\`
Hits:     ${formatNumber(n.Totals?.Accounts || 0)}
Visits:   ${formatNumber(n.Totals?.Visits || 0)}
Clicks:   ${formatNumber(n.Totals?.Clicks || 0)}
\`\`\`

<a:blackverified:1435093657010176071> **BIGGEST HIT**
\`\`\`
Summary:  ${formatNumber(n.Highest?.Summary || 0)}
RAP:      ${formatNumber(n.Highest?.Rap || 0)}
Robux:    ${formatNumber(n.Highest?.Balance || 0)}
\`\`\`

${BOTTOM_BANNER}
`)
      .setThumbnail("https://cdn.discordapp.com/emojis/1435132470742749266.png");

    message.channel.send({ embeds: [embed] });
  }

  // ------ !daily ------
  if (message.content.startsWith('!daily')) {
    const res = await fetch(`https://api.injuries.lu/v1/public/user?userId=${targetId}`);
    const data = await res.json();
    const d = data.Daily || data.Normal;
    if (!d) return message.reply("❌ No daily stats available.");

    const userName = data.Profile?.userName || targetUser.username;

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setDescription(`
${TOP_BANNER}

<a:Black_hear:1435093893061541920> **DAILY STATS**

<a:blackverified:1435093657010176071> **User:** ${userName}

<a:blackverified:1435093657010176071> **DAILY TOTALS**
\`\`\`
Hits:     ${formatNumber(d.Totals?.Accounts || 0)}
Visits:   ${formatNumber(d.Totals?.Visits || 0)}
Clicks:   ${formatNumber(d.Totals?.Clicks || 0)}
\`\`\`

${BOTTOM_BANNER}
`)
      .setThumbnail("https://cdn.discordapp.com/emojis/1435132470742749266.png");

    message.channel.send({ embeds: [embed] });
  }

  // ------ !check ------
  if (message.content.startsWith('!check')) {
    const start = Date.now();
    let ping;
    try {
      const r = await fetch(MAIN_SITE_URL);
      ping = Date.now() - start;
      status = r.ok ? "UP" : "DOWN";
    } catch { status = "DOWN"; ping = null; }

    const embed = new EmbedBuilder()
      .setColor(0x000000)
      .setDescription(`
${TOP_BANNER}

<a:Black_hear:1435093893061541920> **${MAIN_SITE_NAME} STATUS**

<a:blackverified:1435093657010176071> **Status:** ${status}
<a:blackverified:1435093657010176071> **Response:** ${ping ? ping + "ms" : "N/A"}

${BOTTOM_BANNER}
`)
      .setThumbnail("https://cdn.discordapp.com/emojis/1435132470742749266.png");

    message.channel.send({ embeds: [embed] });
  }

});

// Start bot
client.login(TOKEN);
