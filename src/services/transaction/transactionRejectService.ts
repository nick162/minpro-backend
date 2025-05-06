import { join } from "path";
import fs from "fs/promises";
import Handlebars from "handlebars";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { transporter } from "../../lib/nodmailer";
import { PointsType } from "@prisma/client";

export const transactionRejected = async (transactionId: number) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: true,
      transactionDetails: { include: { ticket: true } },
    },
  });

  if (!transaction) throw new ApiError("Transaksi tidak ditemukan", 404);
  if (transaction.status !== "WAITING_FOR_PAYMENT")
    throw new ApiError("Transaksi tidak dapat ditolak", 400);

  await prisma.$transaction(async (tx) => {
    await tx.transaction.update({
      where: { id: transactionId },
      data: { status: "REJECT" },
    });

    await Promise.all(
      transaction.transactionDetails.map((detail) =>
        tx.ticket.update({
          where: { id: detail.ticketId },
          data: {
            availableSeats: {
              increment: detail.qty,
            },
          },
        })
      )
    );

    await Promise.all(
      transaction.transactionDetails.map((detail) =>
        tx.transactionDetail.update({
          where: { id: detail.id },
          data: { deletedAt: new Date() },
        })
      )
    );

    if (transaction.usedPoint && transaction.usedPoint > 0) {
      await tx.user.update({
        where: { id: transaction.userId! },
        data: {
          totalPoint: {
            increment: transaction.usedPoint,
          },
        },
      });

      await tx.pointsHistory.create({
        data: {
          userId: transaction.userId!,
          amount: transaction.usedPoint,
          type: PointsType.IN,
          source: `Pengembalian poin dari transaksi ${transaction.uuid} yang ditolak`,
        },
      });
    }
  });

  // 5. Kirim email penolakan
  const templatePath = join(
    __dirname,
    "../../templates/transaction-rejected.hbs"
  );
  const template = (await fs.readFile(templatePath)).toString();
  const html = Handlebars.compile(template)({
    name: transaction.user.name,
    price: transaction.totalPrice,
    uuid: transaction.uuid,
  });

  await transporter.sendMail({
    to: transaction.user.email,
    subject: "Transaksi Anda Ditolak ❌",
    html,
  });

  return { message: "Transaksi ditolak dan email dikirim" };
};
