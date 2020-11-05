const express = require('express')
const router = express.Router()
const Author = require('../models/author')
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
        //res.redirect(`authors/${newAuthor.id}`)    // yet to implement
        res.redirect(`authors`)
    }
    catch{
        res.render('authors/new',{
            author: author,
            errorMessage: 'Err author name not saved'
        })
    }
    // author.save((err,newAuthor) => {
    //     if(err){
    //         res.render('authors/new',{
    //             author: author,
    //             errorMessage: 'Err author name not saved'
    //         })
    //     }
    //     else{
    //         //res.redirect(`authors/${newAuthor.id}`)    // yet to implement
    //         res.redirect(`authors`)
    //     }
    // })
    //res.send(req.body.name)
})
// this will export for making use from else where in proj
module.exports = router 