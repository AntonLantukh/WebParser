const fs = require('fs');

const { getCss, saveCss } = require('./css');
const { getCategories, saveCategories } = require('./categories');
const { getArticles, saveImages, getFinalContent, saveArticle } = require('./articles');
const { getDirName } = require('./utils');

/**
 * Preparing environment
 */
const prepareFolders = () => {
    console.log(`Initializing empty folders if don't exist`);

    const outputDir = getDirName(['output'], '');
    const articlesDir = getDirName(['output'], 'articles');
    const cssDir = getDirName(['output'], 'css');

    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    if (!fs.existsSync(articlesDir)) fs.mkdirSync(articlesDir);
    if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir);
}

/**
 * Generating result in output -> articles - css
 */
const main = async () => {
    prepareFolders();

    const links = await getCss();
    await saveCss(links);

    const categories = await getCategories();
    await saveCategories(categories, ['output', 'articles']);

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const articles = await getArticles(i + 1);

        for (let j = 0; j < articles.length; j++) {
            const { title, content, images } = articles[j];
            await saveImages(category, images);
            const updatedContent = getFinalContent(content, links);
            await saveArticle(title, category, updatedContent);
        }
    }
}

main();
