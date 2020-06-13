const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const users = require("./routes/users");
const login = require("./routes/login");
const brands = require("./routes/brands");
const categories = require("./routes/categories");
const products = require("./routes/products");
const comments = require("./routes/comments");
const admins = require("./routes/admins");
const adminLogin = require("./routes/adminLogin");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", users);
app.use("/api/login", login);
app.use("/api/brands", brands);
app.use("/api/categories", categories);
app.use("/api/products", products);
app.use("/api/comments", comments);
app.use("/api/admins", admins);
app.use("/api/adminLogin", adminLogin);
app.use("/uploads", express.static("uploads"));

mongoose
  .connect("mongodb://localhost/shopcart", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log("connected to mongodb....."))
  .catch((err) => console.error("could not connect to mongodb......"));

port = 3006;
app.listen(port, () => console.log(`server is running on port  ${port}`));
