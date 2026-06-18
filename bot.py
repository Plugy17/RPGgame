"""
Telegram Bot for Chronicles of Azeria MMORPG
Uses aiogram 3.x for modern async handling
"""

import asyncio
import logging
import os
from aiogram import Bot, Dispatcher, types
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

# Bot token from environment or hardcoded for deployment
BOT_TOKEN = os.environ.get("BOT_TOKEN", "8976079456:AAGhpcWFNGf5IOYfpZG0xW5st7mkVWiVEcU")

# URL of the game webapp — update to your Vercel/Production URL
GAME_WEBAPP_URL = os.environ.get(
    "GAME_WEBAPP_URL",
    "https://rp-ggame-zedx.vercel.app/"
)

# Initialize bot and dispatcher
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    """Handle /start command — send welcome message with game button."""
    user = message.from_user
    first_name = user.first_name or "Stranger"
    username = user.username or first_name

    welcome_text = (
        f"⚔️ **Добро пожаловать, {first_name}!** ⚔️\n\n"
        f"Ты ступил на земли **Азерии** — мира, где магия переплетается "
        f"со сталью, а древние руны хранят силу предков.\n\n"
        f"🏰 **Chronicles of Azeria** — MMORPG прямо в Telegram.\n"
        f"• Сражайся с монстрами\n"
        f"• Собирай ресурсы\n"
        f"• Участвуй в рейдах\n"
        f"• Торгуй на P2P-рынке\n"
        f"• Зарабатывай токены $AZR\n\n"
        f"👇 **Нажми кнопку ниже, чтобы войти в игру**"
    )

    # Create WebApp button
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🎮 Войти в Азерию",
                    web_app=WebAppInfo(url=GAME_WEBAPP_URL)
                )
            ],
            [
                InlineKeyboardButton(
                    text="📢 Новости",
                    url="https://t.me/chronicles_azeria"
                )
            ]
        ]
    )

    await message.answer(
        welcome_text,
        reply_markup=keyboard,
        parse_mode=ParseMode.MARKDOWN
    )


@dp.message()
async def echo_handler(message: types.Message):
    """Handle any non-command messages — redirect to /start info."""
    await message.answer(
        "Используй команду /start, чтобы войти в игру! 🎮"
    )


async def main():
    """Start polling."""
    logging.basicConfig(level=logging.INFO)
    print("🤖 Chronicles of Azeria Bot is running...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())