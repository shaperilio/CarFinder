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

    const dealersByZip = await Promise.all(zipCodes.map(zipCode => getDealers(zipCode, radiusMiles)));
    const dealers = [];
    dealersByZip.map(dealer => dealers.push(...dealer.map(a => a.website)));

    const carsByDealer = await Promise.all(dealers.map(dealer => fetchCars(dealer)));
    const allCars = [];
    carsByDealer.map(cars => allCars.push(...cars));

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