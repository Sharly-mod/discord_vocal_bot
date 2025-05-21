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

GUILD_ID = 1299398593207078982  # ID du serveur de test

class MyBot(commands.Bot):
    async def setup_hook(self):
        # Charger tous les cogs automatiquement
        for filename in os.listdir("./cogs"):
            if filename.endswith(".py"):
                await self.load_extension(f"cogs.{filename[:-3]}")

        # Si tu veux faire du test local, tu peux clean et resync :
        self.tree.clear_commands(guild=discord.Object(id=GUILD_ID))
        await self.tree.sync(guild=discord.Object(id=GUILD_ID))  # Sync uniquement sur ce serveur

bot = MyBot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"✅ {bot.user} est prêt.")

if __name__ == "__main__":
    bot.run(TOKEN)