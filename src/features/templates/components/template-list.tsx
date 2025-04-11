"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { templates, Template, getCategoryById } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { PlusCircle, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";

export function TemplateList() {
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  const templateToDelete = templates.find(t => t.id === deleteTemplateId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">템플릿 관리</h2>
        <Link href="/templates/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            새 템플릿 추가
          </Button>
        </Link>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>템플릿명</TableHead>
              <TableHead>도구 유형</TableHead>
              <TableHead>도안 유형</TableHead>
              <TableHead>게시 상태</TableHead>
              <TableHead>마지막 수정일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  템플릿이 없습니다. 새 템플릿을 추가해주세요.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.toolType}</TableCell>
                  <TableCell>{template.patternType}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${template.publishStatus === '공개' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {template.publishStatus}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(template.lastModified)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/templates/${template.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteTemplateId(template.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>템플릿 삭제</DialogTitle>
                            <DialogDescription>
                              '{templateToDelete?.name}' 템플릿을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">취소</Button>
                            </DialogClose>
                            <Button variant="destructive">
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
    </div>
  );
}
