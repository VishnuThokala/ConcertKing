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

mongoose.connect('mongodb+srv://vishnuvardhan:vishnu@cluster0-mro7x.mongodb.net/test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true', 
{ useNewUrlParser: true , useUnifiedTopology: true ,useCreateIndex:true,}).then(() => { console.log("successful db connection") }).catch((err) => { console.log(err) });
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
//after clicking bookpasses from home page 
app.get('/booktickets/:id/',isLoggedIn,function(req,res){
    console.log("homepage"+req.params.id)
//     var c =new Concert(
        
// {
//     "cid": 5,
//     "band":"",
//     "about": " One direction is know at any pocket of the world and it is this time we got the oppurtunity to witness the live concert",
//     "date": "29-04-2020",
//     "cost": "2600",
//     "place": "Parade Grounds  ,secundrabad , Mumbai",
//     "image": "https://youngjournalistacademy.com/wp-content/uploads/2016/01/Screen-Shot-2013-12-08-at-12.31.13-AM.png ",
//     "passno":19,
//     "passesRemaining": 30,
//     "discount": "25%"
//   })
//         c.save(function(err,res){
//             if(err){
//                 console.log(err);
//             }
//             else{
//                 console.log(res+" \n"+"saved successfully ")
//             }
//         })
  Concert.find({cid:req.params.id},(err,concert)=>{
      
      if(err){
          console.log(err)
          res.render('home');
         }
      if (concert.length) {
          
               res.render('tiles',{concert:concert})
      } else {
          console.log(concert.length)
        console.log('concert didnot open')
        
        res.render('home')
    }
    
  });})
//after clicking book passes in tiles page
app.get('/get:cid',isLoggedIn, function(req,res){
    console.log("after clicking tiles bp ")
    console.log("req.params = "+req.params)
    console.log("req.params.cid = "+req.params.cid)

   Concert.findOneAndUpdate({cid:req.params.cid},{$inc :{'passesRemaining' : -1 , 'passno':1}}, {
        new: true
      },function(err,result){
          if(err){
              console.log(err);
              res.render('login')
          }
          
          else{
              console.log(result)
              User.findOneAndUpdate({username:req.user.username},{"$push" : {'passes':result}}, {
                new: true
              },function(err,resul){
                if(err){
                    console.log(err);
                    res.render('home')
                }
                else{
                    console.log(resul.passes)
                    console.log("my passes")
                    for(var i=0;i!=req.user.passes.length;i++){
                    Concert.findById(req.user.passes[i],function(err,cs){
                        if(err){
                            console.log(err)
                        }
                        console.log("pass "+i)
                        console.log(cs)
                        
                    })
                    console.log("last")

                    
                }  
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
