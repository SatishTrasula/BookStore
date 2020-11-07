const express = require('express')
const router = express.Router()
const Book = require('../models/book')
router.get('/', async (req, res) => {
    //res.send("Hello world!!!")   //commented it's just initially 
    //once the pages are done we can call them as below to render data or info
	let books = []
	try {
		books = await Book.find().sort({ createdDt: 'dec' }).limit(10).exec()
	}
	catch {
		books = []
	}
    res.render('index', {books: books})
    
   //res.render('index')
})

// this will export for making use from else where in proj
module.exports = router	