//jshint esversion:6
import express from "express";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import { config } from "dotenv";
config();

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  newUser
    .save()
    .then(() => {
      res.render("secrets");
    })
    .catch(() => {
      res
        .status(400)
        .send("Oops! Something went wrong. Please try again later");
    });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username })
    .then((data) => {
      if (data) {
        if (data.password === password) {
          res.render("secrets");
        } else {
          res.status(401).send("You're not authorized to view the secrets");
        }
      } else {
        res.status(401).send("You're not authorized to view the secrets");
      }
    })
    .catch(() => {
      res
        .status(400)
        .send("Oops! Something went wrong. Please try again later");
    });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
