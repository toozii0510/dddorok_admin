"use client";

import { useState, useEffect } from "react";
import { MeasurementRuleForm } from "@/features/measurement-rules/components/measurement-rule-form";
import { measurementRules, type MeasurementRule } from "@/lib/data";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface EditMeasurementRuleClientProps {
  id: string;
}

export default function EditMeasurementRuleClient({ id }: EditMeasurementRuleClientProps) {
  const router = useRouter();
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

  const handleSubmit = (data: MeasurementRule) => {
    setIsSubmitting(true);

    // 여기서 데이터 저장 로직 구현 (실제로는 백엔드 API 호출)
    console.log("Measurement rule data to update:", data);

    // 저장 시뮬레이션
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/measurement-rules");
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

      {rule && <MeasurementRuleForm rule={rule} onSubmit={handleSubmit} />}
    </div>
  );
}
