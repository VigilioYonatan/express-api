import * as cheerio from "cheerio";
import { webkit } from "playwright";
import { Categories, Settings } from "~/main";
export async function getCategories(settings: Settings): Promise<Categories[]> {
    if (!settings.categories.ssr) {
        const browser = await webkit.launch({
            headless: false,
            args: ["--disable-dev-shm-usage"],
        }); // headless: true para producción
        try {
            const context = await browser.newContext({
                // viewport: null,
                // ignoreHTTPSErrors: true,
                // javaScriptEnabled: false,
            });
            const page = await context.newPage();
            await page.route(
                "**/*.{png,jpg,jpeg,svg,gif,webp,woff,woff2,ttf,mp4,webm,avi,mov,mkv}",
                (route) => route.abort()
            );

            await page.goto(settings.web_url);
            await page.waitForSelector(settings.categories.container_element);
            // if (settings.categories.event_click) {
            //     await page.click(settings.categories.event_click);
            // }
            const categories = await page.$$eval(
                `${settings.categories.container_element} ${settings.categories.card.element}`,
                (elements) => {
                    return elements.map((element) => {
                        const name =
                            element
                                .querySelector(settings.categories.card.name)
                                ?.textContent?.trim() || "";
                        const image = settings.categories.card.image
                            ? element
                                  .querySelector(settings.categories.card.image)
                                  ?.getAttribute("src") || null // Usar getAttribute('src') para imágenes
                            : null;
                        const url =
                            element
                                .querySelector(settings.categories.card.url)
                                ?.getAttribute("href") || settings.web_url;
                        const deleteUrlCategoria = settings.categories.web_url
                            ? url.replace(settings.categories.web_url, "")
                            : url;

                        return { name, url: deleteUrlCategoria, image };
                    });
                }
            );
            console.log("aca");

            return categories;
        } catch (error) {
            console.error("Error en CSR:", error);
            return [];
        } finally {
            await browser.close();
        }
    }
    try {
        const responseweb = await fetch(settings.web_url);
        const resultWeb = await responseweb.text();
        const $ = cheerio.load(resultWeb);
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
