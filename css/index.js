const fs = require('fs');

const fetch = require('node-fetch');

const { getDirName } = require('../utils');
const { createNewSession, openPage } = require('../session');

/**
 * Getting css from web-site
 */
const getCss = async () => {
    console.log(`Downloading css links`);

    const { browser, page } = await createNewSession();
    await openPage(page);

    const links = await page.$$eval(`head link`, links => {
        return links.reduce((acc, link) => ([...acc, link.href]), [])
    });

    browser.close();

    return links;
};

/**
 * Downloading and saving css files locally
 */
const saveCss = async (links) => {
    console.log(`Saving css files`);

    const folderDir = getDirName(['output'], 'css');
    if (!fs.existsSync(folderDir)) fs.mkdirSync(folderDir);

    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        const file = await fs.createWriteStream(`${folderDir}/${i + 1}.css`);

        await fetch(link)
            .then(res => res.body.pipe(file))
            .catch(err => console.log(err));
    };
}

module.exports = { getCss, saveCss };