import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
  user : "postgres",
  host: "localhost",
  database: process.env.DATA,
  password: String(process.env.PASSWORD),
  port: Number(process.env.PORT)
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    res.render("index.ejs");
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
