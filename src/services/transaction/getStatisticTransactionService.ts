import prisma from "../../config/prisma";

export const getTransactionStatisticService = async () => {
  // Ambil transaksi yang sudah diterima
  const acceptedTransactions = await prisma.transaction.findMany({
    where: { status: "ACCEPTED" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Hitung total revenue
  const totalRevenue = acceptedTransactions.reduce(
    (acc, trx) => acc + trx.totalPrice,
    0
  );

  // Overview (chart revenue per bulan)
  const revenueByMonth: Record<string, number> = {};

  acceptedTransactions.forEach((trx) => {
    const month = trx.createdAt.toLocaleString("default", { month: "short" });
    revenueByMonth[month] = (revenueByMonth[month] || 0) + trx.totalPrice;
  });

  const overview = Object.entries(revenueByMonth).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  // Recent sales (ambil 5 terbaru)
  const recentSales = acceptedTransactions.slice(0, 5).map((trx) => ({
    name: trx.user.name,
    email: trx.user.email,
    amount: trx.totalPrice,
  }));

  // Data tambahan (events, tickets, vouchers)
  const [totalEvents, totalTickets, totalVouchers] = await Promise.all([
    prisma.event.count({ where: { deletedAt: null } }),
    prisma.ticket.count({ where: { deletedAt: null } }),
    prisma.voucher.count({ where: { deletedAt: null } }),
  ]);

  return {
    totalRevenue,
    overview,
    recentSales,
    totalEvents,
    totalTickets,
    totalVouchers,
  };
};
