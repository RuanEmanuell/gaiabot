import { Client, GatewayIntentBits, VoiceChannel } from "discord.js";
import { NoSubscriberBehavior, VoiceConnection, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { createMessage } from "./utils/message.ts";

import dotenv from "dotenv";
import ytdl from "ytdl-core";
import OpusScript from "opusscript";
import { Readable, Writable } from "stream";
import {execSync, spawn} from "child_process";

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
                    const profileFields = [
                        { name: "Nickname", value: `${data.login}` },
                        { name: "Nome", value: `${data.name}` },
                        { name: "Repositórios (Publicos)", value: `${data.public_repos}` },
                        { name: "Seguidores", value: `${data.followers}` },
                        { name: "Seguindo", value: `${data.following}` },
                        { name: "Localização", value: `${data.location ? data.location : "Não informada"}` },
                        { name: "Website", value: `${data.blog ? data.blog : "Nenhum"}` }
                    ]
                    const embed = createMessage({
                        color: 0x0099FF,
                        title: `Perfil do(a) ${data.login}`,
                        url: `https://github.com/${desiredProfile}`,
                        thumbnail: "https://i.pinimg.com/originals/b5/1b/78/b51b78ecc9e5711274931774e433b5e6.png",
                        fields: profileFields, image: `${data.avatar_url}`
                    })
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
                            const repoFields = [
                                { name: "Nome", value: `${repo.name}` },
                                { name: "Descrição", value: `${repo.description}` },
                                { name: "Criador", value: `${repo.full_name.substring(0, repo.full_name.indexOf('/'))}` },
                                { name: "Linguagem principal", value: `${repo.language}` },
                                { name: "Criado em", value: `${repo.created_at.substring(0, 10)}` },
                                { name: "Ultima vez atualizado em", value: `${repo.pushed_at.substring(0, 10)}` },
                                { name: "Website", value: `${repo.homepage ? repo.homepage : "Nenhum"}` }
                            ]
                            const embed = createMessage({
                                color: 0x0099FF,
                                title: `Repositório ${repo.full_name}`,
                                url: `${repo.html_url}`,
                                thumbnail: "https://i.pinimg.com/originals/b5/1b/78/b51b78ecc9e5711274931774e433b5e6.png",
                                fields: repoFields
                            })
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
                    const repoFields = [
                        { name: "Nome", value: `${data.name}` },
                        { name: "Descrição", value: `${data.description}` },
                        { name: "Criador", value: `${data.full_name.substring(0, data.full_name.indexOf('/'))}` },
                        { name: "Linguagem principal", value: `${data.language}` },
                        { name: "Criado em", value: `${data.created_at.substring(0, 10)}` },
                        { name: "Ultima vez atualizado em", value: `${data.pushed_at.substring(0, 10)}` },
                        { name: "Website", value: `${data.homepage ? data.homepage : "Nenhum"}` }
                    ]
                    const embed = createMessage({
                        color: 0x0099FF,
                        title: `Repositório ${data.full_name}`,
                        url: `${data.html_url}`,
                        thumbnail: "https://i.pinimg.com/originals/b5/1b/78/b51b78ecc9e5711274931774e433b5e6.png",
                        fields: repoFields,
                    })
                    await message.reply({ embeds: [embed] });
                } catch (error) {
                    console.log(error);
                    message.reply("Um erro ocorreu. Não consegui encontrar o repositório desejado. Tente novamente ou digite '!gaiahelp' para ver os comandos disponíveis!");
                }
                break;
            case "!gaiaplay":
                const voiceChannel = message.member?.voice.channel;
                if (!voiceChannel) {
                    message.reply("Você precisa estar em um canal de voz para pedir uma música!");
                    return;
                }

                const permissions = voiceChannel?.permissionsFor(message.client.user);
                if (!permissions?.has("Connect") || !permissions.has("Speak")) {
                    message.reply("Eu não tenho as permissões necessárias para tocar música!");
                    return;
                }

                const requestedSong = messageText.substring(messageText.indexOf(" ") + 1);

                message.reply(requestedSong);

                try {
                    const stream = ytdl(requestedSong, { filter: "audioonly" });


                    const convertedStream = await convertAudioFormat(stream);

                    async function convertAudioFormat(stream: Readable): Promise<Writable> {
                        return new Promise((resolve, reject) => {
                            try {
                                const sox = spawn('sox', [
                                    '-t', 's16', '-r', '48000', '-c', '2', '-e', 'signed-integer', '-', '-t', 'wav', '-'
                                ]);
                                const convertedStream = sox.stdin;
                                stream.pipe(convertedStream);
                                resolve(convertedStream);
                            } catch (error) {
                                console.error('Erro ao executar o sox:', error);
                                reject(error);
                            }
                        });
                    }
                    

                    async function convertStreamToOpus(stream: Writable): Promise<Readable> {
                        return new Promise((resolve, reject) => {
                            try {
                                const command = `ffmpeg -i pipe:0 -f s16le -ar 48000 -ac 2 -f opus -vbr on pipe:1`;
                                const opusBuffer = execSync(command);
                                const opusStream = new Readable();
                                opusStream.push(opusBuffer);
                                opusStream.push(null);
                                resolve(opusStream);
                            } catch (error) {
                                console.error('Erro ao executar o ffmpeg:', error);
                                reject(error);
                            }
                        });
                    }
    
                    const opusStream = await convertStreamToOpus(convertedStream);
                    const resource = createAudioResource(opusStream);

                    const connection = joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: voiceChannel.guild.id,
                        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                        selfDeaf: false
                    });

                    const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } });

                    player.play(resource);
                    player.on("error", (error) => {
                        console.error(error);
                        message.reply("Ocorreu um erro ao tocar a música. Tente novamente.");
                        connection.destroy();
                    });

                } catch (error) {
                    console.error(error);
                    message.reply("Ocorreu um erro ao iniciar a música. Tente novamente.");
                }
                break;
            case "!gaiahelp":
                const commandFields = [
                    { name: "!gitprofile {user_name}", value: "Ver informações de um perfil do Github" },
                    { name: "!gitsearch {repo_name}", value: "Pesquisar repositórios do Github. Em caso de mais de um repositório com o mesmo nome encontrado, serão mostrados os 5 primeiros." },
                    { name: "!gitrepo {user_name} {repo_name}", value: "Ver informações de um repositório específico de um usuário do Github." },
                    { name: "!gaiahelp", value: "Ver todos os comandos disponíveis" },
                ];
                const embed = createMessage({
                    color: 0x0099FF,
                    title: "Comandos disponíveis do GaiaBot",
                    thumbnail: "https://i.pinimg.com/originals/b5/1b/78/b51b78ecc9e5711274931774e433b5e6.png",
                    fields: commandFields,
                });
                message.reply({ embeds: [embed] });
                break;
            default:
                message.reply("Comando não encontrado. Tente '!gaiahelp' para ver os comandos disponíveis!")
                break;
        }
    }
});