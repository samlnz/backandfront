import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { Telegraf, Markup } from 'telegraf';
import pkg from 'pg';
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3001', 10);
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const STATIC_URL = process.env.RAILWAY_STATIC_URL;
const APP_URL = process.env.APP_URL || (STATIC_URL ? `https://${STATIC_URL}` : 'http://localhost:5173');

console.log(`[System] Initializing Star Bingo Engine...`);
console.log(`[System] Port: ${PORT}`);
console.log(`[System] App URL: ${APP_URL}`);

// Global error handlers to prevent 502s from minor crashes
process.on('uncaughtException', (err) => {
  console.error('[Critical] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Critical] Unhandled Rejection at:', promise, 'reason:', reason);
});

// --- POSTGRESQL CONNECTION ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 10,
});

const initDb = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ [DB] Connected to PostgreSQL");
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT,
          balance FLOAT DEFAULT 0,
          joined_at BIGINT
        );
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          type TEXT,
          user_id TEXT,
          amount FLOAT,
          ref TEXT,
          round_id BIGINT,
          created_at BIGINT
        );
        CREATE TABLE IF NOT EXISTS pending_sms (
          id SERIAL PRIMARY KEY,
          ref TEXT,
          amount FLOAT,
          created_at BIGINT
        );
        CREATE TABLE IF NOT EXISTS withdrawals (
          id SERIAL PRIMARY KEY,
          user_id TEXT,
          username TEXT,
          amount FLOAT,
          info TEXT,
          status TEXT DEFAULT 'pending'
        );
      `);
      console.log("✅ [DB] Schema verified");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("❌ [DB] Initialization error:", err.message);
  }
};
initDb();

const userStates = new Map();

function extractRef(text) {
  const match = text.match(/[A-Z0-9]{6,12}/i);
  return match ? match[0].toUpperCase() : null;
}

function extractAmount(text) {
  const match = text.match(/(?:ETB|Amt|Amount)[:\s]*([\d,.]+)/i);
  return match ? parseFloat(match[1].replace(/,/g, '')) : null;
}

// --- TELEGRAM BOT ---
const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;
if (bot) {
  bot.start(async (ctx) => {
    try {
      const userId = ctx.from.id.toString();
      const username = ctx.from.username || ctx.from.first_name;
      
      let userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length === 0) {
        await pool.query('INSERT INTO users (id, username, balance, joined_at) VALUES ($1, $2, 0, $3)', 
          [userId, username, Date.now()]);
        userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      }
      
      const balance = userRes.rows[0]?.balance || 0;

      await ctx.replyWithHTML(
        `<b>Welcome to Star Bingo Pro!</b> 🌠\n\n` +
        `💰 <b>Balance:</b> ${balance} ETB\n\n` +
        `🚀 Click below to enter the Arena!`,
        Markup.inlineKeyboard([
          [Markup.button.webApp('🚀 Launch Arena', APP_URL)],
          [Markup.button.callback('💳 Deposit', 'cmd_deposit'), Markup.button.callback('💰 Withdraw', 'request_withdraw')]
        ])
      );
    } catch (e) {
      console.error("[Bot] Start command error:", e);
    }
  });

  bot.action('cmd_deposit', (ctx) => {
    const userId = ctx.from.id.toString();
    userStates.set(userId, { step: 'AWAITING_AMOUNT' });
    ctx.reply("💰 How much would you like to deposit? (Enter amount in ETB, e.g. 500)");
  });

  bot.on('message', async (ctx) => {
    try {
      const userId = ctx.from.id.toString();
      const text = ctx.message.text;
      if (!text) return;
      const state = userStates.get(userId);

      if (state?.step === 'AWAITING_AMOUNT') {
        const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
        if (isNaN(amount) || amount <= 0) return ctx.reply("❌ Invalid amount.");
        userStates.set(userId, { step: 'AWAITING_NOTIFICATION', amount });
        return ctx.replyWithHTML(`🏦 <b>Deposit ${amount} ETB</b> to account <code>0941043869</code> (Samson) and forward the SMS here.`);
      }

      const ref = extractRef(text);
      const amount = extractAmount(text);
      if (ref && amount) {
        const smsRes = await pool.query('SELECT * FROM pending_sms WHERE ref = $1 AND amount = $2', [ref, amount]);
        if (smsRes.rows.length > 0) {
          await pool.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, userId]);
          await pool.query('DELETE FROM pending_sms WHERE id = $1', [smsRes.rows[0].id]);
          userStates.delete(userId);
          return ctx.reply(`✅ DEPOSIT MATCHED! ${amount} ETB added.`);
        }
      }
    } catch (e) {
      console.error("[Bot] Error:", e);
    }
  });

  bot.launch().then(() => console.log("✅ [Bot] Telegram listener active")).catch(err => {
    console.error("❌ [Bot] Launch failed:", err.message);
  });
}

// --- GAME LOGIC ---
const PHASES = { SELECTION: 'SELECTION', PLAYING: 'PLAYING', WINNER: 'WINNER' };
let gameState = {
  roundId: Math.floor(Date.now() / 1000),
  phase: PHASES.SELECTION,
  nextPhaseTime: Date.now() + 45000,
  phaseStartTime: Date.now(),
  participants: [],
  calledNumbers: [],
  sequence: [],
  winner: null
};

function initNewRound() {
  gameState.roundId = Math.floor(Date.now() / 1000);
  gameState.phase = PHASES.SELECTION;
  gameState.nextPhaseTime = Date.now() + 45000;
  gameState.calledNumbers = [];
  gameState.winner = null;
  gameState.participants = []; 
  const nums = Array.from({ length: 75 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  gameState.sequence = nums;
}

// Engine Tick
setInterval(async () => {
  const now = Date.now();
  if (gameState.phase === PHASES.SELECTION && now >= gameState.nextPhaseTime) {
    gameState.phase = PHASES.PLAYING;
    gameState.nextPhaseTime = now;
  } else if (gameState.phase === PHASES.PLAYING && now >= gameState.nextPhaseTime) {
    if (gameState.calledNumbers.length < 75) {
      gameState.calledNumbers.push(gameState.sequence[gameState.calledNumbers.length]);
      gameState.nextPhaseTime = now + 3500;
    } else {
      initNewRound();
    }
  } else if (gameState.phase === PHASES.WINNER && now >= gameState.nextPhaseTime) {
    initNewRound();
  }
}, 1000);

// --- EXPRESS APP ---
const app = express();
app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

const distPath = path.resolve(__dirname, '../dist');
console.log(`[Express] Static files path: ${distPath}`);

// API Routes
app.get('/api/balance/:playerId', async (req, res) => {
  try {
    const userRes = await pool.query('SELECT balance FROM users WHERE id = $1', [req.params.playerId]);
    res.json({ balance: userRes.rows[0]?.balance || 0 });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/game/state', (req, res) => res.json({ ...gameState, serverTime: Date.now() }));

app.post('/api/game/join', async (req, res) => {
  const { playerId, name, cardIds } = req.body;
  gameState.participants.push({ playerId, name, cardIds });
  res.json({ ok: true });
});

// Serve static files from the dist directory
app.use(express.static(distPath));

// Final catch-all for SPA: 
// In Express 5, using a pathless use() is the safest way to handle a wildcard fallback
app.use((req, res, next) => {
  // Only serve index.html for GET requests that aren't for files
  if (req.method !== 'GET') return next();
  
  const indexFile = path.join(distPath, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      // If index.html doesn't exist, it means the build likely failed
      console.error(`[Error] Failed to send index.html: ${err.message}`);
      res.status(404).send("Application not ready. Please ensure the frontend build finished successfully.");
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ [Express] Server listening on port ${PORT}`);
});