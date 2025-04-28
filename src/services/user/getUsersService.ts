import { Prisma } from "@prisma/client";
import prisma from "../../config/prisma";
import { PaginationQueryParams } from "../../types/pagination";

interface GetUsersService extends PaginationQueryParams {
  search: string;
}
export const getUsersService = async (queries: GetUsersService) => {
  const { page, take, sortBy, sortOrder, search } = queries;

  const whereClause: Prisma.UserWhereInput = {
    deletedAt: null,
  };

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    take: take,
    skip: (page - 1) * take,
    orderBy: { [sortBy]: sortOrder },
  });

  const count = await prisma.user.count({ where: whereClause });

  return {
    data: users,
    meta: { page, take, total: count },
  };
};
