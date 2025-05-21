from discord.ext import commands
import time

# Cache pour éviter les actions répétées (id_membre: timestamp)
last_action_time = {}

class AFKMuter(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.afk_channel_id = 1373719204016033893  # Ton salon AFK

    def is_afk_channel(self, channel):
        return channel and channel.id == self.afk_channel_id

    @commands.Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        now = time.time()
        cooldown = 5  # secondes

        if member.bot:
            return  # Ignore les bots

        if last_action_time.get(member.id, 0) + cooldown > now:
            return  # Cooldown actif

        # Mute si rejoint salon AFK
        if self.is_afk_channel(after.channel) and member.voice and not member.voice.mute:
            await member.edit(mute=True)
            print(f"[AFK] {member.display_name} a été mute.")
            last_action_time[member.id] = now

        # Unmute si quitté salon AFK
        elif self.is_afk_channel(before.channel) and not self.is_afk_channel(after.channel):
            if member.voice and member.voice.mute:
                await member.edit(mute=False)
                print(f"[AFK] {member.display_name} a été unmute.")
                last_action_time[member.id] = now

async def setup(bot):
    await bot.add_cog(AFKMuter(bot))