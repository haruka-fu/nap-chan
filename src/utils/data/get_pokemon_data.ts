import axios from "axios";
import * as cheerio from "cheerio";
import { PokemonData } from "../../model/pokemon_data_list";

const url =
    "https://wikiwiki.jp/poke-unite/::cmd/popout?page=%E4%B8%80%E8%A6%A7&id=%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E4%B8%80%E8%A6%A7";

export async function fetchPokemonList() {
    try {
        const res = await axios.get(url, { responseType: "text" });
        const html = res.data;
        const $ = cheerio.load(html);

        let results: PokemonData[] = [];

        // ページ全体のテキストノードを走査して抽出
        $("#content table tbody tr").each((i, row) => {
            let result = new PokemonData(0, "", "", "", "");

            $(row).find("th span").each((j, cell) => {
                const cellText = $(cell).text().trim();
                result.name = cellText || "";
                result.id = j + 1;
            });
            $(row).find("th a").each((j, cell) => {
                const pageUrl = "https://wikiwiki.jp/" + $(cell).attr("href");
                const img = $(cell).find("img").attr("src");
                if (pageUrl) result.pageUrl = pageUrl || "";
                if (img) result.img = img || "";
            });
            $(row).find("td").eq(1).each((j, cell) => {
                result.type = $(cell).text().trim() || "";
            });
            if (result.name) {
                results.push(result);
            }
        });

        return results;
    } catch (err) {
        console.error("取得エラー:", err);
        return [];
    }
}
