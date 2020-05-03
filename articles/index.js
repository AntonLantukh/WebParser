const fs = require('fs');

const beautify = require('js-beautify');
const jsdom = require('jsdom');
const fetch = require('node-fetch');

const { LIST_SELECTOR, ARTICLE_LIST_SELECTOR, ARTICLE_SELECTOR } = require('../constants');
const { getDirName, getFileName } = require('../utils');
const { createNewSession, openPage } = require('../session');

/**
 * Saving FAQ articles from web-site 
 * */
const getArticles = async (index) => {
    const { browser, page } = await createNewSession();
    await openPage(page);

    await page.click(`${LIST_SELECTOR.ITEM} a:nth-of-type(${index})`);
    await page.waitFor(2000);
    await page.waitForSelector(ARTICLE_LIST_SELECTOR.ITEM, { timeout: 3000 });

    const articles = await page.$$(`${ARTICLE_LIST_SELECTOR.ITEM} a`);
    let data = [];

    for (let key = 1; key <= articles.length; key++) {
        await page.waitFor(2000);
        await page.click(`${ARTICLE_LIST_SELECTOR.ITEM} a:nth-of-type(${key})`);
        await page.waitFor(2000);

        const title = await page.$eval(ARTICLE_SELECTOR.TITLE, el => el.textContent);
        const content = await page.$eval(ARTICLE_SELECTOR.CONTENT, el => el.innerHTML);
        const images = await page.$$eval(`${ARTICLE_SELECTOR.CONTENT} img`, imgs => imgs.map(img => img.src));

        // Saving FAQ articles from web-site
        data = [...data, { title, content, images }]
        console.log(`Getting title, content and images from "${title}" article`);

        await page.goBack();
    }
    browser.close()

    return data;
};

/**
 * Saving images locally 
 * */
const saveImages = async (category, images) => {
    if (!images.length) return;

    console.log(`Saving images from "${category}" category`);

    const folderDir = getDirName(['output', 'articles', category], 'images');
    if (!fs.existsSync(folderDir)) fs.mkdirSync(folderDir);

    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const name = getFileName(img);

        // Handling base64 format
        if (/data:/.test(img)) {
            const parsedString = img.replace(/^data:image\/png;base64,/, '');
            fs.writeFile(`${folderDir}/${name}`, parsedString, 'base64', (err) => {
                console.log(err, 'err');
            });
        } else if (!/(\.png|\.jpg|\.gif)/.test(img)) {
            return;
            // Handling .png|.jpg|.gif format
        } else {
            const file = await fs.createWriteStream(`${folderDir}/${name}`);
            await fetch(img)
                .then(res => res.body.pipe(file))
                .catch(err => console.log(err, 'err'));
        };
    }
};

/**
 * Saving article content 
 * */
const saveArticle = async (title, category, content) => {
    console.log(`Saving "${title}" article to .html file`);

    const file = fs.createWriteStream(
        `${getDirName(['output', 'articles'], category)}/${title.replace(/\//g, '\\')}.html`,
        { encoding: 'utf-8' }
    );
    file.write(content);
}

/**
 * Prettify, change srcs and insert css-links
 * */
const getFinalContent = (content, cssLinks) => {
    console.log(`Parsing article content and beautifying`);

    const { JSDOM } = jsdom;
    const noBreakContent = content.replace(/\n/gi, '');
    const dom = new JSDOM(noBreakContent);

    Array.from(dom.window.document.querySelectorAll('img')).map((el, i) => {
        el.src = `./images/${getFileName(el.src)}`

        return el;
    });

    const head = dom.window.document.querySelector('head');
    cssLinks.forEach((_, key) => {
        head.insertAdjacentHTML('afterbegin', `<link href="../../css/${key + 1}.css" rel="stylesheet">`);
    })

    return beautify.html(dom.serialize(), { indent_size: 2, space_in_empty_paren: true });
};

module.exports = { getArticles, saveArticle, getFinalContent, saveImages }