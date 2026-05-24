/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SearchableFieldSelect } from "./SearchableFieldSelect";
import { degreeLevels } from "@/lib/onboarding-constants";

interface StepAcademicBackgroundProps {
  register: any;
  errors: any;
  values: any;
  setValue: any;
}

export function StepAcademicBackground({
  register,
  errors,
  values,
  setValue,
}: StepAcademicBackgroundProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="university" required>University</Label>
        <Input
          id="university"
          variant="glass"
          placeholder="University of Nairobi"
          error={!!errors.university}
          errorMessage={errors.university?.message}
          {...register("university")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="degreeLevel" required>Degree level</Label>
        <select
          id="degreeLevel"
          className="h-12 w-full rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-4 text-sm text-[var(--color-text)] outline-none"
          {...register("degreeLevel")}
        >
          <option value="">Select degree level</option>
          {degreeLevels.map((level) => (
            <option key={level} value={level.toUpperCase()}>
              {level}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <SearchableFieldSelect
          label="Field of study"
          value={values.fieldOfStudy}
          onChange={(value) => setValue("fieldOfStudy", value, { shouldValidate: true })}
          error={errors.fieldOfStudy?.message}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="graduationYear" required>Graduation year</Label>
        <Input
          id="graduationYear"
          variant="glass"
          type="number"
          placeholder="2026"
          error={!!errors.graduationYear}
          errorMessage={errors.graduationYear?.message}
          {...register("graduationYear", { valueAsNumber: true })}
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="gpa">GPA: {Number(values.gpa).toFixed(1)} / 4.0</Label>
        <input
          id="gpa"
          type="range"
          min="0"
          max="4"
          step="0.1"
          value={values.gpa}
          onChange={(event) =>
            setValue("gpa", Number(event.target.value), { shouldValidate: true })
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[rgba(240,240,255,0.08)] accent-[var(--color-primary)]"
        />
      </div>
    </div>
  );
}
