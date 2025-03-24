import * as cheerio from "cheerio";
import { Categories, Settings } from "~/main";
import { JSDOM } from "jsdom";
export async function getCategories(settings: Settings): Promise<Categories[]> {
    let html: string = null;
    try {
        if (!settings.categories.ssr) {
            let dom: JSDOM | null = null;
            try {
                dom = await JSDOM.fromURL(settings.web_url, {
                    runScripts: "dangerously",
                    resources: "usable",
                    pretendToBeVisual: false,
                });
                await new Promise((resolve) => {
                    dom.window.document.addEventListener(
                        "DOMContentLoaded",
                        resolve
                    );
                });
                html = dom.serialize();
                dom.window.close();
            } catch (error) {}
            // if (settings.categories.event_click) {
            //     await page.click(settings.categories.event_click);
            // }
        } else {
            const responseweb = await fetch(settings.web_url);
            html = await responseweb.text();
        }
        const $ = cheerio.load(html);
        const navCatContent = $(settings.categories.container_element);
        let categories: Categories[] = [];
        navCatContent
            .find(settings.categories.card.element)
            .each((_, element) => {
                const name = $(element)
                    .find(settings.categories.card.name)
                    .text()
                    .trim()!;
                const image = settings.categories.card.image
                    ? $(element)
                          .find(settings.categories.card.image)
                          .text()
                          .trim()
                    : null;
                const url =
                    $(element)
                        .find(settings.categories.card.url)
                        .attr("href") || settings.web_url;
                const deleteUrlCategoria = settings.categories.web_url
                    ? url.replace(settings.categories.web_url, "")
                    : url;
                categories = [
                    ...categories,
                    { name, url: deleteUrlCategoria, image },
                ];
            });
        return categories;
    } catch (error) {
        return [];
    }
}
export async function getProducts(settings: Settings): Promise<Categories[]> {
    let html: string = null;
    try {
        if (!settings.categories.ssr) {
            let dom: JSDOM | null = null;
            try {
                dom = await JSDOM.fromURL(settings.web_url, {
                    runScripts: "dangerously",
                    resources: "usable",
                    pretendToBeVisual: false,
                });
                await new Promise((resolve) => {
                    dom.window.document.addEventListener(
                        "DOMContentLoaded",
                        resolve
                    );
                });
                html = dom.serialize();
                dom.window.close();
            } catch (error) {}
            // if (settings.categories.event_click) {
            //     await page.click(settings.categories.event_click);
            // }
        } else {
            const responseweb = await fetch(settings.web_url);
            html = await responseweb.text();
        }
        const $ = cheerio.load(html);
        const navCatContent = $(settings.categories.container_element);
        let categories: Categories[] = [];
        navCatContent
            .find(settings.categories.card.element)
            .each((_, element) => {
                const name = $(element)
                    .find(settings.categories.card.name)
                    .text()
                    .trim()!;
                const image = settings.categories.card.image
                    ? $(element)
                          .find(settings.categories.card.image)
                          .text()
                          .trim()
                    : null;
                const url =
                    $(element)
                        .find(settings.categories.card.url)
                        .attr("href") || settings.web_url;
                const deleteUrlCategoria = settings.categories.web_url
                    ? url.replace(settings.categories.web_url, "")
                    : url;
                categories = [
                    ...categories,
                    { name, url: deleteUrlCategoria, image },
                ];
            });
        return categories;
    } catch (error) {
        return [];
    }
}
