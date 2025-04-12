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
  measurementRules,
  getMeasurementItemById,
  getMeasurementRuleById
} from "@/lib/data";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

interface TemplateFormProps {
  template?: Template;
  initialRuleData?: Partial<Template>;
  onSubmit: (data: Template) => void;
}

export function TemplateForm({ template, initialRuleData, onSubmit }: TemplateFormProps) {
  // Form setup - initialRuleData 처리
  const form = useForm<Template>({
    defaultValues: template || {
      id: "",
      name: "",
      toolType: "대바늘",
      patternType: "서술형",
      publishStatus: "공개",
      thumbnail: "",
      lastModified: new Date().toISOString().split('T')[0],
      categoryIds: [],
      constructionMethods: [],
      measurementItems: initialRuleData?.measurementItems || [],
      sleeveType: initialRuleData?.sleeveType,
      measurementRuleId: initialRuleData?.measurementRuleId ? String(initialRuleData.measurementRuleId) : undefined
    },
  });

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

  // 조건부 UI 표시를 위한 상태들
  const [showConstructionFields, setShowConstructionFields] = useState(false); // 제작 방식
  const [showSleeveFields, setShowSleeveFields] = useState(false); // 소매 유형, 넥라인
  const [showChartFields, setShowChartFields] = useState(false); // 차트 유형
  const [selectedSleeveType, setSelectedSleeveType] = useState<SleeveType | undefined>(template?.sleeveType);
  const [selectedPatternType, setSelectedPatternType] = useState<PatternType>(template?.patternType || '서술형');
  const [ruleValidationError, setRuleValidationError] = useState<string | null>(null);

  const [selectedRule, setSelectedRule] = useState<string | undefined>(
    template?.measurementRuleId ? String(template.measurementRuleId) :
    initialRuleData?.measurementRuleId ? String(initialRuleData.measurementRuleId) : undefined
  );

  console.log("Form initialization with:", {
    template,
    initialRuleData,
    selectedRule,
    measurementItems: initialRuleData?.measurementItems || []
  });

  const level1Categories = categories.filter(cat => cat.parent_id === null);
  const level2Categories = level1Categories
    .find(cat => cat.id === selectedCategory.level1)?.children || [];
  const level3Categories = level2Categories
    .find(cat => cat.id === selectedCategory.level2)?.children || [];

  // initialRuleData 처리 - 단순화된 버전
  useEffect(() => {
    if (initialRuleData?.measurementRuleId) {
      console.log(`Setting measurementRuleId in form: ${initialRuleData.measurementRuleId}`);

      // 폼에 값 설정
      form.setValue('measurementRuleId', String(initialRuleData.measurementRuleId), {
        shouldValidate: true,
        shouldDirty: true
      });

      // 측정 항목 설정
      if (initialRuleData.measurementItems?.length > 0) {
        form.setValue('measurementItems', initialRuleData.measurementItems);
        console.log(`Set ${initialRuleData.measurementItems.length} measurement items`);
      }

      // 소매 유형 설정
      if (initialRuleData.sleeveType) {
        setSelectedSleeveType(initialRuleData.sleeveType);
        form.setValue('sleeveType', initialRuleData.sleeveType);
      }

      // 치수 규칙에서 카테고리 정보 추출
      const rule = measurementRules.find(
        r => String(r.id) === String(initialRuleData.measurementRuleId)
      );

      if (rule) {
        console.log(`Found rule: ${rule.name}, categoryId: ${rule.categoryId}`);

        // 카테고리 ID가 103(스웨터) 또는 104(가디건)인 경우 소매/넥라인 필드 활성화
        if (rule.categoryId === 103 || rule.categoryId === 104) {
          setShowSleeveFields(true);
          console.log("Activating sleeve fields for sweater/cardigan");
        }

        // 소매 유형이 있는 경우 제작 방식 필드 활성화 (상의로 간주)
        if (rule.sleeveType) {
          setShowConstructionFields(true);
          console.log("Activating construction fields for tops with sleeves");
        }

        // 카테고리 정보 설정
        if (rule.categoryId) {
          const category = getCategoryById(rule.categoryId);
          if (category) {
            const parentCategory = category.parent_id ? getCategoryById(category.parent_id) : null;
            const grandParentCategory = parentCategory?.parent_id ? getCategoryById(parentCategory.parent_id) : null;

            setSelectedCategory({
              level1: grandParentCategory?.id || null,
              level2: parentCategory?.id || null,
              level3: category.id
            });

            // 카테고리 ID를 폼에 설정
            const categoryIds = [
              grandParentCategory?.id,
              parentCategory?.id,
              category.id
            ].filter((id): id is number => id !== null);

            form.setValue('categoryIds', categoryIds);

            // 상의(10)인 경우 제작 방식 필드 활성화
            if (parentCategory?.id === 10) { // 10은 상의 카테고리 ID
              setShowConstructionFields(true);
              console.log("Activating construction fields for tops category");
            }
          }
        }
      }
    }
  }, [initialRuleData, form]);

  // Hidden field 등록
  useEffect(() => {
    form.register('measurementRuleId');
  }, [form]);

  useEffect(() => {
    // 조건부 필드 표시 로직
    // 조건 1: 대바늘 && 상의 -> 제작 방식 활성화
    const isKnittingTops =
      selectedToolType === '대바늘' &&
      selectedCategory.level2 === 10; // 10 = 상의 카테고리

    // 조건 2: 카테고리 중분류가 스웨터, 가디건 -> 넥라인, 소매 유형 활성화
    const isSweatersOrCardigans =
      selectedCategory.level3 === 103 || // 103 = 스웨터
      selectedCategory.level3 === 104;   // 104 = 가디건

    // 치수 규칙에서 가져온 카테고리 정보도 확인
    if (isKnittingTops) {
      setShowConstructionFields(true);
    }

    if (isSweatersOrCardigans) {
      setShowSleeveFields(true);
    }

    // 조건 3: 차트형 또는 혼합형 패턴 -> 차트 유형 활성화
    const chartBasedPattern =
      selectedPatternType === '차트형' ||
      selectedPatternType === '혼합형';

    setShowChartFields(chartBasedPattern);

    // 필드가 비활성화될 때 값 초기화
    if (!showConstructionFields && !isKnittingTops) {
      form.setValue('constructionMethods', []);
    }

    if (!showSleeveFields && !isSweatersOrCardigans) {
      form.setValue('sleeveType', undefined);
      form.setValue('necklineType', undefined);
      setSelectedSleeveType(undefined);
    }

    if (!chartBasedPattern) {
      form.setValue('chartTypeIds', []);
    }
  }, [selectedToolType, selectedCategory, selectedPatternType, showConstructionFields, showSleeveFields, form]);

  useEffect(() => {
    if (selectedSleeveType && selectedCategory.level3) {
      const measurementRule = findMeasurementRule(selectedCategory.level3, selectedSleeveType);

      if (!measurementRule) {
        setRuleValidationError(
          "선택한 카테고리와 소매 유형에 대한 치수 규칙이 등록되어 있지 않습니다. 먼저 [치수 규칙 설정] 메뉴에서 등록해주세요."
        );
      } else {
        setRuleValidationError(null);
        form.setValue('measurementRuleId', measurementRule.id);
        form.setValue('measurementItems', measurementRule.items);
      }
    } else {
      setRuleValidationError(null);
    }
  }, [selectedSleeveType, selectedCategory.level3, form]);

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

    if (level === 'level3' && selectedSleeveType) {
      const measurementRule = findMeasurementRule(numValue, selectedSleeveType);
      if (!measurementRule) {
        setRuleValidationError(
          "선택한 카테고리와 소매 유형에 대한 치수 규칙이 등록되어 있지 않습니다. 먼저 [치수 규칙 설정] 메뉴에서 등록해주세요."
        );
      } else {
        setRuleValidationError(null);
        form.setValue('measurementRuleId', measurementRule.id);
      }
    }
  };

  const handleSleeveTypeChange = (value: SleeveType) => {
    setSelectedSleeveType(value);
    form.setValue('sleeveType', value);

    if (selectedCategory.level3) {
      const measurementRule = findMeasurementRule(selectedCategory.level3, value);
      if (!measurementRule) {
        setRuleValidationError(
          "선택한 카테고리와 소매 유형에 대한 치수 규칙이 등록되어 있지 않습니다. 먼저 [치수 규칙 설정] 메뉴에서 등록해주세요."
        );
      } else {
        setRuleValidationError(null);
        form.setValue('measurementRuleId', measurementRule.id);
      }
    }
  };

  const handleSubmit = (data: Template) => {
    console.log("[TemplateForm] Form submission initiated:", data);

    // measurementRuleId 확인
    if (!data.measurementRuleId) {
      console.error("[TemplateForm] No measurementRuleId in form data");
      alert("치수 규칙이 선택되지 않았습니다. 치수 규칙은 필수 항목입니다.");
      return;
    }

    // ID 정규화
    data.measurementRuleId = String(data.measurementRuleId).trim();
    console.log(`[TemplateForm] Using normalized measurementRuleId: "${data.measurementRuleId}"`);

    // 카테고리 IDs 구성
    const categoryIds = [
      selectedCategory.level1,
      selectedCategory.level2,
      selectedCategory.level3
    ].filter((id): id is number => id !== null);

    // 유효성 검사 오류 확인
    if (ruleValidationError) {
      console.error("[TemplateForm] Validation error:", ruleValidationError);
      return;
    }

    // 최종 템플릿 데이터 생성
    const updatedTemplate: Template = {
      ...data,
      categoryIds,
      chartTypeId: data.chartTypeId === 'none' ? undefined : data.chartTypeId,
      lastModified: new Date().toISOString().split('T')[0]
    };

    console.log("[TemplateForm] Submitting final template data:", updatedTemplate);
    onSubmit(updatedTemplate);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
                    onValueChange={(value) => {
                      field.onChange(value as PatternType);
                      setSelectedPatternType(value as PatternType);

                      // 차트 관련 필드 표시 로직 실행
                      const chartBasedPattern =
                        value === '차트형' ||
                        value === '혼합형';

                      setShowChartFields(chartBasedPattern);

                      // 차트 유형이 선택되지 않았을 때 값 초기화
                      if (!chartBasedPattern) {
                        form.setValue('chartTypeIds', []);
                      }
                    }}
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

            {/* 카테고리 정보 표시 (선택 불가) */}
            {form.getValues('measurementRuleId') && selectedCategory.level3 && (
              <div>
                <FormLabel>카테고리</FormLabel>
                <div className="p-3 bg-gray-50 rounded-md border text-sm mt-1">
                  {selectedCategory.level1 && getCategoryById(selectedCategory.level1)?.name}
                  {selectedCategory.level2 && ` > ${getCategoryById(selectedCategory.level2)?.name}`}
                  {selectedCategory.level3 && ` > ${getCategoryById(selectedCategory.level3)?.name}`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  카테고리는 선택한 치수 규칙에 따라 자동으로 설정됩니다.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: 조건부 속성 입력 */}
        {showConstructionFields && (
          <Card>
            <CardHeader>
              <CardTitle>상의 제작 방식</CardTitle>
              <CardDescription>상의 템플릿의 제작 방식을 선택해주세요.</CardDescription>
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
            </CardContent>
          </Card>
        )}

        {/* 소매 및 넥라인 설정 */}
        {showSleeveFields && (
          <Card>
            <CardHeader>
              <CardTitle>상의 세부 속성</CardTitle>
              <CardDescription>소매 유형과 넥라인을 선택해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sleeve Type */}
              <FormField
                control={form.control}
                name="sleeveType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>소매 유형</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        setSelectedSleeveType(value as SleeveType);
                        field.onChange(value as SleeveType);
                      }}
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

        {/* 차트 유형 */}
        {showChartFields && (
          <Card>
            <CardHeader>
              <CardTitle>차트 유형 설정</CardTitle>
              <CardDescription>필요한 차트 유형을 선택해주세요.</CardDescription>
            </CardHeader>
            <CardContent>
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
        )}

        <Card>
          <CardHeader>
            <CardTitle>템플릿 세부 정보</CardTitle>
            <CardDescription>측정 항목과 차트 유형을 설정해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <FormLabel>측정 항목</FormLabel>

              {/* 중요: 치수 규칙 ID를 hidden input으로 추가 */}
              <input
                type="hidden"
                {...form.register('measurementRuleId')}
              />

              <div className="mt-2">
                {form.getValues('measurementRuleId') ? (
                  <div className="p-4 border border-blue-100 bg-blue-50 rounded-md text-blue-800">
                    <div className="flex items-center gap-2 font-medium">
                      <Info className="h-4 w-4" />
                      <span>자동 설정된 측정 항목 (규칙 ID: {form.getValues('measurementRuleId')})</span>
                    </div>
                    <p className="mt-1 text-sm pl-6">
                      치수 규칙에 따라 측정 항목이 자동으로 설정되었습니다.
                      <br />
                      템플릿 저장 이후 각 사이즈별 치수를 설정할 수 있습니다.
                    </p>
                    {form.getValues('measurementItems')?.length > 0 && (
                      <div className="mt-2 pl-6 text-sm">
                        <strong>설정된 항목 ({form.getValues('measurementItems').length}개):</strong> {form.getValues('measurementItems').map(itemId => {
                          const item = getMeasurementItemById(itemId);
                          return item ? item.name : itemId;
                        }).join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
                    <div className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4" />
                      <span>치수 규칙 필요</span>
                    </div>
                    <p className="mt-1 text-sm pl-6">
                      치수 규칙이 설정되지 않았습니다. 치수 규칙은 필수 항목입니다.
                      <br />
                      템플릿을 생성하려면 먼저 치수 규칙 페이지에서 템플릿 생성 버튼을 클릭하세요.
                    </p>
                  </div>
                )}
              </div>
            </div>

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

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button">취소</Button>
          <Button
            type="submit"
            disabled={!!ruleValidationError || !form.watch('measurementRuleId')}
          >
            저장
          </Button>
        </div>
      </form>
    </Form>
  );
}
