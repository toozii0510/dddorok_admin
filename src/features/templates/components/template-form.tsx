"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type Template,
  type ToolType,
  type PatternType,
  type PublishStatus,
  categories,
  Category,
  flattenedCategories,
  getCategoryById,
  CONSTRUCTION_METHODS,
  SLEEVE_TYPES,
  NECKLINE_TYPES,
  chartTypes,
  ConstructionMethod,
  type SleeveType,
  type NecklineType,
  findMeasurementRule,
  measurementRules
} from "@/lib/data";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TemplateFormProps {
  template?: Template;
  onSubmit: (data: Template) => void;
}

export function TemplateForm({ template, onSubmit }: TemplateFormProps) {
  const [selectedToolType, setSelectedToolType] = useState<ToolType>(template?.toolType || '대바늘');
  const [selectedCategory, setSelectedCategory] = useState<{
    level1: number | null;
    level2: number | null;
    level3: number | null;
  }>({
    level1: template?.categoryIds[0] || null,
    level2: template?.categoryIds[1] || null,
    level3: template?.categoryIds[2] || null,
  });

  const [showConditionalFields, setShowConditionalFields] = useState(false);
  const [selectedSleeveType, setSelectedSleeveType] = useState<SleeveType | undefined>(template?.sleeveType);
  const [ruleValidationError, setRuleValidationError] = useState<string | null>(null);

  // Filter categories for cascading dropdown
  const level1Categories = categories.filter(cat => cat.parent_id === null);
  const level2Categories = level1Categories
    .find(cat => cat.id === selectedCategory.level1)?.children || [];
  const level3Categories = level2Categories
    .find(cat => cat.id === selectedCategory.level2)?.children || [];

  // Form setup
  const form = useForm<Template>({
    defaultValues: template || {
      id: "",
      name: "",
      toolType: "대바늘",
      patternType: "서술형",
      publishStatus: "공개", // 기본값을 공개로 변경
      thumbnail: "",
      lastModified: new Date().toISOString().split('T')[0],
      categoryIds: [],
      constructionMethods: [],
      measurementItems: []
    },
  });

  // Check if we should show conditional fields
  useEffect(() => {
    const isKnittingTops =
      selectedToolType === '대바늘' &&
      selectedCategory.level2 === 10; // 상의 category id

    setShowConditionalFields(isKnittingTops);

    // Reset sleeve type and validation error when conditional fields visibility changes
    if (!isKnittingTops) {
      form.setValue('sleeveType', undefined);
      setSelectedSleeveType(undefined);
      setRuleValidationError(null);
    }
  }, [selectedToolType, selectedCategory, form]);

  // Validate measurement rule existence when sleeve type is selected
  useEffect(() => {
    if (selectedSleeveType && selectedCategory.level3) {
      const measurementRule = findMeasurementRule(selectedCategory.level3, selectedSleeveType);

      if (!measurementRule) {
        setRuleValidationError(
          "선택한 카테고리와 소매 유형에 대한 치수 규칙이 등록되어 있지 않습니다. 먼저 [치수 규칙 설정] 메뉴에서 등록해주세요."
        );
      } else {
        setRuleValidationError(null);
        // Set measurement rule ID
        form.setValue('measurementRuleId', measurementRule.id);
        // Set measurement items automatically from the rule
        form.setValue('measurementItems', measurementRule.items);
      }
    } else {
      setRuleValidationError(null);
    }
  }, [selectedSleeveType, selectedCategory.level3, form]);

  // Handle category selection changes
  const handleCategoryChange = (level: 'level1' | 'level2' | 'level3', value: string) => {
    const numValue = Number.parseInt(value);

    if (level === 'level1') {
      setSelectedCategory({
        level1: numValue,
        level2: null,
        level3: null
      });
    } else if (level === 'level2') {
      setSelectedCategory({
        ...selectedCategory,
        level2: numValue,
        level3: null
      });
    } else {
      setSelectedCategory({
        ...selectedCategory,
        level3: numValue
      });
    }

    // Validate rule again when category changes
    if (level === 'level3' && selectedSleeveType) {
      const measurementRule = findMeasurementRule(numValue, selectedSleeveType);
      if (!measurementRule) {
        setRuleValidationError(
          "선택한 카테고리와 소매 유형에 대한 치수 규칙이 등록되어 있지 않습니다. 먼저 [치수 규칙 설정] 메뉴에서 등록해주세요."
        );
      } else {
        setRuleValidationError(null);
        // Set measurement rule ID
        form.setValue('measurementRuleId', measurementRule.id);
      }
    }
  };

  // Handle sleeve type change
  const handleSleeveTypeChange = (value: SleeveType) => {
    setSelectedSleeveType(value);
    form.setValue('sleeveType', value);

    // Validate rule when sleeve type changes
    if (selectedCategory.level3) {
      const measurementRule = findMeasurementRule(selectedCategory.level3, value);
      if (!measurementRule) {
        setRuleValidationError(
          "선택한 카테고리와 소매 유형에 대한 치수 규칙이 등록되어 있지 않습니다. 먼저 [치수 규칙 설정] 메뉴에서 등록해주세요."
        );
      } else {
        setRuleValidationError(null);
        // Set measurement rule ID
        form.setValue('measurementRuleId', measurementRule.id);
      }
    }
  };

  // Handle form submission
  const handleSubmit = (data: Template) => {
    // Combine the category selections into categoryIds
    const categoryIds = [
      selectedCategory.level1,
      selectedCategory.level2,
      selectedCategory.level3
    ].filter((id): id is number => id !== null);

    // If there's a validation error, prevent submission
    if (ruleValidationError) {
      return;
    }

    // Create updated template
    const updatedTemplate: Template = {
      ...data,
      categoryIds,
      chartTypeId: data.chartTypeId === 'none' ? undefined : data.chartTypeId,
      lastModified: new Date().toISOString().split('T')[0]
    };

    onSubmit(updatedTemplate);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Section 1: 기본 정보 입력 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보 입력</CardTitle>
            <CardDescription>템플릿의 기본 정보를 입력해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>템플릿명</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toolType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>도구 유형</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value as ToolType);
                      setSelectedToolType(value as ToolType);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="도구 유형을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="대바늘">대바늘</SelectItem>
                      <SelectItem value="코바늘">코바늘</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patternType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>도안 유형</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value as PatternType)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="도안 유형을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="서술형">서술형</SelectItem>
                      <SelectItem value="차트형">차트형</SelectItem>
                      <SelectItem value="혼합형">혼합형</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="publishStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>게시 상태</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value as PublishStatus)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="게시 상태를 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="공개">공개</SelectItem>
                      <SelectItem value="비공개">비공개</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Selection */}
            <div className="space-y-4">
              <div>
                <FormLabel>카테고리 선택</FormLabel>
                <FormDescription>대분류, 중분류, 소분류를 순서대로 선택해주세요.</FormDescription>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Select
                    value={selectedCategory.level1?.toString() || ""}
                    onValueChange={(value) => handleCategoryChange('level1', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="대분류" />
                    </SelectTrigger>
                    <SelectContent>
                      {level1Categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={selectedCategory.level2?.toString() || ""}
                    onValueChange={(value) => handleCategoryChange('level2', value)}
                    disabled={!selectedCategory.level1}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="중분류" />
                    </SelectTrigger>
                    <SelectContent>
                      {level2Categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select
                    value={selectedCategory.level3?.toString() || ""}
                    onValueChange={(value) => handleCategoryChange('level3', value)}
                    disabled={!selectedCategory.level2}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="소분류" />
                    </SelectTrigger>
                    <SelectContent>
                      {level3Categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: 조건부 속성 입력 - Only shown when criteria is met */}
        {showConditionalFields && (
          <Card>
            <CardHeader>
              <CardTitle>상의 세부 속성</CardTitle>
              <CardDescription>상의 템플릿에 필요한 세부 속성을 선택해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Construction Methods (Multi-select) */}
              <div>
                <FormLabel>제작 방식 (다중 선택 가능)</FormLabel>
                <FormDescription>적용 가능한 제작 방식을 모두 선택해주세요.</FormDescription>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {CONSTRUCTION_METHODS.map((method) => (
                    <FormField
                      key={method}
                      control={form.control}
                      name="constructionMethods"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={method}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(method)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  return checked
                                    ? field.onChange([...currentValues, method])
                                    : field.onChange(
                                        currentValues.filter(
                                          (value) => value !== method
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {method}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Sleeve Type */}
              <FormField
                control={form.control}
                name="sleeveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>소매 유형</FormLabel>
                    <Select
                      onValueChange={(value) => handleSleeveTypeChange(value as SleeveType)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="소매 유형을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SLEEVE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Display validation error when a sleeve type is selected but no matching rule exists */}
              {ruleValidationError && (
                <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    <span>치수 규칙 오류</span>
                  </div>
                  <p className="mt-1 text-sm pl-6">
                    {ruleValidationError}
                  </p>
                </div>
              )}

              {/* Neckline Type */}
              <FormField
                control={form.control}
                name="necklineType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>넥라인 유형</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value as NecklineType)}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="넥라인 유형을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {NECKLINE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Section 3: 템플릿 세부 정보 입력 */}
        <Card>
          <CardHeader>
            <CardTitle>템플릿 세부 정보</CardTitle>
            <CardDescription>측정 항목과 차트 유형을 설정해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Measurement Items - Display information about automatic assignment */}
            <div>
              <FormLabel>측정 항목</FormLabel>
              <div className="mt-2">
                {form.watch('measurementRuleId') ? (
                  <div className="p-4 border border-blue-100 bg-blue-50 rounded-md text-blue-800">
                    <div className="flex items-center gap-2 font-medium">
                      <Info className="h-4 w-4" />
                      <span>자동 설정된 측정 항목</span>
                    </div>
                    <p className="mt-1 text-sm pl-6">
                      선택한 치수 규칙에 따라 측정 항목이 자동으로 설정되었습니다.
                      <br />
                      템플릿 저장 이후 각 사이즈별 치수를 설정할 수 있습니다.
                    </p>
                    {form.watch('measurementItems')?.length > 0 && (
                      <div className="mt-2 pl-6 text-sm">
                        <strong>설정된 항목:</strong> {form.watch('measurementItems').join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border border-gray-200 bg-gray-50 rounded-md text-gray-600">
                    <p className="text-sm">
                      카테고리와 소매 유형을 선택하면 해당 치수 규칙의 측정 항목이 자동으로 설정됩니다.
                      <br />
                      템플릿 저장 이후 각 사이즈별 치수를 설정할 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chart Type - Multi-select */}
            <FormField
              control={form.control}
              name="chartTypeIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>차트 유형</FormLabel>
                  <FormDescription>
                    차트 유형 관리에 등록된 목록에서 선택할 수 있으며, 다중 선택이 가능합니다.
                  </FormDescription>
                  <div className="space-y-2 mt-2">
                    {chartTypes.map(chartType => (
                      <div key={chartType.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`chart-type-${chartType.id}`}
                          checked={(field.value || []).includes(chartType.id)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            if (checked) {
                              field.onChange([...currentValues, chartType.id]);
                            } else {
                              field.onChange(currentValues.filter(id => id !== chartType.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`chart-type-${chartType.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {chartType.name}
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

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button">취소</Button>
          <Button type="submit" disabled={!!ruleValidationError}>저장</Button>
        </div>
      </form>
    </Form>
  );
}
