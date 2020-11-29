const aws = require("aws-sdk");
const multer = require("multer");
const express = require("express");
const app = express();
const morgan = require("morgan");
const multerS3 = require("multer-s3");

require("../secrets");

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCCESS_KEY,
  region: "us-east-2",
});

const config = new aws.Config({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCCESS_KEY,
  region: "us-east-2",
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "images-romina",
    acl: "public-read",
    metadata(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key(req, file, cb) {
      cb(null, Date.now().toString() + ".png");
    },
  }),
});

app.use(morgan("dev"));

app.post("/api/upload", upload.single("photo"), (req, res, next) => {
  try {
    const client = new aws.Rekognition(config);
    const params = {
      SourceImage: {
        S3Object: {
          Bucket: "images-romina",
          Name: req.file.key,
        },
      },
      TargetImage: {
        S3Object: {
          Bucket: "images-romina",
          Name: "public/img/romy2.jpeg",
        },
      },
      SimilarityThreshold: 0,
    };
    console.log(params);
    client.compareFaces(params, (err, data) => {
      if (err) {
        return res.json({ Similarity: 0 });
      }
      const face = data.FaceMatches[0];
      console.log(face);
      res.json(face);
    });
  } catch (err) {
    next(err);
  }
  // console.log("FILE", req.file);
});

app.listen(8080, () => {
  console.log("Listening on port 8080");
});
