"use client";

import { useState } from "react";
import { templates, type Template } from "@/lib/data";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TemplateForm } from "@/features/templates/components/template-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{template.name} 수정</h1>
      </div>

      {/* 탭은 임시로 제거하고 기본 정보만 표시 */}
      <div className="mt-6">
        <TemplateForm template={template} onSubmit={handleUpdateTemplate} />
      </div>
    </div>
  );
}
