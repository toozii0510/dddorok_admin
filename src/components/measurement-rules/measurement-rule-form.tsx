"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type MeasurementRule,
  MEASUREMENT_ITEMS,
  SLEEVE_TYPES,
  flattenedCategories,
  type SleeveType,
  getCategoryById
} from "@/lib/data";

interface MeasurementRuleFormProps {
  rule?: MeasurementRule;
  onSubmit: (data: MeasurementRule) => void;
}

export function MeasurementRuleForm({ rule, onSubmit }: MeasurementRuleFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(rule?.categoryId);
  const [requiresSleeveType, setRequiresSleeveType] = useState<boolean>(!!rule?.sleeveType);
  const [selectedSleeveType, setSelectedSleeveType] = useState<SleeveType | undefined>(rule?.sleeveType);

  // Get all third-level categories (소분류)
  const subcategories = flattenedCategories().filter(cat => {
    const parentCat = cat.parent_id ? flattenedCategories().find(p => p.id === cat.parent_id) : null;
    return parentCat?.parent_id; // Third level has a parent that also has a parent
  });

  // Setup form
  const form = useForm<MeasurementRule>({
    defaultValues: rule || {
      id: "",
      categoryId: 0,
      name: "",
      items: []
    },
  });

  // 카테고리와 소매 유형에 따라 이름 자동 생성
  useEffect(() => {
    if (selectedCategory) {
      const category = getCategoryById(selectedCategory);
      if (category) {
        let autoName = "";

        // 소매 유형이 먼저 오고, 카테고리 소분류가 뒤에 오도록 변경
        if (requiresSleeveType && selectedSleeveType) {
          autoName = `${selectedSleeveType} ${category.name}`;
        } else {
          autoName = category.name;
        }

        // 이름 필드 자동 설정
        form.setValue('name', autoName);
      }
    }
  }, [selectedCategory, requiresSleeveType, selectedSleeveType, form]);

  // Handle form submission
  const handleSubmit = (data: MeasurementRule) => {
    // Add unique ID if it's a new rule
    if (!data.id) {
      data.id = `rule_${Date.now()}`;
    }

    // Remove sleeve type if not required
    if (!requiresSleeveType) {
      data.sleeveType = undefined;
    }

    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>치수 규칙 기본 정보</CardTitle>
            <CardDescription>
              치수 규칙의 기본 정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리 (소분류)</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const categoryId = Number.parseInt(value);
                      field.onChange(categoryId);
                      setSelectedCategory(categoryId);
                    }}
                    defaultValue={field.value ? field.value.toString() : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    소분류 카테고리를 선택하세요
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requireSleeveType"
                checked={requiresSleeveType}
                onCheckedChange={(checked) => setRequiresSleeveType(checked === true)}
              />
              <label
                htmlFor="requireSleeveType"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                소매 유형 필요
              </label>
            </div>

            {requiresSleeveType && (
              <FormField
                control={form.control}
                name="sleeveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>소매 유형</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value as SleeveType);
                        setSelectedSleeveType(value as SleeveType);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="소매 유형을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SLEEVE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>규칙 이름</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly placeholder="자동으로 생성됩니다" />
                  </FormControl>
                  <FormDescription>
                    소매 유형과 카테고리를 선택하면 자동으로 설정됩니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>치수 항목 선택</CardTitle>
            <CardDescription>
              이 규칙에 필요한 치수 항목을 선택해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="items"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {MEASUREMENT_ITEMS.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`item-${item}`}
                          checked={field.value?.includes(item)}
                          onCheckedChange={(checked) => {
                            const currentItems = field.value || [];
                            return checked
                              ? field.onChange([...currentItems, item])
                              : field.onChange(
                                  currentItems.filter((value) => value !== item)
                                );
                          }}
                        />
                        <label
                          htmlFor={`item-${item}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button">취소</Button>
          <Button type="submit">저장</Button>
        </div>
      </form>
    </Form>
  );
}
