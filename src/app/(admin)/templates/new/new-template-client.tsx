"use client";

import { useState, useEffect } from "react";
import { TemplateForm } from "@/features/templates/components/template-form";
import type { Template, MeasurementRule } from "@/lib/data";
import { useRouter } from "next/navigation";
import { measurementRules } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Info, ArrowLeft, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function NewTemplateClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialTemplate, setInitialTemplate] = useState<Partial<Template> | undefined>(undefined);
  const [ruleName, setRuleName] = useState<string>("");
  const [selectedRule, setSelectedRule] = useState<MeasurementRule | null>(null);

  // 치수 규칙 선택 처리 함수
  const handleSelectRule = (rule: MeasurementRule) => {
    console.log("Selected rule:", rule);

    setSelectedRule(rule);
    setRuleName(rule.name);

    // 템플릿 초기 데이터 설정
    const templateData = {
      measurementRuleId: rule.id,
      measurementItems: rule.items,
      sleeveType: rule.sleeveType,
      toolType: "대바늘",
      patternType: "서술형",
      publishStatus: "공개",
    };

    console.log("Setting template data:", templateData);
    setInitialTemplate(templateData);
  };

  const handleSubmit = (data: Template) => {
    setIsSubmitting(true);

    console.log("Template form submitted:", data);
    console.log("MeasurementRuleId:", data.measurementRuleId);

    if (!data.measurementRuleId) {
      toast({
        title: "치수 규칙 필요",
        description: "치수 규칙이 선택되지 않았습니다. 치수 규칙을 먼저 선택해주세요.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // 성공 메시지 및 리다이렉트
    toast({
      title: "템플릿 저장 성공",
      description: `"${data.name}" 템플릿이 생성되었습니다.`
    });

    // Simulate saving with a short delay
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/templates");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">새 템플릿 추가</h1>
        <p className="text-muted-foreground">새로운 템플릿을 생성하려면 먼저 치수 규칙을 선택해주세요.</p>
      </div>

      {!selectedRule ? (
        // 치수 규칙 선택 UI
        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>치수 규칙 선택 필요</AlertTitle>
            <AlertDescription>
              템플릿을 생성하려면 먼저 치수 규칙을 선택해야 합니다. 아래 목록에서 사용할 치수 규칙을 선택해주세요.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <h2 className="text-lg font-medium">사용 가능한 치수 규칙</h2>
            {measurementRules.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>치수 규칙 없음</AlertTitle>
                <AlertDescription>
                  사용 가능한 치수 규칙이 없습니다. 먼저 치수 규칙을 생성해주세요.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-3">
                {measurementRules.map((rule) => (
                  <Card
                    key={rule.id}
                    className={`cursor-pointer hover:border-blue-400 transition-colors ${
                      selectedRule?.id === rule.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleSelectRule(rule)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{rule.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          측정 항목: {rule.items.length}개
                          {rule.sleeveType && ` • 소매 유형: ${rule.sleeveType}`}
                        </p>
                      </div>
                      {selectedRule?.id === rule.id && (
                        <Check className="h-5 w-5 text-blue-500" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // 선택된 치수 규칙 정보 표시 및 템플릿 폼
        <div className="space-y-6">
          <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
            <Info className="h-4 w-4" />
            <AlertTitle>치수 규칙 선택됨</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <div>
                <p><strong>{ruleName}</strong> 치수 규칙을 사용하여 템플릿을 생성합니다.</p>
                <p className="text-xs">규칙 ID: {selectedRule.id}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-300"
                onClick={() => setSelectedRule(null)}
              >
                다른 규칙 선택
              </Button>
            </AlertDescription>
          </Alert>

          {initialTemplate !== undefined && (
            <TemplateForm onSubmit={handleSubmit} initialRuleData={initialTemplate} />
          )}
        </div>
      )}
    </div>
  );
}
