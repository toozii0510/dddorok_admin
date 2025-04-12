"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { chartTypes, type ChartType } from "@/lib/data";
import Link from "next/link";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export function ChartTypeList() {
  const [chartTypesList, setChartTypesList] = useState<ChartType[]>(chartTypes);
  const [deleteChartTypeId, setDeleteChartTypeId] = useState<string | null>(null);
  const [viewChartType, setViewChartType] = useState<ChartType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const chartTypeToDelete = chartTypesList.find(ct => ct.id === deleteChartTypeId);

  // 차트 유형 삭제 함수
  const handleDeleteChartType = () => {
    if (deleteChartTypeId) {
      // 현재 chartTypesList 배열에서 해당 ID를 가진 항목을 제외한 새 배열 생성
      const updatedChartTypes = chartTypesList.filter(ct => ct.id !== deleteChartTypeId);

      // 상태 업데이트
      setChartTypesList(updatedChartTypes);
      setIsDeleteDialogOpen(false);
      setDeleteChartTypeId(null);

      // 성공 메시지 표시
      toast({
        title: "삭제 완료",
        description: `"${chartTypeToDelete?.name}" 차트 유형이 삭제되었습니다.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">차트 유형 관리</h2>
        <p className="text-muted-foreground">
          차트 유형을 관리합니다. 새 차트 유형을 추가하거나 기존 유형을 수정할 수 있습니다.
        </p>
      </div>

      {/* 기획 의도 및 개발자를 위한 설명 카드 */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-800 flex items-center gap-2 text-lg">
            <Info className="h-5 w-5" />
            기획 의도 및 개발 지침
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700 space-y-2 text-sm">
          <p>
            <strong>기능 개요:</strong> 차트 유형 관리 페이지는 니트/뜨개 도안에서 사용되는 각종 차트 유형(패턴)을
            정의하고 관리하는 페이지입니다. 차트 유형은 템플릿에서 참조되어 사용됩니다.
          </p>
          <p>
            <strong>주요 워크플로우:</strong>
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>관리자가 다양한 차트 유형을 미리 등록 (예: 앞 몸판, 뒤 몸판, 소매 등)</li>
            <li>등록된 차트 유형은 템플릿 생성 시 선택 가능</li>
            <li>차트 유형별로 고유 ID와 표시 이름 관리</li>
            <li>불필요한 차트 유형은 삭제 가능 (연결된 템플릿이 없는 경우)</li>
          </ol>
          <p>
            <strong>개발 참고사항:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>차트 유형 삭제 시 연결된 템플릿이 있는지 확인 필요</li>
            <li>향후 차트 유형별 아이콘/이미지 추가 기능 고려</li>
            <li>차트 유형과 템플릿은 M:N 관계 (템플릿은 여러 차트 유형 포함 가능)</li>
            <li>API 연동 시 필요한 엔드포인트: GET/POST/PUT/DELETE /api/chart-types</li>
            <li>차트 유형 ID는 문자열 형태로 관리 (알파벳+숫자 조합)</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link href="/chart-types/new">
          <Button size="lg">
            새 차트 유형 추가
          </Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>차트 유형 ID</TableHead>
              <TableHead>차트 유형 이름</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartTypesList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  차트 유형이 없습니다. 새 차트 유형을 추가해주세요.
                </TableCell>
              </TableRow>
            ) : (
              chartTypesList.map((chartType) => (
                <TableRow key={chartType.id}>
                  <TableCell className="font-medium">{chartType.id}</TableCell>
                  <TableCell>{chartType.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewChartType(chartType)}
                      >
                        상세보기
                      </Button>
                      <Link href={`/chart-types/${chartType.id}`}>
                        <Button variant="outline" size="sm">
                          수정
                        </Button>
                      </Link>
                      <Dialog open={isDeleteDialogOpen && deleteChartTypeId === chartType.id} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                              setDeleteChartTypeId(chartType.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            삭제
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>차트 유형 삭제</DialogTitle>
                            <DialogDescription>
                              '{chartTypeToDelete?.name}' 차트 유형을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 이 차트 유형을 사용하는 템플릿에 영향을 줄 수 있습니다.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsDeleteDialogOpen(false)}
                            >
                              취소
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleDeleteChartType}
                            >
                              삭제
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p><strong>샘플 데이터 안내:</strong> 현재 보이는 데이터는 예시용입니다. 실제 구현 시 백엔드 API와 연동하여 실제 데이터를 표시해야 합니다.</p>
          <p className="mt-1"><strong>연관 관계:</strong> 차트 유형은 템플릿의 chartTypeIds 배열 필드에서 참조됩니다.</p>
        </AlertDescription>
      </Alert>

      {/* Chart Type Details Dialog */}
      {viewChartType && (
        <Dialog open={!!viewChartType} onOpenChange={(open) => !open && setViewChartType(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{viewChartType.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">차트 유형 ID</p>
                    <p>{viewChartType.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">차트 유형 이름</p>
                    <p>{viewChartType.name}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  <strong>개발 참고:</strong> 실제 구현 시 이 다이얼로그에 차트 유형을 사용하는 템플릿 목록 표시 기능 추가 필요
                </p>
              </div>
            </div>
            <DialogFooter>
              <Link href={`/chart-types/${viewChartType.id}`}>
                <Button>차트 유형 수정</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
