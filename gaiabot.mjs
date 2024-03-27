import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();
const key = process.env.PRIVATE_KEY;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once("ready", () => {
    console.log("Gaia Bot ao seu dispor!");
});

client.login(key);

client.on('messageCreate', async message => {
    const messageText = message.content;
    if (!message.author.bot && messageText.startsWith("!")) {
        const desiredComand = messageText.includes(" ") ? messageText.substring(0, messageText.indexOf(" ")) : messageText;
        switch (desiredComand) {
            case "!gitprofile":
                const desiredProfile = messageText.substring(messageText.indexOf(" ") + 1, messageText.length);
                try {
                    const url = `https://api.github.com/users/${desiredProfile}`
                    const response = await fetch(url);
                    const data = await response.json();
                    console.log(data);
                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`Perfil do(a) ${data.login}`)
                        .setURL(`https://github.com/${desiredProfile}`)
                        .setThumbnail("https://i.pinimg.com/originals/b5/1b/78/b51b78ecc9e5711274931774e433b5e6.png")
                        .addFields(
                            { name: "Nickname", value: `${data.login}` },
                            { name: "Nome", value: `${data.name}` },
                            { name: "Repositórios (Publicos)", value: `${data.public_repos}` },
                            { name: "Seguidores", value: `${data.followers}` },
                            { name: "Seguindo", value: `${data.following}` },
                            { name: "Localização", value: `${data.location}` },
                            { name: "Website", value: `${data.blog ? data.blog : "Nenhum"}` }
                        )
                        .setImage(`${data.avatar_url}`);
                    await message.reply({ embeds: [embed] });
                } catch (error) {
                    console.log(error);
                    message.reply("Um erro ocorreu. Não consegui encontrar o perfil desejado. Tente novamente ou digite '!gaiahelp' para ver os comandos disponíveis!");
                }
                break;
            case "!gitsearch":
                const desiredSearch = messageText.substring(messageText.indexOf(" ") + 1, messageText.length);
                try {
                    const url = `https://api.github.com/search/repositories?q=${desiredSearch}`
                    const response = await fetch(url);
                    const data = await response.json();
                    message.reply(`Repositórios encontrados com o nome ${desiredSearch}: ${data.total_count}. Mostrarei no máximo os 5 primeiros.`);
                    if (data.items.length > 0) {
                        for (let i = 0; i < data.items.length && i < 5; i++) {
                            const repo = data.items[i];
                            const embed = new EmbedBuilder()
                                .setColor(0x0099FF)
                                .setTitle(`Repositório ${repo.full_name}`)
                                .setURL(`${repo.html_url}`)
                                .setThumbnail("https://i.pinimg.com/originals/b5/1b/78/b51b78ecc9e5711274931774e433b5e6.png")
                                .addFields(
                                    { name: "Nome", value: `${repo.name}` },
                                    { name: "Descrição", value: `${repo.description}` },
                                    { name: "Criador", value: `${repo.full_name.substring(0, repo.full_name.indexOf('/'))}` },
                                    { name: "Linguagem principal", value: `${repo.language}` },
                                    { name: "Criado em", value: `${repo.created_at.substring(0, 10)}` },
                                    { name: "Ultima vez atualizado em", value: `${repo.pushed_at.substring(0, 10)}` },
                                    { name: "Website", value: `${repo.homepage ? repo.homepage : "Nenhum"}` }
                                );
                            await message.reply({ embeds: [embed] });
                        }
                    }
                } catch (error) {
                    console.log(error);
                    message.reply("Um erro ocorreu. Não consegui encontrar o repositório desejado. Tente novamente ou digite '!gaiahelp' para ver os comandos disponíveis!");
                }
                break;
            case "!gitrepo":
                const firstSpaceIndex = messageText.indexOf(" ") + 1;
                const desiredUser = messageText.substring(firstSpaceIndex, messageText.indexOf(" ", firstSpaceIndex)).trim();
                const desiredRepo = messageText.substring(messageText.indexOf(desiredUser) + desiredUser.length, messageText.length).trim();
                try {
                    const url = `https://api.github.com/repos/${desiredUser}/${desiredRepo}`
                    const response = await fetch(url);
                    const data = await response.json();
                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(`Repositório ${data.full_name}`)
                        .setURL(`${data.html_url}`)
                        .setThumbnail("https://i.pinimg.com/originals/b5/1b/78/b51b78ecc9e5711274931774e433b5e6.png")
                        .addFields(
                            { name: "Nome", value: `${data.name}` },
                            { name: "Descrição", value: `${data.description}` },
                            { name: "Criador", value: `${data.full_name.substring(0, data.full_name.indexOf('/'))}` },
                            { name: "Linguagem principal", value: `${data.language}` },
                            { name: "Criado em", value: `${data.created_at.substring(0, 10)}` },
                            { name: "Ultima vez atualizado em", value: `${data.pushed_at.substring(0, 10)}` },
                            { name: "Website", value: `${data.homepage ? data.homepage : "Nenhum"}` }
                        );
                    await message.reply({ embeds: [embed] });
                } catch (error) {
                    console.log(error);
                    message.reply("Um erro ocorreu. Não consegui encontrar o repositório desejado. Tente novamente ou digite '!gaiahelp' para ver os comandos disponíveis!");
                }
                break;
            case "!gaiahelp":
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("Comandos disponíveis do GaiaBot")
                    .setThumbnail("https://i.pinimg.com/originals/b5/1b/78/b51b78ecc9e5711274931774e433b5e6.png")
                    .addFields(
                        { name: "!gitprofile {user_name}", value: "Ver informações de um perfil do Github" },
                        { name: "!gitsearch {repo_name}", value: "Pesquisar repositórios do Github. Em caso de mais de um repositório com o mesmo nome encontrado, serão mostrados os 5 primeiros." },
                        { name: "!gitrepo {user_name} {repo_name}", value: "Ver informações de um repositório específico de um usuário do Github." },
                        { name: "!gaiahelp", value: "Ver todos os comandos disponíveis" },
                    )
                message.reply({ embeds: [embed] });
                break;
            default:
                message.reply("Comando não encontrado. Tente '!gaiahelp' para ver os comandos disponíveis!")
                break;
        }
    }
});