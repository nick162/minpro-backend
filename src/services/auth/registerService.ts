import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { hashPassword } from "../../lib/argon";
import { transporter } from "../../lib/nodmailer";
import fs from "fs/promises";
import Handlebars from "handlebars";
import { join } from "path";
import shortid from "shortid";
import dayjs from "dayjs";
import { pointQueue } from "../../jobs/queues/point.que";
// ✅ Tambahkan ini

export const registerService = async (body: any) => {
  const { name, email, password, username, referralCode } = body;

  // 1. Validasi email & username
  const emailCheck = await prisma.user.findFirst({ where: { email } });
  if (emailCheck) throw new ApiError("Email already exists", 400);

  const usernameCheck = await prisma.user.findFirst({ where: { username } });
  if (usernameCheck) throw new ApiError("Username already taken", 400);

  const hashedPassword = await hashPassword(password);
  const generatedReferralCode = shortid.generate();

  let referredByUser: any = null;
  let generatedCoupon: any = null;

  // 2. Validasi referral jika ada
  if (referralCode) {
    referredByUser = await prisma.user.findFirst({
      where: { referralCode: referralCode },
    });
    if (!referredByUser) throw new ApiError("Invalid referral code", 400);
  }

  // 3. Buat user baru
  const newUser = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
      referralCode: generatedReferralCode,
      role: body.role === "EVENT_ORGANIZER" ? "EVENT_ORGANIZER" : "CUSTOMER",
      totalPoint: 0,
    },
  });

  // 4. Jika ada referral valid
  if (referralCode && referredByUser) {
    const referralBonus = 10000;
    const couponBonus = 20000;
    const validUntil = dayjs().add(3, "month").toDate();

    // Tambah referral history
    await prisma.referralHistory.create({
      data: {
        userId: referredByUser.id,
        referredUserId: newUser.id,
        amount: referralBonus,
      },
    });

    // Tambah kupon ke user baru
    generatedCoupon = await prisma.coupon.create({
      data: {
        userId: newUser.id,
        amount: couponBonus,
        validUntil,
        code: `REF-${shortid.generate().toUpperCase()}`,
      },
    });

    // Tambahkan poin ke user yang mereferensikan
    await prisma.user.update({
      where: { id: referredByUser.id },
      data: {
        totalPoint: { increment: referralBonus },
        points: {
          create: {
            amount: referralBonus,
            validUntil,
          },
        },
        PointsHistory: {
          create: {
            amount: referralBonus,
            type: "IN",
            source: "REFERRAL",
          },
        },
      },
    });

    // Optional: bisa tetap antrikan di queue jika butuh async reward
    await pointQueue.add("add-point", {
      userId: referredByUser.id,
      amount: referralBonus,
      type: "IN",
      source: "REFERRAL",
    });
  }

  // 5. Kirim email selamat datang
  const templatePath = join(__dirname, "../../templates/welcome.hbs");
  const template = (await fs.readFile(templatePath)).toString();
  const html = Handlebars.compile(template)({ name });

  await transporter.sendMail({
    to: email,
    subject: "Welcome to Our Platform 🎉",
    html,
  });

  // 6. Return response
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
      validUntil: generatedCoupon.validUntil,
    },
  };
};
