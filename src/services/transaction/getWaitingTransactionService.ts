// src/services/transaction/getWaitingTransactionService.ts

import prisma from "../../config/prisma";

export const getWaitingTransactionService = async () => {
  const transactions = await prisma.transaction.findMany({
    where: {
      deletedAt: null,
      status: "WAITING_FOR_PAYMENT",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      event: {
        select: {
          id: true,
          eventName: true,
          category: true,
        },
      },
      transactionDetails: {
        include: {
          ticket: {
            select: {
              id: true,
              ticketType: true,
              price: true,
            },
          },
        },
      },
      review: {
        select: {
          id: true,
          rating: true,
          reviewDesc: true,
        },
      },
      voucher: {
        select: {
          id: true,
          code: true,
          amount: true,
        },
      },
      coupon: {
        select: {
          id: true,
          code: true,
          amount: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    message: "Waiting transactions retrieved successfully",
    data: transactions,
  };
};
