'use strict';
const mongoose = require('mongoose');

const uri = process.env.MONGOLAB_URI || 'mongodb://localhost/task';

console.log('DB connected to: ', uri);

mongoose.connect(uri);


const images = new mongoose.Schema({
	keyword: String
});


const Search = mongoose.model('Search',images);


module.exports = Search;