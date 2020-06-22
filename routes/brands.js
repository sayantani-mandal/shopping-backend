const express = require("express");
const Brand = require("../models/brand");
const adminAuth = require("../middleware/adminAuth");
const mkdirp = require("mkdirp");
const datetime = require("node-datetime");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const date = Date.now();
    const dt = datetime.create(date);
    const formatted = dt.format("d_m_yy");
    var dir = `./uploads/brands/${formatted}`;
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

const router = express.Router();

router.post("/", upload.single("brandImage"), adminAuth, async (req, res) => {
  try {
    // let brand = new Brand ({ ...req.body});
    let brand = new Brand({
      brandName: req.body.brandName,
      brandImage: req.file.path,
    });

    if (!brand.brandName)
      return res.status(400).send({ Error: "Brand name is required" });

    let bname = await Brand.findOne({
      brandName: new RegExp(req.body.brandName, "i"),
    });
    if (bname)
      return res
        .status(400)
        .send({ Error: "duplicate Brand Name found in db" });

    brand = await brand.save();
    res.send(brand);
  } catch (e) {
    res.status(402).send(e);
  }
});

router.get("/", adminAuth, async (req, res) => {
  try {
    const brands = await Brand.find();
    res.send(brands);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/:id", adminAuth, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    res.send(brand);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    let brand = await Brand.findByIdAndUpdate({ _id: req.params.id }, req.body);
    brand = await Brand.findOne({ _id: req.params.id });
    res.send(brand);
  } catch (e) {
    res.status(400).send(e);
  }
});

// router.post("/searchBrand", async (req, res) => {
//   try {
//     const search = new RegExp(req.query.search);
//     console.log(search);
//     const result = await Brand.find({ brandName: search });
//     console.log(result);

//     if (result.length == 0) {
//       res.status(400).send({ Error: "No data found..." });
//     } else {
//       res.send(result);
//     }
//   } catch (e) {
//     res.status(400).send(e);
//   }
// });

module.exports = router;
