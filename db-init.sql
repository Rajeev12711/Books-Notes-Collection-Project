BEGIN;

CREATE TABLE IF NOT EXISTS public.contacts
(
    id serial NOT NULL,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    email character varying(150) COLLATE pg_catalog."default" NOT NULL,
    phone character varying(20) COLLATE pg_catalog."default",
    message text COLLATE pg_catalog."default" NOT NULL,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contacts_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.books
(
    id serial NOT NULL,
    title text COLLATE pg_catalog."default" NOT NULL,
    author text COLLATE pg_catalog."default",
    isbn text COLLATE pg_catalog."default",
    rating integer,
    summary text COLLATE pg_catalog."default",
    read_at date,
    CONSTRAINT books_pkey PRIMARY KEY (id),
    CONSTRAINT books_isbn_key UNIQUE (isbn)
);

CREATE TABLE IF NOT EXISTS public.book_notes
(
    id serial NOT NULL,
    book_id integer NOT NULL,
    note text COLLATE pg_catalog."default" NOT NULL,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT book_notes_pkey PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.book_notes
    ADD CONSTRAINT book_notes_book_id_fkey FOREIGN KEY (book_id)
    REFERENCES public.books (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

COMMIT;
