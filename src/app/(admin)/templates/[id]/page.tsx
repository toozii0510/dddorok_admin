import { templates } from "@/lib/data";
import { notFound } from "next/navigation";
import TemplateDetailClient from "./template-detail-client";

// Generate static parameters for all template IDs
export async function generateStaticParams() {
  return templates.map(template => ({
    id: template.id,
  }));
}

export default async function TemplatePage({ params }: { params: { id: string } }) {
  // Await the params to fix the error
  const id = await Promise.resolve(params.id);

  // Find template by ID
  const template = templates.find((t) => t.id === id);

  if (!template) {
    notFound();
  }

  return <TemplateDetailClient template={template} />;
}
