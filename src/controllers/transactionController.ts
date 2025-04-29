import { Request, Response, NextFunction } from "express";
import { transactionAccepted } from "../services/transaction/transactionAcceptService";
import { transactionRejected } from "../services/transaction/transactionRejectService";

export const acceptTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactionId = parseInt(req.params.id);
    if (isNaN(transactionId)) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    const result = await transactionAccepted(transactionId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactionId = parseInt(req.params.id);
    if (isNaN(transactionId)) {
      return res.status(400).json({ message: "ID tidak valid" });
    }

    const result = await transactionRejected(transactionId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
