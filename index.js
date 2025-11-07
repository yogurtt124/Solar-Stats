/ 1️⃣ Importuri
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

// 4️⃣ Eveniment ready
client.once('ready', () => {
  console.log(`✅ Bot ready as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
});

// 5️⃣ Funcții utile
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

// 5.1️⃣ Uptime Monitor Config
let lastUpTime = null;
let lastStatus = null; // "UP" sau "DOWN"
const STATUS_CHANNEL_ID = "1436098432413597726";
const MAIN_SITE_URL = "https://www.logged.tg/auth/corrupt";
const MAIN_SITE_NAME = "MAIN SITE";

// Auto-check site la fiecare 30 sec
setInterval(async () => {
  try {
    const start = Date.now();
    let res, ping;

    try {
      const response = await fetch(MAIN_SITE_URL);
      res = { ok: response.ok };
      ping = Date.now() - start;
    } catch {
      res = { ok: false };
      ping = null;
    }

    let currentStatus = res.ok ? "UP" : "DOWN";

    if (res.ok && !lastUpTime) lastUpTime = Date.now();
    if (!res.ok) lastUpTime = null;

    if (currentStatus !== lastStatus) {
      const channel = client.channels.cache.get(STATUS_CHANNEL_ID);
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor(0x000000)
          .setThumbnail("<a:emojigg_UZI:1435132470742749266>")
          .setDescription(`@everyone
<a:Black_hear:1435093893061541920> SITE STATUS

<a:blackverified:1435093657010176071> **${MAIN_SITE_NAME}**
<a:blackverified:1435093657010176071> ${currentStatus === "UP" ? "Main site is up, go use it" : "Main site is down, use the backup sites for now"}

<a:blackverified:1435093657010176071> Response Time: ${ping ? ping + "ms" : "N/A"}
`)
          .setImage("https://cdn.discordapp.com/attachments/1436416072252260362/1436418034352001124/standard-3.gif?ex=690f880a&is=690e368a&hm=cb32c5a5a658d0ad3334642680e91bfc2b0054a4c259aebfe3aee84031244c42&")
          .setFooter({ text: "Site Uptime Monitor" });

        channel.send({ embeds: [embed] });
      }
      lastStatus = currentStatus;
    }

  } catch (err) {
    console.error("Error checking site:", err);
  }
}, 30000);

// 6️⃣ Event listener pentru mesaje
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const targetUser = message.mentions.users.first() || message.author;
  const targetId = targetUser.id;

  // ===== !stats =====
  if (message.content.startsWith('!stats')) {
    try {
      const res = await fetch(`https://api.injuries.lu/v1/public/user?userId=${targetId}`);
      const data = await res.json();

      if (!data.success || !data.Normal) {
        message.reply("❌ No stats found for this user.");
        return;
      }

      const normal = data.Normal;
      const profile = data.Profile || {};

      const hits = normal.Totals?.Accounts || 0;
      const visits = normal.Totals?.Visits || 0;
      const clicks = normal.Totals?.Clicks || 0;

      const biggestSummary = normal.Highest?.Summary || 0;
      const biggestRap = normal.Highest?.Rap || 0;
      const biggestRobux = normal.Highest?.Balance || 0;

      const totalSummary = normal.Totals?.Summary || 0;
      const totalRap = normal.Totals?.Rap || 0;
      const totalRobux = normal.Totals?.Balance || 0;

      const userName = profile.userName || targetUser.username;

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setThumbnail("<a:emojigg_UZI:1435132470742749266>")
        .setDescription(`─── <a:Black_hear:1435093893061541920> **NORMAL INFO** <a:Black_hear:1435093893061541920> ───

<a:blackverified:1435093657010176071> **User:** **${userName}**

<a:blackverified:1435093657010176071> **TOTAL STATS:**
\`\`\`
<a:blackverified:1435093657010176071> Hits:     ${formatNumber(hits)}
<a:blackverified:1435093657010176071> Visits:   ${formatNumber(visits)}
<a:blackverified:1435093657010176071> Clicks:   ${formatNumber(clicks)}
\`\`\`

<a:blackverified:1435093657010176071> **BIGGEST HIT:**
\`\`\`
<a:blackverified:1435093657010176071> Summary:  ${formatNumber(biggestSummary)}
<a:blackverified:1435093657010176071> RAP:      ${formatNumber(biggestRap)}
<a:blackverified:1435093657010176071> Robux:    ${formatNumber(biggestRobux)}
\`\`\`

<a:blackverified:1435093657010176071> **TOTAL HIT STATS:**
\`\`\`
<a:blackverified:1435093657010176071> Summary:  ${formatNumber(totalSummary)}
<a:blackverified:1435093657010176071> RAP:      ${formatNumber(totalRap)}
<a:blackverified:1435093657010176071> Robux:    ${formatNumber(totalRobux)}
\`\`\``)
        .setImage("https://cdn.discordapp.com/attachments/1436416072252260362/1436418034352001124/standard-3.gif?ex=690f880a&is=690e368a&hm=cb32c5a5a658d0ad3334642680e91bfc2b0054a4c259aebfe3aee84031244c42&")
        .setFooter({ text: "Stats Bot" });

      await message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error('Error fetching stats:', err);
      message.reply("❌ Error fetching stats. Please try again later.");
    }
  }

  // ===== !daily =====
  if (message.content.startsWith('!daily')) {
    try {
      const res = await fetch(`https://api.injuries.lu/v1/public/user?userId=${targetId}`);
      const data = await res.json();

      if (!data.success) {
        message.reply("❌ No stats found for this user.");
        return;
      }

      const daily = data.Daily || data.Normal;
      const profile = data.Profile || {};

      if (!daily) {
        message.reply("❌ No daily stats available for this user.");
        return;
      }

      const dailyHits = daily.Totals?.Accounts || 0;
      const dailyVisits = daily.Totals?.Visits || 0;
      const dailyClicks = daily.Totals?.Clicks || 0;

      const biggestSummary = daily.Highest?.Summary || 0;
      const biggestRap = daily.Highest?.Rap || 0;
      const biggestRobux = daily.Highest?.Balance || 0;

      const dailySummary = daily.Totals?.Summary || 0;
      const dailyRap = daily.Totals?.Rap || 0;
      const dailyRobux = daily.Totals?.Balance || 0;

      const userName = profile.userName || targetUser.username;

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setThumbnail("<a:emojigg_UZI:1435132470742749266>")
        .setDescription(`─── <a:Black_hear:1435093893061541920> **DAILY STATS** <a:Black_hear:1435093893061541920> ───

<a:blackverified:1435093657010176071> **User:** **${userName}**

<a:blackverified:1435093657010176071> **DAILY STATS:**
\`\`\`
<a:blackverified:1435093657010176071> Hits:     ${formatNumber(dailyHits)}
<a:blackverified:1435093657010176071> Visits:   ${formatNumber(dailyVisits)}
<a:blackverified:1435093657010176071> Clicks:   ${formatNumber(dailyClicks)}
\`\`\`

<a:blackverified:1435093657010176071> **BIGGEST HIT:**
\`\`\`
<a:blackverified:1435093657010176071> Summary:  ${formatNumber(biggestSummary)}
<a:blackverified:1435093657010176071> RAP:      ${formatNumber(biggestRap)}
<a:blackverified:1435093657010176071> Robux:    ${formatNumber(biggestRobux)}
\`\`\`

<a:blackverified:1435093657010176071> **DAILY HIT STATS:**
\`\`\`
<a:blackverified:1435093657010176071> Summary:  ${formatNumber(dailySummary)}
<a:blackverified:1435093657010176071> RAP:      ${formatNumber(dailyRap)}
<a:blackverified:1435093657010176071> Robux:    ${formatNumber(dailyRobux)}
\`\`\``)
        .setImage("https://cdn.discordapp.com/attachments/1436416072252260362/1436418034352001124/standard-3.gif?ex=690f880a&is=690e368a&hm=cb32c5a5a658d0ad3334642680e91bfc2b0054a4c259aebfe3aee84031244c42&")
        .setFooter({ text: "Stats Bot Daily" });

      await message.channel.send({ embeds: [embed] });

    } catch (err) {
      console.error('Error fetching daily stats:', err);
      message.reply("❌ Error fetching daily stats. Please try again later.");
    }
  }

  // ===== ✅ !check =====
  if (message.content.startsWith('!check')) {
    try {
      const start = Date.now();
      let res, ping;

      try {
        const response = await fetch(MAIN_SITE_URL);
        res = { ok: response.ok };
        ping = Date.now() - start;
      } catch {
        res = { ok: false };
        ping = null;
      }

      let statusText = "";
      let uptimeText = "";

      if (res.ok) {
        if (!lastUpTime) lastUpTime = Date.now();
        uptimeText = `UP for **${formatDuration(Date.now() - lastUpTime)}**`;
        statusText = "<a:blackverified:1435093657010176071> **ONLINE**";
      } else {
        lastUpTime = null;
        uptimeText = "❌ No uptime data (offline)";
        statusText = "<a:blackverified:1435093657010176071> OFFLINE";
      }

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setThumbnail("<a:emojigg_UZI:1435132470742749266>")
        .setDescription(`<a:Black_hear:1435093893061541920> SITE STATUS

<a:blackverified:1435093657010176071> **${MAIN_SITE_NAME}**
<a:blackverified:1435093657010176071> **STATUS:** ${statusText}
<a:blackverified:1435093657010176071> **UPTIME:** ${uptimeText}

\`\`\`
<a:blackverified:1435093657010176071> Response Time: ${ping ? ping + "ms" : "N/A"}
\`\`\``)
        .setImage("https://cdn.discordapp.com/attachments/1436416072252260362/1436418034352001124/standard-3.gif?ex=690f880a&is=690e368a&hm=cb32c5a5a658d0ad3334642680e91bfc2b0054a4c259aebfe3aee84031244c42&")
        .setFooter({ text: "Site Uptime Monitor" });

      await message.channel.send({ embeds: [embed] });

    } catch {
      lastUpTime = null;

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setThumbnail("<a:emojigg_UZI:1435132470742749266>")
        .setDescription(`<a:Black_hear:1435093893061541920> SITE STATUS

<a:blackverified:1435093657010176071> **${MAIN_SITE_NAME}**
<a:blackverified:1435093657010176071> **STATUS:** OFFLINE
<a:blackverified:1435093657010176071> **UPTIME:** No uptime data
`)
        .setImage("https://cdn.discordapp.com/attachments/1436416072252260362/1436418034352001124/standard-3.gif?ex=690f880a&is=690e368a&hm=cb32c5a5a658d0ad3334642680e91bfc2b0054a4c259aebfe3aee84031244c42&")
        .setFooter({ text: "Site Uptime Monitor" });

      await message.channel.send({ embeds: [embed] });
    }
  }

});

// 7️⃣ Error handler
client.on('error', (error) => console.error('Discord client error:', error));

// 8️⃣ Verificare token
if (!TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN is not set!');
  process.exit(1);
}

// 9️⃣ Login bot
client.login(TOKEN);
