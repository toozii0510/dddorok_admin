"use client";

import { useState, useEffect } from "react";
import { MeasurementRuleForm } from "@/features/measurement-rules/components/measurement-rule-form";
import { measurementRules, type MeasurementRule } from "@/lib/data";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EditMeasurementRuleClientProps {
  id: string;
}

export default function EditMeasurementRuleClient({ id }: EditMeasurementRuleClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [rule, setRule] = useState<MeasurementRule | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      // 데이터에서 해당 ID에 맞는 측정 규칙 찾기
      const foundRule = measurementRules.find(r => r.id === id);

      if (foundRule) {
        setRule(foundRule);
      } else {
        setNotFound(true);
      }

      setIsLoading(false);
    }
  }, [id]);

  const handleSubmit = (data: MeasurementRule, createTemplate: boolean) => {
    setIsSubmitting(true);

    // 실제로 데이터 업데이트 (실제 구현에서는 API 호출)
    const index = measurementRules.findIndex(r => r.id === data.id);
    if (index !== -1) {
      measurementRules[index] = data;
    } else {
      // 만약 ID가 없는 경우 (이상 케이스) 새로 추가
      measurementRules.push(data);
    }

    console.log("Updated measurement rule:", data);
    console.log("Current rules:", measurementRules);
    console.log("Rule ID to redirect to:", data.id);

    // 저장 시뮬레이션
    setTimeout(() => {
      setIsSubmitting(false);

      toast({
        title: "치수 규칙 수정 완료",
        description: `"${data.name}" 치수 규칙이 성공적으로 업데이트되었습니다.`,
      });

      if (createTemplate) {
        // createTemplate이 true인 경우 템플릿 생성 페이지로 리다이렉트
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
        // 일반 저장인 경우 목록 페이지로 리다이렉트
        router.push("/measurement-rules");
      }
    }, 500);
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (notFound) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>오류</AlertTitle>
        <AlertDescription>
          해당 ID의 측정 규칙을 찾을 수 없습니다.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">치수 규칙 편집</h1>
        <p className="text-muted-foreground">측정 규칙을 수정합니다.</p>
      </div>

      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>중복 방지:</strong> 수정 시에도 동일한 카테고리와 소매 유형 조합으로 이미 다른 규칙이 존재하는 경우 중복 생성이 방지됩니다.
        </AlertDescription>
      </Alert>

      {rule && <MeasurementRuleForm rule={rule} onSubmit={handleSubmit} isEdit={true} />}
    </div>
  );
}
