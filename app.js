const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore=require('connect-mongo')
const isAuthenticated = require('./middleware/auth'); 
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const authRoutes = require('./routes/authRoutes'); 
const dotenv = require("dotenv");
dotenv.config();
const path = require("path");
const app = express();
const bcrypt = require('bcrypt');
const cartRoutes = require('./routes/cartRoutes'); // Cart routes
const checkoutRouter = require('./routes/checkoutRoutes');




const password = 'admin123';
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});

// Middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
        mongoUrl: 'mongodb://localhost:27017/yourDB', 
        
    }),
    cookie: { maxAge: 180 * 60 * 1000 } // 3 hours
}))

app.use((req,res,next)=>{
    if (req.session.user) {
        req.user=req.session.user;
    }
    next();
})
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('views', 'views')
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.urlencoded({ extended: true }));
// Session configuration


// Database connection
mongoose.connect('mongodb://localhost:27017/yourDB', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.use("/",clientRoutes);
app.use('/auth', authRoutes);
app.get("/products",clientRoutes);
app.use('/admin', adminRoutes);
app.use("/admin/overview", adminRoutes);
app.get("/add-product", adminRoutes);
app.get("/admin/add-product", adminRoutes);
app.get("/product-list",adminRoutes);
app.get("/edit-product",adminRoutes);
app.get("/stock",adminRoutes);
app.get("/logout",adminRoutes);
app.use("/cart",cartRoutes);
app.use('/razorpay', checkoutRouter);
app.get('/home',clientRoutes);
app.get('/aboutUs',clientRoutes);
app.get('/blog',clientRoutes);
app.get('/contactUs',clientRoutes);
app.get('/servives',clientRoutes);
app.use('/', checkoutRouter);
app.use('/profile', clientRoutes);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});