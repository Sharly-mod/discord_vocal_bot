import discord
from discord import ui, Interaction
from discord import app_commands
from discord.ext import commands

class PrivateVoice(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.WAITING = {  # IDs à adapter
            1299398594402586829: 1374094815788011631,
            1322976976352579636: 1374102251705995274,
            1370357006342553620: 1374102357901705367,
            1372691483014074569: 1374102284656578691,
        }
        self.private_channels = {}

    @commands.Cog.listener()
    async def on_voice_state_update(self, member, before, after):
        # Création
        if after.channel and after.channel.id in self.WAITING:
            guild = member.guild
            cat = guild.get_channel(self.WAITING[after.channel.id])
            vip = discord.utils.get(guild.roles, name="vip++")
            overwrites = { guild.default_role: discord.PermissionOverwrite(connect=False),
                           member: discord.PermissionOverwrite(connect=True, manage_channels=True) }
            if vip: overwrites[vip] = discord.PermissionOverwrite(connect=True, view_channel=True)
            vc = await guild.create_voice_channel(f"Salon de {member.display_name}", overwrites=overwrites, category=cat)
            self.private_channels[vc.id] = member.id
            await member.move_to(vc)
        # Suppression
        if before.channel and before.channel.id not in self.WAITING.values():
            if before.channel.id in self.private_channels and len(before.channel.members) == 0:
                self.private_channels.pop(before.channel.id, None)
                await before.channel.delete()

    @commands.Cog.listener()
    async def on_interaction(self, interaction: Interaction):
        # placeholder if besoin global
        pass
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
        self.total_pages = (len([m for m in members if not m.bot and m != author]) - 1) // self.max_per_page + 1

        self.add_item(InviteSelect(author, voice_channel, members, page))

        total_pages = (len([m for m in members if not m.bot and m != author]) - 1) // self.max_per_page + 1

        if page > 0:
            prev_button = ui.Button(label="← Précédent", style=discord.ButtonStyle.secondary, custom_id=f"prev_{page}")
            prev_button.callback = self.prev_callback
            self.add_item(prev_button)

        if page < total_pages - 1:
            next_button = ui.Button(label="Suivant →", style=discord.ButtonStyle.secondary, custom_id=f"next_{page}")
            next_button.callback = self.next_callback
            self.add_item(next_button)

    async def prev_callback(self, interaction: Interaction):
        await interaction.response.edit_message(view=InviteView(self.author, self.voice_channel, self.members, self.page - 1))

    async def next_callback(self, interaction: Interaction):
        await interaction.response.edit_message(view=InviteView(self.author, self.voice_channel, self.members, self.page + 1))

# 💬 Slash Command
        @app_commands.command(name="invite", description="Invite un membre dans ton salon vocal privé")
        async def invite(self, interaction: discord.Interaction):
        author = interaction.user
        if not author.voice or not author.voice.channel:
            await interaction.response.send_message("❌ Tu dois être dans un salon vocal.", ephemeral=True)
            return

        channel = author.voice.channel
        owner_id = self.private_channels.get(channel.id)

        vip_role = discord.utils.get(interaction.guild.roles, name="vip++")

        is_owner = owner_id == author.id
        is_admin = author.guild_permissions.administrator
        is_vip = vip_role in author.roles if vip_role else False

        if not (is_owner or is_admin or is_vip):
            await interaction.response.send_message("❌ Tu n'es pas le propriétaire du salon, ni administrateur, ni VIP++.", ephemeral=True)
            return

        members = interaction.guild.members
        view = InviteView(author, channel, members)

        await interaction.response.send_message(
            content=f"👤 Choisis un membre à inviter : (Page 1 sur {view.total_pages})",
            view=view,
            ephemeral=True
        )
async def setup(bot):
    await bot.add_cog(PrivateVoice(bot))