const express = require("express");
const expressLayout = require("express-ejs-layouts");
const morgan = require("morgan");
const dotenv = require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.static("public"));
app.use("/admin",express.static(__dirname+"public/admin"));
app.use("/shop",express.static(__dirname+"public/shop"));
app.use(morgan("dev"));

app.use(expressLayout);
app.set("view engine","ejs");

const shopRoute = require("./routes/shop/shopRouter");
const adminRoute = require("./routes/admin/adminRouter");

app.use("/", shopRoute);
app.use("/admin", adminRoute);

app.get("*", (req,res)=>{
    res.render("404",{title:"404", page:"404"});
});

app.listen(PORT, () =>console.log(`Server running @ http://localhost:${PORT}`));