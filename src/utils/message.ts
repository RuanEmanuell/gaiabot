import { ColorResolvable, EmbedBuilder } from "discord.js";

export function createMessage(messageParams: { color: ColorResolvable; title: string; thumbnail: string; fields: any[]; url?: string; image?: string }) {
    const embed = new EmbedBuilder()
        .setColor(messageParams.color)
        .setTitle(messageParams.title)
        .setThumbnail(messageParams.thumbnail)
        .addFields(
            messageParams.fields
        );
    if (messageParams.url) {
        embed.setURL(messageParams.url);
    }
    if (messageParams.image) {
        embed.setImage(messageParams.image);
    }
    return embed;
}

