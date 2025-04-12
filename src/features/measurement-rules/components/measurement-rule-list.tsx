"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  type MeasurementRule,
  measurementRules as originalMeasurementRules,
  getCategoryById,
  templates,
  getMeasurementItemById,
  getMeasurementItemNames
} from "@/lib/data";
import Link from "next/link";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Info, List, Layers, Ban, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function MeasurementRuleList() {
  const [measurementRules, setMeasurementRules] = useState<MeasurementRule[]>(originalMeasurementRules);
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);
  const [viewItemsRule, setViewItemsRule] = useState<MeasurementRule | null>(null);
  const [viewTemplatesRule, setViewTemplatesRule] = useState<MeasurementRule | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const { toast } = useToast();

  const ruleToDelete = measurementRules.find(r => r.id === deleteRuleId);

  // Function to get category name by ID
  const getCategoryName = (categoryId: number) => {
    const category = getCategoryById(categoryId);
    return category ? category.name : "알 수 없음";
  };

  // 해당 규칙을 사용하는 템플릿 개수 계산
  const getTemplateCount = (ruleId: string) => {
    return templates.filter(template => template.measurementRuleId === ruleId).length;
  };

  // 해당 규칙을 사용하는 템플릿 목록 가져오기
  const getTemplatesByRuleId = (ruleId: string) => {
    return templates.filter(template => template.measurementRuleId === ruleId);
  };

  // 삭제 가능 여부 확인
  const canDeleteRule = (ruleId: string) => {
    return getTemplateCount(ruleId) === 0;
  };

  // 삭제 버튼 클릭 핸들러
  const handleDeleteClick = (ruleId: string) => {
    setDeleteRuleId(ruleId);

    // 삭제 가능 여부 확인 후 적절한 다이얼로그 표시
    if (canDeleteRule(ruleId)) {
      setIsDeleteDialogOpen(true);
    } else {
      setIsErrorDialogOpen(true);
    }
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">치수 규칙 설정</h2>
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
            <strong>기능 개요:</strong> 치수 규칙 설정은 의류 템플릿 생성의 기본이 되는 측정 규칙을 정의하는 페이지입니다.
            각 의류 유형과 소매 유형별로 필요한 측정 항목들을 미리 정의하여 템플릿 생성 시 활용합니다.
          </p>
          <p>
            <strong>주요 워크플로우:</strong>
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>사용자는 대-중-소 카테고리를 선택하여 의류 유형을 지정</li>
            <li>필요시 소매 유형을 선택</li>
            <li>측정해야 할 항목들을 선택(어깨너비, 가슴너비 등)</li>
            <li>생성된 치수 규칙을 기반으로 템플릿 생성 가능</li>
          </ol>
          <p>
            <strong>개발 참고사항:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>데이터 처리:</strong> 실제 구현 시 카테고리 정보와 측정 항목은 API를 통해 동적으로 로드되어야 함</li>
            <li><strong>카테고리별 항목 분류:</strong> 측정 항목은 카테고리(상의/하의/마감 등)와 세부 섹션(몸통/소매/목 등)으로 구분하여 제공해야 함</li>
            <li><strong>관계 모델링:</strong> 치수 규칙과 템플릿 간 1:N 관계 유지 필요</li>
            <li><strong>삭제 제한:</strong> 템플릿에서 사용 중인 치수 규칙은 삭제할 수 없음 (사용 중인 템플릿이 있는 경우 삭제 전 경고 메시지 표시)</li>
            <li><strong>중복 방지 로직:</strong> 동일한 카테고리와 소매 유형의 조합으로 중복 규칙이 생성되지 않도록 방지 로직 구현</li>
          </ul>
          <p className="mt-3 bg-blue-50 p-2 rounded text-blue-800">
            <Info className="h-4 w-4 inline-block mr-1" /> <strong>UI 팁:</strong> 측정 항목 수를 클릭하면 상세 측정 항목 목록을, 템플릿 수를 클릭하면 연결된 템플릿 목록을 확인할 수 있습니다.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Link href="/measurement-rules/new">
          <Button size="lg">
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
              <TableHead>템플릿 수</TableHead>
              <TableHead className="text-center">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {measurementRules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  치수 규칙이 없습니다. 새 치수 규칙을 추가해주세요.
                </TableCell>
              </TableRow>
            ) : (
              measurementRules.map((rule) => {
                const templateCount = getTemplateCount(rule.id);
                const isDeletable = templateCount === 0;

                return (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{getCategoryName(rule.categoryId)}</TableCell>
                    <TableCell>{rule.sleeveType || "-"}</TableCell>

                    {/* 측정 항목 수 클릭 가능 */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-1"
                        onClick={() => setViewItemsRule(rule)}
                      >
                        <List className="h-3 w-3" />
                        {rule.items.length}개
                      </Button>
                    </TableCell>

                    {/* 템플릿 수 클릭 가능 */}
                    <TableCell>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center gap-1"
                        onClick={() => setViewTemplatesRule(rule)}
                        disabled={templateCount === 0}
                      >
                        <Layers className="h-3 w-3" />
                        <Badge variant="outline" className={templateCount === 0 ? "bg-gray-100" : ""}>
                          {templateCount}개
                        </Badge>
                      </Button>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex flex-wrap justify-center gap-2">
                        <Link href={`/measurement-rules/${rule.id}`}>
                          <Button variant="outline" size="sm">
                            규칙 수정
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${isDeletable ? "text-red-500 hover:text-red-700 hover:bg-red-50" : "text-gray-400"}`}
                          onClick={() => handleDeleteClick(rule.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p><strong>샘플 데이터 안내:</strong> 현재 보이는 데이터는 예시용입니다. 실제 구현 시 백엔드 API와 연동하여 실제 데이터를 표시해야 합니다.</p>
          <p className="mt-1"><strong>API 엔드포인트(예시):</strong> GET /api/measurement-rules</p>
        </AlertDescription>
      </Alert>

      {/* 측정 항목 목록 다이얼로그 */}
      {viewItemsRule && (
        <Dialog open={!!viewItemsRule} onOpenChange={(open) => !open && setViewItemsRule(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5 text-blue-600" />
                  <span>"{viewItemsRule.name}" 측정 항목</span>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <h3 className="font-medium mb-2 text-sm text-muted-foreground">측정 항목 목록 ({viewItemsRule.items.length}개)</h3>
              <ul className="grid grid-cols-1 gap-2 mt-1 max-h-80 overflow-y-auto">
                {viewItemsRule.items.map((itemId) => {
                  const item = getMeasurementItemById(itemId);
                  return (
                    <li key={itemId} className="flex items-start gap-2 p-2 rounded hover:bg-gray-50">
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      <div>
                        <div className="font-medium">{item?.name || itemId}</div>
                        {item?.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                        )}
                        {item?.unit && (
                          <div className="text-xs text-blue-600 mt-0.5">단위: {item.unit}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setViewItemsRule(null)}>
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 연결된 템플릿 목록 다이얼로그 */}
      {viewTemplatesRule && (
        <Dialog open={!!viewTemplatesRule} onOpenChange={(open) => !open && setViewTemplatesRule(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-blue-600" />
                  <span>"{viewTemplatesRule.name}" 연결 템플릿</span>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              {(() => {
                const relatedTemplates = getTemplatesByRuleId(viewTemplatesRule.id);

                if (relatedTemplates.length === 0) {
                  return (
                    <div className="text-center p-4 bg-gray-50 rounded">
                      <p className="text-gray-500">연결된 템플릿이 없습니다.</p>
                    </div>
                  );
                }

                return (
                  <>
                    <h3 className="font-medium mb-2 text-sm text-muted-foreground">템플릿 목록 ({relatedTemplates.length}개)</h3>
                    <ul className="divide-y max-h-80 overflow-y-auto">
                      {relatedTemplates.map((template) => (
                        <li key={template.id} className="py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {template.toolType} / {template.patternType}
                              </p>
                            </div>
                            <Link href={`/templates/${template.id}`}>
                              <Button variant="ghost" size="sm">보기</Button>
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })()}
            </div>

            <DialogFooter className="flex justify-between items-center">
              <div>
                {/* 연결된 템플릿이 없는 경우에만 삭제 버튼 표시 */}
                {getTemplatesByRuleId(viewTemplatesRule.id).length === 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setViewTemplatesRule(null);
                      setDeleteRuleId(viewTemplatesRule.id);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    삭제하기
                  </Button>
                )}
              </div>
              <Button variant="outline" onClick={() => setViewTemplatesRule(null)}>
                닫기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>치수 규칙 삭제</DialogTitle>
            <DialogDescription>
              '{ruleToDelete?.name}' 치수 규칙을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

      {/* 삭제 불가능 알림 다이얼로그 */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>삭제 불가</span>
            </DialogTitle>
            <DialogDescription>
              '{ruleToDelete?.name}' 치수 규칙은 현재 템플릿에서 사용 중이므로 삭제할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-3 bg-amber-50 rounded border border-amber-200">
            <div className="text-amber-800 font-medium flex items-center gap-1">
              <Ban className="h-4 w-4" />
              다음 작업이 필요합니다:
            </div>
            <ol className="text-amber-700 list-decimal ml-5 mt-1 text-sm">
              <li>이 규칙을 사용하는 모든 템플릿을 먼저 삭제하세요.</li>
              <li>또는 템플릿을 수정하여 다른 치수 규칙을 사용하도록 변경하세요.</li>
            </ol>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsErrorDialogOpen(false);
                setViewTemplatesRule(ruleToDelete || null);
              }}
            >
              연결된 템플릿 보기
            </Button>
            <Button
              onClick={() => setIsErrorDialogOpen(false)}
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
