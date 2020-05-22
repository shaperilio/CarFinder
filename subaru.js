const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');
const moment = require('moment');

function parseResults(body, dealer) {
    const cars = [];
    const content = cheerio.load(body);
    const dealerName = content('.org').text().trim();
    const dealerAddress = `${content('.street-address').text().trim()}, ${content('.locality').text().trim()}, ${content('.region').text().trim()}, ${content('.postal-code').text().trim()}`;
    const dealerCityState = `${content('.locality').text().trim()}, ${content('.region').text().trim()}`;
    const numCars = content('.vehicle-count').last().text();
    if (!numCars || numCars === '0') return cars;
    content('.hproduct', '.bd').each(
        (i, car) => {
            const name = content('.url', car).text().trim();
            const url = `${dealer}${content('.url', car).attr('href')}`;
            const imgUrl = content('img', content('.media', car)).attr('src');
            const pricing = content('.pricing', car);
            const msrp = content('li', pricing).find('.msrp').find('.value').text();
            const internetPrice = content('li', pricing).find('.internetPrice').find('.value').text();
            const finalPrice = content('li', pricing).find('.final-price').find('.value').text();
            const theCar = {
                dealerName,
                dealerAddress,
                dealerCityState,
                name,
                url,
                imgUrl,
                msrp,
                internetPrice,
                finalPrice,
                prices: []
            };
            content('li', pricing).each(
                (j, price) => {
                    const number = content('.value', price).text();
                    const label = content('.label', price).text();
                    if (label)
                        theCar.prices.push({ label, number });
                })
            cars.push(theCar);
        }
    );
    if (cars.length !== parseInt(numCars)) {
        console.error(`${dealerName} website reports ${numCars} but we retrieved ${cars.length}!`);
    }
    return cars;
}

async function fetchFromDealer(dealer) {
    const query = 'new-inventory/index.htm?search=&model=Outback&trim=Onyx+Edition+XT';
    const url = `${dealer}${query}`;
    const response = await fetch(url);
    const body = await response.text();
    const cars = parseResults(body, dealer);
    console.log(`${cars.length} car(s) found at ${url}`);
    return cars;
}

async function run() {
    const dealers = [
        'https://www.fairfieldsubaru.com/',
        'https://www.diablosubaru.com/',
        'https://www.hanleesnapasubaru.com/',
        'https://www.hanselsubaru.com/',
        'https://www.maitasubaru.com/',
        'https://www.livermoresubaru.com/',
        'https://www.premiersubaruoffremont.com/',
        'https://www.putnamsubaruofburlingame.com/',
        'https://www.serramontesubaru.com/',
        'https://www.carlsensubaru.com/',
        'https://www.subaruofoakland.com/',
        'https://www.albanysubaru.com/',
        'https://www.gillmansubaru.com/',
        'https://www.westhoustonsubaru.com/', 
        'https://www.gillmansubarunorth.com/',
        'https://www.superiorsubaruofhouston.com/'
    ]

    const allCars = [];

    const promises = [];
    for (const dealer of dealers) {
        promises.push(fetchFromDealer(dealer));
    }

    const dealerCars = await Promise.all(promises);
    for (const cars of dealerCars) {
        allCars.push(...cars);
    }

    allCars.sort(function (a, b) {
        if (a.finalPrice < b.finalPrice) return -1;
        if (a.finalPrice > b.finalPrice) return 1;
        return 0;
    });

    const archive = `archive/subaru_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`;
    fs.writeFileSync(archive, JSON.stringify(allCars, null, 2), err => {
        console.error(err);
    });
    
    fs.writeFileSync('subaru.json', JSON.stringify(allCars, null, 2), err => {
        console.error(err);
    });

    return allCars;
}

module.exports = {run};