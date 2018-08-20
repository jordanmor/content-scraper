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
 * 1. Over 2 million downloads a week on npm & update last published within the last week.
 * 2. Chose over Cheerio because Cheerio has not been updated for a year
 */
const jsdom = require('jsdom');

const { JSDOM } = jsdom;

/* Data folder created if one does not exist. If it does exist, 
   an unlogged error is thrown, which does not affect the rest of the program. */
fs.mkdir('data', err => err);

fetch('http://shirts4mike.com/shirts.php')
  .then(checkStatus)
  .then(scrapeUrls)
  .then(urls => console.log(urls))
  .catch(error => console.log(error.message));

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