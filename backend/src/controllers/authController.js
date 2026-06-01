const User = require("../models/user");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const demoAccountRoles = {
  "cometagino@g.cjc.edu.ph": "student",
  "cometagino04@gmail.com": "tutor"
};

function escapeRegex(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeSearchRole(role) {
  return role === "student" || role === "tutor" ? role : null;
}

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const accountName = (username || email || "").trim().toLowerCase();

    if (!accountName || !password) {
      return res.status(400).json({
        message: "Username/email and password are required",
      });
    }

    const existingUser = await User.findOne({ username: accountName });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      username: accountName,
      password: hashedPassword,
      role: role === "tutor" ? "tutor" : "student",
    });

    const token = createToken(user);

    res.status(201).json({
  user: {
    id: user._id,
    username: user.username,
    role: user.role,
  },
  token,
});

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const accountName = (username || email || "").trim().toLowerCase();
    const demoRole = demoAccountRoles[accountName];

    let user =
      await User.findOne({ username: accountName });

    if (!user) {
      if (!demoRole) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      user = await User.create({
        username: accountName,
        password: await bcrypt.hash(password, 10),
        role: demoRole,
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      if (!demoRole) {
        return res.status(400).json({
          message: "Invalid credentials",
        });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    const expectedRole = demoRole || (role === "tutor" ? "tutor" : null);
    if (expectedRole && user.role !== expectedRole) {
      user.role = expectedRole;
    }

    if (user.isModified("password") || user.isModified("role")) {
      await user.save();
    }

    const token = createToken(user);

    res.status(200).json({
  user: {
    id: user._id,
    username: user.username,
    role: user.role,
  },
  token,
});

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const query = String(req.query.query || req.query.q || "").trim();
    const role = normalizeSearchRole(req.query.role);
    const limit = Math.min(Number.parseInt(req.query.limit || "20", 10) || 20, 50);
    const filter = {};

    if (role) filter.role = role;
    if (query) {
      filter.username = { $regex: escapeRegex(query), $options: "i" };
    }

    const users = await User.find(filter)
      .select("username role createdAt")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(users.map((user) => ({
      id: user._id,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
