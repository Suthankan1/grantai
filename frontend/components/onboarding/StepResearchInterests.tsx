/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { TagInput } from "./TagInput";

interface StepResearchInterestsProps {
  values: any;
  setValue: any;
  errors: any;
}

export function StepResearchInterests({ values, setValue, errors }: StepResearchInterestsProps) {
  return (
    <div className="space-y-4">
      <TagInput
        label="Research interests"
        description="Press Enter to add each interest. Minimum 3 required."
        tags={values.researchInterests}
        onChange={(tags) => setValue("researchInterests", tags, { shouldValidate: true })}
        error={errors.researchInterests?.message}
      />
    </div>
  );
}
