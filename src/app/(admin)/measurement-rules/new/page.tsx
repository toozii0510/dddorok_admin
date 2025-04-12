"use client";

import { useState } from "react";
import { MeasurementRuleForm } from "@/features/measurement-rules/components/measurement-rule-form";
import type { MeasurementRule } from "@/lib/data";
import { useRouter } from "next/navigation";

export default function NewMeasurementRulePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data: MeasurementRule) => {
    setIsSubmitting(true);

    // Here you would typically save the rule to your backend
    console.log("Measurement rule data to save:", data);

    // Simulate saving with a short delay
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/measurement-rules");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">새 치수 규칙 추가</h1>
        <p className="text-muted-foreground">새로운 치수 규칙을 생성합니다.</p>
      </div>

      <MeasurementRuleForm onSubmit={handleSubmit} />
    </div>
  );
}
