import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";

interface GetQueryParams extends PaginationQueryParams {
  search?: string;
}

export const getEventsService = async (query: GetQueryParams) => {
  const {
    page = 1,
    take = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = query;

  const whereClause: Prisma.EventWhereInput = {
    deletedAt: null,
  };

  if (search) {
    whereClause.slug = {
      contains: search,
      mode: "insensitive", // typo fix
    };
  }

  const event = await prisma.event.findMany({
    where: whereClause,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * take,
    take,
    include: { user: { omit: { password: true } } },
  });

  const count = await prisma.event.count({ where: whereClause });

  return {
    data: event,
    meta: {
      page,
      take,
      total: count,
    },
  };
};
