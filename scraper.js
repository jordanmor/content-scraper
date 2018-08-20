"use strict";

const fs = require('fs');

/* Data folder created if one does not exist. If it does exist, 
   an unlogged error is thrown, which does not affect the rest of the program. */
fs.mkdir('data', err => err);