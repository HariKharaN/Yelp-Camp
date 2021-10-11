const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')

const imageSchema = new Schema({
    url:String,
    filename: String
})

imageSchema.virtual('thumbnail').get( function() {
    return this.url.replace('/upload','/upload/w_180');
})

const opts = { toJSON: { virtuals: true } };

const CampgroundsSchema = new Schema({
    title: String,
    images:[imageSchema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates: {
            type:[Number],
            required:true
        }
    },
    price: Number,
    description: String,
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[
        {
            type: Schema.Types.ObjectId, 
            ref:'Review'
        }
    ]
}, opts);


CampgroundsSchema.virtual('properties.popUpMarkup').get( function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0,20)}...</p>`
})

// DELETEING REVIEWS WHILE THE CAMPGROUND ITSELF GET DELETED
CampgroundsSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Review.remove({
            _id:{
                $in:doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground',CampgroundsSchema);


// 