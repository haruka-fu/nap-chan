import { Colors } from 'discord.js';

export class PokemonData {
    constructor(
        public id: number = 0,
        public name: string = "",
        public type: string = "",
        public pageUrl: string = "",
        public apiUrl: string = "",
        public img: string = ""
    ) { }
}

export const TypeColor: { [key: string]: number } = {
    "アタック型": Colors.Red,
    "ディフェンス型": Colors.Green,
    "バランス型": Colors.DarkPurple,
    "サポート型": Colors.Yellow,
    "スピード型": Colors.DarkBlue
};
