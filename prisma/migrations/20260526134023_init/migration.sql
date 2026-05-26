-- CreateTable
CREATE TABLE "td_salary" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level_standardized" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "experience_years" INTEGER NOT NULL,
    "base_salary" DOUBLE PRECISION NOT NULL,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_compensation" DOUBLE PRECISION NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "td_salary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "td_salary_company_idx" ON "td_salary"("company");

-- CreateIndex
CREATE INDEX "td_salary_company_level_standardized_location_idx" ON "td_salary"("company", "level_standardized", "location");

-- CreateIndex
CREATE INDEX "td_salary_total_compensation_idx" ON "td_salary"("total_compensation");

-- CreateIndex
CREATE INDEX "td_salary_role_idx" ON "td_salary"("role");
