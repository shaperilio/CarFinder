const fetch = require('node-fetch');
const moment = require('moment');
const fs = require('fs');

const radiusMiles = 150;

function formatCurrency(numberString) {
    let result = ''
    for (let i = numberString.length - 1; i > -1; i--) {
        result = numberString.charAt(i) + result;
        const pos = numberString.length - i;
        if (pos > 0 && pos % 3 === 0) result = ',' + result;
    }
    return '$' + result;
}

function makeImageUrl(urlParams, width, interior=false) {
    const imageUrl = 'https://www.jeep.com/mediaserver/iris?'
    let pov = 'fullfronthero';
    let height = Math.trunc(width / 6 * 4);
    if (interior) { 
        pov = 'I01';
        height = Math.trunc(width / 6 * 8);
    }  
    const renderSettings = `&pov=${pov}&width=${width}&height=${height}&bkgnd=white&resp=jpg`;
    return `${imageUrl}${urlParams}${renderSettings}`;
}

async function getDealers(zipCode, radiusMiles) {
    const url = 'https://www.jeep.com/bdlws/MDLSDealerLocator?zipCode=ZIPCODE&func=SALES&radius=RADIUSMILES&brandCode=J&resultsPerPage=999'
    const requestUrl = url
        .replace('ZIPCODE', zipCode)
        .replace('RADIUSMILES', radiusMiles);
    const response = await fetch(requestUrl);
    const data = await response.json();
    const result = data.status;
    if (!result === 200) {
        console.error(`Could not get dealer list for ${zipCode}: ${result}`);
        return [];
    }
    const dealers = [];
    for (const dealer of data.dealer) {
        let dealerAddress = dealer.dealerAddress1;
        if (dealer.dealerAddress2) dealerAddress += dealer.dealerAddress2;
        dealers.push({
            code: dealer.dealerCode,
            name: dealer.dealerName,
            address: `${dealerAddress}, ${dealer.dealerCity}, ${dealer.dealerState}`,
            cityState: `${dealer.dealerCity}, ${dealer.dealerState}`,
            website: dealer.website + '/'
        })
    }

    console.log(`Obtained ${dealers.length} dealers for ${zipCode}`);
    return dealers;
}

function isCarValid(car, filters) {
    if (filters.engineCodes) {
        if (filters.engineCodes.indexOf(car.engineCode) === -1) return false;
    }

    if (filters.transmissionCodes) {
        if (filters.transmissionCodes.indexOf(car.transmissionCode) === -1) return false;
    }

    if (filters.exteriorColorCodes) {
        if (filters.exteriorColorCodes.indexOf(car.exteriorColorCode) === -1) return false;
    }

    if (filters.options) {
        for (const option of filters.options) {
            if (Array.isArray(option)) {
                let match = false;
                for (const optionCode of option) {
                    if (car.options.indexOf(optionCode) > -1) {
                        match = true;
                        break;
                    }
                }
                if (!match) return false;
            } else {
                if (car.options.indexOf(option) === -1) return false;
            }
        }
    }

    return true;
}

async function getCars(filters, zipCode, dealers) {
    const url = 'https://www.jeep.com/hostd/inventory/getinventoryresults.json?func=SALES&includeIncentives=Y&matchType=X&modelYearCode=IUJ202010&pageNumber=PAGENUMBER&pageSize=PAGESIZE&radius=RADIUSMILES&sortBy=0&zip=ZIPCODE'
    const pageSize = 10000;
    const requestUrl = url
        .replace('PAGENUMBER', 1)
        .replace('ZIPCODE', zipCode)
        .replace('RADIUSMILES', radiusMiles)
        .replace('PAGESIZE', pageSize);
    // console.log(requestUrl);
    const response = await fetch(requestUrl);
    const data = await response.json();
    const result = data.result.result
    if (!result === "SUCCESS") {
        console.error(`${result}: ${data.result.errors.join(', ')}`);
        return [];
    }
    const cars = data.result.data.vehicles;
    console.log(`${cars.length} cars found.`);
    if (cars.length === pageSize) {
        console.warning('There may be more cars available; send another request!');
    }
    if (cars.length < data.result.data.metadata.totalCount) {
        console.warning('There are more cars available; send another request!');
    }
    filteredCars = []
    for (const car of cars) {
        if (filters && !isCarValid(car, filters)) continue;

        if (car.incentives) {
            console.log(car.incentives);
        }

        const engine = car.engineDesc;
        const tranny = car.transmissionDesc;
        const model = car.vehicleDesc;
        const vin = car.vin;
        const interior = car.interiorFabric;
        const employeePrice = car.price.employeePrice;
        const totalPrice = car.price.netPrice;
        const options = car.options;
        let doors;
        for (const attribute of car.attributes.attributes) {
            if (attribute.typeDesc === "Doors") {
                doors = attribute.value;
            }
        }
        const exteriorImageUrl = makeImageUrl(car.extImage, 1000, false);
        const interiorImageUrl = makeImageUrl(car.intImage, 1000, true);
        const modelYearCode = car.ccode.substring(0, 9);
        const windowSticker = `https://www.jeep.com/hostd/windowsticker/getWindowStickerPdf.do?vin=${vin}`
        let dealer = dealers.filter(a => a.code === car.dealerCode);
        if (dealer.length !== 1) {
            console.error(`${dealer.length} dealers found for car with dealer code = ${car.dealerCode}`);
        }
        dealer = dealer[0];
        // mine:        https://www.jeep.com/new-inventory/vehicle-details.html?modelYearCode=IUJ202010&vin=1C4HJXFN2LW266150&dealerCode=60385&radius=150&matchType=X&statusCode=KZX&ref=details&variation=undefined
        // theirs:      https://www.jeep.com/new-inventory/vehicle-details.html?modelYearCode=IUJ202010&vin=1C4HJXCG0LW205403&dealerCode=26852&radius=150&matchType=X&statusCode=KZX&ref=details&variation=undefined
        // My generated URLs don't load properly.
        const carUrl = `https://www.jeep.com/new-inventory/vehicle-details.html?modelYearCode=${modelYearCode}&vin=${vin}&dealerCode=${dealer.code}&radius=${radiusMiles}&matchType=X&statusCode=${car.statusCode}&ref=details&variation=undefined`
        thisCar = {
            model, engine, tranny, vin, interior, employeePrice, totalPrice, 
            options, doors, exteriorImageUrl, interiorImageUrl, 
            windowSticker,
            url: carUrl,
            finalPrice: employeePrice ? formatCurrency(employeePrice) : formatCurrency(totalPrice),
            msrp: formatCurrency(totalPrice),
            rawData: car,
            dealer: dealer
        };
        filteredCars.push(thisCar);
    }

    console.log(`Obtained ${filteredCars.length} cars from a total of ${cars.length} for ${zipCode}`);
    return filteredCars;
}

async function run() {
    const zipCodes = [
        77478,
        94610
    ]

    let promises = [];
    for (const zipCode of zipCodes) {
        promises.push(getDealers(zipCode, radiusMiles));
    }

    const dealersByZip = await Promise.all(promises);
    const allDealers = [];
    for (const dealers of dealersByZip) {
        allDealers.push(...dealers);
    }

    const filter = {
        transmissionCodes: ['DFT'],
        options: [
            ['HT1', 'HT3'], // hard top
            'ADE', // heated seats
            'ALP', // adaptive cruise
            ['AAN', 'AEK'], // CarPlay
            // 'AJ1', // ParkSense
        ],
        exteriorColorCodes: ['PRC', 'PDN', 'PBM', 'PYV', 'PGG']
    }

    promises = [];
    for (const zipCode of zipCodes) {
        promises.push(getCars(filter, zipCode, allDealers));
    }

    const carsByZip = await Promise.all(promises);
    const allCars = [];
    for (const cars of carsByZip) {
        allCars.push(...cars);
    }

    allCars.sort(function (a, b) {
        if (a.finalPrice < b.finalPrice) return -1;
        if (a.finalPrice > b.finalPrice) return 1;
        return 0;
    });

    const archive = `archive/jeep-mfg_${moment().format('YYYY-MM-DD_HH-mm-ss')}.json`;
    fs.writeFileSync(archive, JSON.stringify(allCars, null, 2), err => {
        console.error(err);
    });

    fs.writeFileSync('jeep-mfg.json', JSON.stringify(allCars, null, 2), err => {
        console.error(err);
    });

    return allCars;
}

module.exports = {run, getDealers};