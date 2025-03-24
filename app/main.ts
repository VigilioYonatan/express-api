// import { addAlias } from "module-alias";
// import path from "node:path";
// // here more absolute paths
// addAlias("~", path.resolve(__dirname));
// addAlias("@", path.resolve(__dirname, "services"));
// import { Server } from "~/config/server";
// const application = new Server();
// export const app = application.app;
// export const server = application.listen();
import { getCategories } from "./lib/cheerio";
import * as cheerio from "cheerio";
import { removeTextHTML } from "./lib/helpers";
/*** SETTINGS */
interface CategoryPrincipal {
    ssr: boolean;
    web_url: string | null;
    event_click: string | null;
    container_element: string;
    card: {
        element: string;
        name: string;
        url: string;
        image: string | null;
    };
}
interface CategoryCustom {
    web_url: string | null;
    categories: { url: string; name: string }[];
}

export interface Settings {
    web_url: string;
    categories: CategoryPrincipal | CategoryCustom;
    products: {
        ssr: {
            query: string;
            page_no_found: string | null;
        } | null;
        no_ssr: {
            query: string | null;
        } | null;
        web_url: string | null; //puede que ya haya un link para hacer scrappig de una
        event_click: string | null;
        container_element: string;
        card: {
            element: string;
            name: string;
            url: string;
            price: string | null;
            quantity: string | null;
        };
        product_url: string | null;
        image_url: string | null;
        limit: number | null;
    };
    product: {
        ssr: false | string;
        // web_url: string | null;
        event_click: string | null;
        container_element: string;
        card: {
            element: string;
            name: string;
            url: string;
            price: string | null;
            quantity: string | null;
            description: string | null;
            marca: string | null;
            images: string[] | null;
        };
    };
}

export interface Categories {
    image: string | null;
    name: string;
    url: string;
}
// let categorias: Categories[] = [];
// let subcategorias = [];

interface Product {
    name: string | null;
    url: string | null;
    images: string[] | null;
    price: string | null;
    quantity: string | null;
    marca: string | null;
    description: string | null;
    variants: string | null;
}
let productos: Product[] = [];
// // (async () => {

// //     console.log("Categorías encontradas:", categorias);
// // })();

(async () => {
    // const settings: Settings = {
    // web_url: "https://compuvisionperu.pe/CYM",
    // categories: {
    //     ssr: false,
    //     web_url: null,
    //     container_element: "#navCatContent",
    //     event_click: null,
    //     card: {
    //         element: "> ul > li",
    //         name: "> a > span",
    //         url: "> a",
    //         image: null,
    //     },
    // },

    // };
    const settings: Settings = {
        web_url: "https://cyccomputer.pe",
        categories: {
            ssr: true,
            web_url: "https://cyccomputer.pe/categoria",
            container_element: ".menu-content",
            event_click: ".title-menu",
            card: {
                element: "> .cat-parent",
                name: "> a > span",
                url: "> a",
                image: null,
            },
        },
        products: {
            ssr: { query: "page", page_no_found: null },
            no_ssr: null,
            web_url: null,
            container_element: "#js-product-list",
            event_click: null,
            limit: 12,
            card: {
                element: ".item-inner",
                name: ".productName > a",
                url: ".productName  > a",
                price: ".quantity",
                quantity: null,
            },
            product_url: "https://cyccomputer.pe/producto",
            image_url: "https://cyccomputer.pe",
        },
        product: {
            ssr: false,
            container_element: "#products",
            event_click: null,
            card: {
                element: ".item-inner",
                name: ".productName",
                url: ".productName",
                price: null,
                quantity: null,
                description: null,
                images: null,
                marca: null,
            },
        },
    };

    // let categories: Categories[] = JSON.parse(
    //     fs.existsSync("./categories.txt")
    //         ? fs.readFileSync("./categories.txt", { encoding: "utf-8" })
    //         : "[]"
    // );

    // if (!categories.length) {
    // categorias
    let categories = null;
    if ((settings.categories as CategoryPrincipal)?.card) {
        categories = await getCategories(settings);
    } else {
        categories = (settings.categories as CategoryCustom).categories;
    }

    // fs.writeFileSync("./categories.txt", JSON.stringify(categories));
    // }
    // let products: {
    //     name: string;
    //     url: string;
    //     quantity: string | null;
    //     price: string | null;
    //     category: string;
    // }[][] = JSON.parse(
    //     fs.existsSync("./products.txt")
    //         ? fs.readFileSync("./products.txt", { encoding: "utf-8" })
    //         : "[]"
    // );
    let products: {
        name: string;
        url: string;
        quantity: string | null;
        price: string | null;
        category: string;
    }[][] = [];
    if (!products.length) {
        for await (const cat of categories.slice(0, 4)) {
            let datas: {
                name: string;
                url: string;
                quantity: string | null;
                price: string | null;
                category: string;
            }[] = [];
            let hayMasPaginas = true;
            let pageNumber = 1;
            while (hayMasPaginas) {
                const url = settings.categories.web_url
                    ? `${settings.categories.web_url}${cat.url}`
                    : cat.url;
                try {
                    const response = await fetch(
                        `${url}?${settings.products.ssr.query}=${pageNumber}`
                    );
                    const result = await response.text();
                    const $ = cheerio.load(result);
                    const navCatContent = $(
                        settings.products.container_element
                    );
                    if (settings.products.ssr.page_no_found) {
                        const pageNotFound = $(
                            settings.products.ssr.page_no_found
                        );
                        if (pageNotFound.length) {
                            hayMasPaginas = false;
                            break;
                        }
                    }
                    const products: {
                        name: string;
                        url: string;
                        quantity: string | null;
                        price: string | null;
                        category: string;
                    }[] = [];

                    const productCard = navCatContent.find(
                        settings.products.card.element
                    );

                    if (productCard.length < 1) {
                        hayMasPaginas = false;
                        break;
                    }
                    if (productCard.length !== settings.products.limit) {
                        hayMasPaginas = false;
                        break;
                    }
                    productCard.each((_, element) => {
                        const name = removeTextHTML(
                            $(element)
                                .find(settings.products.card.name)
                                .text()
                                .trim() || ""
                        );
                        const url =
                            $(element)
                                .find(settings.products.card.url)
                                .attr("href") || null;
                        const price =
                            $(element)
                                .find(settings.products.card.price)
                                .text() || null;
                        const quantity =
                            $(element)
                                .find(settings.products.card.quantity)
                                .text() || null;
                        const deleteUrlProduct = settings.products.product_url
                            ? url.replace(settings.products.product_url, "")
                            : url;
                        products.push({
                            name,
                            url: deleteUrlProduct,
                            price: removeTextHTML(price || ""),
                            quantity: removeTextHTML(quantity || ""),
                            category: cat.name,
                        });
                    });
                    // if (
                    //     JSON.stringify(products) === JSON.stringify(productCard)
                    // ) {
                    //     hayMasPaginas = false;
                    //     break;
                    // }

                    pageNumber++;

                    datas = [...datas, ...products];
                } catch (error) {
                    hayMasPaginas = false;
                }
            }
            products = [...products, datas];
        }
        // fs.writeFileSync("./products.txt", JSON.stringify(products));
    }
    return;

    // let products2: Product[] = JSON.parse(
    //     fs.existsSync("./products2.txt")
    //         ? fs.readFileSync("./products2.txt", { encoding: "utf-8" })
    //         : "[]"
    // );
    // if (!products2.length) {
    //     for await (const product of products.flat()) {
    //         const deleteUrl = "https://cyccomputer.pe/producto";
    //         const response = await fetch(
    //             deleteUrl ? `${deleteUrl}${product.url}` : product.url
    //         );
    //         const result = await response.text();
    //         const $ = cheerio.load(result);
    //         const navCatContent = $("#main");
    //         const productName = navCatContent.find("h1.h1").text().trim();

    //         // Extraer el precio
    //         const productPrice =
    //             navCatContent
    //                 .find('span[itemprop="price"]')
    //                 .first()
    //                 .text()
    //                 .trim() || null;

    //         // Extraer la descripción corta
    //         const productDescription = navCatContent
    //             .find(".product-description")
    //             .text()
    //             .trim();
    //         const images: string[] = [];
    //         $("div.js-qv-mask img").each((_, element) => {
    //             const imageUrl = $(element).attr("src");
    //             if (imageUrl) {
    //                 images.push(imageUrl);
    //             }
    //         });
    //         products2 = [
    //             ...products2,
    //             {
    //                 ...product,
    //                 name: productName,
    //                 priceLocal: productPrice,
    //                 priceDolar: productPrice,
    //                 marca: "",
    //                 description: removeTextHTML(productDescription),
    //                 images,
    //             },
    //         ];
    //     }
    //     fs.writeFileSync("./products2.txt", JSON.stringify(products2));
    // }
    // console.log(products2);

    // for (const category of categories) {
    //     console.log({ url: category.url });

    //     const browser = await chromium.launch({ headless: true }); // headless: false para ver el navegador
    //     const page = await browser.newPage();

    //     await page.goto(
    //         category.url
    //         // `${settings.web_url}/shop-list-ctg.php?ctg=003-044-004`
    //     );
    //     await page.route("**/*", (route) => {
    //         const resourceType = route.request().resourceType();
    //         if (["image", "stylesheet", "font"].includes(resourceType)) {
    //             route.abort();
    //         } else {
    //             route.continue();
    //         }
    //     });
    //     await page.waitForSelector(".product");

    //     const products: any[] = await page.$$eval(".product", (elements) => {
    //         const urlPathProduct:
    //             | string
    //             | null = `${settings.web_url}/shop-product-detail.php?prod=`;
    //         const urlPathImage: string | null =
    //             "https://compuvisionperu.pe/public/img/productos";
    //         return elements.map((product) => {
    //             const name: string | null =
    //                 product
    //                     ?.querySelector(".product_title a")
    //                     ?.textContent?.trim() || null;
    //             const url: string | null =
    //                 (
    //                     product?.querySelector(
    //                         ".product_title a"
    //                     ) as HTMLLinkElement
    //                 )?.href.trim() || null;
    //             const priceLocal =
    //                 product
    //                     ?.querySelector(".product_price .price")
    //                     ?.textContent?.trim() || null;
    //             const priceDolar =
    //                 product
    //                     ?.querySelector(".product_price .price")
    //                     ?.textContent?.trim() || null;
    //             const image: string | null =
    //                 (
    //                     product?.querySelector(
    //                         ".product_img img"
    //                     ) as HTMLImageElement
    //                 )?.src || null;

    //             return {
    //                 name,
    //                 priceLocal,
    //                 priceDolar,
    //                 image: image
    //                     ? urlPathImage
    //                         ? image.replace(urlPathImage, "")
    //                         : image
    //                     : null,
    //                 url: url
    //                     ? urlPathProduct
    //                         ? url.replace(urlPathProduct, "")
    //                         : url
    //                     : null,
    //                 marca: null,
    //             };
    //         });
    //     });
    //     console.log(products);

    //     await browser.close();
    // }

    // const urlPathProduct: string | null =
    //     "${settings.}/shop-product-detail.php?prod=";
    // const urlPathImage: string | null =
    //     "https://compuvisionperu.pe/public/img/productos";
    // const productoInfo: Product[] = await Promise.all(
    //     products.map(async (product) => {
    //         let productInfo: any = {
    //             price: null,
    //             quantity: null,
    //             category: null,
    //             brand: null,
    //             images: null,
    //         };
    //         if (product.url) {
    //             const response = await fetch(
    //                 urlPathProduct
    //                     ? `${urlPathProduct}${product.url}`
    //                     : product.url
    //             );

    //             const result = await response.text();
    //             const $ = cheerio.load(result);

    //             // Extraer la información del producto
    //             productInfo = {
    //                 price: $(".product_price .price").first().text().trim(), // Precio con impuesto
    //                 quantity: $("#stock").val(), // Cantidad en stock
    //                 category: $('a:contains("DISCO DURO")').text().trim(), // Categoría
    //                 brand: $('a:contains("SAMSUNG")').text().trim(), // Marca
    //                 images: [],
    //             };

    //             // Extraer las imágenes adicionales
    //             $(".product_gallery_item img").each((_, element) => {
    //                 const imageUrl = $(element).attr("src");
    //                 productInfo.images.push(imageUrl);
    //             });
    //         }

    //         return {
    //             ...product,
    //             ...productInfo,
    //             // html: result.slice(0, 200),
    //         };
    //     })
    // );
    // console.log({ productoInfo });

    // console.log("Productos encontrados:");
    // console.log(products);
})();

// import { JSDOM } from "jsdom";
// import { delay } from "./lib/helpers";
// async function scrape() {
//     // const response = await fetch(

//     // );
//     // const result = await response.text();
//     // let page = 1;
//     let productos: { name: string | null }[][] = JSON.parse(
//         fs.existsSync("./products_ssr.txt")
//             ? fs.readFileSync("./products_ssr.txt", { encoding: "utf-8" })
//             : "[]"
//     );
//     if (!productos.length) {
//         let dom: JSDOM | null = null;
//         try {
//             dom = await JSDOM.fromURL(
//                 "https://compuvisionperu.pe/CYM/shop-list-ctg.php?ctg=001",
//                 {
//                     runScripts: "dangerously",
//                     resources: "usable",
//                     pretendToBeVisual: false,
//                 }
//             );
//         } catch (error) {}
//         let block = true;
//         const limit = 12;

//         while (block) {
//             await delay(10);
//             const shop_container =
//                 dom.window.document.querySelector(".shop_container");
//             const cards = shop_container.querySelectorAll(".product");
//             console.log(cards.length);

//             if (cards.length !== limit) {
//                 block = false;
//             }
//             let products: { name: string | null }[] = [];
//             for (const card of cards) {
//                 const name =
//                     card.querySelector(".product_title a").textContent || null;

//                 products = [...products, { name }];
//             }
//             productos = [...productos, products];
//             const paginatorElement = dom.window.document.querySelector(
//                 ".linearicons-arrow-right"
//             ) as HTMLButtonElement;
//             if (paginatorElement) {
//                 paginatorElement.click();
//             } else {
//                 block = false;
//             }

//             console.log({ productos });
//             // page++;
//         }
//         dom.window.close();
//         fs.writeFileSync("./products_ssr.txt", JSON.stringify(productos));
//     }

//     // const titulo =
//     //     dom.window.document.querySelector(".product_title a")?.textContent;
//     // console.log({ titulo });
// }

// scrape();
