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
  region: "us-east-1",
});

const config = new aws.Config({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCCESS_KEY,
  region: "us-east-1",
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: "faceimages142452-dev",
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
          Bucket: "faceimages142452-dev",
          Name: req.file.key,
        },
      },
      TargetImage: {
        S3Object: {
          Bucket: "faceimages142452-dev",
          Name: "public/7A8C0D65-C8AF-49EA-B881-9515D0451227.jpg",
        },
      },
      SimilarityThreshold: 0,
    };

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
