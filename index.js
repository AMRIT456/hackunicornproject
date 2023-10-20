import 'dotenv/config'
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose, { plugin } from "mongoose";
import session from "express-session";
// import flash from "connect-flash";
import flash from "express-flash";
import passport from "passport";
import passportlocalmongoose from "passport-local-mongoose";
const app=express();
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
// app.configure(function() {
//   app.use(express.cookieParser('keyboard cat'));
//   app.use(express.session({ cookie: { maxAge: 60000 }}));
//   app.use(flash());
// });
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
mongoose.connect("mongodb+srv://amritchattopadhyay456:QfTdra7Fq8efN8Kh@cluster1.vdavmwa.mongodb.net/contactdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const contactschema=new mongoose.Schema({
    name:String,
    email:String,
    subject:String,
    message:String
})
const startupuserschema=new mongoose.Schema({
  name:String,
  email:String,
  password:String,
})
//contactschema.plugin(passportlocalmongoose);
startupuserschema.plugin(passportlocalmongoose);
const Contact=new mongoose.model("Contact",contactschema);
const User= new mongoose.model("User",startupuserschema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
    res.render("home.ejs");
})

app.post("/submit",(req,res)=>{
  const newname=req.body.username;
  const newemail=req.body.email;
  const newsubject=req.body.subject;
  const newmessage=req.body.message;
  const contact=new Contact({
    name:newname,
    email:newemail,
    subject:newsubject,
    message:newmessage
  })
  contact.save();
  req.flash('info', 'Your message has been send successfully!')
  res.redirect("/#contact");
})
app.get("/signup",(req,res)=>{
  res.render("registration.ejs");
})
app.get("/login",(req,res)=>{
  res.render("login.ejs");
})
app.get("/profile",(req,res)=>{
 
  if(req.isAuthenticated()){
     console.log(req);
     console.log(req.user.email);
      res.render("profile.ejs",{nameuser:req.user.username});
  }else{
      res.redirect("/login")
  }
})

app.get("/logout", (req, res) => {
  if (req.isAuthenticated()) {
      req.logout(function(err) {
          if (err) {
              console.error(err);
          }
          res.redirect("/");
      });
  } else {
      // Handle the case where the user is not authenticated
      res.redirect("/");
  }
});
app.post("/submitregistration", (req, res) => {
  // console.log(req);
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword;

  if (password === confirmpassword) {
    User.register({ username: req.body.username }, password, function (err, user) {
      if (err) {
        console.error(err); // Log the error for debugging
        res.redirect("/signup");
      } else {
        passport.authenticate("local")(req, res, function () {
          // console.log(req);
          res.redirect("/profile");
        });
      }
    });
  } else {
    console.error("Password and confirm password do not match."); // Log the error for debugging
    res.render("registration.ejs");
  }
});



app.post("/login",(req,res)=>{
  // console.log(req);
  const user=new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user,function(err){
    if(err){
        console.log(err);
    }else{
        passport.authenticate("local")(req,res,function(){
           
            res.redirect("/profile");
        });
    }
  }) ;
})
app.listen(3000,function(){
    console.log("Server started on port 3000.");
});