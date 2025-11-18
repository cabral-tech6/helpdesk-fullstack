import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createTicket,
  getAllTickets,
  getMyTickets
} from "../controllers/ticketController.js";

const router = Router();

console.log(" ticketRoutes.js foi carregado");

router.get("/test", (req, res) => {
  console.log(" Entrou em GET /tickets/test");
  return res.json({ ok: true, route: "/tickets/test" });
});

// Listar todos os tickets
router.get("/", authMiddleware, getAllTickets);

// Listar tickets do usuário logado
router.get("/my", authMiddleware, getMyTickets);

// Criar novo ticket
router.post("/", authMiddleware, createTicket);

export default router;
