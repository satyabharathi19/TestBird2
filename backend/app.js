const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();
app.use(express.static('public'));
app.use(express.json()); 
app.use(cors());
const mysql = require("mysql2");

const pool = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.stack);
    return;
  }
  console.log("Connected to Railway MySQL database!");
});
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    pool.query(`SELECT * FROM registration WHERE email = ?`, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: "Email already exists! Try a different email." });
        }

        pool.query(
            `INSERT INTO registration (username, email, password) VALUES (?, ?, ?)`,
            [username, email, password],
            (error, results) => {
                if (error) {
                    return res.status(500).json({ message: "Error inserting data", error });
                }
                res.status(200).json({ message: "User registered successfully!", userid: results.insertId });
            }
        );
    });
});

app.post("/signIn", (req, res) => {
    const { email, password } = req.body;

    pool.query(`SELECT * FROM registration WHERE email = ?`, [email], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        if (result.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }


        // Extract stored password and compare
        const user = result[0];
        
        if (user.password === password) {
            return res.status(200).json({ message: "Successfully logged in",userid:user.userid});
        } else {
            return res.status(401).json({ message: "Invalid email or password" });
        }
    });
});

app.post("/collection", (req, res) => {
    const { collectionName,userid } = req.body;

    pool.query(`SELECT * FROM collection WHERE collectionName = ?`, [collectionName], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

       
        pool.query(
            `INSERT INTO collection (collectionName,userid) VALUES ( ?, ?)`,
            [collectionName,userid],
            (error, results) => {
                if (error) {
                    return res.status(500).json({ message: "Error inserting data", error });
                }
                res.status(200).json({ message: "collection successfully created !", collectionid: results.insertId });
            }
        );
    });
});

app.get("/collection", (req, res) => {
    const { userid } = req.query; // Use query parameters for GET requests

    if (!userid) {
        return res.status(400).json({ message: "User ID is required" });
    }

    pool.query(`SELECT * FROM collection WHERE userid = ?`, [userid], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }

        // If no collections are found, return an appropriate message
        if (result.length === 0) {
            return res.status(404).json({ message: "No collections found for this user" });
        }

        res.status(200).json({ collections: result });
    });
});


// Create a new request
app.post("/requests", (req, res) => {
    const { userId, requestName, method, url, body, collectionName } = req.body;
    
    // Validate required fields
    if (!userId || !requestName || !method || !url || !collectionName) {
        return res.status(400).json({ 
            message: "Missing required fields: userId, requestName, method, url, and collectionName are required" 
        });
    }

    // First, find the collection ID based on collectionName and userId
    pool.query(
        `SELECT collectionid FROM collection WHERE collectionName = ? AND userid = ?`,
        [collectionName, userId], 
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: "Collection not found for this user!" });
            }

            const collectionId = result[0].collectionid;

            // Convert body object to JSON string if it exists
            const bodyJson = body ? JSON.stringify(body) : null;

            // Insert the request into the requests table
            pool.query(
                `INSERT INTO requests (userId, collectionId, requestName, method, url, body) VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, collectionId, requestName, method, url, bodyJson],
                (error, results) => {
                    if (error) {
                        console.error("Error inserting request:", error);
                        return res.status(500).json({ message: "Error inserting request", error: error.message });
                    }
                    
                    res.status(201).json({ 
                        message: "Request successfully created!", 
                        requestId: results.insertId,
                        data: {
                            userId,
                            collectionId,
                            requestName,
                            method,
                            url,
                            body: bodyJson
                        }
                    });
                }
            );
        }
    );
});

// Get requests by collection
app.get("/requests", (req, res) => {
    const { userId, collectionName } = req.query;
    
    if (!userId || !collectionName) {
        return res.status(400).json({ 
            message: "Missing required query parameters: userId and collectionName are required" 
        });
    }

    // Get requests for a specific collection
    pool.query(
        `SELECT r.*, c.collectionName 
         FROM requests r 
         JOIN collection c ON r.collectionId = c.collectionid 
         WHERE r.userId = ? AND c.collectionName = ?
         ORDER BY r.requestName`,
        [userId, collectionName],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            // Parse body JSON back to object for each request
            const requests = results.map(request => ({
                ...request,
                body: request.body ? JSON.parse(request.body) : null
            }));

            res.status(200).json({ 
                message: "Requests retrieved successfully", 
                requests: requests 
            });
        }
    );
});

// Get a specific request by ID
app.get("/requests/:requestId", (req, res) => {
    const { requestId } = req.params;
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "Missing required query parameter: userId" });
    }

    pool.query(
        `SELECT r.*, c.collectionName 
         FROM requests r 
         JOIN collection c ON r.collectionId = c.collectionid 
         WHERE r.id = ? AND r.userId = ?`,
        [requestId, userId],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Request not found" });
            }

            const request = results[0];
            // Parse body JSON back to object
            request.body = request.body ? JSON.parse(request.body) : null;

            res.status(200).json({ 
                message: "Request retrieved successfully", 
                request: request 
            });
        }
    );
});

// Update a request
app.put("/requests/:requestId", (req, res) => {
    const { requestId } = req.params;
    const { userId, requestName, method, url, body } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "Missing required field: userId" });
    }

    // Convert body object to JSON string if it exists
    const bodyJson = body ? JSON.stringify(body) : null;

    pool.query(
        `UPDATE requests 
         SET requestName = ?, method = ?, url = ?, body = ? 
         WHERE id = ? AND userId = ?`,
        [requestName, method, url, bodyJson, requestId, userId],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Request not found or unauthorized" });
            }

            res.status(200).json({ 
                message: "Request updated successfully",
                requestId: requestId
            });
        }
    );
});

// Delete collection
app.delete("/collections/:collectionId", (req, res) => {
    const { collectionId } = req.params;
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "Missing required query parameter: userId" });
    }

    pool.query(
        `DELETE FROM collection WHERE collectionid = ? AND userid = ?`,
        [collectionId, userId],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Collection not found or unauthorized" });
            }

            res.status(200).json({ 
                message: "Collection deleted successfully",
                collectionId: collectionId
            });
        }
    );
});

// Delete a request
app.delete("/requests/:requestId", (req, res) => {
    const { requestId } = req.params;
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "Missing required query parameter: userId" });
    }

    pool.query(
        `DELETE FROM requests WHERE id = ? AND userId = ?`,
        [requestId, userId],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ message: "Database error", error: err.message });
            }

            if (results.affectedRows === 0) {
                return res.status(404).json({ message: "Request not found or unauthorized" });
            }

            res.status(200).json({ 
                message: "Request deleted successfully",
                requestId: requestId
            });
        }
    );
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});