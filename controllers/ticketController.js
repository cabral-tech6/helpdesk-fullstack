import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "User not authenticated." });
    }

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description and category are required.",
      });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        category,
        status: "OPEN",
        priority: priority || "MEDIUM",
        userId: userId
      }
    });

    return res.status(201).json({
      message: "Ticket created successfully.",
      ticket
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res
      .status(500)
      .json({ message: "Internal server error." });
  }
};

// Listar todos os tickets (visão geral)
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      message: "Tickets list.",
      tickets
    });
  } catch (error) {
    console.error("Error listing tickets:", error);
    return res
      .status(500)
      .json({ message: "Internal server error." });
  }
};

// Listar apenas os tickets do usuário logado
export const getMyTickets = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ message: "User not authenticated." });
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({
      message: "My tickets list.",
      tickets
    });
  } catch (error) {
    console.error("Error listing my tickets:", error);
    return res
      .status(500)
      .json({ message: "Internal server error." });
  }
};
