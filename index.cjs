// 使用动态导入 node-fetch
(async () => {
    const express = require('express');
    const cheerio = require('cheerio');
    const path = require('path');

    // 动态导入 node-fetch
    const fetch = (await import('node-fetch')).default;

    const app = express();
    const port = 80;

    // 其他代码保持不变
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.json());

    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
            const attr = element.attribs;
            let url = "//greasyfork.org"
            element.children.forEach((r, i) => {
                if (r.name === "article") {
                    r.children.forEach(r => {
                        if (r.name === "h2") {
                            r.children.forEach(r => {
                                if (r.name === "a") {
                                    url += r.attribs.href
                                }
                            })
                        }
                    })
                }
            })
            const name = attr['data-script-name'].trim();
            const updatedDate = attr['data-script-updated-date'].trim();
            const score = attr['data-script-rating-score'].trim();
            const dailyInstalls = attr['data-script-daily-installs'].trim();
            const totalInstalls = attr['data-script-total-installs'].trim();

            scripts.push({
                name, url, updatedDate, score, dailyInstalls, totalInstalls
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
        try {
            const scripts = await scrapeGreasyFork();
            res.json(scripts);
        } catch (error) {
            console.error('Scraping error:', error);
            res.json({error: 'An error occurred while scraping the website'});
        }
    });

    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();
