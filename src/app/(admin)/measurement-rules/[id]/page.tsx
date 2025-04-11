import { measurementRules } from "@/lib/data";
import EditMeasurementRuleClient from "./client";

// 정적 내보내기를 위한 동적 경로 매개변수 생성
export function generateStaticParams() {
  return measurementRules.map(rule => ({
    id: rule.id,
  }));
}

// 서버 컴포넌트
export default function EditMeasurementRulePage({ params }: { params: { id: string } }) {
  return <EditMeasurementRuleClient id={params.id} />;
}
