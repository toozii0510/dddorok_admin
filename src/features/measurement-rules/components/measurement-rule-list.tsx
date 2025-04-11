"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type MeasurementRule, measurementRules as originalMeasurementRules, getCategoryById } from "@/lib/data";
import { PlusCircle, Edit, Trash, Eye } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export function MeasurementRuleList() {
  const [measurementRules, setMeasurementRules] = useState<MeasurementRule[]>(originalMeasurementRules);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [viewRule, setViewRule] = useState<MeasurementRule | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const ruleToDelete = measurementRules.find(r => r.id === deleteRuleId);

  // Function to get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = getCategoryById(categoryId);
    return category ? category.name : "알 수 없음";
  };

  // 측정 규칙 삭제 함수
  const handleDeleteRule = () => {
    if (deleteRuleId) {
      // 현재 measurementRules 배열에서 해당 ID를 가진 항목을 제외한 새 배열 생성
      const updatedRules = measurementRules.filter(rule => rule.id !== deleteRuleId);

      // 상태 업데이트
      setMeasurementRules(updatedRules);
      setIsDeleteDialogOpen(false);
      setDeleteRuleId(null);

      // 성공 메시지 표시
      toast({
        title: "삭제 완료",
        description: `"${ruleToDelete?.name}" 치수 규칙이 삭제되었습니다.`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">치수 규칙 설정</h2>
        <Link href="/measurement-rules/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            새 치수 규칙 추가
          </Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>규칙 이름</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>소매 유형</TableHead>
              <TableHead>측정 항목 수</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {measurementRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  치수 규칙이 없습니다. 새 치수 규칙을 추가해주세요.
                </TableCell>
              </TableRow>
            ) : (
              measurementRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{getCategoryName(rule.categoryId)}</TableCell>
                  <TableCell>{rule.sleeveType || "-"}</TableCell>
                  <TableCell>{rule.items.length}개</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewRule(rule)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link href={`/measurement-rules/${rule.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Dialog open={isDeleteDialogOpen && deleteRuleId === rule.id} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setDeleteRuleId(rule.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>치수 규칙 삭제</DialogTitle>
                            <DialogDescription>
                              '{ruleToDelete?.name}' 치수 규칙을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 이 규칙을 사용하는 템플릿에 영향을 줄 수 있습니다.
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
                              onClick={handleDeleteRule}
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

      {/* Rule Details Dialog */}
      {viewRule && (
        <Dialog open={!!viewRule} onOpenChange={(open) => !open && setViewRule(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{viewRule.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">기본 정보</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">카테고리</p>
                    <p>{getCategoryName(viewRule.categoryId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">소매 유형</p>
                    <p>{viewRule.sleeveType || "-"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium">측정 항목</h3>
                <ul className="grid grid-cols-2 gap-2 mt-2">
                  {viewRule.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Link href={`/measurement-rules/${viewRule.id}`}>
                <Button>수정</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
