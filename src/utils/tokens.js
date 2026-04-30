import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const createAuthToken = (user) =>
  jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );

export const verifyAuthToken = (token) => jwt.verify(token, env.jwtSecret);
