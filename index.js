var express = require('express')
var bodyParser = require('body-parser')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
// var ejs = require('ejs');
var User = require('./models/user');
var Concert = require('./models/concert')
const port = process.env.PORT||3000;
var app = express()
app.use(express.static("public/images"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public/images"));
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/noted', { useNewUrlParser: true }).then(() => { console.log("successful db connection") }).catch((err) => { console.log(err) });
const dbo = mongoose.Connection;
mongoose.set('useFindAndModify', false);
app.set("view engine", 'ejs');
app.use(require('express-session')({
    secret: "salt",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//default
app.get("/", function (req, res) {
    res.render('login', { data: { view: false } });
});


//signup
app.get("/signup?", function (req, res) {
    res.render("signup", { data: { view: false } });
});

app.post("/signup", function (req, res) {
    Users = new User({ email: req.body.email, username: req.body.username });

    User.register(Users, req.body.cpassword, function (err, user) {
        if (err) {
            res.render('signup', { data: { view: true, msg1: err } })
        } else {
            res.render('home');
        }
    });


});


app.get('/home', isLoggedIn, function (req, res) {
    
                 res.render('home')
       
   })

   app.get('/profile', isLoggedIn, function (req, res) {
      res.render('profile',{data :req.user});
  })



app.post("/login", function (req, res) {
    if (!req.body.username) {
        res.render('login', { data: { view: true, msg1: "Username was not given" } })
    } else {
        if (!req.body.password) {
            res.render('login', { data: { view: true, msg: "Password was not given" } })
        } else {
            passport.authenticate('local', function (err, user, info) {
                if (err) {
                    console.log(err)

                    res.render('login', { data: { view: true, msg: err } })
                } else {
                    if (!user) {
                        res.render('login', { data: { view: true, msg: "Username or password incorrect " } })
                    } else {
                        req.login(user, function (err) {
                            if (err) {
                                console.log(err)
                                res.render('login', { data: { view: true, msg: err } })
                            } else {
                                res.render('home');
                            }
                        })
                    }
                }
            })(req, res);
        }
    }
}
)

// is loggedin middlewear
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/');
    }

}

app.get('/bookedpasses/',isLoggedIn,function(req,res){
    console.log(req.user.username)
    User.find({user:req.user.username},(err,data)=>{
        if(err){
            console.log(err)
            res.render('home');
           }
        if(data.length) {
            console.log(data)
             res.json(data)
        } else {
          console.log('didnot book passes')
          console.log(data)
          res.render('home')
      }
     });})

app.get('/booktickets/:id/',isLoggedIn,function(req,res){
    console.log(req.user.cid)
  Concert.find({cid:req.params.id},(err,concert)=>{
      if(err){
          console.log(err)
          res.render('home');
         }
      if (concert.length) {
          
               res.render('tiles',{concert:concert})
      } else {
        console.log('didnot open')
        
        res.render('home')
    }
    
  });})

app.get('/:cid',isLoggedIn,function(req,res){
    
    console.log(req.params.cid)
     Concert.findOneAndUpdate({cid:req.params.cid},{$inc :{'passesRemaining' : -1 , 'passno':1}}, {
        new: true
      },function(err,result){
          if(err){
              console.log(err);
              res.render('login')
          }
          
          else{
              console.log(result)
              User.findOneAndUpdate({username:req.user.username},{ 'passes':result}, {
                new: true
              },function(err,resul){
                if(err){
                    console.log(err);
                    res.render('home')
                }
                else{
                    console.log(resul)
                }
            });
           res.render('profile',{data :req.user});
            }
      });
     
});
      
 

// signout 
app.get("/logout", function (req, res) {
    req.logout();
    res.render('login', { data: { view: false } });
});

const listen = app.listen(port, function (req, res) {
    console.log('server started' + listen.address().port);
})
