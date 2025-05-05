import { Request, Response, NextFunction } from "express";
import { transactionAccepted } from "../services/transaction/transactionAcceptService";
import { transactionRejected } from "../services/transaction/transactionRejectService";
import { getTransactionsService } from "../services/transaction/getTransactionsService";
import { ApiError } from "../utils/api-error";
import { getWaitingTransactionService } from "../services/transaction/getWaitingTransactionService";

export const getTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getTransactionsService();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
export const acceptTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactionId = parseInt(req.params.id);
    if (isNaN(transactionId)) {
      throw new ApiError("Invalid Id Transaction", 404);
    }

    const result = await transactionAccepted(transactionId);
    res.status(200).send(result);
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
      throw new ApiError("Invalid Transaction Id", 404);
    }

    const result = await transactionRejected(transactionId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getWaitingTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getWaitingTransactionService();
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
