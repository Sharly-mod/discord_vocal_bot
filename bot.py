import discord
from discord.ext import commands
import os
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("TOKEN")
intents = discord.Intents.default()
intents.voice_states = True
intents.guilds = True
intents.members = True
intents.message_content = True  # Important pour les commandes texte

bot = commands.Bot(command_prefix="!", intents=intents)

# Mapping entre ID des salles d’attente et ID des catégories associées
WAITING_ROOM_TO_CATEGORY = {
    1299398594402586829: 1374094815788011631,  # Attente 1 → Catégorie 1
    1322976976352579636: 1374102251705995274,  # Attente 2 → Catégorie 2
    1370357006342553620: 1374102357901705367,  # Attente 3 → Catégorie 3
    1372691483014074569: 1374102284656578691,  # Attente 4 → Catégorie 4
}


# Dictionnaire des vocaux privés avec leur propriétaire
private_channels = {}

@bot.event
async def on_ready():
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

    # Supprimer les vocaux vides
    if before.channel and before.channel.category_id in WAITING_ROOM_TO_CATEGORY.values():
        if len(before.channel.members) == 0 and before.channel.id not in WAITING_ROOM_TO_CATEGORY:
            private_channels.pop(before.channel.id, None)
            await before.channel.delete()
class MemberSelect(discord.ui.Select):
    def __init__(self, channel: discord.VoiceChannel, members):
        self.channel = channel
        options = [
            discord.SelectOption(label=member.display_name, value=str(member.id))
            for member in members
        ]
        super().__init__(placeholder="🎧 Choisis les membres à inviter", min_values=1, max_values=len(options), options=options)

    async def callback(self, interaction: discord.Interaction):
        selected_ids = [int(member_id) for member_id in self.values]
        for member_id in selected_ids:
            member = interaction.guild.get_member(member_id)
            if member:
                await self.channel.set_permissions(
                    member,
                    connect=True,
                    speak=True,
                    view_channel=True
                )

        await interaction.response.send_message("✅ Les membres peuvent maintenant **rejoindre et parler** dans ton salon.", ephemeral=True)

class SelectView(discord.ui.View):
    def __init__(self, channel, members):
        super().__init__()
        self.add_item(MemberSelect(channel, members))
@bot.command()
async def invite(ctx):
    """Commande pour inviter des gens dans ton salon vocal privé."""
    if ctx.author.voice and ctx.author.voice.channel:
        channel = ctx.author.voice.channel

        # Optionnel : vérifie que l'utilisateur est bien propriétaire du salon (à adapter selon ton système)
        # if not channel.name.startswith(f"{ctx.author.name}-"):
        #     return await ctx.send("❌ Tu ne peux inviter que dans ton propre salon.")

        # Liste des membres à inviter (hors bots et l'auteur)
        members = [m for m in ctx.guild.members if not m.bot and m != ctx.author]

        if not members:
            return await ctx.send("⚠️ Aucun membre à inviter.")

        embed = discord.Embed(
            title="🎧 Invitation vocale",
            description="Sélectionne les personnes à inviter dans ton salon privé.",
            color=discord.Color.blue()
        )
        await ctx.send(embed=embed, view=SelectView(channel, members))
    else:
        await ctx.send("❌ Tu dois être connecté à un salon vocal pour utiliser cette commande.")


bot.run(TOKEN)