const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const diagrams = require("../config/canva.json");

(async () => {

    const browser = await chromium.launch({
        headless: true
    });

    fs.mkdirSync(path.join(__dirname, "..", "capturas"), { recursive: true });

    for (const item of diagrams) {

        const page = await browser.newPage({
            viewport: {
                width: 1920,
                height: 1080
            }
        });

        const embedUrl = item.url.includes("?") ? `${item.url}&embed` : `${item.url}?embed`;

        await page.setContent(`
            <div style="position: relative; width: 100%; height: 0; padding-top: 100%; padding-bottom: 0; margin: 0; overflow: hidden; border-radius: 0; box-shadow: none; background: white;">
                <iframe loading="lazy" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; border: none; padding: 0; margin: 0;" src="${embedUrl}" allowfullscreen="allowfullscreen" allow="fullscreen"></iframe>
            </div>
        `, {
            waitUntil: "domcontentloaded"
        });

        // Espera 5 segundos para que cargue Canva
        await page.waitForTimeout(5000);

        const output = path.join(__dirname, "..", "capturas", `${item.name}.png`);

        await page.locator("iframe").screenshot({
            path: output
        });

        console.log("Capturado:", output);

        await page.close();
    }

    await browser.close();

})();