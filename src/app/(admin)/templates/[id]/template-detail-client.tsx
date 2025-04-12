"use client";

import { useState } from "react";
import { templates, type Template, getMeasurementItemById, getCategoryById } from "@/lib/data";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SizeDetailForm } from "@/features/templates/components/size-detail-form"; // Updated import path
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

interface TemplateDetailClientProps {
  template: Template;
}

// 자동 템플릿명 생성 함수
function generateTemplateName(template: Template): string {
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
  const category = getCategoryById(template.categoryIds[2]);
  if (category) {
    formatOptions.push(category.name);
  }

  // 완성된 템플릿명 (없으면 기존 이름 사용)
  return formatOptions.length > 0 ? formatOptions.join(' ') : template.name;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{generateTemplateName(template)}</h1>
      </div>

      <SizeDetailForm
        template={template}
        onSubmit={handleSaveSizeDetails}
      />
    </div>
  );
}
