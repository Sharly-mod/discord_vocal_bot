import discord
from discord import ui, Interaction, app_commands
from discord.ext import commands
import os
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("TOKEN")
intents = discord.Intents.default()
intents.voice_states = True
intents.guilds = True
intents.members = True
intents.message_content = True

bot = commands.Bot(command_prefix="!", intents=intents)

WAITING_ROOM_TO_CATEGORY = {
    1299398594402586829: 1374094815788011631,
    1322976976352579636: 1374102251705995274,
    1370357006342553620: 1374102357901705367,
    1372691483014074569: 1374102284656578691,
}

private_channels = {}

@bot.event
async def on_ready():
    await bot.tree.sync()
    print(f"{bot.user} est prêt.")

@bot.event
async def on_voice_state_update(member, before, after):
    if after.channel and after.channel.id in WAITING_ROOM_TO_CATEGORY:
        guild = member.guild
        category_id = WAITING_ROOM_TO_CATEGORY[after.channel.id]
        category = guild.get_channel(category_id)

        overwrites = {
            guild.default_role: discord.PermissionOverwrite(connect=False),
            member: discord.PermissionOverwrite(connect=True, manage_channels=True)
        }

        private_channel = await guild.create_voice_channel(
            name=f"Salon de {member.display_name}",
            overwrites=overwrites,
            category=category
        )

        private_channels[private_channel.id] = member.id
        await member.move_to(private_channel)

    if before.channel and before.channel.category_id in WAITING_ROOM_TO_CATEGORY.values():
        if len(before.channel.members) == 0 and before.channel.id not in WAITING_ROOM_TO_CATEGORY:
            private_channels.pop(before.channel.id, None)
            await before.channel.delete()

# UI Select
class InviteSelect(ui.Select):
    def __init__(self, author, voice_channel, members):
        self.author = author
        self.voice_channel = voice_channel

        options = [
            discord.SelectOption(label=member.display_name, value=str(member.id))
            for member in members if not member.bot and member != author][:25]  # MAX 25 membres

        super().__init__(
            placeholder="Choisis un membre à inviter",
            min_values=1,
            max_values > 1,
            options=options
        )

    async def callback(self, interaction: Interaction):
        if interaction.user != self.author:
            await interaction.response.send_message("❌ Tu n'as pas lancé ce menu.", ephemeral=True)
            return

        member_id = int(self.values[0])
        member = self.voice_channel.guild.get_member(member_id)

        if member:
            await self.voice_channel.set_permissions(
                member,
                connect=True,
                speak=True,
                view_channel=True
            )
            await interaction.response.send_message(f"✅ {member.mention} peut maintenant rejoindre ton salon.", ephemeral=True)
        else:
            await interaction.response.send_message("❌ Membre introuvable.", ephemeral=True)

# View
class InviteView(ui.View):
    def __init__(self, author, voice_channel, members):
        super().__init__(timeout=60)
        self.add_item(InviteSelect(author, voice_channel, members))

# 💬 Slash Command
@bot.tree.command(name="invite", description="Invite un membre dans ton salon vocal privé")
async def invite(interaction: discord.Interaction):
    author = interaction.user
    if not author.voice or not author.voice.channel:
        await interaction.response.send_message("❌ Tu dois être dans un salon vocal.", ephemeral=True)
        return

    channel = author.voice.channel
    owner_id = private_channels.get(channel.id)

    if owner_id != author.id:
        await interaction.response.send_message("❌ Tu n'es pas le propriétaire de ce salon.", ephemeral=True)
        return

    members = interaction.guild.members
    view = InviteView(author, channel, members)
    await interaction.response.send_message("👤 Choisis un membre à inviter :", view=view, ephemeral=True)

bot.run(TOKEN)