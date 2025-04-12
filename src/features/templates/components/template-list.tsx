"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { templates, Template, getCategoryById, chartTypes as chartTypesList } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Assuming Badge component is imported

export function TemplateList() {
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const templateToDelete = templates.find(t => t.id === deleteTemplateId);

  // 템플릿 삭제 처리
  const handleDeleteTemplate = () => {
    if (!deleteTemplateId) return;

    // 실제 구현에서는 API 호출로 서버에서 삭제
    const index = templates.findIndex(t => t.id === deleteTemplateId);
    if (index !== -1) {
      templates.splice(index, 1);
      setDeleteTemplateId(null);
      // 서버 업데이트를 위해 페이지 새로고침 (실제 구현 시 SWR 또는 React Query로 대체)
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">템플릿 관리</h2>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-800 flex items-center gap-2 text-lg">
            <Info className="h-5 w-5" />
            기획 의도 및 개발 지침
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700 space-y-2 text-sm">
          <p>
            <strong>기능 개요:</strong> 템플릿 관리 페이지는 니트/뜨개 도안 템플릿을 조회하고 관리하는 페이지입니다.
            각 템플릿은 특정 치수 규칙과 연결되어 있으며, 자동으로 계산된 템플릿명, 도구 유형, 차트 유형 등의 정보를 표시합니다.
          </p>
          <p>
            <strong>주요 워크플로우:</strong>
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>치수 규칙 설정 메뉴에서 규칙을 선택하고 새 템플릿 추가 버튼으로 템플릿 생성</li>
            <li>템플릿명은 카테고리, 제작 방식, 넥라인, 소매 유형 등을 조합하여 자동 생성</li>
            <li>템플릿 상세 페이지에서 세부 치수 정보 입력 및 관리</li>
            <li>템플릿 목록에서 수정 및 삭제 기능으로 템플릿 관리</li>
          </ol>
          <p>
            <strong>개발 참고사항:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>템플릿 생성 시 필요한 조건부 입력 필드는 다음과 같이 구현:</li>
            <ul className="list-disc pl-5 mt-1">
              <li>대바늘 + 상의: 제작 방식(탑다운, 바텀업 등) 입력 활성화</li>
              <li>스웨터/가디건: 소매 유형, 넥라인 유형 입력 활성화</li>
              <li>차트형/혼합형 패턴: 차트 유형 선택 활성화</li>
            </ul>
            <li>치수 규칙의 카테고리와 소매 유형에 따라 추가 입력 항목이 표시됨</li>
            <li>템플릿명은 조건부 필드 값을 조합하여 자동 생성됨 (수동 입력 필요 없음)</li>
            <li>템플릿 세부 치수는 사이즈 범위별로 엑셀 형식의 표에서 관리</li>
            <li>치수 규칙에 따라 카테고리는 자동으로 설정되며 사용자가 변경할 수 없음</li>
          </ul>
          <p className="mt-3 bg-blue-50 p-2 rounded text-blue-800">
            <Info className="h-4 w-4 inline-block mr-1" /> <strong>UI 팁:</strong> 템플릿 생성 시 입력한 값에 따라 템플릿명이 자동으로 생성되며, 세부 치수는 엑셀에서 값을 복사하여 한번에 붙여넣기할 수 있습니다.
          </p>
        </CardContent>
      </Card>

      <Alert variant="info" className="bg-blue-50 text-blue-800 border-blue-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          새로운 템플릿을 추가하려면 [치수 규칙 설정] 메뉴에서 규칙을 선택한 후 템플릿을 생성해주세요.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end">
        <Link href="/templates/new">
          <Button size="lg">
            새 템플릿 추가
          </Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">템플릿명</TableHead>
              <TableHead className="w-1/6">도구 유형</TableHead>
              <TableHead className="w-1/6">차트 유형</TableHead>
              <TableHead className="w-1/6">게시 상태</TableHead>
              <TableHead className="text-center w-1/6">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  템플릿이 없습니다. 새 템플릿 추가 버튼을 클릭하여 템플릿을 생성해주세요.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => {
                // 템플릿명 자동 생성 (도구유형 제외)
                const category = getCategoryById(template.categoryIds[2]);
                const formatOptions = [];

                // 제작 방식 (있는 경우만)
                if (template.constructionMethods && template.constructionMethods.length > 0) {
                  formatOptions.push(template.constructionMethods[0]);
                }

                // 넥라인 (있는 경우만)
                if (template.necklineType) {
                  formatOptions.push(template.necklineType);
                }

                // 소매 유형 (있는 경우만)
                if (template.sleeveType) {
                  formatOptions.push(template.sleeveType);
                }

                // 카테고리 소분류
                if (category) {
                  formatOptions.push(category.name);
                }

                // 완성된 템플릿명
                const formattedName = formatOptions.join(' ');

                // 차트 유형 문자열
                const templateChartTypes = template.chartTypeIds?.map(id => {
                  const chart = chartTypesList.find(c => c.id === id);
                  return chart ? chart.name : '';
                }).filter(Boolean).join(', ') || '-';

                return (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{formattedName}</TableCell>
                    <TableCell>{template.toolType}</TableCell>
                    <TableCell>{templateChartTypes}</TableCell>
                    <TableCell>
                      <Badge variant={template.publishStatus === '공개' ? 'default' : 'secondary'}>
                        {template.publishStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Link href={`/templates/${template.id}`}>
                          <Button variant="outline" size="sm">
                            세부 치수 편집
                          </Button>
                        </Link>
                        <Link href={`/templates/${template.id}/edit`}>
                          <Button variant="outline" size="sm">
                            수정
                          </Button>
                        </Link>
                        <Dialog open={deleteTemplateId === template.id} onOpenChange={(open) => open ? setDeleteTemplateId(template.id) : setDeleteTemplateId(null)}>
                          <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              삭제
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>템플릿 삭제</DialogTitle>
                              <DialogDescription>
                                정말로 이 템플릿을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">취소</Button>
                              </DialogClose>
                              <Button variant="destructive" onClick={handleDeleteTemplate}>
                                삭제
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Alert variant="info" className="bg-blue-50 border-blue-200 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p><strong>샘플 데이터 안내:</strong> 현재 보이는 데이터는 예시용입니다. 실제 구현 시 백엔드 API와 연동하여 실제 데이터를 표시해야 합니다.</p>
          <p className="mt-1"><strong>데이터 모델 참고:</strong> 각 템플릿은 measurementRuleId 필드를 통해 치수 규칙과 연결됩니다.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
