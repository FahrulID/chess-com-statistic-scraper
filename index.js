const { Console } = require('console');
const puppeteer = require('puppeteer');
const readline = require("readline");
const jsonfile = require('jsonfile')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class scraper 
{

    _targetUsername;
    _browser;
    _statistics = [];
    _chessComLink;
    _x = 1;
    _fileName;

    constructor(username)
    {
        this._targetUsername = username;
        this._chessComLink = `https://www.chess.com/games/archive/${this._targetUsername}?gameOwner=other_game&gameTypes%5B0%5D=chess960&gameTypes%5B1%5D=daily&timeSort=asc&gameType=live&page=`;
        this._fileName = `results/${this._targetUsername}.json`;
        this.run();
    }

    async run()
    {
        await this.launchBrowser();
        await this.scrape(1);
    }

    async launchBrowser()
    {
        this._browser = await puppeteer.launch({
            headless: false, 
            args: ["--user-data-dir=./Google/Chrome/User Data/",'--no-sandbox']
        }); // default is true
        console.log(`Successfully launched puppeteer...`);
    }

    async scrape(pageNumber)
    {
        var linkToGo = this._chessComLink + pageNumber;
        var stats = {};

        const page = await this._browser.newPage();

        console.log(`Successfully spawn chromium...`);
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36');

        console.log(`Heading ${linkToGo}...`);
        await page.goto(linkToGo, {waitUntil: 'networkidle2'});

        console.log(`${linkToGo} loaded successfully...`);
        if(await this.checkPage(page) === true)
        {
            //Mulai
            console.log("Starting Scraping for the table...");
            var x = 1;
            var element = "";

            do
            {
                console.log(`Scraping the global ${this._x} row and local ${x} row...`);
                var setat = {};

                var elementPath = `#games-root-index > div > div.archive-games-table-wrapper > div > table > tbody > tr.v-board-popover:nth-child(${x})`;
                var time = elementPath + ` > td.archive-games-icon-block > span.archive-games-game-time`;
                var pemain1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                var pemain2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                var elo1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > span.post-view-meta-rating`;
                var elo2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > span.post-view-meta-rating`;               
                var skor1 = elementPath + ` > td > a.archive-games-result-wrapper > div.archive-games-result-wrapper-score > div:nth-child(1)`;
                var skor2 = elementPath + ` > td > a.archive-games-result-wrapper > div.archive-games-result-wrapper-score > div:nth-child(2)`;
                var akurasi1 = elementPath + ` > td.table-text-center.archive-games-analyze-cell > div:nth-child(2)`;
                var akurasi2 = elementPath + ` > td.table-text-center.archive-games-analyze-cell > div:nth-child(3)`;
                var moves = elementPath + ` > td.table-text-center > span`;
                var date = elementPath + ` > td.table-text-right.archive-games-date-cell`;
                element = await page.$(elementPath);

                if(element !== null)
                {
                    var setattime = await page.$(time);
                    var setatpemain1 = await page.$(pemain1);
                    var setatpemain2 = await page.$(pemain2);
                    var setatelo1 = await page.$(elo1);
                    var setatelo2 = await page.$(elo2);
                    var setatskor1 = await page.$(skor1);
                    var setatskor2 = await page.$(skor2);
                    var setatakurasi1 = await page.$(akurasi1);
                    var setatakurasi2 = await page.$(akurasi2);
                    var setatmoves = await page.$(moves);
                    var setatdate = await page.$(date);
    
                    setat.time = await page.evaluate(el => el.textContent, setattime);
                    setat.pemain1 = await page.evaluate(el => el.textContent, setatpemain1);
                    setat.pemain2 = await page.evaluate(el => el.textContent, setatpemain2);
                    setat.elo1 = await page.evaluate(el => el.textContent, setatelo1);
                    setat.elo2 = await page.evaluate(el => el.textContent, setatelo2);
                    setat.skor1 = await page.evaluate(el => el.textContent, setatskor1);
                    setat.skor2 = await page.evaluate(el => el.textContent, setatskor2);
                    setat.akurasi1 = await page.evaluate(el => el.textContent, setatakurasi1);
                    setat.akurasi2 = await page.evaluate(el => el.textContent, setatakurasi2);
                    setat.moves = await page.evaluate(el => el.textContent, setatmoves);
                    setat.date = await page.evaluate(el => el.textContent, setatdate);

                    setat.time = setat.time.replace(/[\t\n\    ]+/g,'')
                    setat.pemain1 = setat.pemain1.replace(/[\t\n\    ]+/g,'')
                    setat.pemain2 = setat.pemain2.replace(/[\t\n\    ]+/g,'')
                    setat.date = setat.date.replace(/[\t\n\    ]+/g,'')
    
                    stats[this._x] = setat;
    
                    this._statistics.push(stats);
                    
                    x++;
                    this._x++;
                }
            }while(element !== null);

        } else {
            //console.log(this._statistics);
            jsonfile.writeFileSync(this._fileName, this._statistics);
            return false;
        }
        console.log("Heading to next page...")
        this.scrape(pageNumber + 1);

    }

    async checkPage(page)
    {
        try
        {
            // Checking if login element exist
            let element = await page.$("#games-root-index > div > div > div > h3");
            console.log(element);
            if(await element === null){return true};
            return false;
        } catch(err)
        {
            console.log(err);
        }
    }
}

var tes = new scraper("dewa_kipas");