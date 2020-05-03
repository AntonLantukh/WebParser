const puppeteer = require('puppeteer');

const { WEB_SITE } = require('../constants');

const createNewSession = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const context = await browser.createIncognitoBrowserContext();
    const page = await context.newPage();

    return { browser, page };
}

const openPage = async (page) => {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(WEB_SITE);
    await page.waitFor(2000);
}

module.exports = { createNewSession, openPage };
