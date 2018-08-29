"use strict";

const fs = require('fs');

/* 
 * Reasons for using node-fetch
 * 1. Over 3 million downloads a week on npm & update last published within the last month
 * 2. I am familiar with the fetch API and therefore more comfortable using fetch in this project
 */
const fetch = require('node-fetch');

/* 
 * Reasons for using jsdom
 * 1. Over 2 million downloads a week on npm & update last published within the last month.
 * 2. Ease of use with jquery makes scraping data from website easier
 * 3. Chose over Cheerio because Cheerio has not been updated for a year
 */
const jsdom = require('jsdom');

/* 
 * Reasons for using json2csv
 * 1. Over 75,000 downloads a week on npm & update last published within the last month
 * 2. Good documentation made this module easy to implement in my project
 */
const json2csv = require('json2csv').parse;

const { JSDOM } = jsdom;

// Data folder created if one does not exist. If it does exist, the program does nothing.
fs.mkdir('data', err => err);

/*=============-=============-=============-=============
                        FETCH DATA
===============-=============-=============-===========*/

/* The project uses the http://shirts4mike.com/shirts.php URL 
as an entry point to look through the links on the page to find 8 shirts */

fetch('http://shirts4mike.com/shirts.php')
  .then(checkStatus)
  .then(scrapeUrls)
  .then(scrapeData)
  .then(convertToCSV)
  .catch(logError);

/*=============-=============-=============-=============
                        FUNCTIONS
===============-=============-=============-===========*/

function checkStatus(response) {
  if (response.ok) {
    return response.text();
  } else {
    throw new Error(`Connection error: There's been a ${response.status} error. Cannot connect to ${response.url}.`);
  }
}

// Extract urls that point to shirt data from main products page url using jsdom and jquery
function scrapeUrls(html) {
  const dom = new JSDOM(html);
  const $ = (require('jquery'))(dom.window);

  /* Create a jQuery collection of all relevant links to shirt info by selecting every <a> element 
  whose href attribute value begins with "shirt.php?id=". Map through this colleciton to create 
  the URLs where the shirt data can be accessed and scraped. */

  const urls = $('a[href^="shirt.php?id="]').map(function() {
    return `http://shirts4mike.com/${this.getAttribute('href')}`;
  });
  
  return $.makeArray(urls); // return a regular array
}

/* Pass an array of promises to Promise.all() to return a single promise 
that's resolved when all the data promises have resolved. 
Make array iteration easier using async/await */

async function scrapeData(urls) {
  const extractedDataArray = urls.map(async url => {
      const data = await fetch(url)
          .then(checkStatus)
          .then(extractData)
          .catch(logError);
      data.URL = url;
      return data;
  });
  return await Promise.all(extractedDataArray);
}

/* Use jsdom and jquery to scrape data from each shirt product page and return
relevant information in an object that can be converted to a csv file */

function extractData(html) {
  const dom = new JSDOM(html);
  const $ = (require('jquery'))(dom.window);
  const $shirtImg = $('.shirt-picture img');
  return {
      title: $shirtImg.attr('alt'),
      price: $('.shirt-details .price').text(),
      imageURL: `http://shirts4mike.com/${$shirtImg.attr('src')}`,
      URL: '',
      time: new Date().toISOString().slice(11,19)
  }
}

function convertToCSV(data) {
  const fields = ['title', 'price', 'imageURL', 'URL', 'time'];
  const date = new Date().toISOString().slice(0, 10);

  try {

    const csv = json2csv(data, { fields });
    fs.writeFile(`./data/${date}.csv`, csv, err => err);

  } catch (error) {
    console.log(error.message);
  }
}

/* When errors occur, logError function displays a human-friendly error and logs
the error in a scraper-error.log with a timestamp */

function logError(error) {
  const date = new Date().toString();
  let errorMessage = '';

  if (error.message.includes('Connection error')) {

    errorMessage = `${date}\n${error.message}\n\n`;

  } else if (error.message.includes('request to')) {

    let errorText = error.message.split(', ').splice(0,1).toString();
    errorText = errorText.slice(0,1).toUpperCase() + errorText.slice(1);
    errorMessage = new Error(`${date}\n${errorText}.\n\n`);

  } else {

    errorMessage = new Error(`${date}\nThere has been a problem with your fetch operation: ${error}\n\n`)
  }

  fs.appendFile('./scraper-error.log', errorMessage, err => err);

}