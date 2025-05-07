import { Request, Response, NextFunction } from "express";
import { transactionAccepted } from "../services/transaction/transactionAcceptService";
import { transactionRejected } from "../services/transaction/transactionRejectService";
import { getTransactionsService } from "../services/transaction/getTransactionsService";
import { ApiError } from "../utils/api-error";
import { getWaitingTransactionService } from "../services/transaction/getWaitingTransactionService";
import { getAttendeeList } from "../services/transaction/getAttendanceService";
import { getTransactionStatisticService } from "../services/transaction/getStatisticTransactionService";
import { getTransactionById } from "../services/transaction/getTransactionById";
import { createTransactionService } from "../services/transaction/createTransactionService";

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

export const getAttendeeListController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const attendees = await getAttendeeList();
    res.status(200).json({ attendees });
  } catch (error) {
    next(error);
  }
};

export const getStatisticTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const transactions = await getTransactionStatisticService();
    res.status(200).send(transactions);
  } catch (error) {
    next(error);
  }
};

export const getTransactionByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const transactionId = parseInt(req.params.id); // Mendapatkan ID dari URL params

  if (isNaN(transactionId)) {
    throw new ApiError("Invalid transaction ID", 400);
  }

  try {
    const transaction = await getTransactionById(transactionId);

    res.status(200).json({
      message: "Transaction found",
      data: transaction,
    });
  } catch (error: any) {
    console.error("Error in getTransactionByIdController:", error);
    next(
      new ApiError("An error occurred while retrieving the transaction", 404)
    );
  }
};

export const createTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Request Body:", req.body); // Log request body
    const transactionId = await createTransactionService(req.body);
    res.status(201).json({ transactionId });
  } catch (error) {
    console.error("Error:", error); // Log error
    next(error);
  }
};
