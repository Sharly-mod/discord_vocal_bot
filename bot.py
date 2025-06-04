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
    await bot.load_extension("cogs.afk_muter")
    print(f"{bot.user} est prêt.")

@bot.event
async def on_voice_state_update(member, before, after):
    if after.channel and after.channel.id in WAITING_ROOM_TO_CATEGORY:
        guild = member.guild
        category_id = WAITING_ROOM_TO_CATEGORY[after.channel.id]
        category = guild.get_channel(category_id)

        vip_role = discord.utils.get(guild.roles, name="vip++")

        overwrites = {
            guild.default_role: discord.PermissionOverwrite(connect=False),
            member: discord.PermissionOverwrite(connect=True, manage_channels=True)
        }

# Si le rôle VIP++ existe, on lui donne l'accès automatiquement
        if vip_role:
            overwrites[vip_role] = discord.PermissionOverwrite(connect=True, view_channel=True)
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


# 💬 Slash Command
@bot.tree.command(name="invite", description="Invite un membre dans ton salon vocal privé")
@app_commands.describe(membre="Mentionne le membre à inviter")
async def invite(interaction: discord.Interaction, membre: discord.Member):
    author = interaction.user
    if not author.voice or not author.voice.channel:
        await interaction.response.send_message("❌ Tu dois être dans un salon vocal.", ephemeral=True)
        return

    channel = author.voice.channel
    owner_id = private_channels.get(channel.id)

    vip_role = discord.utils.get(interaction.guild.roles, name="vip++")

    is_owner = owner_id == author.id
    is_admin = author.guild_permissions.administrator
    is_vip = vip_role in author.roles if vip_role else False

    if not (is_owner or is_admin or is_vip):
        await interaction.response.send_message("❌ Tu n'es pas le propriétaire du salon, ni administrateur, ni VIP++.", ephemeral=True)
        return

    await channel.set_permissions(membre, connect=True, speak=True, view_channel=True)

    embed = discord.Embed(
        title="✅ Invitation envoyée",
        description=f"{membre.mention} peut maintenant rejoindre ton salon.",
        color=discord.Color.green()
    )
    embed.set_thumbnail(url=membre.display_avatar.url)

    await interaction.response.send_message(embed=embed, ephemeral=True)

bot.run(TOKEN)