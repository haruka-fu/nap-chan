import axios from "axios";
import * as cheerio from "cheerio";

const url =
    "https://wikiwiki.jp/poke-unite/::cmd/popout?page=%E4%B8%80%E8%A6%A7&id=%E3%83%9D%E3%82%B1%E3%83%A2%E3%83%B3%E4%B8%80%E8%A6%A7";

export async function fetchPokemonList() {
    try {
        const res = await axios.get(url, { responseType: "text" });
        const html = res.data;
        const $ = cheerio.load(html);

        let results: {
            id: number;
            name: string;
            pageUrl: string;
            img: string;
        }[] = [];

        // ページ全体のテキストノードを走査して抽出
        $("#content table tbody tr").each((i, row) => {
            let result: {
                id: number;
                name: string;
                pageUrl: string;
                img: string;
            } = {
                id: i++,
                name: "",
                pageUrl: "",
                img: "",
            };
            $(row).find("th span").each((j, cell) => {
                const cellText = $(cell).text().trim();
                result.name = cellText || "";
            });
            $(row).find("th a").each((j, cell) => {
                const pageUrl = "https://wikiwiki.jp/" + $(cell).attr("href");
                const img = $(cell).find("img").attr("src");
                if (pageUrl) result.pageUrl = pageUrl || "";
                if (img) result.img = img;
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

(async () => {
    const list = await fetchPokemonList();
    console.log("取得件数:", list.length);
    console.log(list);
})();
