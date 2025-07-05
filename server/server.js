import express from "express";
import { auth } from "express-openid-connect";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connect from "./db/connect.js";
import asyncHandler from "express-async-handler";
import fs from "fs";
import User from "./models/UserModel.js";

dotenv.config();

const app = express();

// 🔍 Helpful log for debugging
console.log("BASE_URL:", process.env.BASE_URL);
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

// Validate BASE_URL format
const baseURL = process.env.BASE_URL || "https://job-findrr.onrender.com";
try {
  new URL(baseURL);
  console.log(" BASE_URL is valid:", baseURL);
} catch (error) {
  console.error(" Invalid BASE_URL:", baseURL, error.message);
}

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: baseURL, // Use validated baseURL
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  routes: {
    postLogoutRedirect: process.env.CLIENT_URL,
    callback: "/callback",
    logout: "/logout",
    login: "/login",
  },
  session: {
    absoluteDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
    cookie: {
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    },
  },
};

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      "http://localhost:3000",
      "https://job-finder-deployed.vercel.app"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Auth0 Middleware
app.use(auth(config));

// ⬇️ Ensure user is in DB
const enusureUserInDB = asyncHandler(async (user) => {
  const existingUser = await User.findOne({ auth0Id: user.sub });

  if (!existingUser) {
    const newUser = new User({
      auth0Id: user.sub,
      email: user.email,
      name: user.name,
      role: "jobseeker",
      profilePicture: user.picture,
    });

    await newUser.save();
    console.log("User added to DB", user);
  } else {
    console.log("User already exists in DB", existingUser.email);
  }
});

app.get("/", async (req, res) => {
  if (req.oidc?.isAuthenticated()) {
    await enusureUserInDB(req.oidc.user);
    return res.redirect(process.env.CLIENT_URL);
  } else {
    return res.send("Logged out");
  }
});

// ⬇️ Dynamic route loading
const routeFiles = fs.readdirSync("./routes");
routeFiles.forEach((file) => {
  import(`./routes/${file}`)
    .then((route) => app.use("/api/v1/", route.default))
    .catch((err) => console.log("Route load error:", err));
});

// ✅ Start Server
const server = async () => {
  try {
    await connect();
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.log("Server startup error:", err.message);
    process.exit(1);
  }
};

server();
