const fetch = require('node-fetch');
const moment = require('moment');
const md5 = require('md5');
const fs = require('fs');
const childProcess = require('child_process');

function makeCacheFilename(url) {
    const key = `${url}${moment().format('YYYY-MM-DD_HH')}`
    return `cache/${md5(key)}`;   
}

async function getHtml(url) {
    const filename = `${makeCacheFilename(url)}.html`;
    if (fs.existsSync(filename)) {
        // console.debug(`Cache hit ${filename} => ${url}`);
        return String(fs.readFileSync(filename));
    }

    // childProcess.execSync(`curl -L "${url}" -o ${filename}`);
    // return String(fs.readFileSync(filename));

    const response = await fetch(url);
    const data = await response.text();
    fs.writeFile(filename, data, err => {
        if (err) {
            console.error(`Could not write cache file ${filename} for ${url}`);
        }
    });
    return data;
}

async function getJson(url) {
    const filename = `${makeCacheFilename(url)}.json`;
    if (fs.existsSync(filename)) {
        // console.debug(`Cache hit ${filename} => ${url}`);
        return JSON.parse(fs.readFileSync(filename));
    }

    const response = await fetch(url);
    const data = await response.json();
    fs.writeFile(filename, JSON.stringify(data, null, 2), err => {
        if (err) {
            console.error(`Could not write cache file ${filename} for ${url}`);
        }
    });
    return data;
}

module.exports = { getHtml, getJson }