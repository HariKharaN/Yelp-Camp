const User = require('../models/user');

module.exports.renderRegister = (req,res) =>{
    res.render('users/register')
}

module.exports.newRegister = async(req,res) =>{
    try{
        const {email,username,password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser, err =>{
            if(err) return next(err);
            else{
                req.flash('sucess','Welcome to YELP-Camp');
                res.redirect('/campgrounds')
            }
        })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/register')
    }
}

module.exports.renderLogin = (req,res) =>{
    res.render('users/login');
}

module.exports.newLogin = (req,res) =>{
    req.flash('success','Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res) =>{
    req.logout();
    req.flash('success','GoodBYE!!!')
    res.redirect('/')
}