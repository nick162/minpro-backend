import prisma from "../../config/prisma";

export const getAttendeeList = async () => {
  const transactions = await prisma.transaction.findMany({
    where: {
      status: "ACCEPTED",
      deletedAt: null,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      event: {
        select: { id: true, eventName: true },
      },
    },
  });

  const attendees = transactions.map((tx) => ({
    id: tx.id,
    name: tx.user.name,
    email: tx.user.email,
    eventName: tx.event.eventName,
  }));

  return attendees;
};
