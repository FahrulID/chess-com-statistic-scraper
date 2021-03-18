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
    _asc = "asc" // asc dan desc
    _maxPages = 20;

    constructor(username)
    {
        this._targetUsername = username;
        this._chessComLink = `https://www.chess.com/games/archive/${this._targetUsername}?gameOwner=other_game&gameTypes%5B0%5D=chess960&gameTypes%5B1%5D=daily&timeSort=${this._asc}&gameType=live&page=`;
        this._won1 = `https://www.chess.com/games/archive/${this._targetUsername}?gameOwner=other_game&gameResult=win_timeout&gameType=live&timeSort=${this._asc}&page=`;
        this._won2 = `https://www.chess.com/games/archive/${this._targetUsername}?gameOwner=other_game&gameResult=win_checkmated&gameType=live&timeSort=${this._asc}&page=`;
        this._won3 = `https://www.chess.com/games/archive/${this._targetUsername}?gameOwner=other_game&gameResult=win_resigned&gameType=live&timeSort=${this._asc}&page=`;
        this._won4 = `https://www.chess.com/games/archive/${this._targetUsername}?gameOwner=other_game&gameResult=win_abandoned&gameType=live&timeSort=${this._asc}&page=`;
        this._lose1 = `https://www.chess.com/games/archive/${this._targetUsername}?gameOwner=other_game&gameResult=timeout&gameType=live&timeSort=${this._asc}&page=`;
        this._lose2 = `https://www.chess.com/games/archive/${this._targetUsername}?gameOwner=other_game&gameResult=checkmated&gameType=live&timeSort=${this._asc}&page=`;
        this._lose3 = `https://www.chess.com/games/archive/${this._targetUsername}?gameOwner=other_game&gameResult=resigned&gameType=live&timeSort=${this._asc}&page=`;
        this._lose4 = `https://www.chess.com/games/archive/${this._targetUsername}?gameOwner=other_game&gameResult=abandoned&gameType=live&timeSort=${this._asc}&page=`;
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
        if(pageNumber > this._maxPages && this._maxPages !== 0)
        {
            return false;
        }

        var linkToGo = this._chessComLink + pageNumber;

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
                var banned1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > a.user-flair.flair-link > span.v-tooltip.flair-component.flair-blocked`;
                var banned2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > a.user-flair.flair-link > span.v-tooltip.flair-component.flair-blocked`;
                var negara1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > div.v-tooltip.country-flags-component`;
                var negara2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > div.v-tooltip.country-flags-component`;
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
                    var setatbanned1 = await page.$(banned1);
                    var setatbanned2 = await page.$(banned2);
                    var setatnegara1 = await page.$(negara1);
                    var setatnegara2 = await page.$(negara2);
    
                    setat.time = await page.evaluate(el => el.textContent, setattime);
                    setat.pemain1 = await page.evaluate(el => el.textContent, setatpemain1);
                    setat.pemain2 = await page.evaluate(el => el.textContent, setatpemain2);
                    setat.elo1 = await page.evaluate(el => el.textContent, setatelo1);
                    setat.elo2 = await page.evaluate(el => el.textContent, setatelo2);
                    setat.skor1 = await page.evaluate(el => el.textContent, setatskor1);
                    setat.skor2 = await page.evaluate(el => el.textContent, setatskor2);

                    if(setatakurasi1 !== null)
                    {
                        setat.akurasi1 = await page.evaluate(el => el.textContent, setatakurasi1);
                        setat.akurasi2 = await page.evaluate(el => el.textContent, setatakurasi2);
                    } else {
                        setat.akurasi1 = null;
                        setat.akurasi2 = null;
                    }

                    setat.moves = await page.evaluate(el => el.textContent, setatmoves);
                    setat.date = await page.evaluate(el => el.textContent, setatdate);
                    setat.banned1 = (setatbanned1 !== null) ? true : false;
                    setat.banned2 = (setatbanned2 !== null) ? true : false;
                    
                    var angkaNegara1 = await setatnegara1.getProperty('className') + '';
                    var angkaNegara2 = await setatnegara2.getProperty('className') + '';
                    setat.negara1 = angkaNegara1.split(" ")[2].split("-")[1];
                    setat.negara2 = angkaNegara2.split(" ")[2].split("-")[1];

                    setat.time = setat.time.replace(/[\t\n\    ]+/g,'');
                    setat.pemain1 = setat.pemain1.replace(/[\t\n\    ]+/g,'');
                    setat.pemain2 = setat.pemain2.replace(/[\t\n\    ]+/g,'');
                    setat.date = setat.date.replace(/[\t\n\    ]+/g,'');
                    setat.negara1 = setat.negara1.replace(/[\t\n\    ]+/g,'');
                    setat.negara2 = setat.negara2.replace(/[\t\n\    ]+/g,'');
    
                    this._statistics[this._x] = setat;
                    
                    x++;
                    this._x++;
                }
            }while(element !== null);

        } else {
            //console.log(this._statistics);
            //await this.scrapeSecond();
            await jsonfile.writeFileSync(this._fileName, this._statistics);
            return false;
        }
        await page.close();
        console.log("Heading to next page...")
        await this.scrape(pageNumber + 1);

    }

    async scrapeSecond()
    {
        var exit = false;
        var pageNumber = 1;

        // Won by timeout
        while(!exit)
        {
            var linkToGo = this._won1 + pageNumber;
    
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
                    console.log(`Scraping the WIN - Timeout, local ${x} row...`);
    
                    var elementPath = `#games-root-index > div > div.archive-games-table-wrapper > div > table > tbody > tr.v-board-popover:nth-child(${x})`;
                    var pemain1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var pemain2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var elo1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > span.post-view-meta-rating`;
                    var elo2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > span.post-view-meta-rating`;               
                    element = await page.$(elementPath);
    
                    if(element !== null)
                    {
                        var setatpemain1 = await page.$(pemain1);
                        var setatpemain2 = await page.$(pemain2);
                        var setatelo1 = await page.$(elo1);
                        var setatelo2 = await page.$(elo2);
        
                        pemain1 = await page.evaluate(el => el.textContent, setatpemain1);
                        pemain2 = await page.evaluate(el => el.textContent, setatpemain2);
                        elo1 = await page.evaluate(el => el.textContent, setatelo1);
                        elo2 = await page.evaluate(el => el.textContent, setatelo2);
                        pemain1 = pemain1.replace(/[\t\n\    ]+/g,'');
                        pemain2 = pemain2.replace(/[\t\n\    ]+/g,'');
                        
    
                        for (const [key, value] of Object.entries(this._statistics)) {
                            if(value.pemain1 == pemain1 && value.pemain2 == pemain2 && value.elo1 == elo1 && value.elo2 == elo2)
                            {
                                console.log("Ketemu...")
                                this._statistics[key].status = "WIN-TIMEOUT";
                            }
                        }
                        x++;
                    }
                }while(element !== null)

                pageNumber++;
            } else {
                pageNumber = 1;
                exit = true;
            }
        }

        exit = false

        // Won by checkmated
        while(!exit)
        {
            var linkToGo = this._won2 + pageNumber;
    
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
                    console.log(`Scraping the WIN - Checkmated, local ${x} row...`);
    
                    var elementPath = `#games-root-index > div > div.archive-games-table-wrapper > div > table > tbody > tr.v-board-popover:nth-child(${x})`;
                    var pemain1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var pemain2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var elo1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > span.post-view-meta-rating`;
                    var elo2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > span.post-view-meta-rating`;               
                    element = await page.$(elementPath);
    
                    if(element !== null)
                    {
                        var setatpemain1 = await page.$(pemain1);
                        var setatpemain2 = await page.$(pemain2);
                        var setatelo1 = await page.$(elo1);
                        var setatelo2 = await page.$(elo2);
        
                        pemain1 = await page.evaluate(el => el.textContent, setatpemain1);
                        pemain2 = await page.evaluate(el => el.textContent, setatpemain2);
                        elo1 = await page.evaluate(el => el.textContent, setatelo1);
                        elo2 = await page.evaluate(el => el.textContent, setatelo2);
                        pemain1 = pemain1.replace(/[\t\n\    ]+/g,'');
                        pemain2 = pemain2.replace(/[\t\n\    ]+/g,'');
    
                        for (const [key, value] of Object.entries(this._statistics)) {
                            if(value.pemain1 == pemain1 && value.pemain2 == pemain2 && value.elo1 == elo1 && value.elo2 == elo2)
                            {
                                console.log("Ketemu...")
                                this._statistics[key].status = "WIN-CHECKMATED";
                            }
                        }
                        x++;
                    }
                }while(element !== null)

                pageNumber++;
            } else {
                pageNumber = 1;
                exit = true;
            }
        }

        exit = false

        // Won by resigned
        while(!exit)
        {
            var linkToGo = this._won3 + pageNumber;
    
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
                    console.log(`Scraping the WIN - Resigned, local ${x} row...`);
    
                    var elementPath = `#games-root-index > div > div.archive-games-table-wrapper > div > table > tbody > tr.v-board-popover:nth-child(${x})`;
                    var pemain1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var pemain2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var elo1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > span.post-view-meta-rating`;
                    var elo2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > span.post-view-meta-rating`;               
                    element = await page.$(elementPath);
    
                    if(element !== null)
                    {
                        var setatpemain1 = await page.$(pemain1);
                        var setatpemain2 = await page.$(pemain2);
                        var setatelo1 = await page.$(elo1);
                        var setatelo2 = await page.$(elo2);
        
                        pemain1 = await page.evaluate(el => el.textContent, setatpemain1);
                        pemain2 = await page.evaluate(el => el.textContent, setatpemain2);
                        elo1 = await page.evaluate(el => el.textContent, setatelo1);
                        elo2 = await page.evaluate(el => el.textContent, setatelo2);
                        pemain1 = pemain1.replace(/[\t\n\    ]+/g,'');
                        pemain2 = pemain2.replace(/[\t\n\    ]+/g,'');
    
                        for (const [key, value] of Object.entries(this._statistics)) {
                            if(value.pemain1 == pemain1 && value.pemain2 == pemain2 && value.elo1 == elo1 && value.elo2 == elo2)
                            {
                                console.log("Ketemu...")
                                this._statistics[key].status = "WIN-RESIGNED";
                            }
                        }
                        x++;
                    }
                }while(element !== null)

                pageNumber++;
            } else {
                pageNumber = 1;
                exit = true;
            }
        }

        exit = false

        // Won by abandoned
        while(!exit)
        {
            var linkToGo = this._won4 + pageNumber;
    
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
                    console.log(`Scraping the WIN - Abandoned, local ${x} row...`);
    
                    var elementPath = `#games-root-index > div > div.archive-games-table-wrapper > div > table > tbody > tr.v-board-popover:nth-child(${x})`;
                    var pemain1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var pemain2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var elo1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > span.post-view-meta-rating`;
                    var elo2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > span.post-view-meta-rating`;               
                    element = await page.$(elementPath);
    
                    if(element !== null)
                    {
                        var setatpemain1 = await page.$(pemain1);
                        var setatpemain2 = await page.$(pemain2);
                        var setatelo1 = await page.$(elo1);
                        var setatelo2 = await page.$(elo2);
        
                        pemain1 = await page.evaluate(el => el.textContent, setatpemain1);
                        pemain2 = await page.evaluate(el => el.textContent, setatpemain2);
                        elo1 = await page.evaluate(el => el.textContent, setatelo1);
                        elo2 = await page.evaluate(el => el.textContent, setatelo2);
                        pemain1 = pemain1.replace(/[\t\n\    ]+/g,'');
                        pemain2 = pemain2.replace(/[\t\n\    ]+/g,'');
    
                        for (const [key, value] of Object.entries(this._statistics)) {
                            if(value.pemain1 == pemain1 && value.pemain2 == pemain2 && value.elo1 == elo1 && value.elo2 == elo2)
                            {
                                console.log("Ketemu...")
                                this._statistics[key].status = "WIN-ABANDONED";
                            }
                        }
                        x++;
                    }
                }while(element !== null)

                pageNumber++;
            } else {
                pageNumber = 1;
                exit = true;
            }
        }

        exit = false

        // lost by timeout
        while(!exit)
        {
            var linkToGo = this._lose1 + pageNumber;
    
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
                    console.log(`Scraping the LOSE - Timeout, local ${x} row...`);
    
                    var elementPath = `#games-root-index > div > div.archive-games-table-wrapper > div > table > tbody > tr.v-board-popover:nth-child(${x})`;
                    var pemain1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var pemain2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var elo1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > span.post-view-meta-rating`;
                    var elo2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > span.post-view-meta-rating`;               
                    element = await page.$(elementPath);
    
                    if(element !== null)
                    {
                        var setatpemain1 = await page.$(pemain1);
                        var setatpemain2 = await page.$(pemain2);
                        var setatelo1 = await page.$(elo1);
                        var setatelo2 = await page.$(elo2);
        
                        pemain1 = await page.evaluate(el => el.textContent, setatpemain1);
                        pemain2 = await page.evaluate(el => el.textContent, setatpemain2);
                        elo1 = await page.evaluate(el => el.textContent, setatelo1);
                        elo2 = await page.evaluate(el => el.textContent, setatelo2);
                        pemain1 = pemain1.replace(/[\t\n\    ]+/g,'');
                        pemain2 = pemain2.replace(/[\t\n\    ]+/g,'');
    
                        for (const [key, value] of Object.entries(this._statistics)) {
                            if(value.pemain1 == pemain1 && value.pemain2 == pemain2 && value.elo1 == elo1 && value.elo2 == elo2)
                            {
                                console.log("Ketemu...")
                                this._statistics[key].status = "LOSE-TIMEOUT";
                            }
                        }
                        x++;
                    }
                }while(element !== null)

                pageNumber++;
            } else {
                pageNumber = 1;
                exit = true;
            }
        }

        exit = false

        // lose by checkmated
        while(!exit)
        {
            var linkToGo = this._lose2 + pageNumber;
    
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
                    console.log(`Scraping the LOSE - Checkmated, local ${x} row...`);
    
                    var elementPath = `#games-root-index > div > div.archive-games-table-wrapper > div > table > tbody > tr.v-board-popover:nth-child(${x})`;
                    var pemain1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var pemain2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var elo1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > span.post-view-meta-rating`;
                    var elo2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > span.post-view-meta-rating`;               
                    element = await page.$(elementPath);
    
                    if(element !== null)
                    {
                        var setatpemain1 = await page.$(pemain1);
                        var setatpemain2 = await page.$(pemain2);
                        var setatelo1 = await page.$(elo1);
                        var setatelo2 = await page.$(elo2);
        
                        pemain1 = await page.evaluate(el => el.textContent, setatpemain1);
                        pemain2 = await page.evaluate(el => el.textContent, setatpemain2);
                        elo1 = await page.evaluate(el => el.textContent, setatelo1);
                        elo2 = await page.evaluate(el => el.textContent, setatelo2);
                        pemain1 = pemain1.replace(/[\t\n\    ]+/g,'');
                        pemain2 = pemain2.replace(/[\t\n\    ]+/g,'');
    
                        for (const [key, value] of Object.entries(this._statistics)) {
                            if(value.pemain1 == pemain1 && value.pemain2 == pemain2 && value.elo1 == elo1 && value.elo2 == elo2)
                            {
                                console.log("Ketemu...")
                                this._statistics[key].status = "LOSE-CHECKMATED";
                            }
                        }
                        x++;
                    }
                }while(element !== null)

                pageNumber++;
            } else {
                pageNumber = 1;
                exit = true;
            }
        }

        exit = false

        // lose by resigned
        while(!exit)
        {
            var linkToGo = this._lose3 + pageNumber;
    
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
                    console.log(`Scraping the LOSE - Resigned, local ${x} row...`);
    
                    var elementPath = `#games-root-index > div > div.archive-games-table-wrapper > div > table > tbody > tr.v-board-popover:nth-child(${x})`;
                    var pemain1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var pemain2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var elo1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > span.post-view-meta-rating`;
                    var elo2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > span.post-view-meta-rating`;               
                    element = await page.$(elementPath);
    
                    if(element !== null)
                    {
                        var setatpemain1 = await page.$(pemain1);
                        var setatpemain2 = await page.$(pemain2);
                        var setatelo1 = await page.$(elo1);
                        var setatelo2 = await page.$(elo2);
        
                        pemain1 = await page.evaluate(el => el.textContent, setatpemain1);
                        pemain2 = await page.evaluate(el => el.textContent, setatpemain2);
                        elo1 = await page.evaluate(el => el.textContent, setatelo1);
                        elo2 = await page.evaluate(el => el.textContent, setatelo2);
                        pemain1 = pemain1.replace(/[\t\n\    ]+/g,'');
                        pemain2 = pemain2.replace(/[\t\n\    ]+/g,'');
    
                        for (const [key, value] of Object.entries(this._statistics)) {
                            if(value.pemain1 == pemain1 && value.pemain2 == pemain2 && value.elo1 == elo1 && value.elo2 == elo2)
                            {
                                console.log("Ketemu...")
                                this._statistics[key].status = "LOSE-RESIGNED";
                            }
                        }
                        x++;
                    }
                }while(element !== null)

                pageNumber++;
            } else {
                pageNumber = 1;
                exit = true;
            }
        }

        exit = false

        // Lose by abandoned
        while(!exit)
        {
            var linkToGo = this._lose4 + pageNumber;
    
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
                    console.log(`Scraping the LOSE - Abandoned, local ${x} row...`);
    
                    var elementPath = `#games-root-index > div > div.archive-games-table-wrapper > div > table > tbody > tr.v-board-popover:nth-child(${x})`;
                    var pemain1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var pemain2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > a.post-view-meta-username.v-user-popover`;
                    var elo1 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(1) > div.post-view-meta-user > span.post-view-meta-rating`;
                    var elo2 = elementPath + ` > td.archive-games-user-cell > div.archive-games-user-wrapper > div.archive-games-users > div.archive-games-user-tagline:nth-child(2) > div.post-view-meta-user > span.post-view-meta-rating`;               
                    element = await page.$(elementPath);
    
                    if(element !== null)
                    {
                        var setatpemain1 = await page.$(pemain1);
                        var setatpemain2 = await page.$(pemain2);
                        var setatelo1 = await page.$(elo1);
                        var setatelo2 = await page.$(elo2);
        
                        pemain1 = await page.evaluate(el => el.textContent, setatpemain1);
                        pemain2 = await page.evaluate(el => el.textContent, setatpemain2);
                        elo1 = await page.evaluate(el => el.textContent, setatelo1);
                        elo2 = await page.evaluate(el => el.textContent, setatelo2);
                        pemain1 = pemain1.replace(/[\t\n\    ]+/g,'');
                        pemain2 = pemain2.replace(/[\t\n\    ]+/g,'');
    
                        for (const [key, value] of Object.entries(this._statistics)) {
                            if(value.pemain1 == pemain1 && value.pemain2 == pemain2 && value.elo1 == elo1 && value.elo2 == elo2)
                            {
                                console.log("Ketemu...")
                                this._statistics[key].status = "LOSE-ABANDONED";
                            }
                        }
                        x++;
                    }
                }while(element !== null)

                pageNumber++;
            } else {
                pageNumber = 1;
                exit = true;
            }
        }

        exit = false
    }

    async checkPage(page)
    {
        try
        {
            // Checking if login element exist
            let element = await page.$("#games-root-index > div > div > div > h3");
            //console.log(element);
            if(await element === null){return true};
            return false;
        } catch(err)
        {
            console.log(err);
        }
    }
}

var tes = new scraper("dewa_kipas");