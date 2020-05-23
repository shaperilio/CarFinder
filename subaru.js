const fetch = require('node-fetch');
const fs = require('fs');
const moment = require('moment');
const { parseResults } = require('./dealer-common.js');

async function fetchFromDealer(dealer) {
    const query = 'new-inventory/index.htm?search=&model=Outback&trim=Onyx+Edition+XT';
    const url = `${dealer}${query}`;
    const response = await fetch(url);
    const body = await response.text();
    const cars = parseResults(body, dealer, 'subaru', url);
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