const express = require("express");
const { Product, validate } = require("../models/product");
const { Category } = require("../models/category");
const Brand = require("../models/brand");
const mkdirp = require("mkdirp");
const datetime = require("node-datetime");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const date = Date.now();
    const dt = datetime.create(date);
    const formatted = dt.format("d_m_yy");
    var dir = `./uploads/products/${formatted}`;
    mkdirp(dir)
      .then(() => {
        cb(null, dir);
      })
      .catch((err) => console.log(err));
    //cb(null, './uploads/');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".")[1];
    cb(null, Date.now() + file.fieldname + "." + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});
//.array('proImage',5);

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    let products = new Product({ ...req.body });
    const result = validate(req.body);
    if (result.error)
      return res.status(400).send({ Error: result.error.details[0].message });

    const cat = await Category.findById(products.categoryId);
    if (!cat)
      return res.status(400).send({ Error: "Invalid category id given..." });

    const brand = await Brand.findById(products.brandId);
    if (!brand)
      return res.status(400).send({ Error: "Invalid Brand id given..." });

    let pro = await Product.findOne({ proName: req.body.proName });
    if (pro)
      return res.status(400).send({ Error: "duplicate product found in db" });

    products = await products.save();
    res.send(products);
  } catch (e) {
    res.status(402).send(e);
  }
});

router.post(
  "/proImages/:id",
  upload.array("proImages", 5),
  async (req, res) => {
    try {
      let pro = await Product.findById(req.params.id);
      console.log(pro);
      if (!pro) res.status(400).send({ Error: "invalid Product Id provided" });
      else {
        req.files.forEach((image) => {
          pro.proImages.push({ proImage: image.path });
        });
        pro = await pro.save();
        res.send(pro);
      }
    } catch (e) {
      res.status(400).send(e);
    }
  }
);

router.get("/:id", async (req, res) => {
  try {
    const pro = await Product.findByIdAndDelete(req.params.id);
    res.send(pro);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/", async (req, res) => {
  try {
    //const products = await Product.find().populate("categories");
    const products = await Product.find().populate({
      path: "categories",
      populate: {
        path: "brands",
      },
    });
    res.send(products);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    const pro = await Product.findByIdAndUpdate(req.params.id, {
      $set: req.body,
    });
    res.send(pro);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
