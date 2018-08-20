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
  .catch(error => console.log(error.message));

function checkStatus(response) {
  if (response.ok) {
    return response.text();
  } else {
    throw new Error(`Connection error: There's been a ${response.status} error. Cannot connect to ${response.url}.`);
  }
}