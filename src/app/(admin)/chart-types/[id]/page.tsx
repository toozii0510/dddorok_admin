import { EditChartTypeClient } from "./edit-chart-type-client";

export const metadata = {
  title: '차트 유형 수정 | 관리자 페이지',
};

export default function EditChartTypePage({ params }: { params: { id: string } }) {
  return <EditChartTypeClient id={params.id} />;
}
