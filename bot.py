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
    def __init__(self, author, voice_channel, members, page=0):
        self.author = author
        self.voice_channel = voice_channel
        self.page = page
        self.members = [m for m in members if not m.bot and m != author]

        # Pagination
        self.max_per_page = 25
        start = self.page * self.max_per_page
        end = start + self.max_per_page
        page_members = self.members[start:end]

        # Créer options (et ignorer les membres sans label)
        options = []
        for member in page_members:
            label = member.display_name.strip() or member.name
            if label:
                options.append(discord.SelectOption(label=label[:100], value=str(member.id)))

        # Si aucune option, ajoute une option fantôme
        if not options:
            options.append(discord.SelectOption(label="Aucun membre", value="none"))

        super().__init__(
            placeholder="Choisis un membre à inviter",
            min_values=1,
            max_values=1,
            options=options
        )

    async def callback(self, interaction: Interaction):
        if interaction.user != self.author:
            await interaction.response.send_message("❌ Tu n'as pas lancé ce menu.", ephemeral=True)
            return

        member_id = self.values[0]
        if member_id == "none":
            await interaction.response.send_message("❌ Aucun membre sélectionné.", ephemeral=True)
            return

        member = self.voice_channel.guild.get_member(int(member_id))
        if member:
            await self.voice_channel.set_permissions(member, connect=True, speak=True, view_channel=True)
            await interaction.response.send_message(f"✅ {member.mention} peut maintenant rejoindre ton salon.", ephemeral=True)
        else:
            await interaction.response.send_message("❌ Membre introuvable.", ephemeral=True)


class InviteView(ui.View):
    def __init__(self, author, voice_channel, members, page=0):
        super().__init__(timeout=60)
        self.author = author
        self.voice_channel = voice_channel
        self.members = members
        self.page = page
        self.max_per_page = 25

        # Ajoute le menu déroulant
        self.add_item(InviteSelect(author, voice_channel, members, page))

        # Ajoute les boutons navigation
        total_pages = (len([m for m in members if not m.bot and m != author]) - 1) // 25 + 1

        if self.page > 0:
            self.add_item(ui.Button(label="← Précédent", style=discord.ButtonStyle.secondary, custom_id="prev"))

        if self.page < total_pages - 1:
            self.add_item(ui.Button(label="Suivant →", style=discord.ButtonStyle.secondary, custom_id="next"))

    @ui.button(label="← Précédent", style=discord.ButtonStyle.secondary, custom_id="prev", row=1)
    async def previous(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.edit_message(view=InviteView(self.author, self.voice_channel, self.members, self.page - 1))

    @ui.button(label="Suivant →", style=discord.ButtonStyle.secondary, custom_id="next", row=1)
    async def next(self, interaction: discord.Interaction, button: ui.Button):
        await interaction.response.edit_message(view=InviteView(self.author, self.voice_channel, self.members, self.page + 1))

class PreviousButton(ui.Button):
    def __init__(self, view):
        super().__init__(label="← Précédent", style=discord.ButtonStyle.primary)
        self.view_ref = view

    async def callback(self, interaction: Interaction):
        if interaction.user != self.view_ref.author:
            await interaction.response.send_message("❌ Tu n'as pas lancé ce menu.", ephemeral=True)
            return

        self.view_ref.page -= 1
        self.view_ref.update_items()
        await interaction.response.edit_message(
            content=f"👤 Choisis un membre à inviter : (Page {self.view_ref.page + 1} sur {self.view_ref.total_pages})",
            view=self.view_ref
        )


class NextButton(ui.Button):
    def __init__(self, view):
        super().__init__(label="Suivant →", style=discord.ButtonStyle.primary)
        self.view_ref = view

    async def callback(self, interaction: Interaction):
        if interaction.user != self.view_ref.author:
            await interaction.response.send_message("❌ Tu n'as pas lancé ce menu.", ephemeral=True)
            return

        self.view_ref.page += 1
        self.view_ref.update_items()
        await interaction.response.edit_message(
            content=f"👤 Choisis un membre à inviter : (Page {self.view_ref.page + 1} sur {self.view_ref.total_pages})",
            view=self.view_ref
        )
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
    view = InviteView(author, channel, interaction.guild.members)
    await interaction.response.send_message("👤 Choisis un membre à inviter :", view=view, ephemeral=True)


    await interaction.response.send_message(
        f"👤 Choisis un membre à inviter : (Page 1 sur {view.total_pages})",
        view=view,
        ephemeral=True
    )
bot.run(TOKEN)