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
    cookie: { secure: false },
  }),
);

function requireLoggedIn(req, res) {
    if (!req.session.userId) {
        res.status(401).json({ error: "Not logged in" });
        return false;
    }
    return true;
}

function requireAdmin(req, res) {
    if (!req.session.userId) {
        res.status(401).json({ error: "Not logged in" });
        return false;
    }
    if (req.session.role !== "admin") {
        res.status(403).json({ error: "Admin access required" });
        return false;
    }
    return true;
}

function requireTrainer(req, res) {
    if (!req.session.userId) {
        res.status(401).json({ error: "Not logged in" });
        return false;
    }
    if (req.session.role !== "trainer") {
        res.status(403).json({ error: "Trainer access required" });
        return false;
    }
    return true;
}

function dbQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

async function getOrCreateContentItem(contentType, contentId) {
    if (contentType === "POST") {
        const posts = await dbQuery("SELECT id FROM posts WHERE id = ?", [contentId]);
        if (posts.length === 0) {
            const error = new Error("Post not found");
            error.status = 404;
            throw error;
        }

        await dbQuery(
            "INSERT INTO content_items (content_type, post_id, comment_id, profile_user_id) VALUES ('POST', ?, NULL, NULL) ON DUPLICATE KEY UPDATE content_type = VALUES(content_type)",
            [contentId]
        );

        const rows = await dbQuery("SELECT id FROM content_items WHERE post_id = ?", [contentId]);
        return rows[0].id;
    }

    if (contentType === "COMMENT") {
        const comments = await dbQuery("SELECT id FROM comments WHERE id = ?", [contentId]);
        if (comments.length === 0) {
            const error = new Error("Comment not found");
            error.status = 404;
            throw error;
        }

        await dbQuery(
            "INSERT INTO content_items (content_type, post_id, comment_id, profile_user_id) VALUES ('COMMENT', NULL, ?, NULL) ON DUPLICATE KEY UPDATE content_type = VALUES(content_type)",
            [contentId]
        );

        const rows = await dbQuery("SELECT id FROM content_items WHERE comment_id = ?", [contentId]);
        return rows[0].id;
    }

    if (contentType === "PROFILE") {
        const users = await dbQuery("SELECT id FROM users WHERE id = ?", [contentId]);
        if (users.length === 0) {
            const error = new Error("Profile not found");
            error.status = 404;
            throw error;
        }

        await dbQuery(
            "INSERT INTO content_items (content_type, post_id, comment_id, profile_user_id) VALUES ('PROFILE', NULL, NULL, ?) ON DUPLICATE KEY UPDATE content_type = VALUES(content_type)",
            [contentId]
        );

        const rows = await dbQuery("SELECT id FROM content_items WHERE profile_user_id = ?", [contentId]);
        return rows[0].id;
    }

    const error = new Error("Invalid content type");
    error.status = 400;
    throw error;
}

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

    let tableName = "users";
    let redirectPath = "dashboard.html";

    // Explicitly handle each role
    if (role === "admin") {
        tableName = "admins";
        redirectPath = "admindashboard.html";
    } else if (role === "trainer") {
        tableName = "trainers";
        redirectPath = "trainer-dashboard.html";
    } else {
        // This covers role === "user" or if role is missing
        tableName = "users";
        redirectPath = "dashboard.html";
    }

    const sql = `SELECT * FROM ${tableName} WHERE email = ?`;

    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) {
            // Provide a clearer error message for the specific role attempted
            return res.status(400).json({ message: `Invalid ${role || 'user'} login` });
        }

    // Check if the password matches
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

        // Save session data
        req.session.userId = results[0].id;
        req.session.role = role || "user"; // Default to "user" if role wasn't sent

        res.json({ message: "Login success", redirect: redirectPath });
    });
});

/* ================= TRAINER CONTENT DASHBOARD ================= */
app.get("/trainer/dashboard-data", async (req, res) => {
    if (!requireTrainer(req, res)) return;

    try {
        const trainers = await dbQuery("SELECT id FROM trainers WHERE user_id = ? LIMIT 1", [req.session.userId]);
        if (trainers.length === 0) {
            return res.status(403).json({ error: "Trainer profile not found" });
        }

        const trainerId = trainers[0].id;

        const [statsRows, draftRows, libraryRows] = await Promise.all([
            dbQuery(
                `
                SELECT
                    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft_count,
                    SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published_count
                FROM trainer_content_posts
                WHERE trainer_id = ?
                `,
                [trainerId]
            ),
            dbQuery(
                `
                SELECT id, title, status, updated_at
                FROM trainer_content_posts
                WHERE trainer_id = ? AND status = 'draft'
                ORDER BY updated_at DESC
                LIMIT 10
                `,
                [trainerId]
            ),
            dbQuery(
                `
                SELECT id, title, status, updated_at
                FROM trainer_content_posts
                WHERE trainer_id = ?
                ORDER BY updated_at DESC
                LIMIT 15
                `,
                [trainerId]
            )
        ]);

        const stats = statsRows[0] || {};

        res.json({
            stats: {
                drafts: Number(stats.draft_count || 0),
                pendingReviews: 0,
                published: Number(stats.published_count || 0)
            },
            drafts: draftRows,
            library: libraryRows
        });
    } catch (err) {
        console.error("Trainer dashboard load error:", err);
        res.status(500).json({ error: "Failed to load trainer dashboard" });
    }
});

app.post("/trainer/content/drafts", async (req, res) => {
    if (!requireTrainer(req, res)) return;

    try {
        const title = typeof req.body.title === "string" && req.body.title.trim()
            ? req.body.title.trim().slice(0, 150)
            : "Untitled Draft";

        const trainers = await dbQuery("SELECT id FROM trainers WHERE user_id = ? LIMIT 1", [req.session.userId]);
        if (trainers.length === 0) {
            return res.status(403).json({ error: "Trainer profile not found" });
        }

        const trainerId = trainers[0].id;
        const result = await dbQuery(
            "INSERT INTO trainer_content_posts (trainer_id, title, status) VALUES (?, ?, 'draft')",
            [trainerId, title]
        );

        res.status(201).json({
            id: result.insertId,
            title,
            status: "draft",
            message: "Draft created"
        });
    } catch (err) {
        console.error("Create trainer draft error:", err);
        res.status(500).json({ error: "Failed to create draft" });
    }
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
        WHERE (
            posts.user_id = ? 
            OR posts.user_id IN (
                SELECT CASE 
                    WHEN user_id_1 = ? THEN user_id_2 
                    ELSE user_id_1 
                END 
                FROM friends 
                WHERE user_id_1 = ? OR user_id_2 = ?
            )
        )
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

  db.query(
    "INSERT IGNORE INTO likes (user_id, post_id) VALUES (?, ?)",
    [user_id, post_id],
    (err) => {
      if (err) return res.status(500).send("Error");
      res.send("Liked");
    },
  );
});

app.post("/unlike", (req, res) => {
  const user_id = req.session.userId;
  const { post_id } = req.body;

  if (!user_id) return res.status(401).send("Not logged in");

  db.query(
    "DELETE FROM likes WHERE user_id = ? AND post_id = ?",
    [user_id, post_id],
    (err) => {
      if (err) return res.status(500).send("Error");
      res.send("Unliked");
    },
  );
});

app.post("/comment", (req, res) => {
  const user_id = req.session.userId;
  const { post_id, comment } = req.body;

  if (!user_id) return res.status(401).send("Not logged in");

  db.query(
    "INSERT INTO comments (user_id, post_id, comment) VALUES (?, ?, ?)",
    [user_id, post_id, comment],
    (err) => {
      if (err) return res.status(500).send("Error");
      res.send("Added");
    },
  );
});

/* ================= DELETE COMMENT ================= */
app.post("/delete-comment", (req, res) => {
  const user_id = req.session.userId;
  const { comment_id } = req.body;

  if (!user_id) return res.status(401).send("Not logged in");

  db.query(
    "DELETE FROM comments WHERE id = ? AND user_id = ?",
    [comment_id, user_id],
    (err, result) => {
      if (err) return res.status(500).send("Error");
      if (result.affectedRows === 0)
        return res.status(403).send("Unauthorized");
      res.send("Deleted");
    },
  );
});

/* ================= ADMIN USERS ================= */
app.get("/admin/users", (req, res) => {
  const sql =
    "SELECT id, name, email, role, status FROM users ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error loading users");
    }
    res.json(results);
  });
});

app.post("/admin/users/:id/ban", (req, res) => {
  const userId = req.params.id;
  const sql = "UPDATE users SET status = 'banned' WHERE id = ?";

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error banning user");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("User not found");
    }
    res.send("User banned");
  });
});

app.post("/admin/users/:id/unban", (req, res) => {
  const userId = req.params.id;
  const sql = "UPDATE users SET status = 'active' WHERE id = ?";

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error unbanning user");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("User not found");
    }
    res.send("User unbanned");
  });
});

/* ================= ADMIN CONTENT PRICING ================= */
app.get("/admin/content-pricing", (req, res) => {
  const sql =
    "SELECT id, title, description, pricing_type, price, trainer_id FROM content ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error loading content");
    }
    res.json(results || []);
  });
});

app.put("/admin/content-pricing/:id", (req, res) => {
  const contentId = req.params.id;
  const { pricing_type, price } = req.body;

  if (!pricing_type) {
    return res.status(400).send("Pricing type required");
  }

  const sql = "UPDATE content SET pricing_type = ?, price = ? WHERE id = ?";
  db.query(sql, [pricing_type, price || 0, contentId], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error updating pricing");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Content not found");
    }
    res.send("Pricing updated");
  });
});

app.delete("/admin/content/:id", (req, res) => {
  const contentId = req.params.id;

  db.query("DELETE FROM content WHERE id = ?", [contentId], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error deleting content");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Content not found");
    }
    res.send("Content deleted");
  });
});

/* ================= ADMIN BUNDLES ================= */
app.get("/admin/bundles", (req, res) => {
  const sql =
    "SELECT id, name, description, price, status FROM bundles ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error loading bundles");
    }
    res.json(results || []);
  });
});

app.post("/admin/bundles", (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !description || !price) {
    return res.status(400).send("All bundle fields required");
  }

  const sql =
    "INSERT INTO bundles (name, description, price, status) VALUES (?, ?, ?, 'active')";
  db.query(sql, [name, description, price], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error creating bundle");
    }
    res.json({ id: result.insertId });
  });
});

app.put("/admin/bundles/:id", (req, res) => {
  const bundleId = req.params.id;
  const { name, description, price, status } = req.body;

  const sql =
    "UPDATE bundles SET name = ?, description = ?, price = ?, status = ? WHERE id = ?";
  db.query(sql, [name, description, price, status, bundleId], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error updating bundle");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Bundle not found");
    }
    res.send("Bundle updated");
  });
});

app.delete("/admin/bundles/:id", (req, res) => {
  const bundleId = req.params.id;

  db.query("DELETE FROM bundles WHERE id = ?", [bundleId], (err, result) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error deleting bundle");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Bundle not found");
    }
    res.send("Bundle deleted");
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

/* ================= ADMIN CHALLENGES ================= */
app.get("/admin/challenges", (req, res) => {
  const sql = "SELECT * FROM challenges ORDER BY start_date DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB Error:", err);
      return res.status(500).send("Error loading admin challenges");
    }
    res.json(results);
  });
});

app.post("/admin/challenges", (req, res) => {
  const { title, description, difficulty, start_date, end_date } = req.body;

  if (!title || !description || !difficulty || !start_date || !end_date) {
    return res.status(400).send("All challenge fields are required");
  }

  const sql = `INSERT INTO challenges (title, description, difficulty, start_date, end_date) VALUES (?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [title, description, difficulty, start_date, end_date],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).send("Error creating challenge");
      }
      res.json({ id: result.insertId });
    },
  );
});

app.put("/admin/challenges/:id", (req, res) => {
  const challengeId = req.params.id;
  const { title, description, difficulty, start_date, end_date } = req.body;

  if (!title || !description || !difficulty || !start_date || !end_date) {
    return res.status(400).send("All challenge fields are required");
  }

  const sql = `UPDATE challenges SET title = ?, description = ?, difficulty = ?, start_date = ?, end_date = ? WHERE id = ?`;
  db.query(
    sql,
    [title, description, difficulty, start_date, end_date, challengeId],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).send("Error updating challenge");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("Challenge not found");
      }
      res.send("Challenge updated");
    },
  );
});

app.delete("/admin/challenges/:id", (req, res) => {
  const challengeId = req.params.id;

  db.query(
    "DELETE FROM challenges WHERE id = ?",
    [challengeId],
    (err, result) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).send("Error deleting challenge");
      }
      if (result.affectedRows === 0) {
        return res.status(404).send("Challenge not found");
      }
      res.send("Challenge deleted");
    },
  );
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
    if (err || results.length === 0)
      return res.status(404).send("Challenge not found");
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

  const sql =
    "DELETE FROM challenge_participants WHERE user_id = ? AND challenge_id = ?";

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

  db.query(
    "SELECT id, name, email, bio, profile_pic FROM users WHERE id = ?",
    [id],
    (err, results) => {
      if (err || results.length === 0) {
        return res.status(404).send("User not found");
      }

      res.json(results[0]);
    },
  );
});

/* ================= UPDATE PROFILE ================= */
app.put("/profile", (req, res) => {
  const id = req.session.userId;
  const { name, bio, profile_pic } = req.body;

  if (!id) return res.status(401).send("Not logged in");

  const sql =
    "UPDATE users SET name = ?, bio = ?, profile_pic = ? WHERE id = ?";

  db.query(sql, [name, bio, profile_pic, id], (err) => {
    if (err) return res.status(500).send("Error updating profile");
    res.send("Profile updated!");
  });
});

/* ================= PROFILE STATS ================= */
app.get("/profile-stats", (req, res) => {
  const userId = req.session.userId;

  if (!userId) return res.status(401).send("Not logged in");

  const workoutCountSql =
    "SELECT COUNT(*) AS totalWorkouts FROM workouts WHERE user_id = ?";
  const challengeCountSql =
    "SELECT COUNT(*) AS activeChallenges FROM challenge_participants WHERE user_id = ?";

  db.query(workoutCountSql, [userId], (err, workoutRes) => {
    if (err) return res.status(500).send("Error");

    db.query(challengeCountSql, [userId], (err, challengeRes) => {
      if (err) return res.status(500).send("Error");

      const total = workoutRes[0].totalWorkouts;
      const completionRate = total > 0 ? Math.min(100, total * 5) : 0;

      res.json({
        totalWorkouts: total,
        activeChallenges: challengeRes[0].activeChallenges,
        completionRate: completionRate,
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
app.get("/admin/activity", (req, res) => {
  db.query(
    "SELECT * FROM posts ORDER BY created_at DESC LIMIT 20",
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    },
  );
});

/* ================= SITE STATISTICS ================= */
app.get("/admin/stats", (req, res) => {
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
app.post("/admin/settings", (req, res) => {
  const { site_name } = req.body;

  db.query(
    "UPDATE settings SET value = ? WHERE name = 'site_name'",
    [site_name],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Settings updated");
    },
  );
});

/* ================= REFUNDS ================= */
app.get("/admin/refunds", (req, res) => {
  db.query(
    "SELECT * FROM purchases WHERE status = 'Requested'",
    (err, results) => {
      if (err) return res.status(500).send(err);
      res.json(results);
    },
  );
});

app.post("/admin/refunds/:id/approve", (req, res) => {
  db.query(
    "UPDATE purchases SET status = 'Refunded' WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.send("Refund issued");
    },
  );
});

app.post('/admin/refunds/:id/deny', (req, res) => {
    db.query(
        "UPDATE purchases SET status = 'Denied' WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send("Refund denied");
        }
    );
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
