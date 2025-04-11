"use client";

import { useState } from "react";
import { templates, type Template } from "@/lib/data";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategoryById } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SizeDetailForm } from "@/features/templates/components/size-detail-form"; // Updated import path

interface TemplateDetailClientProps {
  template: Template;
}

export default function TemplateDetailClient({ template }: TemplateDetailClientProps) {
  const router = useRouter();

  // 세부 치수 저장 처리
  const handleSaveSizeDetails = (updatedTemplate: Template) => {
    // 실제 구현에서는 API 호출로 서버에 저장
    const index = templates.findIndex(t => t.id === updatedTemplate.id);
    if (index !== -1) {
      templates[index] = updatedTemplate;
      alert('세부 치수가 저장되었습니다.');
      router.refresh();
    }
  };

  // Process category path
  const categoryPath = template.categoryIds
    .map(id => {
      const cat = getCategoryById(id);
      return cat ? cat.name : '';
    })
    .filter(Boolean).join(' > ');

  // Get other formatted display values
  const constructionMethods = template.constructionMethods?.join(', ') || '없음';
  const measurementItems = template.measurementItems?.join(', ') || '없음';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{template.name}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/templates">목록으로</Link>
          </Button>
          <Button asChild>
            <Link href={`/templates/${template.id}/edit`}>수정</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="mb-4">
          <TabsTrigger value="info">기본 정보</TabsTrigger>
          <TabsTrigger value="size-details">세부 치수 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>템플릿 정보</CardTitle>
              <CardDescription>템플릿 상세 정보를 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">도구 유형</div>
                  <div>{template.toolType}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">도안 유형</div>
                  <div>{template.patternType}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">카테고리</div>
                  <div>{categoryPath}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">게시 상태</div>
                  <div>{template.publishStatus}</div>
                </div>
                {template.sleeveType && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">소매 유형</div>
                    <div>{template.sleeveType}</div>
                  </div>
                )}
                {template.necklineType && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">넥라인 유형</div>
                    <div>{template.necklineType}</div>
                  </div>
                )}
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">제작 방식</div>
                  <div>{constructionMethods}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">측정 항목</div>
                  <div>{measurementItems}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">차트 유형</div>
                  <div>{template.chartTypeId || '없음'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">마지막 수정일</div>
                  <div>{template.lastModified}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="size-details">
          <SizeDetailForm
            template={template}
            onSubmit={handleSaveSizeDetails}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
