-- AlterTable
ALTER TABLE "email_verifications"
  ALTER COLUMN "expiresAt" TYPE TIMESTAMPTZ(3) USING "expiresAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ(3) USING "createdAt" AT TIME ZONE 'UTC';
