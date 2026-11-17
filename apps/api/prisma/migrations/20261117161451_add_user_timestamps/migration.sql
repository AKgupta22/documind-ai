-- Add nullable columns first so existing rows can be backfilled.
ALTER TABLE "users"
  ADD COLUMN "created_at" TIMESTAMPTZ(3),
  ADD COLUMN "updated_at" TIMESTAMPTZ(3);

-- Backfill existing users from their earliest email verification token.
WITH first_verification AS (
  SELECT u."id", MIN(v."createdAt") AS "first_created_at"
  FROM "users" u
  LEFT JOIN "email_verifications" v ON v."userId" = u."id"
  GROUP BY u."id"
)
UPDATE "users" u
SET
  "created_at" = COALESCE(f."first_created_at", CURRENT_TIMESTAMP),
  "updated_at" = COALESCE(f."first_created_at", CURRENT_TIMESTAMP)
FROM first_verification f
WHERE f."id" = u."id";

-- Enforce required columns after the backfill.
ALTER TABLE "users"
  ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "created_at" SET NOT NULL,
  ALTER COLUMN "updated_at" SET NOT NULL;
