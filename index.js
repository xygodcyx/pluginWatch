import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 80;
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // 允许所有域访问
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }

    next();
});

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
        res.json({error: 'An error occurred while scraping the website'});
    }
});

app.get('/', async (req, res) => {
    res.send("服务器启动成功")
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});