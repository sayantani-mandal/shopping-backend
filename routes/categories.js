const express = require("express");
const { Category, validate } = require("../models/category");
const Brand = require("../models/brand");
const adminAuth = require("../middleware/adminAuth");
const Joi = require("@hapi/joi");
const mkdirp = require("mkdirp");
const datetime = require("node-datetime");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const date = Date.now();
    const dt = datetime.create(date);
    const formatted = dt.format("d_m_yy");
    var dir = `./uploads/categories/${formatted}`;
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

router.post("/", adminAuth, async (req, res) => {
  try {
    console.log(abcd);
    let cat = new Category({ ...req.body });

    const { error } = checkBrand(req.body.brandIds);
    if (error) return res.status(400).send({ Error: error.details[0].message });

    const result = validate(req.body);
    if (result.error)
      return res.status(400).send({ Error: result.error.details[0].message });

    let cname = await Category.findOne({
      catName: new RegExp(req.body.catName, "i"),
    });
    if (cname)
      return res
        .status(400)
        .send({ Error: "duplicate Category Name found in db" });

    const brands = cat.brandIds;
    for (let i = 0; i < brands.length; i++) {
      const brand = await Brand.findById(cat.brandIds[i].brandId);
      if (!brand) return res.status(400).send({ Error: "invalid brandId" });
      console.log(brand);
    }
    cat = await cat.save();
    res.send(cat);
  } catch (e) {
    res.status(402).send(e);
  }
});

router.post("/catImage", upload.single("catImage"), async (req, res) => {
  try {
    let cat = await Category.findById({ _id: req.body.catId });
    if (!cat)
      return res.status(400).send({ Error: "invalid category Id provided" });
    else {
      cat.catImage = req.file.path;
      cat = await cat.save();
      res.send({ Success: "Category Image is uploaded successfully" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/addBrand/:id", adminAuth, async (req, res) => {
  try {
    const { error } = checkBrand(req.body);
    if (error) return res.status(400).send({ Error: error.details[0].message });

    let brands = req.body;
    let cat = await Category.findById(req.params.id);
    if (!cat)
      return res.status(400).send({ Error: "Invalid Category Id provided" });
    for (let i = 0; i < brands.length; i++) {
      const brand = await Brand.findById(brands[i].brandId);
      if (!brand) return res.status(400).send({ Error: "invalid brandId" });

      var result = cat.brandIds.find(function (element) {
        return element.brandId == brands[i].brandId;
      });
      if (result) {
        return res
          .status(400)
          .send({ Error: "This brand is already is in category..." });
      }
    }
    cat.brandIds = cat.brandIds.concat(brands);
    cat = await cat.save();
    res.send(cat);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/", adminAuth, async (req, res) => {
  try {
    const categories = await Category.find().populate("brands");
    res.send(categories);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/:id", adminAuth, async (req, res) => {
  try {
    const cat = await Category.findByIdAndDelete(req.params.id);
    res.send(cat);
  } catch (e) {
    res.status(400).send(e);
  }
});

// router.post("/edits/:id", async (req, res) => {
//   try {
//     console.log(abcd);
//     console.log(req.params.id);
//     // let cat = req.body;
//     // console.log(req.params.id);
//     // let category = await Category.findById(req.params.id);
//     // if (!category) {
//     //   return res.status(400).send({ Error: "Invalid Category Id provided" });
//     // }
//     // category.update(cat);
//     // res.send(cat);
//   } catch (e) {
//     res.status(402).send(e);
//   }
// });
router.put("/edit/:id", async (req, res) => {
  try {
    let cat = await Category.findByIdAndUpdate(
      { _id: req.params.id },
      req.body
    );
    cat = await Category.findOne({ _id: req.params.id });
    res.send(cat);
  } catch (e) {
    res.status(400).send(e);
  }
});

function checkBrand(brands) {
  const schema = Joi.array()
    .items(
      Joi.object({
        brandId: Joi.string().pattern(new RegExp("^[0-9a-fA-f]{24}$")),
      })
    )
    .min(1)
    .required()
    .unique();
  return schema.validate(brands);
}
module.exports = router;
