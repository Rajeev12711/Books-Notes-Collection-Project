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
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");


const parseBool = (val) => val === "1" || val === "true";


app.get("/", async (req, res) => {
  const sort = req.query.sort || "title";
  const sortMap = {
    title: "title ASC",
    read_at: "read_at DESC",
    rating: "rating DESC",
  };
  const orderBy = sortMap[sort] || sortMap.title;

  try {
    const result = await db.query(`SELECT * FROM books ORDER BY ${orderBy}`);
    const books = result.rows;

    res.render("index.ejs", { 
      listBooks: books,
      success: parseBool(req.query.success),
      error: parseBool(req.query.error), 
    });
  } catch (err) {
    console.log(err);
  }
});


app.get("/add", async (req, res)=>{
  res.render("add.ejs",{
    success: parseBool(req.query.success),
    error: parseBool(req.query.error),
});
});

app.post("/add", async (req, res) => {
  const { title, author, isbn, rating, summary, read_at} = req.body;
  if (!title || !author) return res.redirect("/add?error=1");

  try {
    await db.query(
      "INSERT INTO books (title, author, isbn, rating, summary, read_at) VALUES ($1, $2, $3, $4, $5, $6)",
      [title, author, isbn, rating, summary, read_at]
    );
    res.redirect("/?success=1"); 

  } catch (err) {
    console.error(err);
    res.redirect("/?error=1");

  }
});


app.get("/contact", (req, res) => {
  res.render("contact.ejs", {
    success: parseBool(req.query.success),
    error: parseBool(req.query.error),
});
});

app.post("/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    await db.query(
      "INSERT INTO contacts (name, email, phone, message) VALUES ($1, $2, $3, $4)",
      [name, email, phone, message]
    );

    res.redirect("/?success=1"); 
  } catch (err) {
    console.error(err);
    res.redirect("/?error=1");
  }
});



app.get("/books/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const bookResult = await db.query("SELECT * FROM books WHERE id = $1", [id]);
        const book = bookResult.rows[0];

        if (!book) return res.status(404).send("Book not found");

        const notesResult = await db.query(
            "SELECT * FROM book_notes WHERE book_id = $1 ORDER BY id ASC",
            [id]
        );
        const note = notesResult.rows;

        res.render("notesRead.ejs", { book, note });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


app.post("/books/:id/delete", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("BEGIN");

    
    await db.query("DELETE FROM book_notes WHERE book_id = $1", [id]);

    const result = await db.query(
      "DELETE FROM books WHERE id = $1 RETURNING *",
      [id]
    );

    if (!result.rows[0]) {
      await db.query("ROLLBACK");
      return res.status(404).send("Book not found");
    }

    await db.query("COMMIT");
    res.redirect("/");
  } catch (err) {
    await db.query("ROLLBACK");
    console.error(err);
  }
});



app.get("/books/:id/edit", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM books WHERE id=$1", [id]);
    const book = result.rows[0];
    if (!book) return res.status(404).send("Book not found");
    res.render("edit.ejs", { book });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


app.post("/books/:id/edit", async (req, res) => {
  const { id } = req.params;
  const { title, author, isbn, rating, summary, read_at } = req.body;
  try {
    await db.query(
      "UPDATE books SET title=$1, author=$2, isbn=$3, rating=$4, summary=$5, read_at=$6 WHERE id=$7",
      [title, author, isbn, rating, summary, read_at, id]
    );
    res.redirect("/");
  } catch (err) {
    console.error(err);
  }
});


app.post("/books/:book_id/notes/add", async (req, res) => {
  const { book_id } = req.params;
  const { note } = req.body;

  try {
    await db.query(
      "INSERT INTO book_notes (book_id, note) VALUES ($1, $2)",
      [book_id, note]
    );
    res.redirect(`/books/${book_id}`);
  } catch (err) {
    console.error(err);
  }
});


app.post("/books/:book_id/notes/edit/:id", async (req, res) => {
  const { book_id, id } = req.params;
  const { note } = req.body;

  try {
    await db.query(
      "UPDATE book_notes SET note=$1 WHERE id=$2 AND book_id=$3",
      [note, id, book_id]
    );
    res.redirect(`/books/${book_id}`);
  } catch (err) {
    console.error(err);
  }
});



app.post("/books/:book_id/notes/delete/:id", async (req, res) => {
  const { book_id, id } = req.params;

  try {
    await db.query(
      "DELETE FROM book_notes WHERE id=$1 AND book_id=$2",
      [id, book_id]
    );
    res.redirect(`/books/${book_id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting note");
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
