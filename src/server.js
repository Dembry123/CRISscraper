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
        
        // Navigate to the CRIS Query Builder URL
        await page.goto('https://cris.dot.state.tx.us/public/Query/app/query-builder', {
            waitUntil: 'networkidle2',
        });

        // Wait for the accept button to be visible
        await page.waitForSelector('#btn-accept', { visible: true });
        
        // Click the accept button
        await Promise.all([
            page.click('#btn-accept'),
            page.waitForNavigation({ waitUntil: 'networkidle2' }),
        ]);

        // Check if we're on a new page (URL changed)
        const currentUrl = page.url();
        if (currentUrl === 'https://cris.dot.state.tx.us/public/Query/app/query-builder') {
            throw new Error('URL did not change after clicking accept button');
        }

        // Check for an element that should be present after accepting
        const postAcceptSelector = '#rdoCrash'; // Replace with actual selector
        const elementExists = await page.evaluate((sel) => !!document.querySelector(sel), postAcceptSelector);
        
        if (!elementExists) {
            throw new Error('Expected element not found after accepting');
        }

        console.log('Accept button clicked successfully');
        
        // You can add more actions here

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
