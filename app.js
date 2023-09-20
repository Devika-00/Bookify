const express = require("express");
const expressLayout = require("express-ejs-layouts");
const morgan = require("morgan");
const dotenv = require("dotenv").config();
const connectDatabase = require("./config/db");
const session = require ("express-session");
const connectFlash = require("connect-flash");
const passport = require("passport");
const connectMongo = require("connect-mongo");
const { default: mongoose } = require("mongoose");
const { ensureAdmin } = require("./middlewares/authMiddleware");


const {ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");


const app = express();

const PORT = process.env.PORT || 5000;

connectDatabase();

app.use(express.static("public"));
app.use("/admin",express.static(__dirname+"public/admin"));
app.use("/shop",express.static(__dirname+"public/shop"));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

const MongoStore = connectMongo(session);

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
        },
        store: new MongoStore({ mongooseConnection: mongoose.connection }),
    })
);
app.use(passport.initialize());
app.use(passport.session());
require("./utils/passport.auth");

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use(connectFlash());
// app.use((req,res,next)=>{
//     res.locals.messages = req.flash()
//     next();
// })

app.use(expressLayout);
app.set("view engine","ejs");

//Admin route
const adminRoute = require("./routes/admin/adminRouter");
const productRoute = require("./routes/admin/productsRoute");
const categoryRoute = require("./routes/admin/categoryRoutes");
const bannerRoute = require("./routes/admin/bannerRoutes");
const customerRoute = require("./routes/admin/customerRoutes");
const couponRoute = require("./routes/admin/couponRoutes");
const adminAuthRoute = require("./routes/admin/authRoute");
const orderRoute = require("./routes/admin/ordersRoute");

app.use("/admin/products", ensureAdmin, productRoute);
app.use("/admin/category",ensureAdmin,categoryRoute);
app.use("/admin/banner",ensureAdmin,bannerRoute);
app.use("/admin/customer",ensureAdmin,customerRoute);
app.use("/admin/coupon",ensureAdmin,couponRoute);
app.use("/admin/auth",adminAuthRoute);
app.use("/admin/order",ensureAdmin,orderRoute);
app.use("/admin",ensureAdmin, adminRoute);

//user routes

const shopRoute = require("./routes/shop/shopRouter");
const authRoutes = require("./routes/shop/authRoutes");
const userRoutes = require("./routes/shop/userRoutes");
const orderRoutes = require("./routes/shop/orderRoutes");



app.use("/", shopRoute);
app.use("/auth", authRoutes);
app.use("/user",ensureLoggedIn({ redirectTo: "/auth/login" }),   userRoutes);
app.use("/order",ensureLoggedIn({ redirectTo: "/auth/login" }),  orderRoutes);

app.use((req,res)=>{
    res.render("404",{title:"404", page:"404"});
});

app.listen(PORT, () =>console.log(`Server running @ http://localhost:${PORT}`));

