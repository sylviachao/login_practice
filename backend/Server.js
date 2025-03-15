import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from 'fs';
import validator from "validator";
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to validate email
const isValidEmail = (email) => {
  return validator.isEmail(email);  // Validator will return true if it's a valid email
};


// // 2025/3/14 : PostgreSQL settings, required further testing
// const { Pool } = pg;

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// app.use(cors());
// app.use(express.json());

// // User Registration
// app.post("/signup", async (req, res) => {
//   const { name, email, password, dob, gender, lifeStory, partnerPref } = req.body;

// // Check if the email and password are provided and not empty
// if (!email || !password) {
//   return res.status(400).json({ error: "Email and password are required" });
// }

// // Validate the email format
// if (!isValidEmail(email)) {
//   return res.status(400).json({ error: "Invalid email format" });
// }

//

//   try {
//     const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (result.rows.length != 0) {
//       return res.status(400).json({ error: "Email already registered. Please use other email." });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const result = await pool.query(
//       "INSERT INTO users (name, email, password, dob, gender, life_story, partner_pref) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, email",
//       [name, email, hashedPassword, dob, gender, lifeStory, partnerPref]
//     );
//     res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // User Login
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

// // Check if the email and password are provided and not empty
// if (!email || !password) {
//   return res.status(400).json({ error: "Email and password are required" });
// }

// // Validate the email format
// if (!isValidEmail(email)) {
//   return res.status(400).json({ error: "Invalid email format" });
// }
  
//   try {
//     const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
//     if (result.rows.length === 0) {
//       return res.status(400).json({ error: "User not found" });
//     }
    
//     const user = result.rows[0];
//     const validPassword = await bcrypt.compare(password, user.password);
//     if (!validPassword) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }
    
//     const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
//     res.json({ message: "Login successful", token });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });



// Read the mock database from a JSON file


const mockDbPath = path.join(process.env.TEST_PATH, 'mockdb.json');
const readDatabase = () => {
  const data = fs.readFileSync(mockDbPath, 'utf8');
  return JSON.parse(data);
};


// Get salt rounds from the .env file, or default to 10 if not provided
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10; 

app.post("/signup", async (req, res) => {
  const { name, email, password, dob, gender, lifeStory, partnerPref } = req.body;
  // Get mock data
  const db = readDatabase();

  // Hash the password before saving it
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);  // Salt rounds = 10


    // Check if the email and password are provided and not empty
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Validate the email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if existed
    const user = db.users.find(u => u.email === email);
    
    if (user) {
      return res.status(400).json({ error: "Email already registered. Please use other email." });
    }
    
    // Create new user (in-memory)
    const newUser = {
      id: db.users.length + 1,
      name,
      email,
      password: hashedPassword, // Store hashed password
      dob,
      gender,
      lifeStory,
      partnerPref,
    };

    // Add the new user to the mock database
    db.users.push(newUser);

    // Save back to the mock database file
    fs.writeFileSync(mockDbPath, JSON.stringify(db, null, 2));

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Login (mock)
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Check if the email and password are provided and not empty
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  // Validate the email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  
  
  const db = readDatabase();
  const user = db.users.find(u => u.email === email);
  
  if (!user) {
    return res.status(400).json({ error: "User not found" });
  }
  
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
