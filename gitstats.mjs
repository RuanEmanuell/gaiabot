import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();
const key = process.env.PRIVATE_KEY;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once("ready", () => {
    console.log("Ready to rumble!");
});

client.login(key);

client.on('messageCreate', async message => {
    const messageText = message.content;
    if (!message.author.bot && messageText.startsWith("!")) {
        const desiredComand = messageText.substring(0, messageText.indexOf(" "));
        switch (desiredComand) {
            case "!profile":
                const desiredProfile = messageText.substring(messageText.indexOf(" ") + 1, messageText.length);
                try {
                    const url = `https://api.github.com/users/${desiredProfile}`
                    const response = await fetch(url);
                    const data = await response.json();
                    console.log(data);
                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`${data.login} Profile`)
                        .setURL(`https://github.com/${desiredProfile}`)
                        .setThumbnail("https://i.pinimg.com/originals/b5/1b/78/b51b78ecc9e5711274931774e433b5e6.png")
                        .addFields(
                            { name: "Nickname", value: `${data.login}` },
                            { name: "Name", value: `${data.name}` },
                            { name: "Repositories (Public)", value: `${data.public_repos}` },
                            { name: "Followers", value: `${data.followers}` },
                            { name: "Following", value: `${data.following}` },
                            { name: "Website", value: `${data.blog ? data.blog : "None"}` }
                        )
                        .setImage(`${data.avatar_url}`);
                    await message.reply({ embeds: [embed] });
                } catch (error) {
                    console.log(error);
                    message.reply("An error ocurred. We could not find the desired profile. Try again!");
                }
                break;
            case "!repo":

                break;
            default:
                message.reply("Command not found. Try '!profile {name}' or '!repo {name}'")
                break;
        }
    }
});