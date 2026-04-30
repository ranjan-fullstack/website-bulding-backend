import cors from "cors";
import express from "express";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { adminRouter } from "./routes/adminRoutes.js";
import { authRouter } from "./routes/authRoutes.js";
import { businessRouter } from "./routes/businessRoutes.js";
import { orderRouter } from "./routes/orderRoutes.js";

const app = express();

app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "webmitra-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin/business", businessRouter);
app.use("/api/orders", orderRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong" });
});

connectDb()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`Backend running on http://localhost:${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Backend failed to start", error);
    process.exit(1);
  });
