"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChartTypeForm, ChartTypeFormData } from "@/features/chart-types/components/chart-type-form";
import { useToast } from "@/hooks/use-toast";
import { chartTypes, type ChartType } from "@/lib/data";

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

interface EditChartTypeClientProps {
  id: string;
}

export function EditChartTypeClient({ id }: EditChartTypeClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [chartType, setChartType] = useState<ChartType | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 앱에서는 API 호출을 통해 데이터를 가져옴
    const foundChartType = chartTypes.find(ct => ct.id === id);
    setChartType(foundChartType);
    setLoading(false);
  }, [id]);

  const handleSubmit = (data: ChartTypeFormData) => {
    if (!chartType) return;

    // 업데이트된 차트 유형 객체 생성
    const updatedChartType: ChartType = {
      ...chartType,
      name: data.name,
      // 기타 필요한 필드 업데이트
    };

    // 실제 앱에서는 백엔드 API로 전송
    console.log("Updated chart type:", updatedChartType);

    // 성공 메시지 표시
    toast({
      title: "수정 완료",
      description: `"${data.name}" 차트 유형이 수정되었습니다.`,
    });

    // 차트 유형 목록 페이지로 이동
    router.push("/chart-types");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <p>로딩 중...</p>
      </div>
    );
  }

  if (!chartType) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <h2 className="text-xl font-semibold mb-2">차트 유형을 찾을 수 없습니다</h2>
        <p className="text-gray-500 mb-4">요청하신 ID에 해당하는 차트 유형이 없습니다.</p>
        <button
          onClick={() => router.push("/chart-types")}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          차트 유형 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">차트 유형 수정: {chartType.name}</h1>
      </div>
      <ChartTypeForm chartType={chartType} onSubmit={handleSubmit} />
    </div>
  );
}
