const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const Book = require('../models/book')
const Author = require('../models/author')
//const { error } = require('console')

const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['images/jpeg', 'images/png','images/gif']
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath)
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    },
    fileFilter: (req, file, callback) => {
        callback(null,imageMimeTypes.includes(file.mimetype))
    }
})

//var upload = multer({ storage: storage }).single('myImage');

const upload = multer({
    storage: storage
})

//Search all Books
router.get('/', async (req, res) => {
    //res.send('All Books')
    let query = Book.find()
    if( req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if( req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if( req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try{
        const books = await query.exec()
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
    }
    catch{
        res.redirect('/')
    }

})

//New Book
router.get('/new', async (req,res) => {
    // try{ 
	// 	const authors = await Author.find({})
	// 	const book = new Book()
	// 	res.render('books/new', {
	// 		authors: authors,
	// 		book: book
	// 	})
	// }
	// catch {
	// 	res.redirect('/books')
    // }
    //the above code is all implemented using a function that is called as follows
    renderNewPage(res, new Book())
})

//Create Book
router.post('/', upload.single('cover1'), async (req,res) => {
    //res.send('Create Book')
    let fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })
    //once multer is implemented with upload and capturing filename now save to db
    try{ 
        const newBook = await book.save()
        //res.redirect(`/books/${newbook.id}`)
        res.redirect(`books`)
    }
    catch(err){
        console.error(err)
        if( book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        renderNewPage(res, book, true)
    }

})

//under route New Book get the logic can be encapsulated into a generic function 
async function renderNewPage(res, book, hasError = false)
{
    try{
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = "Error Creating Book"
        res.render('books/new', params)
    }
    catch{
        res.redirect('/books')
    } 
}


function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath,fileName), err => {
		if (err) console.error(err)
	})
}

// this will export for making use from else where in proj
module.exports = router 