import { join } from "path";
import fs from "fs/promises";
import Handlebars from "handlebars";
import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { transporter } from "../../lib/nodmailer";

export const transactionRejected = async (transactionId: number) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { user: true },
  });

  if (!transaction) throw new ApiError("Transaksi tidak ditemukan", 404);
  if (transaction.status !== "WAITING_FOR_ADMIN_CONFIRMATION")
    throw new ApiError("Transaksi sudah diproses", 400);

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "REJECT" },
  });

  // Email
  const templatePath = join(__dirname, "../templates/transaction-rejected.hbs");
  const template = (await fs.readFile(templatePath)).toString();
  const html = Handlebars.compile(template)({
    name: transaction.user.name,
    eventId: transaction.eventId,
  });

  await transporter.sendMail({
    to: transaction.user.email,
    subject: "Transaksi Anda Ditolak ❌",
    html,
  });

  return { message: "Transaksi ditolak dan email dikirim" };
};
