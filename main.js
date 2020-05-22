const subaru = require('./subaru.js');
const jeep   = require('./jeep-mfg.js');
const fs     = require('fs');
const moment = require('moment');

async function makeSubaruTable() {
    const allCars = await subaru.run();
    let html = `
    <table cellpadding="5px" border="1px">
    <tr>
      <th>Photo</th>
      <th>MSRP</th>
      <th>Final price</th>
      <th>Location</th>
    </tr>`;

    for (const car of allCars) {
        const googleMapsLink = `https://www.google.com/maps/place/${car.dealerAddress.replace(/\s/g, '+')}`;
        html += `<tr>
    <td><img src="${car.imgUrl}" height="120px"></td>
    <td>${car.msrp}</td>
    <td><a href="${car.url}" target="_blank">${car.finalPrice}</a></td>
    <td><a href="${googleMapsLink}" target="_blank">${car.dealerName} - ${car.dealerCityState}</a></td>
    </tr>`
        console.log(`${car.finalPrice} - ${car.name} (${car.url}).`);
    }

    html += `</table>`;

    return html;
}

async function makeJeepTable() {
    const allCars = await jeep.run();
    let html = `
    <table cellpadding="5px" border="1px">
    <tr>
      <th>Photo</th>
      <th>MSRP</th>
      <th>Final price</th>
      <th>Location</th>
    </tr>`;

    for (const car of allCars) {
        const googleMapsLink = `https://www.google.com/maps/place/${car.dealer.address.replace(/\s/g, '+')}`;
        html += `<tr>
    <td>
        <a href="${car.exteriorImageUrl}" target="_blank"><img src="${car.exteriorImageUrl}" height="120px">
        <a href="${car.interiorImageUrl}" target="_blank"><img src="${car.interiorImageUrl}" height="120px">
    </td>
    <td>${car.msrp}</td>
    <td><a href="${car.url}" target="_blank">${car.finalPrice}</a></td>
    <td><a href="${googleMapsLink}" target="_blank">${car.dealer.name} - ${car.dealer.cityState}</a><br />
        <a href="${car.windowSticker}" target="_blank">${car.vin}</a></td>
    </tr>`
        console.log(`${car.finalPrice} - ${car.model} (${car.url}).`);
    }

    html += `</table>`;

    return html;
}

async function makePage() {
    let html = `
    <body>
    <p>Updated ${moment().format('YYYY-MM-DD HH:mm:ss')}</p>
    <table><tr><td valign="top">`;
    
    html += await makeSubaruTable();

    html += `</td>
    <td valign="top">`;
    
    html += await makeJeepTable();
    
    html += `
    </td></tr></table>
    </body>`;
    fs.writeFileSync('index.html', html, err => {
        console.error(err);
    });
}

makePage();