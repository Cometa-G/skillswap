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

function publicBaseUrl(req) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const protocol = forwardedProto || req.protocol || "http";
  return `${protocol}://${req.get("host")}`;
}

function envUrl(name) {
  return String(process.env[name] || "").trim().replace(/\/+$/, "");
}

function isLocalRequest(req) {
  const host = String(req.get("host") || "").toLowerCase();
  return /^localhost(?::\d+)?$/.test(host) ||
    /^127\.0\.0\.1(?::\d+)?$/.test(host) ||
    /^\[::1\](?::\d+)?$/.test(host);
}

function frontendBaseUrl(req) {
  if (isLocalRequest(req)) return publicBaseUrl(req);
  return envUrl("FRONTEND_URL") || publicBaseUrl(req);
}

function googleRedirectUri(req) {
  if (isLocalRequest(req)) return `${publicBaseUrl(req)}/auth/google/callback`;
  return envUrl("GOOGLE_REDIRECT_URI") || `${frontendBaseUrl(req)}/auth/google/callback`;
}

function parseGoogleState(value) {
  try {
    const decoded = JSON.parse(Buffer.from(String(value || ""), "base64url").toString("utf8"));
    return {
      role: decoded.role === "tutor" ? "tutor" : "student"
    };
  } catch {
    return { role: "student" };
  }
}

function authSuccessHtml(req, payload) {
  const frontendUrl = frontendBaseUrl(req);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Signing in - SkillSwap</title>
</head>
<body>
  <p>Signing you in...</p>
  <script>
    const payload = ${JSON.stringify(payload)};
    sessionStorage.setItem("skillswapToken", payload.token);
    sessionStorage.setItem("skillswapUser", JSON.stringify(payload.user));
    sessionStorage.setItem("skillswapRole", payload.user.role);
    localStorage.removeItem("skillswapToken");
    localStorage.removeItem("skillswapUser");
    localStorage.removeItem("skillswapRole");
    window.location.replace(${JSON.stringify(`${frontendUrl}/dashboard.html`)});
  </script>
</body>
</html>`;
}

function demoGoogleUser(req, profile, role) {
  const store = req.app.locals.demoStore || { users: [] };
  const email = String(profile.email || "").trim().toLowerCase();
  const googleId = String(profile.id || email);
  let user = store.users.find((item) => item.googleId === googleId || item.username === email);

  if (!user) {
    user = {
      id: `demo-google-${googleId}`,
      username: email,
      googleId,
      password: "google-oauth",
      role
    };
    store.users.push(user);
  } else {
    user.googleId = user.googleId || googleId;
    user.role = role || user.role || "student";
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    },
    token: jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "skillswapsecret",
      { expiresIn: "7d" }
    )
  };
}

async function exchangeGoogleCode(req, code) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: googleRedirectUri(req),
      grant_type: "authorization_code"
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Google token exchange failed");
  }
  return data;
}

async function getGoogleProfile(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const profile = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(profile.error?.message || "Could not load Google profile");
  }
  return profile;
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

exports.googleStart = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ message: "GOOGLE_CLIENT_ID is not configured" });
  }

  const role = req.query.role === "tutor" ? "tutor" : "student";
  const state = Buffer.from(JSON.stringify({ role }), "utf8").toString("base64url");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(req),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account"
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

exports.googleCallback = async (req, res) => {
  try {
    if (req.query.error) {
      return res.redirect(`/login.html?error=${encodeURIComponent(req.query.error)}`);
    }

    const code = String(req.query.code || "");
    if (!code) {
      return res.status(400).send("Missing Google authorization code");
    }

    const { role } = parseGoogleState(req.query.state);
    const tokens = await exchangeGoogleCode(req, code);
    const profile = await getGoogleProfile(tokens.access_token);
    const email = String(profile.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).send("Google account did not provide an email address");
    }

    if (req.app.locals.mongoConnected === false) {
      return res.type("html").send(authSuccessHtml(req, demoGoogleUser(req, profile, role)));
    }

    let user = await User.findOne({
      $or: [
        { googleId: String(profile.id || "") },
        { username: email }
      ]
    });

    if (!user) {
      user = await User.create({
        username: email,
        googleId: String(profile.id || ""),
        password: await bcrypt.hash(`google:${profile.id}:${Date.now()}`, 10),
        role
      });
    } else {
      let changed = false;
      if (!user.googleId && profile.id) {
        user.googleId = String(profile.id);
        changed = true;
      }
      if (role && user.role !== role) {
        user.role = role;
        changed = true;
      }
      if (changed) await user.save();
    }

    const payload = {
      user: {
        id: String(user._id),
        username: user.username,
        role: user.role
      },
      token: createToken(user)
    };

    res.type("html").send(authSuccessHtml(req, payload));
  } catch (err) {
    console.error(err);
    res.redirect(`/login.html?error=${encodeURIComponent(err.message)}`);
  }
};
