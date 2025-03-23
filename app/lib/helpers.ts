export function removeTextHTML(value: string) {
    return value
        ? value
              .replace(/<img[^>]*src="[^"]*"[^>]*>/gi, "")
              .replace(/(<([^>]+)>)/gi, "")
        : null;
}
export async function delay(seg = 10) {
    return new Promise((res) => setTimeout(() => res(true), seg * 1000));
}
