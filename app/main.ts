// // import { addAlias } from "module-alias";
// // import path from "node:path";
// // // here more absolute paths
// // addAlias("~", path.resolve(__dirname));
// // addAlias("@", path.resolve(__dirname, "services"));
// // import { Server } from "~/config/server";
// // const application = new Server();
// // export const app = application.app;
// // export const server = application.listen();
// import { getCategories } from "./lib/cheerio";
// import * as cheerio from "cheerio";
// import { removeTextHTML } from "./lib/helpers";
// import fs from "node:fs";
// /*** SETTINGS */
// export interface Settings {
//     web_url: string;
//     categories: {
//         ssr: boolean;
//         web_url: string | null;
//         event_click: string | null;
//         container_element: string;
//         card: {
//             element: string;
//             name: string;
//             url: string;
//             image: string | null;
//         };
//     };
// }

// export interface Categories {
//     image: string | null;
//     name: string;
//     url: string;
// }
// // let categorias: Categories[] = [];
// // let subcategorias = [];

// interface Product {
//     name: string | null;
//     url: string | null;
//     images: string[] | null;
//     priceLocal: string | null;
//     priceDolar: string | null;
//     quantity: string | null;
//     marca: string | null;
//     description: string | null;
// }
// let productos: Product[] = [];
// // (async () => {

// //     console.log("Categorías encontradas:", categorias);
// // })();

// (async () => {
//     const settings: Settings = {
//         web_url: "https://cyccomputer.pe",
//         categories: {
//             ssr: true,
//             web_url: "https://cyccomputer.pe/categoria",
//             container_element: ".menu-content",
//             event_click: ".title-menu",
//             card: {
//                 element: "> .cat-parent",
//                 name: "> a > span",
//                 url: "> a",
//                 image: null,
//             },
//         },
//     };

//     let categories: Categories[] = JSON.parse(
//         fs.existsSync("./categories.txt")
//             ? fs.readFileSync("./categories.txt", { encoding: "utf-8" })
//             : "[]"
//     );

//     if (!categories.length) {
//         // categorias
//         categories = await getCategories(settings);

//         fs.writeFileSync("./categories.txt", JSON.stringify(categories));
//     }
//     let products: {
//         name: string;
//         url: string;
//         quantity: string | null;
//         price: string | null;
//         category: string;
//     }[][] = JSON.parse(
//         fs.existsSync("./products.txt")
//             ? fs.readFileSync("./products.txt", { encoding: "utf-8" })
//             : "[]"
//     );
//     if (!products.length) {
//         let index = 1;
//         for await (const cat of categories) {
//             let datas: {
//                 name: string;
//                 url: string;
//                 quantity: string | null;
//                 price: string | null;
//                 category: string;
//             }[] = [];
//             let hayMasPaginas = true;
//             let pageNumber = 1;
//             while (hayMasPaginas) {
//                 const url = settings.categories.web_url
//                     ? `${settings.categories.web_url}${cat.url}`
//                     : cat.url;
//                 try {
//                     const response = await fetch(`${url}?page=${pageNumber}`);
//                     const result = await response.text();
//                     const $ = cheerio.load(result);
//                     const navCatContent = $("#js-product-list");
//                     const pageNotFound = $(".page-not-found");

//                     // if (pageNotFound.length) {
//                     //     hayMasPaginas = false;
//                     //     break;
//                     // }
//                     const deleteUrl = "https://cyccomputer.pe/producto";
//                     const deleteImageUrl = "https://cyccomputer.pe/producto";
//                     const products: {
//                         name: string;
//                         url: string;
//                         quantity: string | null;
//                         price: string | null;
//                         category: string;
//                     }[] = [];
//                     const productCard = navCatContent.find(".item-inner");
//                     if (productCard.length < 1) {
//                         hayMasPaginas = false;
//                         break;
//                     }
//                     productCard.each((_, element) => {
//                         const name = removeTextHTML(
//                             $(element).find(".productName a").text().trim()!
//                         );
//                         const url =
//                             $(element).find(".productName a").attr("href") ||
//                             settings.web_url;
//                         const price = $(element).find(".price").text() || null;
//                         const quantity =
//                             $(element).find(".quantity").text() || null;
//                         const deleteUrlProduct = deleteUrl
//                             ? url.replace(deleteUrl, "")
//                             : url;
//                         products.push({
//                             name,
//                             url: deleteUrlProduct,
//                             price: price ? removeTextHTML(price) : price,
//                             quantity: quantity
//                                 ? removeTextHTML(quantity)
//                                 : quantity,
//                             category: cat.name,
//                         });
//                     });
//                     pageNumber++;
//                     if (pageNumber === 1) {
//                         console.log({ products: JSON.stringify(products) });
//                     }
//                     datas = [...datas, ...products];
//                 } catch (error) {
//                     hayMasPaginas = false;
//                 }
//             }
//             if (index === 1) {
//                 console.log({ datas: JSON.stringify(datas) });
//             }

//             products = [...products, datas];
//         }
//         fs.writeFileSync("./products.txt", JSON.stringify(products));
//     }
//     let products2: Product[] = JSON.parse(
//         fs.existsSync("./products2.txt")
//             ? fs.readFileSync("./products2.txt", { encoding: "utf-8" })
//             : "[]"
//     );
//     if (!products2.length) {
//         for await (const product of products.flat()) {
//             const deleteUrl = "https://cyccomputer.pe/producto";
//             const response = await fetch(
//                 deleteUrl ? `${deleteUrl}${product.url}` : product.url
//             );
//             const result = await response.text();
//             const $ = cheerio.load(result);
//             const navCatContent = $("#main");
//             const productName = navCatContent.find("h1.h1").text().trim();

//             // Extraer el precio
//             const productPrice =
//                 navCatContent
//                     .find('span[itemprop="price"]')
//                     .first()
//                     .text()
//                     .trim() || null;

//             // Extraer la descripción corta
//             const productDescription = navCatContent
//                 .find(".product-description")
//                 .text()
//                 .trim();
//             const images: string[] = [];
//             $("div.js-qv-mask img").each((_, element) => {
//                 const imageUrl = $(element).attr("src");
//                 if (imageUrl) {
//                     images.push(imageUrl);
//                 }
//             });
//             products2 = [
//                 ...products2,
//                 {
//                     ...product,
//                     name: productName,
//                     priceLocal: productPrice,
//                     priceDolar: productPrice,
//                     marca: "",
//                     description: removeTextHTML(productDescription),
//                     images,
//                 },
//             ];
//         }
//         fs.writeFileSync("./products2.txt", JSON.stringify(products2));
//     }
//     console.log(products2);

//     // for (const category of categories) {
//     //     console.log({ url: category.url });

//     //     const browser = await chromium.launch({ headless: true }); // headless: false para ver el navegador
//     //     const page = await browser.newPage();

//     //     await page.goto(
//     //         category.url
//     //         // `${settings.web_url}/shop-list-ctg.php?ctg=003-044-004`
//     //     );
//     //     await page.route("**/*", (route) => {
//     //         const resourceType = route.request().resourceType();
//     //         if (["image", "stylesheet", "font"].includes(resourceType)) {
//     //             route.abort();
//     //         } else {
//     //             route.continue();
//     //         }
//     //     });
//     //     await page.waitForSelector(".product");

//     //     const products: any[] = await page.$$eval(".product", (elements) => {
//     //         const urlPathProduct:
//     //             | string
//     //             | null = `${settings.web_url}/shop-product-detail.php?prod=`;
//     //         const urlPathImage: string | null =
//     //             "https://compuvisionperu.pe/public/img/productos";
//     //         return elements.map((product) => {
//     //             const name: string | null =
//     //                 product
//     //                     ?.querySelector(".product_title a")
//     //                     ?.textContent?.trim() || null;
//     //             const url: string | null =
//     //                 (
//     //                     product?.querySelector(
//     //                         ".product_title a"
//     //                     ) as HTMLLinkElement
//     //                 )?.href.trim() || null;
//     //             const priceLocal =
//     //                 product
//     //                     ?.querySelector(".product_price .price")
//     //                     ?.textContent?.trim() || null;
//     //             const priceDolar =
//     //                 product
//     //                     ?.querySelector(".product_price .price")
//     //                     ?.textContent?.trim() || null;
//     //             const image: string | null =
//     //                 (
//     //                     product?.querySelector(
//     //                         ".product_img img"
//     //                     ) as HTMLImageElement
//     //                 )?.src || null;

//     //             return {
//     //                 name,
//     //                 priceLocal,
//     //                 priceDolar,
//     //                 image: image
//     //                     ? urlPathImage
//     //                         ? image.replace(urlPathImage, "")
//     //                         : image
//     //                     : null,
//     //                 url: url
//     //                     ? urlPathProduct
//     //                         ? url.replace(urlPathProduct, "")
//     //                         : url
//     //                     : null,
//     //                 marca: null,
//     //             };
//     //         });
//     //     });
//     //     console.log(products);

//     //     await browser.close();
//     // }

//     // const urlPathProduct: string | null =
//     //     "${settings.}/shop-product-detail.php?prod=";
//     // const urlPathImage: string | null =
//     //     "https://compuvisionperu.pe/public/img/productos";
//     // const productoInfo: Product[] = await Promise.all(
//     //     products.map(async (product) => {
//     //         let productInfo: any = {
//     //             price: null,
//     //             quantity: null,
//     //             category: null,
//     //             brand: null,
//     //             images: null,
//     //         };
//     //         if (product.url) {
//     //             const response = await fetch(
//     //                 urlPathProduct
//     //                     ? `${urlPathProduct}${product.url}`
//     //                     : product.url
//     //             );

//     //             const result = await response.text();
//     //             const $ = cheerio.load(result);

//     //             // Extraer la información del producto
//     //             productInfo = {
//     //                 price: $(".product_price .price").first().text().trim(), // Precio con impuesto
//     //                 quantity: $("#stock").val(), // Cantidad en stock
//     //                 category: $('a:contains("DISCO DURO")').text().trim(), // Categoría
//     //                 brand: $('a:contains("SAMSUNG")').text().trim(), // Marca
//     //                 images: [],
//     //             };

//     //             // Extraer las imágenes adicionales
//     //             $(".product_gallery_item img").each((_, element) => {
//     //                 const imageUrl = $(element).attr("src");
//     //                 productInfo.images.push(imageUrl);
//     //             });
//     //         }

//     //         return {
//     //             ...product,
//     //             ...productInfo,
//     //             // html: result.slice(0, 200),
//     //         };
//     //     })
//     // );
//     // console.log({ productoInfo });

//     // console.log("Productos encontrados:");
//     // console.log(products);
// })();

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
