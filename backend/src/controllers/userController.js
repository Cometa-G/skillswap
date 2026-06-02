const User = require("../models/user");

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeRole(role) {
  return role === "student" || role === "tutor" ? role : null;
}

function serializeUser(user) {
  return {
    id: user._id || user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt
  };
}

exports.searchUsers = async (req, res) => {
  try {
    const query = String(req.query.query || req.query.q || "").trim();
    const role = normalizeRole(req.query.role);
    const limit = Math.min(Number.parseInt(req.query.limit || "20", 10) || 20, 50);
    const currentUserId = String(req.user?.id || "");

    if (req.app.locals.mongoConnected === false) {
      const searchDemoAccounts = req.app.locals.searchDemoAccounts;
      const accounts = typeof searchDemoAccounts === "function"
        ? searchDemoAccounts(query, role)
        : [];
      return res.json(accounts
        .filter((account) => String(account.id) !== currentUserId)
        .slice(0, limit));
    }

    const filter = {};
    if (role) filter.role = role;
    if (query) filter.username = { $regex: escapeRegex(query), $options: "i" };
    if (currentUserId) filter._id = { $ne: currentUserId };

    const users = await User.find(filter)
      .select("username role createdAt")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(users.map(serializeUser));
  } catch (err) {
    res.status(500).json({ message: err.message || "Could not search users" });
  }
};
