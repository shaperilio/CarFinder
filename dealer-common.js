const cheerio = require('cheerio');
const fs = require('fs');

const windowStickerUrl =  'https://window-sticker-services.pse.dealer.com/windowsticker/MAKE?vin=VIN'

function parseResults(body, dealer, make, pageUrl) {
    console.log(pageUrl);
    const cars = [];
    const content = cheerio.load(body);
    fs.writeFileSync('page.html', body)
    const numCars = content('.vehicle-count').last().text();
    const apparentNumCars = content('.hproduct', '.bd').length;
    console.log(`numCars = ${numCars}; apparentNumCars = ${apparentNumCars}`);
    if (!numCars || numCars === '0' || apparentNumCars === 0) 
        return cars;

    let dealerName = content('.org').text().trim();
    if (!dealerName) {
        dealerName = 'noname';
    }
    if (!dealerName) {
        dealerName = 'noname';
    }
    if (!dealerName) {
        dealerName = 'noname';
    }
    if (!dealerName) {
        dealerName = 'noname';
    }
    const dealerAddress = `${content('.street-address').text().trim()}, ${content('.locality').text().trim()}, ${content('.region').text().trim()}, ${content('.postal-code').text().trim()}`;
    const dealerCityState = `${content('.locality').text().trim()}, ${content('.region').text().trim()}`;
    content('.hproduct', '.bd').each(
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
                msrp = '0'
            }
            let finalPrice = content('li', pricing).find('.final-price').find('.value').text();
            if (!finalPrice) {
                finalPrice = content('.an-final-price .price', pricing).text();
            }
            if (!finalPrice) {
                finalPrice = '0';
            }
            if (!finalPrice) {
                finalPrice = '0';
            }
            if (!finalPrice) {
                finalPrice = '0';
            }
            const internetPrice = content('li', pricing).find('.internetPrice').find('.value').text();
            let vin = content('.vin dd', car).text();
            const engine = content('.description dt:contains("Engine:")', car).next().text().replace(',', '');
            const theCar = {
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
    if (cars.length !== parseInt(numCars)) {
        console.error(`${dealerName} website reports ${numCars} but we retrieved ${cars.length}!`);
    }
    return cars;
}

module.exports = {parseResults}