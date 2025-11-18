import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_troca_isso_depois";

export const authMiddleware = (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Authorization header not provided." });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid authorization format." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    console.error("Erro no authMiddleware:", error);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};
