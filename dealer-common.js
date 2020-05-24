const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

const windowStickerUrl =  'https://window-sticker-services.pse.dealer.com/windowsticker/MAKE?vin=VIN'

async function fetchFromDealer(dealerUrl, make, query) {
    const url = `${dealerUrl}${query}`;
    const response = await fetch(url);
    const body = await response.text();
    let result = parseResults(body, dealerUrl, make, url);
    const cars = result.cars;
    console.log(`${cars.length} car(s) found at ${url}`);
    while (result.reportedCars > cars.length) {
        const response = await fetch(url.replace('search=', `start=${cars.length}`));
        const body = await response.text();
        result = parseResults(body, dealerUrl, make, url);
        cars.push(...result.cars);
    }
    return cars;
}

function parseResults(body, dealer, make, pageUrl) {
    const cars = [];
    const content = cheerio.load(body);
    fs.writeFileSync('page.html', body)
    const numCars = content('.vehicle-count').last().text();
    const carList = content('.hproduct', '.bd');
    console.log(`numCars = ${numCars}; carList.length = ${carList.length} at ${pageUrl}`);

    let dealerName = content('.org').text().trim();
    if (!dealerName) {
        dealerName = 'Unkown dealer name';
    }
    const dealerAddress = `${content('.street-address').text().trim()}, ${content('.locality').text().trim()}, ${content('.region').text().trim()}, ${content('.postal-code').text().trim()}`;
    const dealerCityState = `${content('.locality').text().trim()}, ${content('.region').text().trim()}`;
    carList.each(
        (i, car) => {
            const name = content('.url', car).text().trim();
            const url = `${dealer}${content('.url', car).attr('href')}`;
            const imgUrl = content('img', content('.media', car)).attr('src');
            const pricing = content('.pricing', car);
            let msrp = content('li', pricing).find('.msrp').find('.value').text();
            if (!msrp) {
                msrp = content('.an-msrp .price', pricing).text();
            }
            if (!msrp) {
                msrp = content('span', pricing).first().next().text();
            }
            if (!msrp) {
                msrp = content('.value', content('.salePrice', pricing)).text();
            }
            if (!msrp) {
                msrp = '0'; // put bad ones at the top.
            }
            let finalPrice = content('li', pricing).find('.final-price').find('.value').text();
            if (!finalPrice) {
                finalPrice = content('.an-final-price .price', pricing).text();
            }
            if (!finalPrice) {
                finalPrice = '0';
            }
            const internetPrice = content('li', pricing).find('.internetPrice').find('.value').text();
            let vin = content('.vin dd', car).text();
            const engine = content('.description dt:contains("Engine:")', car).next().text().replace(',', '');
            const theCar = {
                pageUrl,
                dealerName,
                dealerAddress,
                dealerCityState,
                name,
                url,
                imgUrl,
                engine,
                vin,
                windowSticker: windowStickerUrl.replace('MAKE', make).replace('VIN', vin),
                msrp,
                internetPrice,
                finalPrice,
                prices: []
            };
            content('li', pricing).each(
                (i, price) => {
                    const number = content('.value', price).text();
                    const label = content('.label', price).text();
                    if (label)
                        theCar.prices.push({ label, number });
                })
            cars.push(theCar);
        }
    );

    let reportedCars = 0;
    if (!isNaN(parseInt(numCars)) && carList.length > 0) {
        reportedCars = parseInt(numCars)
    }

    return { cars, reportedCars };
}

module.exports = { fetchFromDealer }