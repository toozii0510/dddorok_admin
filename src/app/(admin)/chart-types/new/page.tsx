import { NewChartTypeClient } from './new-chart-type-client';

export const metadata = {
  title: '새 차트 유형 추가 | 관리자 페이지',
  description: '새로운 차트 유형을 추가하는 페이지입니다.',
};

export default function NewChartTypePage() {
  return <NewChartTypeClient />;
}
