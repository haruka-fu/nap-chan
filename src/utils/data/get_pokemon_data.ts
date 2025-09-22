import axios from "axios";
import * as cheerio from "cheerio";

const url =
    "https://wikiwiki.jp/poke-unite/::cmd/popout?page=%E4%B8%80%E8%A6%A7&id=%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E4%B8%80%E8%A6%A7";

export async function fetchPokemonList() {
    try {
        const res = await axios.get(url, { responseType: "text" });
        const html = res.data;
        const $ = cheerio.load(html);

        const result: { id: any; name: any; }[] = [];

        // ページ全体のテキストノードを走査して抽出
        $("#content table tbody tr th span").each((i, row) => {
            $(row).each((j, cell) => {
                const cellText = $(cell).text().trim();
                result.push({ id: i, name: cellText });
                i++;
            });
        });

        return result;
    } catch (err) {
        console.error("取得エラー:", err);
        return [];
    }
}

(async () => {
    const list = await fetchPokemonList();
    console.log("取得件数:", list.length);
    console.log(list);
})();
