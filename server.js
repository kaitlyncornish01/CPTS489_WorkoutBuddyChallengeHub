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

        const match = await bcrypt.compare(password, results[0].password);
        if (!match) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Save session data
        req.session.userId = results[0].id;
        req.session.role = role || "user"; // Default to "user" if role wasn't sent

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
                WHERE NOT EXISTS (
                        SELECT 1
                        FROM user_hidden_content uhc
                        JOIN content_items ci ON ci.id = uhc.content_item_id
                        WHERE uhc.user_id = ?
                            AND uhc.unhidden_at IS NULL
                            AND ci.post_id = posts.id
                )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM user_hidden_content uhc
                        JOIN content_items ci ON ci.id = uhc.content_item_id
                        WHERE uhc.user_id = ?
                            AND uhc.unhidden_at IS NULL
                            AND ci.profile_user_id = posts.user_id
                )
        GROUP BY posts.id
        ORDER BY posts.created_at DESC
    `;

        db.query(postSql, [currentUserId, currentUserId, currentUserId], (err, posts) => {
        if (err) return res.status(500).send("Error");

                const commentSql = `
                        SELECT comments.*, users.name
                        FROM comments
                        JOIN users ON comments.user_id = users.id
                        WHERE NOT EXISTS (
                                SELECT 1
                                FROM user_hidden_content uhc
                                JOIN content_items ci ON ci.id = uhc.content_item_id
                                WHERE uhc.user_id = ?
                                    AND uhc.unhidden_at IS NULL
                                    AND ci.comment_id = comments.id
                        )
                            AND NOT EXISTS (
                                SELECT 1
                                FROM user_hidden_content uhc
                                JOIN content_items ci ON ci.id = uhc.content_item_id
                                WHERE uhc.user_id = ?
                                    AND uhc.unhidden_at IS NULL
                                    AND ci.profile_user_id = comments.user_id
                        )
                `;
                db.query(commentSql, [currentUserId, currentUserId], (err, comments) => {
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

/* ================= REPORTING ================= */
app.get("/report-reasons", async (req, res) => {
    if (!requireLoggedIn(req, res)) return;

    try {
        const reasons = await dbQuery(
            "SELECT id, reason_code, reason_label FROM report_reasons WHERE is_active = 1 ORDER BY reason_label ASC"
        );
        res.json(reasons);
    } catch (err) {
        console.error("Load report reasons error:", err);
        res.status(500).json({ error: "Failed to load report reasons" });
    }
});

app.post("/report-content", async (req, res) => {
    if (!requireLoggedIn(req, res)) return;

    try {
        const reporterUserId = req.session.userId;
        const { content_type, content_id, reason_ids, report_text } = req.body;
        const normalizedType = String(content_type || "").toUpperCase();
        const contentId = Number(content_id);
        const parsedReasonIds = Array.isArray(reason_ids)
            ? reason_ids.map(Number).filter(Number.isInteger)
            : [];
        const reportText = typeof report_text === "string" ? report_text.trim() : null;

        if (!["POST", "COMMENT", "PROFILE"].includes(normalizedType)) {
            return res.status(400).json({ error: "Invalid content_type" });
        }

        if (!Number.isInteger(contentId) || contentId <= 0) {
            return res.status(400).json({ error: "Invalid content_id" });
        }

        if (parsedReasonIds.length === 0) {
            return res.status(400).json({ error: "At least one report reason is required" });
        }

        if (reportText && reportText.length > 500) {
            return res.status(400).json({ error: "Report text cannot exceed 500 characters" });
        }

        const contentItemId = await getOrCreateContentItem(normalizedType, contentId);
        const reasonIdsJson = JSON.stringify(parsedReasonIds);

        await dbQuery("CALL sp_submit_content_report(?, ?, ?, ?)", [
            reporterUserId,
            contentItemId,
            reportText || null,
            reasonIdsJson
        ]);

        res.status(201).json({
            success: true,
            message: "Report submitted successfully"
        });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "You cannot report the same item twice." });
        }

        if (err.code === "ER_SIGNAL_EXCEPTION") {
            return res.status(400).json({ error: err.sqlMessage || "Invalid report submission" });
        }

        console.error("Submit report error:", err);
        res.status(500).json({ error: "Failed to submit report" });
    }
});

app.post("/unhide-content", async (req, res) => {
    if (!requireLoggedIn(req, res)) return;

    try {
        const { content_type, content_id } = req.body;
        const normalizedType = String(content_type || "").toUpperCase();
        const contentId = Number(content_id);

        if (!["POST", "COMMENT", "PROFILE"].includes(normalizedType)) {
            return res.status(400).json({ error: "Invalid content_type" });
        }

        if (!Number.isInteger(contentId) || contentId <= 0) {
            return res.status(400).json({ error: "Invalid content_id" });
        }

        const contentItemId = await getOrCreateContentItem(normalizedType, contentId);
        await dbQuery("CALL sp_unhide_content(?, ?, ?, 'USER')", [
            req.session.userId,
            contentItemId,
            req.session.userId
        ]);

        res.json({ success: true, message: "Content unhidden" });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        if (err.code === "ER_SIGNAL_EXCEPTION") {
            return res.status(400).json({ error: err.sqlMessage || "Unable to unhide content" });
        }

        console.error("Unhide content error:", err);
        res.status(500).json({ error: "Failed to unhide content" });
    }
});

/* ================= ADMIN REPORT MANAGEMENT ================= */
app.get("/reports", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
        const requestedStatus = String(req.query.status || "ACTIVE").toUpperCase();
        const allowedStatuses = ["ACTIVE", "IN_REVIEW", "RESOLVED", "REJECTED"];
        const statusFilter = allowedStatuses.includes(requestedStatus) ? requestedStatus : "ACTIVE";

        const reports = await dbQuery(
            `
            SELECT
                cr.id,
                cr.reporter_user_id,
                reporter.name AS reporter_name,
                cr.content_item_id,
                ci.content_type,
                ci.post_id,
                ci.comment_id,
                ci.profile_user_id,
                cr.status_code,
                cr.report_text,
                cr.admin_notes,
                cr.created_at,
                GROUP_CONCAT(rr.reason_label ORDER BY rr.reason_label SEPARATOR ', ') AS reasons
            FROM content_reports cr
            JOIN users reporter ON reporter.id = cr.reporter_user_id
            JOIN content_items ci ON ci.id = cr.content_item_id
            LEFT JOIN content_report_reason_selections crrs ON crrs.report_id = cr.id
            LEFT JOIN report_reasons rr ON rr.id = crrs.reason_id
            WHERE cr.status_code = ?
            GROUP BY
                cr.id,
                cr.reporter_user_id,
                reporter.name,
                cr.content_item_id,
                ci.content_type,
                ci.post_id,
                ci.comment_id,
                ci.profile_user_id,
                cr.status_code,
                cr.report_text,
                cr.admin_notes,
                cr.created_at
            ORDER BY cr.created_at DESC
            `,
            [statusFilter]
        );

        res.json(reports);
    } catch (err) {
        console.error("Load reports error:", err);
        res.status(500).json({ error: "Failed to load reports" });
    }
});

app.get("/admin/reports", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
        const requestedStatus = String(req.query.status || "ACTIVE").toUpperCase();
        const allowedStatuses = ["ACTIVE", "IN_REVIEW", "RESOLVED", "REJECTED"];
        const statusFilter = allowedStatuses.includes(requestedStatus) ? requestedStatus : "ACTIVE";

        const reports = await dbQuery(
            `
            SELECT
                cr.id,
                cr.reporter_user_id,
                reporter.name AS reporter_name,
                cr.content_item_id,
                ci.content_type,
                ci.post_id,
                ci.comment_id,
                ci.profile_user_id,
                cr.status_code,
                cr.report_text,
                cr.admin_notes,
                cr.created_at,
                GROUP_CONCAT(rr.reason_label ORDER BY rr.reason_label SEPARATOR ', ') AS reasons
            FROM content_reports cr
            JOIN users reporter ON reporter.id = cr.reporter_user_id
            JOIN content_items ci ON ci.id = cr.content_item_id
            LEFT JOIN content_report_reason_selections crrs ON crrs.report_id = cr.id
            LEFT JOIN report_reasons rr ON rr.id = crrs.reason_id
            WHERE cr.status_code = ?
            GROUP BY
                cr.id,
                cr.reporter_user_id,
                reporter.name,
                cr.content_item_id,
                ci.content_type,
                ci.post_id,
                ci.comment_id,
                ci.profile_user_id,
                cr.status_code,
                cr.report_text,
                cr.admin_notes,
                cr.created_at
            ORDER BY cr.created_at DESC
            `,
            [statusFilter]
        );

        res.json(reports);
    } catch (err) {
        console.error("Load admin reports error:", err);
        res.status(500).json({ error: "Failed to load reports" });
    }
});

app.post("/reports/:id/resolve", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
        const reportId = Number(req.params.id);
        const { admin_notes } = req.body;

        if (!Number.isInteger(reportId) || reportId <= 0) {
            return res.status(400).json({ error: "Invalid report ID" });
        }

        const rows = await dbQuery("SELECT status_code FROM content_reports WHERE id = ?", [reportId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Report not found" });
        }

        const oldStatus = rows[0].status_code;
        await dbQuery("UPDATE content_reports SET status_code = 'RESOLVED', admin_notes = ? WHERE id = ?", [
            admin_notes || null,
            reportId
        ]);
        await dbQuery(
            "INSERT INTO content_report_status_history (report_id, old_status_code, new_status_code, changed_by_user_id, change_note) VALUES (?, ?, 'RESOLVED', ?, ?)",
            [reportId, oldStatus, req.session.userId, admin_notes || null]
        );

        res.json({ success: true, message: "Report resolved" });
    } catch (err) {
        console.error("Resolve report error:", err);
        res.status(500).json({ error: "Failed to resolve report" });
    }
});

app.post("/reports/:id/dismiss", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
        const reportId = Number(req.params.id);
        const { admin_notes } = req.body;

        if (!Number.isInteger(reportId) || reportId <= 0) {
            return res.status(400).json({ error: "Invalid report ID" });
        }

        const rows = await dbQuery("SELECT status_code FROM content_reports WHERE id = ?", [reportId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: "Report not found" });
        }

        const oldStatus = rows[0].status_code;
        await dbQuery("UPDATE content_reports SET status_code = 'REJECTED', admin_notes = ? WHERE id = ?", [
            admin_notes || null,
            reportId
        ]);
        await dbQuery(
            "INSERT INTO content_report_status_history (report_id, old_status_code, new_status_code, changed_by_user_id, change_note) VALUES (?, ?, 'REJECTED', ?, ?)",
            [reportId, oldStatus, req.session.userId, admin_notes || null]
        );

        res.json({ success: true, message: "Report dismissed" });
    } catch (err) {
        console.error("Dismiss report error:", err);
        res.status(500).json({ error: "Failed to dismiss report" });
    }
});

app.post("/admin/unhide-content", async (req, res) => {
    if (!requireAdmin(req, res)) return;

    try {
        const { user_id, content_type, content_id } = req.body;
        const targetUserId = Number(user_id);
        const normalizedType = String(content_type || "").toUpperCase();
        const contentId = Number(content_id);

        if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
            return res.status(400).json({ error: "Invalid user_id" });
        }

        if (!["POST", "COMMENT", "PROFILE"].includes(normalizedType)) {
            return res.status(400).json({ error: "Invalid content_type" });
        }

        if (!Number.isInteger(contentId) || contentId <= 0) {
            return res.status(400).json({ error: "Invalid content_id" });
        }

        const contentItemId = await getOrCreateContentItem(normalizedType, contentId);
        await dbQuery("CALL sp_unhide_content(?, ?, ?, 'ADMIN')", [
            targetUserId,
            contentItemId,
            req.session.userId
        ]);

        res.json({ success: true, message: "Content unhidden for user" });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({ error: err.message });
        }

        if (err.code === "ER_SIGNAL_EXCEPTION") {
            return res.status(400).json({ error: err.sqlMessage || "Unable to unhide content" });
        }

        console.error("Admin unhide content error:", err);
        res.status(500).json({ error: "Failed to unhide content" });
    }
});

/* ================= PLATFORM ACTIVITY ================= */
app.get('/admin/activity', (req, res) => {
    // We use LEFT JOIN to ensure the post is always returned
    // and explicitly select the name as 'username'
    const sql = `
        SELECT 
            posts.id, 
            posts.content, 
            posts.created_at, 
            users.name AS username 
        FROM posts 
        LEFT JOIN users ON posts.user_id = users.id 
        ORDER BY posts.created_at DESC 
        LIMIT 50
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Activity Fetch Error:", err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
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

        /* ================= FRIENDS MANAGEMENT ================= */

        /* Get current user's friend list with details */
        app.get("/friends", (req, res) => {
            const userId = req.session.userId;
            if (!userId) return res.status(401).json({ error: "Not logged in" });

            const sql = `
                SELECT DISTINCT u.id, u.name, u.bio, u.profile_pic,
                CASE WHEN mu.id IS NULL THEN 0 ELSE 1 END AS is_muted
                FROM users u
                LEFT JOIN muted_users mu ON mu.user_id = ? AND mu.muted_user_id = u.id
                WHERE u.id IN (
                    SELECT CASE 
                        WHEN user_id_1 = ? THEN user_id_2
                        ELSE user_id_1
                    END
                    FROM friends
                    WHERE user_id_1 = ? OR user_id_2 = ?
                )
                ORDER BY u.name ASC
            `;
    
            db.query(sql, [userId, userId, userId, userId], (err, friends) => {
                if (err) {
                    console.error("DB Error:", err);
                    return res.status(500).json({ error: "Failed to load friends" });
                }
                res.json(friends);
            });
        });

        /* Get pending friend requests for current user */
        app.get("/friend-requests", (req, res) => {
            const userId = req.session.userId;
            if (!userId) return res.status(401).json({ error: "Not logged in" });

            const sql = `
                SELECT fr.id, fr.from_user_id, u.name, u.bio, u.profile_pic, fr.created_at
                FROM friend_requests fr
                JOIN users u ON fr.from_user_id = u.id
                WHERE fr.to_user_id = ? AND fr.status = 'pending' AND DATEDIFF(NOW(), fr.created_at) <= 100
                ORDER BY fr.created_at DESC
            `;
    
            db.query(sql, [userId], (err, requests) => {
                if (err) {
                    console.error("DB Error:", err);
                    return res.status(500).json({ error: "Failed to load requests" });
                }
                res.json(requests);
            });
        });

        /* Get outgoing friend requests sent by current user */
        app.get("/sent-friend-requests", (req, res) => {
            const userId = req.session.userId;
            if (!userId) return res.status(401).json({ error: "Not logged in" });

            const sql = `
                SELECT fr.id, fr.to_user_id, u.name, u.bio, u.profile_pic, fr.created_at
                FROM friend_requests fr
                JOIN users u ON fr.to_user_id = u.id
                WHERE fr.from_user_id = ? AND fr.status = 'pending'
                AND DATEDIFF(NOW(), fr.created_at) <= 100
                ORDER BY fr.created_at DESC
            `;
    
            db.query(sql, [userId], (err, requests) => {
                if (err) {
                    console.error("DB Error:", err);
                    return res.status(500).json({ error: "Failed to load sent requests" });
                }
                res.json(requests);
            });
        });

        /* Send a friend request with full validation */
        app.post("/send-friend-request", (req, res) => {
            const fromUserId = req.session.userId;
            const { to_user_id } = req.body;

            if (!fromUserId) return res.status(401).json({ error: "Not logged in" });
            if (!to_user_id || isNaN(to_user_id)) return res.status(400).json({ error: "Invalid user ID" });
            if (fromUserId === parseInt(to_user_id)) return res.status(400).json({ error: "Cannot add yourself" });

            /* Check if muted by target user */
            const mutedCheckSql = "SELECT id FROM muted_users WHERE user_id = ? AND muted_user_id = ?";
            db.query(mutedCheckSql, [to_user_id, fromUserId], (err, mutedResults) => {
                if (err) return res.status(500).json({ error: "Database error" });
                if (mutedResults.length > 0) {
                    return res.status(400).json({ error: "muted", message: "You cannot send a friend request to a user who has muted you." });
                }

                /* Check if already friends */
                const friendCheckSql = "SELECT id FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)";
                db.query(friendCheckSql, [fromUserId, to_user_id, to_user_id, fromUserId], (err, friendResults) => {
                    if (err) return res.status(500).json({ error: "Database error" });
                    if (friendResults.length > 0) {
                        return res.status(400).json({ error: "already_friends", message: "You are already friends with this user." });
                    }

                    /* Check friend list capacity */
                    const friendCountSql = "SELECT COUNT(*) AS friend_count FROM friends WHERE user_id_1 = ? OR user_id_2 = ?";
                    db.query(friendCountSql, [to_user_id, to_user_id], (err, countResults) => {
                        if (err) return res.status(500).json({ error: "Database error" });
                        if (countResults[0].friend_count >= 100) {
                            return res.status(400).json({ error: "friends_full", message: to_user_id + " has the maximum number of friends, they must remove some in order to receive a request." });
                        }

                        /* Check for previous denial */
                        const denialCheckSql = "SELECT id FROM friend_requests WHERE from_user_id = ? AND to_user_id = ? AND status = 'denied'";
                        db.query(denialCheckSql, [fromUserId, to_user_id], (err, denialResults) => {
                            if (err) return res.status(500).json({ error: "Database error" });
                            if (denialResults.length > 0) {
                                return res.status(400).json({ error: "previous_denial", message: "You cannot re-send a request that has been denied previously." });
                            }

                            /* Check if request already exists */
                            const existingCheckSql = "SELECT id FROM friend_requests WHERE from_user_id = ? AND to_user_id = ? AND status = 'pending'";
                            db.query(existingCheckSql, [fromUserId, to_user_id], (err, existingResults) => {
                                if (err) return res.status(500).json({ error: "Database error" });
                                if (existingResults.length > 0) {
                                    return res.status(400).json({ error: "pending_request", message: "A friend request already exists." });
                                }

                                /* Insert the friend request */
                                const insertSql = "INSERT INTO friend_requests (from_user_id, to_user_id, status) VALUES (?, ?, 'pending')";
                                db.query(insertSql, [fromUserId, to_user_id], (err, result) => {
                                    if (err) {
                                        console.error("DB Error:", err);
                                        return res.status(500).json({ error: "Failed to send request" });
                                    }
                                    res.json({ success: true, message: "Friend request sent!" });
                                });
                            });
                        });
                    });
                });
            });
        });

        /* Accept a friend request */
        app.post("/accept-friend-request/:requestId", (req, res) => {
            const userId = req.session.userId;
            const requestId = req.params.requestId;

            if (!userId) return res.status(401).json({ error: "Not logged in" });
            if (!requestId || isNaN(requestId)) return res.status(400).json({ error: "Invalid request ID" });

            /* Verify the request belongs to current user and is pending */
            const verifySql = "SELECT from_user_id, to_user_id FROM friend_requests WHERE id = ? AND to_user_id = ? AND status = 'pending'";
            db.query(verifySql, [requestId, userId], (err, results) => {
                if (err) return res.status(500).json({ error: "Database error" });
                if (results.length === 0) {
                    return res.status(404).json({ error: "Request not found or unauthorized" });
                }

                const fromUserId = results[0].from_user_id;
                const toUserId = results[0].to_user_id;

                /* Create friendship and delete request */
                const friendSql = "INSERT IGNORE INTO friends (user_id_1, user_id_2) VALUES (?, ?)";
                db.query(friendSql, [Math.min(fromUserId, toUserId), Math.max(fromUserId, toUserId)], (err) => {
                    if (err) {
                        console.error("DB Error:", err);
                        return res.status(500).json({ error: "Failed to accept request" });
                    }

                    /* Delete the request */
                    const deleteSql = "DELETE FROM friend_requests WHERE id = ?";
                    db.query(deleteSql, [requestId], (err) => {
                        if (err) return res.status(500).json({ error: "Failed to accept request" });
                        res.json({ success: true, message: "Friend request accepted!" });
                    });
                });
            });
        });

        /* Deny a friend request */
        app.post("/deny-friend-request/:requestId", (req, res) => {
            const userId = req.session.userId;
            const requestId = req.params.requestId;

            if (!userId) return res.status(401).json({ error: "Not logged in" });
            if (!requestId || isNaN(requestId)) return res.status(400).json({ error: "Invalid request ID" });

            /* Verify the request belongs to current user */
            const verifySql = "SELECT from_user_id FROM friend_requests WHERE id = ? AND to_user_id = ? AND status = 'pending'";
            db.query(verifySql, [requestId, userId], (err, results) => {
                if (err) return res.status(500).json({ error: "Database error" });
                if (results.length === 0) {
                    return res.status(404).json({ error: "Request not found or unauthorized" });
                }

                /* Update status to denied */
                const updateSql = "UPDATE friend_requests SET status = 'denied' WHERE id = ?";
                db.query(updateSql, [requestId], (err) => {
                    if (err) return res.status(500).json({ error: "Failed to deny request" });
                    res.json({ success: true, message: "Friend request denied." });
                });
            });
        });

        /* Cancel outgoing friend request */
        app.post("/cancel-friend-request/:requestId", (req, res) => {
            const userId = req.session.userId;
            const requestId = req.params.requestId;

            if (!userId) return res.status(401).json({ error: "Not logged in" });
            if (!requestId || isNaN(requestId)) return res.status(400).json({ error: "Invalid request ID" });

            /* Verify the request was sent by current user */
            const verifySql = "SELECT id FROM friend_requests WHERE id = ? AND from_user_id = ? AND status = 'pending'";
            db.query(verifySql, [requestId, userId], (err, results) => {
                if (err) return res.status(500).json({ error: "Database error" });
                if (results.length === 0) {
                    return res.status(404).json({ error: "Request not found or unauthorized" });
                }

                /* Delete the request */
                const deleteSql = "DELETE FROM friend_requests WHERE id = ?";
                db.query(deleteSql, [requestId], (err) => {
                    if (err) return res.status(500).json({ error: "Failed to cancel request" });
                    res.json({ success: true, message: "Friend request cancelled." });
                });
            });
        });

        /* Remove a friend */
        app.post("/remove-friend/:friendId", (req, res) => {
            const userId = req.session.userId;
            const friendId = req.params.friendId;

            if (!userId) return res.status(401).json({ error: "Not logged in" });
            if (!friendId || isNaN(friendId)) return res.status(400).json({ error: "Invalid friend ID" });

            /* Delete friendship in either direction */
            const deleteSql = "DELETE FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)";
            db.query(deleteSql, [userId, friendId, friendId, userId], (err, result) => {
                if (err) return res.status(500).json({ error: "Failed to remove friend" });
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "Friendship not found" });
                }
                res.json({ success: true, message: "Friend removed." });
            });
        });

        /* Get public user profile with friend status */
        app.get("/user/:userId", (req, res) => {
            const currentUserId = req.session.userId;
            const targetUserId = req.params.userId;

            if (!targetUserId || isNaN(targetUserId)) return res.status(400).json({ error: "Invalid user ID" });

            /* Get user profile */
            const userSql = "SELECT id, name, bio, profile_pic FROM users WHERE id = ?";
            db.query(userSql, [targetUserId], (err, results) => {
                if (err) return res.status(500).json({ error: "Database error" });
                if (results.length === 0) {
                    return res.status(404).json({ error: "User not found" });
                }

                const user = results[0];
                const response = { ...user };

                /* If logged in, add friend relationship status */
                if (currentUserId) {
                    const friendStatusSql = "SELECT id FROM friends WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)";
                    db.query(friendStatusSql, [currentUserId, targetUserId, targetUserId, currentUserId], (err, friendResults) => {
                        if (err) return res.status(500).json({ error: "Database error" });
                        response.is_friend = friendResults.length > 0;

                        const mutedByMeSql = "SELECT id FROM muted_users WHERE user_id = ? AND muted_user_id = ?";
                        db.query(mutedByMeSql, [currentUserId, targetUserId], (err, mutedResults) => {
                            if (err) return res.status(500).json({ error: "Database error" });
                            response.is_muted = mutedResults.length > 0;

                            const mutedByTargetSql = "SELECT id FROM muted_users WHERE user_id = ? AND muted_user_id = ?";
                            db.query(mutedByTargetSql, [targetUserId, currentUserId], (err, mutedByTargetResults) => {
                                if (err) return res.status(500).json({ error: "Database error" });
                                response.muted_by_target = mutedByTargetResults.length > 0;

                                const requestStatusSql = "SELECT id, from_user_id FROM friend_requests WHERE ((from_user_id = ? AND to_user_id = ?) OR (from_user_id = ? AND to_user_id = ?)) AND status = 'pending' AND DATEDIFF(NOW(), created_at) <= 100";
                                db.query(requestStatusSql, [currentUserId, targetUserId, targetUserId, currentUserId], (err, requestResults) => {
                                    if (err) return res.status(500).json({ error: "Database error" });
                        
                                    response.pending_request = requestResults.length > 0;
                                    if (requestResults.length > 0) {
                                        response.request_id = requestResults[0].id;
                                        response.request_from_me = requestResults[0].from_user_id === currentUserId;
                                    }

                                    res.json(response);
                                });
                            });
                        });
                    });
                } else {
                    response.is_friend = false;
                    response.pending_request = false;
                    response.is_muted = false;
                    response.muted_by_target = false;
                    res.json(response);
                }
            });
        });

        /* Mute a user */
        app.post("/mute-user/:userId", (req, res) => {
            const currentUserId = req.session.userId;
            const userToMute = req.params.userId;

            if (!currentUserId) return res.status(401).json({ error: "Not logged in" });
            if (!userToMute || isNaN(userToMute)) return res.status(400).json({ error: "Invalid user ID" });
            if (currentUserId === parseInt(userToMute)) return res.status(400).json({ error: "Cannot mute yourself" });

            const muteSql = "INSERT IGNORE INTO muted_users (user_id, muted_user_id) VALUES (?, ?)";
            db.query(muteSql, [currentUserId, userToMute], (err) => {
                if (err) return res.status(500).json({ error: "Failed to mute user" });
                res.json({ success: true, message: "User muted." });
            });
        });

        /* Unmute a user */
        app.post("/unmute-user/:userId", (req, res) => {
            const currentUserId = req.session.userId;
            const userToUnmute = req.params.userId;

            if (!currentUserId) return res.status(401).json({ error: "Not logged in" });
            if (!userToUnmute || isNaN(userToUnmute)) return res.status(400).json({ error: "Invalid user ID" });

            const unmuteSql = "DELETE FROM muted_users WHERE user_id = ? AND muted_user_id = ?";
            db.query(unmuteSql, [currentUserId, userToUnmute], (err, result) => {
                if (err) return res.status(500).json({ error: "Failed to unmute user" });
                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "Mute relationship not found" });
                }
                res.json({ success: true, message: "User unmuted." });
            });
        });

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
