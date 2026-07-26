const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

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

        await page.goto(item.url, {
            waitUntil: "domcontentloaded"
        });

        // Espera a que cargue Canva
        await page.waitForTimeout(5000);

        // Inyecta CSS para ocultar solo UI flotante sin afectar el diseño
        await page.addStyleTag({
            content: `
                body { background: #ffffff !important; }
                /* Oculta barra superior */
                header { display: none !important; }
                [role="menubar"] { display: none !important; }
                [role="toolbar"] { display: none !important; }
                footer { display: none !important; }
                /* Elimina sombras globales */
                * { box-shadow: none !important; }
            `
        });

        const output = path.join(__dirname, "..", "capturas", `${item.name}.png`);
        const tempOutput = path.join(__dirname, "..", "capturas", `.${item.name}-temp.png`);

        // Captura la página completa
        await page.screenshot({
            path: tempOutput
        });

        // Post-procesa con sharp para recortar bordes grises
        try {
            await sharp(tempOutput)
                .trim({
                    threshold: 100  // Threshold más alto para bordes grises
                })
                .toFile(output);
            
            // Elimina archivo temporal.
            fs.unlinkSync(tempOutput);
            
            console.log("Capturado y recortado:", output);
        } catch (err) {
            console.log("Capturado sin recorte:", tempOutput, "->", output);
            fs.renameSync(tempOutput, output);
        }
    }

    await browser.close();

})();