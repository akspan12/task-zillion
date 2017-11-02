'use strict';

const express = require('express');
const router = express.Router();
const task = require('../utils/index');
const Search = require('../db/db');
const getImages = require('../utils/readdirectory');
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('search', { title: 'Express' });
});

router.post('/keyword', (req,res,next) => {
	const keyword = req.body.keyword;
	
	task.startTask(keyword)
	.then((data) => {

		console.log('\n\n\n Task Status:\n\n',data);

		res.redirect('/history');
		
		return new Search({
			keyword: keyword
		});
	})
	.then((data) => data.save())
	.then((data) => {
		console.log('Saved successfully: ', data);
	})
	.catch((err) => {
		res.render('error',err);
		console.log('An error occurred: ', err);
	});

});

router.get('/history',(req,res,next) => {
	
	Search.find()
	.then(async (data) => {
		return await Promise.all( data.map((datum) => {
			return datum.keyword;
		}));
	})
	.then((data) => {
		console.log(data);
		res.render('history', {searchArr:data})
	})
	.catch((err) => {

		console.log('Could not retrieve data: ', err);
		res.render('error',err);
	});

});

router.get('/getimages', (req,res,next) => {
	
	const keyword = req.query.keyword;

	const directoryPath = path.resolve(__dirname,'../','public/images',keyword,'grayscale');

	getImages(directoryPath)
	.then((data) => {
		// console.log('Directory contents: ', data);

		res.render('result',{images:data, keyword:keyword});
	})
	.catch((err) => {
		console.log('Error in reading contents: ', err);
		res.render('error', err);
	})


})

module.exports = router;