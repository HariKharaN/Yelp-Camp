const express = require("express");
const router  = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require("../models/campground");
const multer = require('multer');
const {storage} = require('../cloudinary/index');
const upload = multer({storage});
// controllers
const campgrounds = require('../controllers/campgrounds');
// Middelware
const { isLoggedIn , validateCampground , isAuthor} = require('../middleware');

// ROUTES
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post( isLoggedIn, upload.array('image') ,validateCampground,catchAsync(campgrounds.createCampground));

// another method to group the same routes

router.get('/new', isLoggedIn,campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn,isAuthor, upload.array('image') ,validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn,isAuthor,catchAsync(campgrounds.deleteCampground))
// show or viewing route

router.get("/:id/edit", isLoggedIn,isAuthor,catchAsync(campgrounds.renderEditForm));
// Update method route post
  
module.exports = router;
