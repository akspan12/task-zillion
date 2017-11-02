'use strict';
const imageGrayScale = require('image-filter-grayscale');
const path = require('path');
const imgGS = require('image-grayscale');
const fs = require('fs');

let img = path.resolve(__dirname,'../','public/images/time','tmpimage2.jpg');

imgGS(img,{logProgress:true, bufferMode: true})
.then((data) => {
	fs.mkdirSync(path.resolve(__dirname,'../','public/images/time/grayscale'));
	
	fs.writeFileSync(path.resolve(__dirname,'../','public/images/time/grayscale')+'/img-black.jpg',data);
})
.catch((err) => {
	console.log(err)
});