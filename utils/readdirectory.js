'use strict';
const fs = require('fs');

const getImageNames = (path) => {

	return new Promise((resolve,reject) => {
		fs.readdir(path, (err,items) => {
			if(err)
				reject(err);
			else
				resolve(items);
		});
	});
};

module.exports = getImageNames;