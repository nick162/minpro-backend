import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { hashPassword } from "../../lib/argon";
import { transporter } from "../../lib/nodmailer";
import fs from "fs/promises";
import Handlebars from "handlebars";
import { join } from "path";
import shortid from "shortid";
import dayjs from "dayjs";

export const registerService = async (body: any) => {
  const { name, email, password, username, referralCode } = body;

  // 1. Cek email & username
  // 1. Cek email & username
  // 1. Cek email & username
  const emailCheck = await prisma.user.findFirst({ where: { email } });
  if (emailCheck) throw new ApiError("Email already exists", 400);

  const usernameCheck = await prisma.user.findFirst({ where: { username } });
  if (usernameCheck) throw new ApiError("Username already taken", 400);

  const hashedPassword = await hashPassword(password);
  const generatedReferralCode = shortid.generate();

  let referredByUser: any = null;
  let generatedCoupon: any = null;

  // 2. Jika pakai referral code
  if (referralCode) {
    referredByUser = await prisma.user.findFirst({
      where: { referralCode: referralCode },
    });
    if (!referredByUser) throw new ApiError("Invalid referral code", 400);

    // Tambahkan poin ke user yang direferensikan
    await prisma.point.create({
      data: {
        userId: referredByUser.id,
        amount: 10000,
        validUntil: dayjs().add(3, "month").toDate(),
      },
    });
  }

  // 3. Buat user baru
  const newUser = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
      referralCode: generatedReferralCode,
      role: body.role === "EVENT_ORGANIZER" ? "EVENT_ORGANIZER" : "CUSTOMER", // Sesuaikan role yang diterima
    },
  });

  // 4. Jika ada referral code, catat ke referral_histories setelah user baru dibuat
  if (referralCode && referredByUser) {
    await prisma.referralHistory.create({
      data: {
        userId: referredByUser.id, // User yang memberikan referral
        referredUserId: newUser.id, // User yang baru dibuat
        amount: 10000, // Poin yang diberikan
      },
    });

    // 5. Buat kupon diskon untuk user baru
    generatedCoupon = await prisma.coupon.create({
      data: {
        userId: newUser.id,
        amount: 20000,
        validUntil: dayjs().add(3, "month").toDate(),
        code: `REF-${shortid.generate().toUpperCase()}`,
      },
    });
  }

  // 6. Kirim email sambutan
  const templatePath = join(__dirname, "../../templates/welcome.hbs");
  const template = (await fs.readFile(templatePath)).toString();
  const html = Handlebars.compile(template)({ name });

  await transporter.sendMail({
    to: email,
    subject: "Welcome to Our Platform 🎉",
    html,
  });

  // 7. Return response
  return {
    message: "Register successful",
    user: {
      id: newUser.id,
      email: newUser.email,
      referralCode: newUser.referralCode,
    },
    coupon: generatedCoupon && {
      code: generatedCoupon.code,
      amount: generatedCoupon.amount,
      validUntil: generatedCoupon.valid_until,
    },
  };
};
