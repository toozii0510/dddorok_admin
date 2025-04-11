import { templates } from "@/lib/data";
import { notFound } from "next/navigation";
import TemplateDetailClient from "./template-detail-client";

// Generate static parameters for all template IDs
export async function generateStaticParams() {
  return templates.map(template => ({
    id: template.id,
  }));
}

export default function TemplatePage({ params }: { params: { id: string } }) {
  // Find template by ID
  const template = templates.find((t) => t.id === params.id);

  if (!template) {
    notFound();
  }

  return <TemplateDetailClient template={template} />;
}
