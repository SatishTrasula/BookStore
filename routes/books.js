const express = require('express')
const router = express.Router()
//const multer = require('multer')
//const path = require('path')
//const fs = require('fs') // to unlink i.e., delete file from uploads

const Book = require('../models/book')
const Author = require('../models/author')
//const { error } = require('console')

//const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png','image/gif']
/*
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

const upload = multer({
    storage: storage
})

*/

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
router.post('/',  async (req,res) => {
    //res.send('Create Book')   upload.single('cover1'),
    //let fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        //coverImageName: fileName,
        description: req.body.description
    })
    saveCover(book,req.body.cover1)

    //once multer is implemented with upload and capturing filename now save to db
    try{ 
        const newBook = await book.save()
        //res.redirect(`/books/${newbook.id}`)
        res.redirect(`books`)
    }
    catch(err){
        console.error(err)
        /*
        if( book.coverImageName != null){
            removeBookCover(book.coverImageName)
        }
        */
        renderNewPage(res, book, true)
    }

})

function saveCover(book,coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    //console.log("Cover Type: ",cover.type)
    //console.log("Type Condition Check: ", imageMimeTypes.includes(cover.type))
    if(cover != null && imageMimeTypes.includes(cover.type)){
       // console.log("inside if block")
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
    //console.log("Image Buffer: ", book.coverImage)
    //console.log("Type:", book.coverImageType)
}

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

/*
function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath,fileName), err => {
		if (err) console.error(err)
	})
}
*/
// this will export for making use from else where in proj
module.exports = router 