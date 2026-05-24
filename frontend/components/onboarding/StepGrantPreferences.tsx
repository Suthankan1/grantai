/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { grantTypes, countries, deadlinePreferences } from "@/lib/onboarding-constants";

interface StepGrantPreferencesProps {
  register: any;
  errors: any;
  values: any;
  setValue: any;
}

export function StepGrantPreferences({
  register,
  errors,
  values,
  setValue,
}: StepGrantPreferencesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label>Grant types</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {grantTypes.map((type) => {
            const selected = values.grantTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  const next = selected
                    ? values.grantTypes.filter((value: string) => value !== type)
                    : [...values.grantTypes, type];
                  setValue("grantTypes", next, { shouldValidate: true });
                }}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  selected
                    ? "border-[rgba(108,71,255,0.45)] bg-[rgba(108,71,255,0.12)] text-white"
                    : "border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] text-[var(--color-text)] hover:border-[var(--border-strong)]"
                }`}
              >
                <span>{type}</span>
                {selected && <Check className="h-4 w-4 text-[#00D4AA]" />}
              </button>
            );
          })}
        </div>
        {errors.grantTypes && <p className="text-xs text-red-400">{errors.grantTypes.message}</p>}
      </div>

      <div className="space-y-3">
        <Label>Preferred countries</Label>
        <div className="grid gap-3 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1 py-1">
          {countries.map((country) => {
            const selected = values.preferredCountries.includes(country.name);
            return (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  const next = selected
                    ? values.preferredCountries.filter((value: string) => value !== country.name)
                    : [...values.preferredCountries, country.name];
                  setValue("preferredCountries", next, { shouldValidate: true });
                }}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  selected
                    ? "border-[rgba(0,212,170,0.4)] bg-[rgba(0,212,170,0.12)] text-white"
                    : "border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] text-[var(--color-text)] hover:border-[var(--border-strong)]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  {country.name}
                </span>
                {selected && <Check className="h-4 w-4 text-[#00D4AA]" />}
              </button>
            );
          })}
        </div>
        {errors.preferredCountries && (
          <p className="text-xs text-red-400">{errors.preferredCountries.message}</p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="minGrantAmount">
            Minimum grant amount: ${Number(values.minGrantAmount).toLocaleString()}
          </Label>
          <input
            id="minGrantAmount"
            type="range"
            min="0"
            max="250000"
            step="5000"
            value={values.minGrantAmount}
            onChange={(event) =>
              setValue("minGrantAmount", Number(event.target.value), { shouldValidate: true })
            }
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[rgba(240,240,255,0.08)] accent-[var(--color-accent)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadlinePreference" required>
            Deadline preference
          </Label>
          <select
            id="deadlinePreference"
            className="h-12 w-full rounded-xl border border-[var(--border-default)] bg-[rgba(240,240,255,0.04)] px-4 text-sm text-[var(--color-text)] outline-none"
            {...register("deadlinePreference")}
          >
            {deadlinePreferences.map((deadline) => (
              <option key={deadline.value} value={deadline.value}>
                {deadline.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
