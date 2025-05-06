import { Transaction } from "@prisma/client";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";

// Fungsi untuk mendapatkan transaksi berdasarkan ID
export const getTransactionById = async (
  transactionId: number
): Promise<Transaction | null> => {
  try {
    // Cari transaksi berdasarkan ID
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        transactionDetails: {
          include: {
            ticket: true, // Mengambil informasi tiket terkait transaksi
          },
        },
        user: true, // Mengambil informasi user terkait transaksi
        event: true, // Mengambil informasi event terkait transaksi
        voucher: true, // Mengambil informasi voucher terkait transaksi
        coupon: true, // Mengambil informasi coupon terkait transaksi
      },
    });

    // Jika transaksi tidak ditemukan, return null
    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }

    return transaction;
  } catch (error) {
    console.error("Error in getTransactionById:", error);
    throw new ApiError("Failed to get transaction by ID", 404);
  }
};
