import discord
from discord import ui, Interaction, app_commands
from discord.ext import commands
import os
import asyncio
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
access_requests = {}  # {channel_id: [user_id, ...]}
private_channels = {}

@bot.event
async def on_ready():
    await bot.tree.sync(guild=discord.Object(id=1299398593207078982))
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

@bot.tree.command(name="request", description="Demande l'accès à un salon vocal privé")
@app_commands.describe(membre="Mentionne le membre à qui appartient le salon")
async def request(interaction: discord.Interaction, membre: discord.Member):
    requester = interaction.user
    if not membre.voice or not membre.voice.channel:
        await interaction.response.send_message("❌ Ce membre n'est pas dans un salon vocal.", ephemeral=True)
        return

    channel = membre.voice.channel
    if private_channels.get(channel.id) != membre.id:
        await interaction.response.send_message("❌ Ce n'est pas un salon privé appartenant à ce membre.", ephemeral=True)
        return

    access_requests.setdefault(channel.id, [])

    if requester.id in access_requests[channel.id]:
        await interaction.response.send_message("⏳ Tu as déjà fait une demande pour ce salon.", ephemeral=True)
        return

    access_requests[channel.id].append(requester.id)
    await interaction.response.send_message("📨 Demande envoyée. Elle expirera dans 5 minutes.", ephemeral=True)

    try:
        await membre.send(f"🔔 {requester.display_name} souhaite rejoindre ton salon vocal privé. Utilise `/accept {requester.mention}` ou `/deny {requester.mention}`.")
    except discord.Forbidden:
        pass

    # Auto-suppression après 5 minutes
    async def remove_request_later():
        await asyncio.sleep(300)
        channel_requests = access_requests.get(channel.id)
        if channel_requests and requester.id in channel_requests:
            channel_requests.remove(requester.id)
            try:
                await requester.send("⌛ Ta demande d'accès a expiré (5 minutes).")
            except discord.Forbidden:
                pass

    asyncio.create_task(remove_request_later())

@bot.tree.command(name="accept", description="Accepte un membre dans ton salon vocal privé")
@app_commands.describe(membre="Mentionne le membre à accepter")
async def accept(interaction: discord.Interaction, membre: discord.Member):
    author = interaction.user
    if not author.voice or not author.voice.channel:
        await interaction.response.send_message("❌ Tu dois être dans ton salon vocal privé.", ephemeral=True)
        return

    channel = author.voice.channel
    if private_channels.get(channel.id) != author.id:
        await interaction.response.send_message("❌ Tu n'es pas le propriétaire de ce salon.", ephemeral=True)
        return

    if membre.id not in access_requests.get(channel.id, []):
        await interaction.response.send_message("❌ Ce membre n'a pas fait de demande pour ce salon.", ephemeral=True)
        return

    await channel.set_permissions(membre, connect=True, speak=True, view_channel=True)
    access_requests[channel.id].remove(membre.id)

    await interaction.response.send_message(f"✅ {membre.mention} peut maintenant rejoindre le salon.", ephemeral=True)

@bot.tree.command(name="deny", description="Refuse une demande d'accès à ton salon vocal privé")
@app_commands.describe(membre="Mentionne le membre à refuser")
async def deny(interaction: discord.Interaction, membre: discord.Member):
    author = interaction.user
    if not author.voice or not author.voice.channel:
        await interaction.response.send_message("❌ Tu dois être dans ton salon vocal privé.", ephemeral=True)
        return

    channel = author.voice.channel
    if private_channels.get(channel.id) != author.id:
        await interaction.response.send_message("❌ Tu n'es pas le propriétaire de ce salon.", ephemeral=True)
        return

    if membre.id not in access_requests.get(channel.id, []):
        await interaction.response.send_message("❌ Ce membre n'a pas demandé l'accès à ce salon.", ephemeral=True)
        return

    access_requests[channel.id].remove(membre.id)
    await interaction.response.send_message(f"🚫 Accès refusé pour {membre.mention}.", ephemeral=True)

    try:
        await membre.send(f"🚫 {author.display_name} a refusé ta demande pour rejoindre son salon vocal.")
    except discord.Forbidden:
        pass


bot.run(TOKEN)