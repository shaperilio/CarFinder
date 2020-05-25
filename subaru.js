const fs = require('fs');
const moment = require('moment');
const { fetchFromDealer } = require('./dealer-common.js');


async function getCarsFromDealers() {
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

    const carsByDealer = await Promise.all(dealers.map(dealer => fetchFromDealer(dealer, 'subaru')));
    const allCars = [];
    carsByDealer.map(cars => allCars.push(...cars));

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

module.exports = {getCarsFromDealers};