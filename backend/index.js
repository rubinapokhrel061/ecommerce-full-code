import cors from "cors";
import cron from "node-cron";
import express from "express";
import passport from "passport";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import "dotenv/config";
import "./config/google-strategy.js";
import "./config/passport-jwt-strategy.js";

import router from "./routes/index.js";
import connectToDatabase from "./config/connectdb.js";
import setTokensCookies from "./utils/setTokensCookies.js";
import orderController from "./controllers/orderController.js";

const app = express();
const PORT = process.env.PORT || 3000;

cron.schedule(" */15 * * * *", () => {
  console.log("running");
});

// Database Connection
connectToDatabase();

// morgan
app.use(morgan("dev"));

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_HOST || "http://localhost:3000",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.post(
  "/api/v0/webhook",
  express.raw({ type: "application/json" }),
  orderController.webhooks
);

// JSON
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Passport Middleware
app.use(passport.initialize());

app.use(bodyParser.json());

// Load Routes
app.use("/api/v0", router);

// cron.schedule("*/5 * * * *", async () => {
//   try {
//     const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
//     const fiveMinutesLater = new Date(Date.now() - 4 * 60 * 1000);

//     const result = await CartModel.deleteMany({
//       addedAt: {
//         $gte: fiveMinutesAgo,
//         $lt: fiveMinutesLater,
//       },
//     });
//     console.log(
//       `Deleted ${result.deletedCount} cart items added exactly 5 minutes ago`
//     );
//   } catch (error) {
//     console.error("Error deleting cart items:", error);
//   }
// });

// Google Auth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    session: false,
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_HOST}/account/login`,
  }),
  (req, res) => {
    const { user, accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
      req.user;

    const newAccessToken = accessToken;
    const newRefreshToken = refreshToken;
    const newAccessTokenExp = accessTokenExp;
    const newRefreshTokenExp = refreshTokenExp;
    const role = user.roles[0];

    // Set Cookies
    setTokensCookies(
      res,
      role,
      newAccessToken,
      newRefreshToken,
      newAccessTokenExp,
      newRefreshTokenExp
    );
    const redirectPath = user.roles[0] === "admin" ? "/admin/dashboard" : "/";
    res.redirect(`${process.env.FRONTEND_HOST}${redirectPath}`);
  }
);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
