"use client";

import { useState } from "react";
import { templates, type Template } from "@/lib/data";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TemplateForm } from "@/features/templates/components/template-form"; // Updated import path
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SizeDetailForm } from "@/components/templates/size-detail-form";

interface EditTemplateClientProps {
  template: Template;
}

export default function EditTemplateClient({ template }: EditTemplateClientProps) {
  const router = useRouter();

  // 기본 정보 업데이트 처리
  const handleUpdateTemplate = (updatedTemplate: Template) => {
    // 실제 구현에서는 API 호출로 서버에 저장
    const index = templates.findIndex(t => t.id === updatedTemplate.id);
    if (index !== -1) {
      templates[index] = updatedTemplate;
      alert('템플릿이 수정되었습니다.');
      router.refresh();
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{template.name} 수정</h1>
        <Button asChild variant="outline">
          <Link href={`/templates/${template.id}`}>상세보기로 돌아가기</Link>
        </Button>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="mb-4">
          <TabsTrigger value="info">기본 정보</TabsTrigger>
          <TabsTrigger value="size-details">세부 치수 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <TemplateForm template={template} onSubmit={handleUpdateTemplate} />
        </TabsContent>

        <TabsContent value="size-details">
          <SizeDetailForm template={template} onSubmit={handleSaveSizeDetails} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
