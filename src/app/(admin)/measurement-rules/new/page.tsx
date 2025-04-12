"use client";

import { useState } from "react";
import { MeasurementRuleForm } from "@/features/measurement-rules/components/measurement-rule-form";
import { measurementRules, type MeasurementRule } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function NewMeasurementRulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data: MeasurementRule, createTemplate: boolean) => {
    setIsSubmitting(true);

    // 새 규칙을 측정 규칙 배열에 추가 (실제 구현에서는 API 호출로 대체)
    measurementRules.push(data);
    console.log("Measurement rule data saved:", data);
    console.log("Current rules:", measurementRules);
    console.log("Rule ID to redirect to:", data.id);

    // Simulate saving with a short delay
    setTimeout(() => {
      setIsSubmitting(false);

      toast({
        title: "치수 규칙 생성 완료",
        description: `"${data.name}" 치수 규칙이 성공적으로 저장되었습니다.`,
      });

      if (createTemplate) {
        // 템플릿 생성 페이지로 리다이렉트, 치수 규칙 ID를 쿼리 파라미터로 전달
        console.log(`Redirecting to template creation with ruleId: ${data.id}`);

        try {
          // 규칙이 있는지 확인
          const savedRule = measurementRules.find(r => r.id === data.id);
          if (!savedRule) {
            throw new Error("저장된 규칙을 찾을 수 없습니다");
          }

          // 저장 시간을 두어 데이터가 반영될 시간 확보
          setTimeout(() => {
            if (data.id) {
              window.location.href = `/templates/new?ruleId=${encodeURIComponent(data.id)}`;
            } else {
              console.error("Rule ID is undefined, cannot redirect");
              alert("치수 규칙 ID가 생성되지 않았습니다. 다시 시도해 주세요.");
              router.push("/measurement-rules");
            }
          }, 500);
        } catch (error) {
          console.error("Error redirecting to template page:", error);
          alert("치수 규칙은 저장되었으나 템플릿 생성 페이지로 이동 중 오류가 발생했습니다.");
          router.push("/measurement-rules");
        }
      } else {
        router.push("/measurement-rules");
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">새 치수 규칙 추가</h1>
        <p className="text-muted-foreground">
          새로운 치수 규칙을 생성합니다. 규칙을 저장한 후 바로 이 규칙을 사용하는 템플릿을 생성할 수도 있습니다.
        </p>
      </div>

      <Alert variant="info" className="bg-blue-50 border-blue-200 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>중복 방지:</strong> 동일한 카테고리와 소매 유형 조합으로 이미 규칙이 존재하는 경우 중복 생성이 방지됩니다.
        </AlertDescription>
      </Alert>

      <MeasurementRuleForm onSubmit={handleSubmit} />
    </div>
  );
}
