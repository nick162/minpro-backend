import shortid from "shortid";

/**
 * Generate a unique referral code using shortid.
 * Optionally, you can prefix it with username or initials.
 */
export const generateReferralCode = (prefix?: string): string => {
  const uniqueCode = shortid.generate();

  if (prefix) {
    // Clean the prefix and combine
    const cleanPrefix = prefix.replace(/\s+/g, "").toUpperCase();
    return `${cleanPrefix}-${uniqueCode}`;
  }

  return uniqueCode;
};
