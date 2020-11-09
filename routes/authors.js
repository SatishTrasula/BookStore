const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')
//Search all Authors
router.get('/', async (req, res) => {
    let searchOptions = {}
    if ( req.query.name != null && req.query.name != ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {
            authors: authors, 
            searchOptions: req.query
        })
    }
    catch{
        res.redirect('/')
    }
   
})

//New Authors
router.get('/new', async (req,res) => {
    res.render('authors/new', {author: new Author()})
})

//Create New Author
router.post('/', async(req,res) => {
    //res.send('Create')
    const author = new Author({
        name: req.body.name
    })
    try{
        const newAuthor = await author.save()  // when using async also use await for async call to be completed 
        res.redirect(`authors/${newAuthor.id}`)    // yet to implement
        //res.redirect(`authors`)
    }
    catch{
        res.render('authors/new',{
            author: author,
            errorMessage: 'Err author name not saved'
        })
    }
    //res.send(req.body.name)
})

router.get('/:id', async (req,res) => {
    //res.send("Show Author "+ req.params.id)
    try{
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: author.id}).limit(6).exec()
        //console.log(books)
        res.render('authors/show',{
            author: author,
            booksByAuthor: books
        })
    }
    catch{
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req,res) => {
    //res.send("Edit Author "+ req.params.id)
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit',{author: author})
    }
    catch{
        res.redirect('authors')
    }
})

router.put('/:id',  async (req,res) => {
    //res.send("Update Author "+ req.params.id) 
    let author
    try{
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()  // when using async also use await for async call to be completed 
        res.redirect(`/authors/${author.id}`) 
        //res.redirect(`authors`)
    }
    catch{
        if(author == null){
            res.redirect('/')
        }
        res.render('authors/edit',{
            author: author,
            errorMessage: 'Err in author update name'
        })
    }
})

router.delete('/:id', async (req,res) => {
    //res.send("Delete Author "+ req.params.id)
    let author
    try{
        author = await Author.findById(req.params.id)
        await author.remove()  // when using async also use await for async call to be completed 
        res.redirect('/authors') 
        //res.redirect(`authors`)
    }
    catch{
        if(author == null){
            res.redirect('/')
        }
        else{
            res.redirect(`/authors/${author.id}`)
        }
    }
})

// this will export for making use from else where in proj
module.exports = router 