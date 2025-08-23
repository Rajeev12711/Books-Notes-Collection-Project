import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();


const app = express();
const port = 3000;


const db = new pg.Client({
  user : process.env.USER,
  host: process.env.HOST,
  database: process.env.DATA,
  password: String(process.env.PASSWORD),
  port: Number(process.env.PORT)
});
db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", async (req, res) => {
  const sort = req.query.sort || "title"; 
  let orderBy = "title"; 

  if (sort === "title") orderBy = "title";
  else if (sort === "read_at") orderBy = "read_at DESC";
  else if (sort === "rating") orderBy = "rating DESC";

  try {
    const result = await db.query(`SELECT * FROM books ORDER BY ${orderBy}`);
    const books = result.rows;


    res.render("index.ejs", { listBooks: books });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
});



app.get("/add", async (req, res)=>{
  res.render("create.ejs");
});

app.post("/add", async (req, res) => {
  const { title, author, isbn, rating,  summary, read_at} = req.body;

  try {
    await db.query(
      "INSERT INTO books (title, author, isbn, rating, date, summary) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, isbn, rating, summary, read_at]
    );
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/contact", async (req, res) => {
  const { name, email, number, message } = req.body;

  try {
    await db.query(
      "INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4)",
      [name, email, number, message]
    );

    alert("Thanks for contacting me! I'll get back to you soon.");
    res.redirect("/")
  } catch (err) {
    console.log(err);
    res.status(500).send("Error saving contact form");
  }
});



app.get("/contact", (req, res) => {
  res.render("contact.ejs");
});

app.post("/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    await db.query(
      "INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4)",
      [name, email, phone, message]
    );

    alert("Thanks for contacting me! I'll get back to you soon.");
    res.redirect("/");
  } catch (err) {
    console.error(err);
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
