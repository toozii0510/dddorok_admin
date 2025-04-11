"use client";

import { useState } from "react";
import { TemplateForm } from "@/features/templates/components/template-form"; // Updated import path
import type { Template } from "@/lib/data";
import { useRouter } from "next/navigation";

export default function NewTemplateClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (data: Template) => {
    setIsSubmitting(true);

    // Here you would typically save the template to your backend
    console.log("Template data to save:", data);

    // Simulate saving with a short delay
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/templates");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">새 템플릿 추가</h1>
        <p className="text-muted-foreground">새로운 템플릿을 생성합니다.</p>
      </div>

      <TemplateForm onSubmit={handleSubmit} />
    </div>
  );
}
