const rp = require('request-promise');
const fs =  require('fs');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const path = require('path');
// const imageGrayScale = require('image-grayscale');

const urls = fs.readFileSync(__dirname+'/temp.txt').toString().split('\n');

const downloadImage = (url,name) => {
	
	const imageOptions = {
		uri: url,
		encoding: null
	};

	return new Promise((resolve,reject) => {
		rp.get(imageOptions)
		.then((data) => {
			const buffer = Buffer.from(data,'utf8');
			fs.writeFileSync('tmp'+name+'.jpg',buffer);
			resolve('tmp'+name+'.jpg');
		})
		.catch((err) => {
			console.error(err);
			reject(err);
		});
	});
};

const decolorImage = (image) => {
	
	return new Promise((resolve, reject) => {

		imageGrayScale(image, {bufferMode: true, showErrorMessages: true}, (error, buffer) => {
			 if(error){
			 	console.error(error);
			 	reject(error);
			 }
			 else
			 {
			 	console.log('Buffer received');
 			 	fs.writeFileSync('tmp-bnw'+name+'.jpg',buffer);
 			 	resolve('tmp-bnc'+name+'.jpg');
			 }
		});
	});
}

const compressImage = (image,directory) => {
	
	return imagemin([image], path.resolve(__dirname, '../','public/images',directory), {use: []})
	.then((files) => {
		return 'Image optimized ' + files.map((file) => file.path);
	})
	.catch((err) => {
		throw err;
	});
};

const processImages = async (images, directory) => {
	
	return await Promise.all( images.map(async (image) => {
		return await compressImage('./'+image,directory);
	}));
}

const removeColors = async (images) => {

	return await Promise.all( images.map( async (image) => {
		return await decolorImage('./build/images/'+image);
	}));
}



const saveImages = async (images) => {

	return await Promise.all( images.map(async (image, idx) => {
		return await downloadImage(image,'image'+idx);
	}));

};

let images = null;

saveImages(urls)
.then((data) => {
	images = data;
	return processImages(data,'mydirectory');
})
.then((data) => {
	console.log('Image has been compressed',data);
	// return removeColors(images);
})
.catch((err) => {
	console.log(err);
});