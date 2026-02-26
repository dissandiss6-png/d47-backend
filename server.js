require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.send("D47 License Server Running ✅");
});

// Verify License Endpoint
app.post("/verify", async (req, res) => {
  const { email, mtid, license_key } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND mtid=$2 AND license_key=$3",
      [email, mtid, license_key]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ status: "invalid" });
    }

    const user = result.rows[0];

    if (user.expired) {
      return res.status(403).json({ status: "expired" });
    }

    return res.json({ status: "active" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
