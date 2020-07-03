const express = require("express");
const { Product, validate } = require("../models/product");
const adminAuth = require("../middleware/adminAuth");
const auth = require("../middleware/auth");
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

router.post("/", adminAuth, async (req, res) => {
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
  adminAuth,
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

// router.get("/:id", async (req, res) => {
//   try {
//     const pro = await Product.findByIdAndDelete(req.params.id);
//     res.send(pro);
//   } catch (e) {
//     res.status(400).send(e);
//   }
// });

router.get("/", adminAuth, async (req, res) => {
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

router.get("/user", auth, async (req, res) => {
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

router.get("/user/getAllProducts", async (req, res) => {
  //try {
  let filter = {
    price: {
      $lte: 9999999999,
      $gte: 0,
    },
  };

  if (!isNaN(req.query.max)) {
    filter.price["$lte"] = req.query.max;
  }
  if (req.query.categoryId) {
    filter.categoryId = req.query.categoryId;
  }
  if (!isNaN(req.query.min)) {
    filter.price["$gte"] = req.query.min;
  }

  console.log(req.query.min);
  console.log(filter);

  let pro = Product.find(filter);
  pro
    .populate("categories")
    // .select('_id name price')
    .exec()
    .then((products) => {
      const response = {
        count: products.length,
        products: products.map((product) => {
          return {
            _id: product._id,
            name: product.proName,
            price: product.price,
            category: product.categoryId,
            productImage: product.proImages,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((error) => {
      next(error);
    });
});

// router.get("/user/getAllProducts", async (req, res) => {
//   try {
//     let filter = {
//       price: {
//         $lte: 9999999999,
//         $gte: 0,
//       },
//     };

//     if (!isNaN(req.query.max)) {
//       filter.price["$lte"] = req.query.max;
//     }
//     if (req.query.categoryId) {
//       filter.categoryId = req.query.categoryId;
//     }
//     if (!isNaN(req.query.min)) {
//       filter.price["$gte"] = req.query.min;
//     }

//     console.log(req.query.min);
//     console.log(filter);

//     const products = [];
//     let response = Product.find(filter).populate("categories");

//     // response = {
//     //   count: products.length,
//     //   products: products.map({
//     //     _id: product._id,
//     //     name: product.proName,
//     //     price: product.price,
//     //     category: product.categoryId,
//     //     productImage: product.proImages,
//     //   }),
//     // };
//     res.send(response);
//   } catch (e) {
//     res.status(400).send(e);
//   }
// });

router.get("/user/:id", async (req, res) => {
  try {
    let pro = await Product.findById(req.params.id);
    console.log(pro);
    res.send(pro);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    let pro = await Product.findByIdAndUpdate({ _id: req.params.id }, req.body);
    pro = await Product.findOne({ _id: req.params.id });
    res.send(pro);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
