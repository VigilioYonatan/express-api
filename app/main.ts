import { JSDOM } from "jsdom";
import { delay } from "./lib/helpers";
async function scrape() {
    const dom = await JSDOM.fromURL(
        "https://compuvisionperu.pe/CYM/shop-list-ctg.php?ctg=024",
        {
            runScripts: "dangerously",
            resources: "usable",
        }
    );
    await delay(30);
    const titulo =
        dom.window.document.querySelector(".product_title a")?.textContent;
    console.log({ titulo });
}

scrape();
