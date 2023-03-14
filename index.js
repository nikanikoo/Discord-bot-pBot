/**
 * @author Andrey Nedobylskiy (admin@twister-vl.ru)
 *
 */

const puppeteer = require('puppeteer');
require('dotenv').config();

class PBot {

    constructor(botName = process.env.NAME, lang = process.env.LANG) {
        this.botName = botName;
        this.page = null;
        this.queue = [];
        this.lang = lang
    }

    async _sayToBot(text) {
        let result = await this.page.evaluate((text) => {
            return new Promise((resolve) => {
                $('.last_answer').text('NOTEXT');
                $('.main_input').val(text);
                $('#btnSay').click();

                let lastAnswer = '';

                let timer = setInterval(() => {

                    if($('.last_answer').text() && $('.last_answer').text() !== 'NOTEXT' && $('.last_answer').text() !== 'ρBot: думаю...' && $('.last_answer').text() !== 'ρBot: thinking...') {
                        if(lastAnswer === $('.last_answer').text()) {
                            clearInterval(timer);
                            resolve($('.last_answer').text());
                        }
                        lastAnswer = $('.last_answer').text();
                    }
                }, 100);

            })
        }, text);

        result = result.split(':')[1].trim();

        result = result.replace(/pBot/g, this.botName);
        result = result.replace(/ρBot/g, this.botName);

        return result;

    }

    /**
     * Сказать боту и получить ответ
     * @param {string} text
     * @returns {Promise<string>}
     * @async
     */
    say(text) {
        return new Promise((resolve => {
            this.queue.push({text, cb: (response) => resolve(response)});
        }))
    }

    /**
     * Инициализация
     * @param {*} options
     * @returns {Promise<void>}
     */
    async init(options = {headless: true}) {
        this.browser = await puppeteer.launch(options);

        this.page = await this.browser.newPage();
        await this.page.setDefaultNavigationTimeout(0);

                await this.page.goto('http://p-bot.ru/');

        //await page.screenshot({path: 'example.png'});
        await this.page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'});

        //Таймер очереди запросов
        const queueProcesser = async () => {
            let request = this.queue.shift();

            if(!request) {
                this.queueTimer = setTimeout(queueProcesser, 100);
                return;
            }

            //Выполняем обработку запроса
            request.cb(await this._sayToBot(request.text));

            this.queueTimer = setTimeout(queueProcesser, 100);
        };
        this.queueTimer = setTimeout(queueProcesser, 100);
    }

    /**
     * Остановка
     * @returns {Promise<void>}
     */
    async destroy() {
        clearTimeout(this.queueTimer);
        await this.browser.close();
    }
}

module.exports = PBot;