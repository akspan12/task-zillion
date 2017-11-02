'use strict';

const rp = require('request-promise');
const fs = require('fs');
const imagemin = require('imagemin');
const path = require('path')
const imgGrayScale = require('image-grayscale');

const convertToGrey = (image,savePath,directory) => {

	// console.log('Converting: ',image);
	return imgGrayScale(image,{bufferMode: true, logProgress:true})
	.then((data) => {
		
		// console.log('Writing to: ',savePath);
		fs.writeFileSync(savePath, data);
		return Promise.resolve('Image converted to gray scale: '+image);
	})
	.catch((err) => {
		console.log('Could not convert to grayscale: ', err);
	})
};


const removeColor = async (images, directory) => {
	
	fs.mkdirSync(path.resolve(__dirname,'../','public/images',directory,'grayscale'));
	
	let imageFolder = path.resolve(__dirname,'../','public/images',directory);

	let savePath = path.resolve(__dirname,'../','public/images',directory,'grayscale');

	return await Promise.all(images.map(async (image) => {
		
		return await convertToGrey(path.resolve(imageFolder, image), path.resolve(savePath, image), directory);
	}));
}


const compressImage = (image,directory) => {

	return imagemin([image], path.resolve(__dirname,'../','public/images',directory), {use: []})
	.then(() => {
		return 'Image optimized ' + image;
	})
	.catch((err) => {
		throw error;
	});
};

const processImages = async (images,directory) => {
	
	return await Promise.all( images.map(async (image) => {
		return await compressImage('./'+image,directory);
	}));
};


const downloadImage = (url,name) => {
	
	const imageOptions = {
		uri: url,
		encoding: null,
		resolveWithFullResponse: true,
		simple: false
	};

	return new Promise((resolve,reject) => {
		rp.get(imageOptions)
		.then((data) => {
			const buffer = Buffer.from(data.body,'utf8');
			fs.writeFileSync('tmp'+name+'.jpg',buffer);
			resolve('tmp'+name+'.jpg');
		})
		.catch((err) => {
			console.error('Could not download image: ', url);
			resolve('tmp'+name+'.jpg'); // rejecting this causes the downloaded images to not be copied to static folder
		});
	});
};

const saveImages = async (images) => {

	return await Promise.all( images.map(async (image, idx) => {
		return await downloadImage(image,'image'+idx);
	}));

};

module.exports.startTask = (keyword) => {

		console.log('Received keyword: ',keyword);

		let options1 = {
		uri:'https://www.googleapis.com/customsearch/v1',
		qs: {
			q:keyword, // search expression
			cx: process.env.CSE_ID,
			key: process.env.CSE_API_KEY,
			searchType: 'image',
			num: 10, // number of search results,
			start: 1
		},
		json: true
	};

	let options2 = {
		uri:'https://www.googleapis.com/customsearch/v1',
		qs: {
			q:keyword, // search expression
			cx: process.env.CSE_ID,
			key: process.env.CSE_API_KEY,
			searchType: 'image',
			num: 10, // number of search results,
			start: 11
		},
		json: true
	};


	let imageNames = [];

	return rp(options1)
		.then((data) => {
			return new Promise((resolve, reject) => {
				let images = [];
				data.items.forEach((item) => {
					images.push(item.link);
				});
				resolve(images);
			});
		})
		.then((images) => {
			return rp(options2)
				.then((data) => {
					data.items.forEach((item) => {
						images.push(item.link);
					});

					return Promise.resolve(images);
				})
		})
		.then((data) => {
			return saveImages(data.splice(0,15)); //array containing name of images
		})
		.then((data) => {
			imageNames = data;
			console.log('Images:\n',data);
			return processImages(data,keyword);
		})
		.then((data) => {
			console.log('Compressed Images:\n',data);
			return removeColor(imageNames, keyword);
		})
		.then((data) => {
			console.log('Converted to grayscale:\n',data);
			return Promise.resolve(true);
		})
		.catch((err) => {
			console.error(err);
			return false;
		});
}
