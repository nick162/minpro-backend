import prisma from "../../config/prisma";
import { ApiError } from "../../utils/api-error";
import { Category } from "@prisma/client";

// Enum kategori yang valid
const validCategories = [
  "MUSIC",
  "ART",
  "WOKRSHOP",
  "EXHIBITION",
  "FOOD",
  "SPORT",
];

export const getEventByCategoryService = async (category: string) => {
  const upperCategory = category.toUpperCase();

  // Validasi apakah kategori termasuk dalam enum
  if (!validCategories.includes(upperCategory)) {
    throw new ApiError("Invalid category", 400);
  }

  const events = await prisma.event.findMany({
    where: {
      category: upperCategory as Category,
      deletedAt: null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    message: `List of ${upperCategory} events`,
    events,
  };
};
