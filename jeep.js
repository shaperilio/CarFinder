const fs = require('fs');
const moment = require('moment');
const { getDealers } = require('./jeep-mfg.js')
const { fetchFromDealer } = require('./dealer-common.js');

async function fetchCars(dealer) {
    const query = 'new-inventory/index.htm?search=&model=Wrangler&gvOption=Distance+Pacing+Cruise+Control&gvOption=Heated+Seats';
    return await fetchFromDealer(dealer, 'jeep', query);
}

async function getCarsFromDealers() {

    const zipCodes = [
        77478,
        94610
    ]

    const radiusMiles = 50;

    let promises = [];
    for (const zipCode of zipCodes) {
        promises.push(getDealers(zipCode, radiusMiles));
    }

    const dealersByZip = await Promise.all(promises);
    const dealers = [];
    for (const d of dealersByZip) {
        dealers.push(...d.map(a => a.website));
    }

    const allCars = [];

    promises = [];
    for (const dealer of dealers) {
        promises.push(fetchCars(dealer));
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

    const archive = `archive/jeep_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`;
    fs.writeFileSync(archive, JSON.stringify(allCars, null, 2), err => {
        console.error(err);
    });
    
    fs.writeFileSync('jeep.json', JSON.stringify(allCars, null, 2), err => {
        console.error(err);
    });

    return allCars;
}

module.exports = {getCarsFromDealers};