const fs = require('fs');

const { getDirName } = require('../utils');
const { createNewSession, openPage } = require('../session');
const { LIST_SELECTOR } = require('../constants');

/** 
 * Saving FAQ categories
 *  */
const getCategories = async () => {
    const { browser, page } = await createNewSession();
    await openPage(page);

    console.log('Getting categories');

    const categoriesNames = await page.$$eval(`${LIST_SELECTOR.ITEM} a div`, categories => {
        return categories.reduce((acc, category) => ([...acc, category.textContent]), [])
    });

    browser.close();

    return categoriesNames;
};

/** 
 * Creating directory with category to save articles
 *  */
const saveCategories = (entities, path) => {
    for (let i = 0; i < entities.length; i++) {
        const name = entities[i];
        const dir = getDirName(path, name);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    }
}

module.exports = { getCategories, saveCategories }