import os
import discord
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("TOKEN")

intents = discord.Intents.default()
intents.voice_states = True
intents.guilds = True
intents.members = True
intents.message_content = True

class MyBot(commands.Bot):
    async def setup_hook(self):
        # Chargement automatique des cogs
        for filename in os.listdir("./cogs"):
            if filename.endswith(".py"):
                await self.load_extension(f"cogs.{filename[:-3]}")

        # Synchronisation des commandes slash
        await self.tree.sync()

bot = MyBot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"✅ {bot.user} est prêt.")

if __name__ == "__main__":
    bot.run(TOKEN)