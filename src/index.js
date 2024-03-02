import TelegramApi from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { ogg } from './oggConverter.js';

(() => {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    dotenv.config({ path: '.env.development' });
  } else {
    dotenv.config({ path: '.env.production' });
  }
})();

// const openai = new OpenAI({ apiKey: process.env.GPT_KEY2 });
const token = process.env.TOKEN_BOT;

const bot = new TelegramApi(token, { polling: true });

const start = () => {
  bot.setMyCommands([
    { command: '/start', description: 'Запуск бота' },
    { command: '/info', description: 'Информация о боте' },
  ]);

  bot.on('text', async (context) => {
    try {
      const { text, chat } = context;
      switch (text) {
        case '/start':
          return bot.sendMessage(
            chat.id,
            `${chat.first_name}, добро пожаловать!`
          );
        case '/info':
          return bot.sendMessage(chat.id, 'Я чат GPT бот');

        default:
          return bot.sendMessage(
            chat.id,
            'Несуществующая команда. Попробуй снова'
          );
      }
    } catch ({ message }) {
      console.log('Ошибка при событии на текстовое сообщение', message);
    }
  });

  bot.on('voice', async (context) => {
    try {
      const { from, chat } = context;
      const { id: userId } = from;
      const link = await bot.getFileLink(context.voice.file_id);
      const oggPath = await ogg.create(link, userId);
      const mp3Path = await ogg.toMp3(oggPath, userId);
      bot.sendMessage(chat.id, mp3Path);
    } catch (error) {
      console.log('Ошибка при событии на голосовое сообщение', error);
    }
  });
};

start();
