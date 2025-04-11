"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { chartTypes, type ChartType } from "@/lib/data";
import { PlusCircle, Edit, Trash, Eye } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">차트 유형 관리</h2>
        <Link href="/chart-types/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
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
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewChartType(chartType)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/chart-types/${chartType.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Dialog open={isDeleteDialogOpen && deleteChartTypeId === chartType.id} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setDeleteChartTypeId(chartType.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
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
            </div>
            <DialogFooter>
              <Link href={`/chart-types/${viewChartType.id}`}>
                <Button>수정</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
