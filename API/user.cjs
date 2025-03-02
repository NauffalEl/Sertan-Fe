const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sertan_db",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to MySQL database");
});

app.use(bodyParser.json());
app.use(cors()); // Use Cors middleware

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "Token not provided" });
  }

  jwt.verify(token, "your_secret_key", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.userId = decoded.userId;
    next();
  });
}
// Endpoint for user registration
app.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password || !email) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    // Check if username or email already exists
    db.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email], async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Registration failed" });
      }

      // If username or email already exists, send error response
      if (result.length > 0) {
        return res.status(409).json({ message: "Username or email already exists" });
      }

      // Hash the password
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error(hashErr);
          return res.status(500).json({ message: "Registration failed" });
        }

        // Store the user in the database with hashed password
        db.query("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [username, hashedPassword, email], (insertErr, insertResult) => {
          if (insertErr) {
            console.error(insertErr);
            return res.status(500).json({ message: "Registration failed" });
          }
          res.status(201).json({ message: "Registration successful" });
        });
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log("Received login request with identifier:", identifier);

    db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [identifier, identifier],
      async (err, result) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ message: "Login failed" });
        }

        if (result.length === 0) {
          return res.status(401).json({ message: "Invalid email or username" });
        }

        const user = result[0];
        console.log("User data from database:", user);

        bcrypt.compare(password, user.password, (compareErr, passwordMatch) => {
          if (compareErr) {
            console.error("Password comparison error:", compareErr);
            return res.status(500).json({ message: "Login failed" });
          }

          console.log("Password from request:", password);
          console.log("Password from database:", user.password);
          console.log("Password match result:", passwordMatch);

          if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password" });
          }

          console.log("User logged in:", user.username);
          res.status(200).json({ message: "Login successful" });
        });
      }
    );
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});




// User endpoints
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching users" });
    }
    res.json(result);
  });
});

// Profile endpoints
app.get("/profiles/:userId", verifyToken, (req, res) => {
  const userId = req.params.userId;
  db.query(
    "SELECT * FROM profiles WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching user profile" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "User profile not found" });
      }
      res.json(result[0]);
    }
  );
});

app.post("/profiles", verifyToken, (req, res) => {
  const { userId, fullName, email, phoneNumber, address } = req.body;
  db.query(
    "INSERT INTO profiles (user_id, full_name, email, phone_number, address) VALUES (?, ?, ?, ?, ?)",
    [userId, fullName, email, phoneNumber, address],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Error adding profile" });
      }
      res.status(201).json({ message: "Profile added successfully" });
    }
  );
});
// Chats endpoints
app.get("/chats", verifyToken, (req, res) => {
  const userId = req.userId;
  db.query("SELECT * FROM chats WHERE user_id = ?", [userId], (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.post("/chats", verifyToken, (req, res) => {
  const { userId, message } = req.body;
  db.query(
    "INSERT INTO chats (user_id, message) VALUES (?, ?)",
    [userId, message],
    (err, result) => {
      if (err) throw err;
      res.send("Message sent successfully");
    }
  );
});

// History endpoints
app.get("/history", verifyToken, (req, res) => {
  const userId = req.userId;
  db.query(
    "SELECT * FROM history WHERE user_id = ?",
    [userId],
    (err, result) => {
      if (err) throw err;
      res.json(result);
    }
  );
});

app.post("/history", verifyToken, (req, res) => {
  const { userId, title, content } = req.body;
  db.query(
    "INSERT INTO history (user_id, title, content) VALUES (?, ?, ?)",
    [userId, title, content],
    (err, result) => {
      if (err) throw err;
      res.send("History added successfully");
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
