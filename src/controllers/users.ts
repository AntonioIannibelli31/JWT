import { Request, Response } from "express";
import "dotenv/config";
import jwt from "jsonwebtoken";
import pgPromise from "pg-promise";

const db = pgPromise()("postgres://postgres:postgres@localhost:5432/esercizi");

const setupDb = async () => {
  await db.none(`
  DROP TABLE IF EXISTS users;

  CREATE TABLE users (
    id SERIAL NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    token TEXT
  )
  `);
  await db.none(
    `INSERT INTO users (username,password) VALUES ('User', 'Password')`
  );
};
setupDb();
console.log(db);

const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user: any = await db.one(
    `SELECT * FROM users WHERE username=$1`,
    username
  );
  if (user && user.password === password) {
    const { SECRET = "" } = process.env;
    const payload = {
      id: user.id,
      username,
    };
    const token = jwt.sign(payload, SECRET);
    await db.none(`UPDATE users SET token=$2 WHERE id=$1`, [user.id, token]);
    res.status(200).json({ id: user.id, username, token });
  } else {
    res.status(400).json({ msg: "Username or password not correct!" });
  }
};

const signup = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = await db.oneOrNone(
    `SELECT * FROM users WHERE username=$1`,
    username
  );
  if (user) {
    res.status(409).json({ msg: "Username already exists" });
  } else {
    const { id } = await db.one(
      `INSERT INTO users (username,password) VALUES ($1, $2) RETURNING id`,
      [username, password]
    );
    res.status(201).json({ id, msg: "User created!" });
  }
};

export { login, signup };
