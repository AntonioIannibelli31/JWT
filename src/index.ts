import express from "express";
import "dotenv/config";
import {
  getAll,
  getOneById,
  create,
  updateById,
  deleteById,
  createImage,
} from "./controllers/server.js";
import { login, signup } from "./controllers/users.js";
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.get("/", getAll);
app.get("/:id", getOneById);
app.post("/", create);
app.put("/:id", updateById);
app.delete("/:id", deleteById);
app.post("/:id/image", upload.single("image"), createImage);
app.post("/users/login", login);
app.post("/users/signup", signup);

app.listen(port, () => {
  console.log(`Server partito correttamente, porta http://localhost:${port}`);
});
