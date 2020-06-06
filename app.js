const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const bodyParser = require("body-parser");
const Firestore = require("@google-cloud/firestore");
const PROJECTID = "winter-runway-279100";
const COLLECTION_NAME = "codesnippets";
const firestore = new Firestore({
  projectId: PROJECTID,
  timestampsInSnapshots: true,
});

const app = express();

app.use(cors());
app.use(bodyParser());

app.get("/code/:hash", async function (req, res) {
  let collectionReference = await firestore
    .collection(COLLECTION_NAME)
    .where("hash", "==", req.params.hash)
    .get();
  res.status(200).json(collectionReference.docs.map((doc) => doc.data()));
});

app.get("/code", async function (_, res) {
  let collectionReference = await firestore.collection(COLLECTION_NAME).get();
  res.status(200).json(collectionReference.docs.map((doc) => doc.data()));
});

app.post("/code", async function (req, res) {
  const { content, language, name } = req.body;
  const current_date = new Date().valueOf().toString();
  const random = Math.random().toString();
  const newHash = crypto
    .createHash("sha1")
    .update(current_date + random)
    .digest("hex");

  const payload = {
    content,
    language,
    name,
    hash: newHash,
  };

  try {
    const document = firestore.doc(`${COLLECTION_NAME}/${newHash}`);
    await document.set(payload);
    res.status(200).json({
      ...payload,
      message: "successful upload",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Application running on ${PORT}`));
