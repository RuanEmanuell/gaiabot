import { EmbedBuilder } from "discord.js";

export function createMessage(messageParams) {
    const embed = new EmbedBuilder()
        .setColor(messageParams.color)
        .setTitle(messageParams.title)
        .setThumbnail(messageParams.thumbnail)
        .addFields(
            messageParams.fields
        )
        .setURL(messageParams.url)
        .setImage(messageParams.image);
    return embed;
}

