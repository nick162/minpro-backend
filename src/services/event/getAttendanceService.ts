import prisma from "../../config/prisma";

export const getAttendeeList = async (eventId: number) => {
  return prisma.transaction.findMany({
    where: {
      eventId,
      status: "ACCEPTED",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      transactionDetails: {
        include: {
          ticket: {
            select: {
              sold: true,
            },
          },
        },
      },
    },
  });
};
