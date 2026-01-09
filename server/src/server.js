const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Welcome to CRISscraper!');
});

app.get('/scrape', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({ headless: false });

        const page = await browser.newPage();
        
        await page.goto('https://cris.dot.state.tx.us/public/Query/app/query-builder', {
            waitUntil: 'networkidle2',
        });
        
        await page.waitForSelector('#btn-accept', { visible: true });
        await Promise.all([
            page.click('#btn-accept'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);
        const currentUrl = page.url();
        console.log(currentUrl);

        const postAcceptSelector = '#rdoCrash';
        const elementExists = await page.evaluate((sel) => !!document.querySelector(sel), postAcceptSelector);

        if (currentUrl === 'https://cris.dot.state.tx.us/public/Query/app/query-builder') {
            throw new Error('URL did not change after clicking accept button');
        }
        
        if (!elementExists) {
            throw new Error('Expected element not found after accepting');
        }

        console.log('Accept button clicked successfully');
        

        res.send('Scraping completed! Accepted terms and conditions.');
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).send(`An error occurred while scraping: ${error.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
