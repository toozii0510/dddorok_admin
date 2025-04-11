import { EditChartTypeClient } from "./edit-chart-type-client";

export const metadata = {
  title: '차트 유형 수정 | 관리자 페이지',
  description: '차트 유형을 수정하는 페이지입니다.',
};

export default function EditChartTypePage({ params }: { params: { id: string } }) {
  return <EditChartTypeClient id={params.id} />;
}
