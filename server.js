import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 80;

async function scrapeGreasyFork() {
    const url = 'https://greasyfork.org/zh-CN/users/1083212-xygodcyx';
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const scripts = [];

    $('#user-script-list li').each((index, element) => {
        console.log(element.attribs)
        const attr = element.attribs
        const name = attr["data-script-name"].trim();
        const dailyInstalls = attr["data-script-daily-installs"].trim();
        const totalInstalls = attr["data-script-total-installs"].trim();

        scripts.push({
            name,
            dailyInstalls,
            totalInstalls
        });
    });

    return scripts;
}

app.get('/scripts', async (req, res) => {
    try {
        const scripts = await scrapeGreasyFork();
        res.json(scripts);
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({error: 'An error occurred while scraping the website'});
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});