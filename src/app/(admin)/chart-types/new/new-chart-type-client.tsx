"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChartTypeForm } from "@/features/chart-types/components/chart-type-form";
import { useToast } from "@/hooks/use-toast";
import { chartTypes, type ChartType } from "@/lib/data";
import type { ChartTypeFormData } from "@/features/chart-types/components/chart-type-form";

// 차트 유형 제출 데이터 타입 정의
interface ChartTypeSubmitData {
  id: string;
  name: string;
  coordinates: Array<{ x: number; y: number }>;
  drawOrder: number[];
  armholeDepth: number | null;
  structure_data: {
    name: string;
    coordinates: Array<{ x: number; y: number }>;
    drawOrder: number[];
    armholeDepth: number | null;
  };
}

export function NewChartTypeClient() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (data: ChartTypeFormData) => {
    // 차트 유형 ID 생성 로직 (실제로는 백엔드에서 생성)
    const newId = `chart${chartTypes.length + 1}`;

    // 새 차트 유형 객체 생성
    const newChartType: ChartType = {
      id: newId,
      name: data.name,
      // 기타 필요한 필드들...
    };

    // 실제 앱에서는 백엔드 API로 전송
    console.log("New chart type:", newChartType);

    // 성공 메시지 표시
    toast({
      title: "생성 완료",
      description: `"${data.name}" 차트 유형이 생성되었습니다.`,
    });

    // 차트 유형 목록 페이지로 이동
    router.push("/chart-types");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">새 차트 유형 추가</h1>
      </div>
      <ChartTypeForm onSubmit={handleSubmit} />
    </div>
  );
}
