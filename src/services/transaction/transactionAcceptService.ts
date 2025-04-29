import { join } from "path";
import fs from "fs/promises";
import Handlebars from "handlebars";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { transporter } from "../../lib/nodmailer";

export const transactionAccepted = async (transactionId: number) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction) throw new ApiError("Transaksi tidak ditemukan", 404);
  if (transaction.status !== "WAITING_FOR_ADMIN_CONFIRMATION")
    throw new ApiError("Transaksi sudah diproses", 400);

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "ACCEPTED" },
  });

  // Email
  const templatePath = join(__dirname, "../templates/transaction-accepted.hbs");
  const template = (await fs.readFile(templatePath)).toString();
  const html = Handlebars.compile(template)({
    name: transaction.user.name,
    eventId: transaction.eventId,
    price: transaction.totalPrice,
  });

  await transporter.sendMail({
    to: transaction.user.email,
    subject: "Transaksi Anda Diterima 🎉",
    html,
  });

  return { message: "Transaksi diterima dan email dikirim" };
};
