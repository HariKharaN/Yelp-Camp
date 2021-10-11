const mongoose = require('mongoose');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"Connection error:"));
db.once("open",() =>{
    console.log("Database connected");
});

// array[Math.floor(Math.random() * array.length)]
// for generating randome place for the place array

const sample = (array) =>array[Math.floor(Math.random() * array.length)];

const seedDB = async() =>{
    await Campground.deleteMany({});
    for(let i=0;i<300;i++)
    {
        const random1000 = Math.floor(Math.random() *1000);
        const price = Math.floor(Math.random()*20) + 10;
        const camp = new Campground({
            author:'61640f8aff1771973cb09fee',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nobis ea veniam cum necessitatibus itaque fuga aspernatur illo delectus, nostrum provident rem excepturi, eos, est nulla debitis pariatur! Cupiditate, repellat? Eos!',
            price,
            geometry:{
                type:"Point",
                coordinates:[cities[random1000].longitude,cities[random1000].latitude]
            },
            images:  [
                {
                  url: 'https://res.cloudinary.com/djcmedreb/image/upload/v1633954770/YelpCamp/er5ioaf9rnkwkttbh9ol.jpg',
                  filename: 'YelpCamp/er5ioaf9rnkwkttbh9ol',
                },
                {
                  url: 'https://res.cloudinary.com/djcmedreb/image/upload/v1633954771/YelpCamp/kd6m7mejftq1hiur7jqn.jpg',
                  filename: 'YelpCamp/kd6m7mejftq1hiur7jqn',
                }
              ]
        }) 
        await camp.save();
    }
    // const c = new Campground({
    //     title:'Purple Field'
    // })
    // await c.save();
}
seedDB()
.then(() =>{
    mongoose.connection.close();
})