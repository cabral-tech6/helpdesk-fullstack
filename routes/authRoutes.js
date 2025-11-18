import { Router } from "express";
import { register, login } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/test", (req, res) => {
  console.log("🔥 Passou dentro do authRoutes /test");
  res.json({ ok: true, route: "/auth/test" });
});

router.get("/me", authMiddleware, (req, res) => {
  return res.json({
    message: "Authenticated user",
    user: req.user,
  });
});

router.post("/register", register);

router.post("/login", login);

export default router;
