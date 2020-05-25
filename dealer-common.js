const fetcher = require('./fetch-with-cache.js');
const cheerio = require('cheerio');
const fs = require('fs');

const windowStickerUrl =  'https://window-sticker-services.pse.dealer.com/windowsticker/MAKE?vin=VIN'

async function fetchFromDealer(dealerUrl, make, query) {
    const url = `${dealerUrl}${query}`;
    const body = await fetcher.getHtml(url);
    let result = await parseResults(body, dealerUrl, make, url);
    const cars = result.cars;
    while (result.reportedCars > cars.length) {
        const paginatedUrl = url.replace('search=', `start=${cars.length}`)
        const body = await fetcher.getHtml(paginatedUrl);
        result = await parseResults(body, dealerUrl, make, paginatedUrl);
        cars.push(...result.cars);
    }
    console.log(`${cars.length} car(s) parsed from ${url}`);
    return cars;
}

async function getVinFromCarPage(url) {
    const body = await fetcher.getHtml(url);
    const content = cheerio.load(body);
    const vinLine = content('.additional-details').text();
    const vinIdx = vinLine.indexOf("VIN:");
    let vin;
    if (vinIdx > -1) {
        vin = vinLine.slice(vinIdx + 4, vinLine.length).trim();
    }
    if (!vin) {
        vin = content('.value', content('.vin')).text().trim();
    }
    if (!vin) {
        console.warn(`Could not get VIN from ${url}`);
    }
    return vin;
}

async function parseResults(body, dealer, make, pageUrl) {
    const cars = [];
    const content = cheerio.load(body);
    fs.writeFileSync('page.html', body)
    const numCars = content('.vehicle-count').last().text();
    const carList = content('.hproduct', '.bd');
    // console.log(`numCars = ${numCars}; carList.length = ${carList.length} at ${pageUrl}`);

    if (carList.length === 0) {
        console.error(`No cars found at ${pageUrl}`);
        // const dealerForFile = dealer.match(/https?\:\/\/(www\.)?(?<dealer>\w*)\./).groups.dealer;
        // fs.writeFileSync(`crap/page_${dealerForFile}.html`, body);
        // console.error('Page saved for inspection');
    }
    let dealerName = content('.org').text().trim();
    if (!dealerName) {
        dealerName = 'Unkown dealer name';
    }
    const dealerAddress = `${content('.street-address').text().trim()}, ${content('.locality').text().trim()}, ${content('.region').text().trim()}, ${content('.postal-code').text().trim()}`;
    const dealerCityState = `${content('.locality').text().trim()}, ${content('.region').text().trim()}`;
    carList.each( 
        async (i, car) => {
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
            if (!vin) {
                vin = await getVinFromCarPage(url);
                if (!vin) {
                    console.error(`Could not get vin from search resutls at ${pageUrl} or car page at ${url}`);
                }
            }
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