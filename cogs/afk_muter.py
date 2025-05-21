import discord
from discord.ext import commands

class AFKMuter(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.afk_channel_id = 123456789012345678  # Remplace par l'ID de ton salon AFK

    @commands.Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        # Si le membre rejoint un canal vocal
        if after.channel and after.channel.id == self.afk_channel_id:
            try:
                await member.edit(mute=True)
                print(f"[AFK] {member} a été mute.")
            except discord.Forbidden:
                print(f"[AFK] Impossible de mute {member} (permissions manquantes).")
        elif before.channel and before.channel.id == self.afk_channel_id and after.channel != before.channel:
            try:
                await member.edit(mute=False)
                print(f"[AFK] {member} a été unmute.")
            except discord.Forbidden:
                print(f"[AFK] Impossible de unmute {member} (permissions manquantes).")

async def setup(bot):
    await bot.add_cog(AFKMuter(bot))