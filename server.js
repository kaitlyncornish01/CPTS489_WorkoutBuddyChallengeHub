const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const db = require("./db");
const path = require("path");
const session = require("express-session");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "Workout Buddy Challenge Hub")));

app.use(
    session({
        secret: "supersecretkey",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

/* ================= AUTH ROUTES ================= */
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.query(sql, [name, email, hashedPassword], (err) => {
        if (err) return res.status(400).send("Email already exists");
        res.send("Registered!");
    });
});

app.post("/login", (req, res) => {
    const { email, password, role } = req.body;
    const formattedEmail = email.toLowerCase().trim();

    // Always look in the "users" table
    const sql = `SELECT * FROM users WHERE email = ?`;

    db.query(sql, [formattedEmail], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: "Invalid login" });
        }

        const user = results[0];

        // Check if the password matches
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Check if the user's role in the DB matches the login portal they used
        if (user.role !== role) {
            return res.status(403).json({ message: `This account is not authorized as a ${role}` });
        }

        // Set Session
        req.session.userId = user.id;
        req.session.role = user.role;

        // Determine redirect based on the role stored in DB
        let redirectPath = "dashboard.html";
        if (user.role === "admin") redirectPath = "admindashboard.html";
        if (user.role === "trainer") redirectPath = "trainer-dashboard.html";

        res.json({ message: "Login success", redirect: redirectPath });
    });
});

/* ================= POSTS & INTERACTIONS ================= */
app.get("/posts", (req, res) => {
    const currentUserId = req.session.userId;
    if (!currentUserId) return res.status(401).send("Not logged in");

    const postSql = `
        SELECT posts.*, users.name, 
        (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS like_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = posts.id AND user_id = ?) AS user_has_liked
        FROM posts 
        JOIN users ON posts.user_id = users.id
        GROUP BY posts.id
        ORDER BY posts.created_at DESC
    `;

    db.query(postSql, [currentUserId], (err, posts) => {
        if (err) return res.status(500).send("Error");

        const commentSql = `SELECT comments.*, users.name FROM comments JOIN users ON comments.user_id = users.id`;
        db.query(commentSql, (err, comments) => {
            const postsWithComments = posts.map(post => ({
                ...post,
                comments: comments.filter(c => c.post_id === post.id)
            }));
            res.json(postsWithComments);
        });
    });
});

app.post("/like", (req, res) => {
    const user_id = req.session.userId;
    const { post_id } = req.body;

    if (!user_id) return res.status(401).send("Not logged in");

    db.query("INSERT IGNORE INTO likes (user_id, post_id) VALUES (?, ?)", [user_id, post_id], (err) => {
        if (err) return res.status(500).send("Error");
        res.send("Liked");
    });
});

app.post("/unlike", (req, res) => {
    const user_id = req.session.userId;
    const { post_id } = req.body;

    if (!user_id) return res.status(401).send("Not logged in");

    db.query("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [user_id, post_id], (err) => {
        if (err) return res.status(500).send("Error");
        res.send("Unliked");
    });
});

app.post("/comment", (req, res) => {
    const user_id = req.session.userId;
    const { post_id, comment } = req.body;

    if (!user_id) return res.status(401).send("Not logged in");

    db.query("INSERT INTO comments (user_id, post_id, comment) VALUES (?, ?, ?)", [user_id, post_id, comment], (err) => {
        if (err) return res.status(500).send("Error");
        res.send("Added");
    });
});

/* ================= DELETE COMMENT ================= */
app.post("/delete-comment", (req, res) => {
    const user_id = req.session.userId;
    const { comment_id } = req.body;

    if (!user_id) return res.status(401).send("Not logged in");

    db.query("DELETE FROM comments WHERE id = ? AND user_id = ?", [comment_id, user_id], (err, result) => {
        if (err) return res.status(500).send("Error");
        if (result.affectedRows === 0) return res.status(403).send("Unauthorized");
        res.send("Deleted");
    });
});

/* ================= CHALLENGES ================= */
app.get("/challenges", (req, res) => {
    const sql = "SELECT * FROM challenges ORDER BY start_date DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.error("DB Error:", err);
            return res.status(500).send("Error loading challenges");
        }
        res.json(results);
    });
});

/* ================= ADD CHALLENGE BY ID ================= */
app.get("/challenge/:id", (req, res) => {
    const challengeId = req.params.id;
    const userId = req.session.userId;

    if (!userId) return res.status(401).send("Not logged in");

    const sql = `
        SELECT c.*, 
        (SELECT COUNT(*) FROM challenge_participants WHERE challenge_id = c.id AND user_id = ?) AS is_joined
        FROM challenges c WHERE c.id = ?
    `;

    db.query(sql, [userId, challengeId], (err, results) => {
        if (err || results.length === 0) return res.status(404).send("Challenge not found");
        res.json(results[0]);
    });
});

/* ================= Join Challenge ================= */
app.post("/join-challenge", (req, res) => {
    const user_id = req.session.userId;
    const { challenge_id } = req.body;

    if (!user_id) return res.status(401).send("Not logged in");

    const checkSql = `
        SELECT * FROM challenge_participants 
        WHERE user_id = ? AND challenge_id = ?
    `;

    db.query(checkSql, [user_id, challenge_id], (err, results) => {
        if (results.length > 0) {
            return res.status(400).send("Already joined");
        }

        const insertSql = `
            INSERT INTO challenge_participants (user_id, challenge_id)
            VALUES (?, ?)
        `;

        db.query(insertSql, [user_id, challenge_id], (err) => {
            if (err) return res.status(500).send("Error joining challenge");
            res.send("Joined!");
        });
    });
});

/* ================= UNJOIN CHALLENGE ================= */
app.post("/unjoin-challenge", (req, res) => {
    const user_id = req.session.userId;
    const { challenge_id } = req.body;

    if (!user_id) return res.status(401).send("Not logged in");

    const sql = "DELETE FROM challenge_participants WHERE user_id = ? AND challenge_id = ?";

    db.query(sql, [user_id, challenge_id], (err, result) => {
        if (err) return res.status(500).send("Error unjoining");
        res.send("Unjoined");
    });
});

/* ================= LOG WORKOUT ================= */
app.post("/log-workout", (req, res) => {
    const user_id = req.session.userId;
    const { type, duration, calories, date } = req.body;

    if (!user_id) return res.status(401).send("Not logged in");

    if (!type || !duration || !date) {
        return res.status(400).send("Missing required fields");
    }

    const sql = `
        INSERT INTO workouts (user_id, type, duration, calories, date)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [user_id, type, duration, calories, date], (err) => {
        if (err) return res.status(500).send("Error saving workout");

        const postSql = `
            INSERT INTO posts (user_id, content)
            VALUES (?, ?)
        `;

        const content = `Completed a ${duration} min ${type} workout 💪`;

        db.query(postSql, [user_id, content]);

        res.send("Workout logged!");
    });
});

/* ================= DASHBOARD: GET JOINED CHALLENGES ================= */
app.get("/user-challenges", (req, res) => {
    const userId = req.session.userId;

    if (!userId) return res.status(401).send("Not logged in");

    const sql = `
        SELECT challenges.* FROM challenges 
        JOIN challenge_participants ON challenges.id = challenge_participants.challenge_id 
        WHERE challenge_participants.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).send("Error loading user challenges");
        res.json(results);
    });
});

/* ================= GET PROFILE ================= */
app.get("/profile", (req, res) => {
    const id = req.session.userId;

    if (!id) return res.status(401).send("Not logged in");

    db.query("SELECT id, name, email, bio, profile_pic FROM users WHERE id = ?", [id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send("User not found");
        }

        res.json(results[0]);
    });
});

/* ================= UPDATE PROFILE ================= */
app.put("/profile", (req, res) => {
    const id = req.session.userId;
    const { name, bio, profile_pic } = req.body;

    if (!id) return res.status(401).send("Not logged in");

    const sql = "UPDATE users SET name = ?, bio = ?, profile_pic = ? WHERE id = ?";

    db.query(sql, [name, bio, profile_pic, id], (err) => {
        if (err) return res.status(500).send("Error updating profile");
        res.send("Profile updated!");
    });
});

/* ================= PROFILE STATS ================= */
app.get("/profile-stats", (req, res) => {
    const userId = req.session.userId;

    if (!userId) return res.status(401).send("Not logged in");

    const workoutCountSql = "SELECT COUNT(*) AS totalWorkouts FROM workouts WHERE user_id = ?";
    const challengeCountSql = "SELECT COUNT(*) AS activeChallenges FROM challenge_participants WHERE user_id = ?";
    
    db.query(workoutCountSql, [userId], (err, workoutRes) => {
        if (err) return res.status(500).send("Error");

        db.query(challengeCountSql, [userId], (err, challengeRes) => {
            if (err) return res.status(500).send("Error");

            const total = workoutRes[0].totalWorkouts;
            const completionRate = total > 0 ? Math.min(100, total * 5) : 0; 

            res.json({
                totalWorkouts: total,
                activeChallenges: challengeRes[0].activeChallenges,
                completionRate: completionRate
            });
        });
    });
});

/* ================= GET ALL REPORTS ================= */
app.get('/reports', (req, res) => {
    db.query("SELECT * FROM reports WHERE status = 'Pending'", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Resolve report
app.post('/reports/:id/resolve', (req, res) => {
    const reportId = req.params.id;

    db.query(
        "UPDATE reports SET status = 'Resolved' WHERE id = ?",
        [reportId],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send("Report resolved");
        }
    );
});

// Dismiss report
app.post('/reports/:id/dismiss', (req, res) => {
    const reportId = req.params.id;

    db.query(
        "UPDATE reports SET status = 'Dismissed' WHERE id = ?",
        [reportId],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send("Report dismissed");
        }
    );
});

/* ================= PLATFORM ACTIVITY ================= */
app.get('/admin/activity', (req, res) => {
    db.query(
        "SELECT * FROM posts ORDER BY created_at DESC LIMIT 20",
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        }
    );
});

/* ================= SITE STATISTICS ================= */
app.get('/admin/stats', (req, res) => {
    const stats = {};

    db.query("SELECT COUNT(*) AS users FROM users", (err, r1) => {
        stats.users = r1[0].users;

        db.query("SELECT COUNT(*) AS challenges FROM challenges", (err, r2) => {
            stats.challenges = r2[0].challenges;

            db.query("SELECT COUNT(*) AS workouts FROM workouts", (err, r3) => {
                stats.workouts = r3[0].workouts;

                res.json(stats);
            });
        });
    });
});

/* ================= SYSTEM SETTINGS ================= */
app.post('/admin/settings', (req, res) => {
    const { site_name } = req.body;

    db.query(
        "UPDATE settings SET value = ? WHERE name = 'site_name'",
        [site_name],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send("Settings updated");
        }
    );
});

/* ================= REFUNDS ================= */
app.get('/admin/refunds', (req, res) => {
    db.query("SELECT * FROM purchases WHERE status = 'Requested'", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post('/admin/refunds/:id/approve', (req, res) => {
    db.query(
        "UPDATE purchases SET status = 'Refunded' WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send("Refund issued");
        }
    );
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
