"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Info, CheckSquare } from "lucide-react";
import {
  type MeasurementRule,
  SLEEVE_TYPES,
  categories,
  getCategoryById,
  type SleeveType,
  flattenedCategories,
  isDuplicateMeasurementRule,
  measurementItems,
  measurementItemsByCategory,
  measurementItemsBySection,
  getMeasurementItemById
} from "@/lib/data";
import { PlusCircle } from "lucide-react";

interface MeasurementRuleFormProps {
  rule?: MeasurementRule;
  isEdit?: boolean;
  onSubmit: (data: MeasurementRule, createTemplate: boolean) => void;
}

export function MeasurementRuleForm({ rule, isEdit = false, onSubmit }: MeasurementRuleFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<{
    level1: number | null;
    level2: number | null;
    level3: number | null;
  }>({
    level1: null,
    level2: null,
    level3: null
  });
  const [requiresSleeveType, setRequiresSleeveType] = useState<boolean>(!!rule?.sleeveType);
  const [selectedSleeveType, setSelectedSleeveType] = useState<SleeveType | undefined>(rule?.sleeveType);
  const [duplicateError, setDuplicateError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("상의");

  // 대-중-소 카테고리 리스트
  const level1Categories = categories.filter(cat => cat.parent_id === null);
  const level2Categories = level1Categories
    .find(cat => cat.id === selectedCategory.level1)?.children || [];
  const level3Categories = level2Categories
    .find(cat => cat.id === selectedCategory.level2)?.children || [];

  // 측정 항목을 카테고리별로 그룹화
  const groupedItems = measurementItemsByCategory();
  const itemCategories = Object.keys(groupedItems);

  // 측정 항목을 섹션별로 그룹화
  const sectionedItems = measurementItemsBySection();

  // Setup form
  const form = useForm<MeasurementRule>({
    defaultValues: rule || {
      id: "",
      categoryId: 0,
      name: "",
      items: []
    },
  });

  // API 데이터 로딩 시뮬레이션
  useEffect(() => {
    setIsLoading(true);
    // API 호출 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  // Edit mode일 경우 초기 카테고리 설정
  useEffect(() => {
    if (rule?.categoryId) {
      const category = getCategoryById(rule.categoryId);
      if (category) {
        const parentCategory = category.parent_id ? getCategoryById(category.parent_id) : null;
        const grandParentCategory = parentCategory?.parent_id ? getCategoryById(parentCategory.parent_id) : null;

        setSelectedCategory({
          level1: grandParentCategory?.id || null,
          level2: parentCategory?.id || null,
          level3: category.id
        });
      }
    }
  }, [rule]);

  // 카테고리와 소매 유형에 따라 이름 자동 생성
  useEffect(() => {
    if (selectedCategory.level3) {
      const category = getCategoryById(selectedCategory.level3);
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
        // 카테고리 ID 필드 설정
        form.setValue('categoryId', category.id);

        // 카테고리가 변경되면 중복 오류 초기화
        setDuplicateError(false);
      }
    }
  }, [selectedCategory.level3, requiresSleeveType, selectedSleeveType, form]);

  // 소매 유형이 변경될 때도 중복 체크 초기화
  useEffect(() => {
    setDuplicateError(false);
  }, [selectedSleeveType, requiresSleeveType]);

  // 카테고리 선택 변경 처리
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
  };

  // 중복 체크
  const checkForDuplicates = (categoryId: number, sleeveType?: SleeveType): boolean => {
    // 수정 모드에서는 자기 자신을 제외하고 중복 체크
    return isDuplicateMeasurementRule(categoryId, sleeveType, isEdit ? rule?.id : undefined);
  };

  // Handle form submission
  const handleSubmit = (data: MeasurementRule, createTemplate: boolean = false) => {
    // Add unique ID if it's a new rule
    if (!data.id) {
      data.id = `rule_${Date.now()}`;
    }

    // Remove sleeve type if not required
    if (!requiresSleeveType) {
      data.sleeveType = undefined;
    }

    // 중복 체크
    const isDuplicate = checkForDuplicates(data.categoryId, data.sleeveType);
    if (isDuplicate) {
      setDuplicateError(true);
      return;
    }

    onSubmit(data, createTemplate);
  };

  // 측정 항목이 선택되어 있는지 확인
  const isItemSelected = (itemId: string) => {
    return form.getValues().items?.includes(itemId) || false;
  };

  // 아이템 선택 처리
  const handleItemChange = (itemId: string, checked: boolean) => {
    const currentItems = form.getValues().items || [];
    if (checked) {
      form.setValue('items', [...currentItems, itemId]);
    } else {
      form.setValue('items', currentItems.filter(id => id !== itemId));
    }
  };

  // 섹션의 모든 항목 선택/해제
  const handleSectionSelectAll = (category: string, section: string, selected: boolean) => {
    const sectionItems = sectionedItems[category][section];
    const currentItems = form.getValues().items || [];
    let newItems: string[];

    if (selected) {
      // 섹션 항목 모두 추가 (중복 제거)
      const sectionItemIds = sectionItems.map(item => item.id);
      newItems = [...new Set([...currentItems, ...sectionItemIds])];
    } else {
      // 섹션 항목 모두 제거
      const sectionItemIds = sectionItems.map(item => item.id);
      newItems = currentItems.filter(id => !sectionItemIds.includes(id));
    }

    form.setValue('items', newItems);
  };

  // 섹션 항목들이 모두 선택되었는지 확인
  const isSectionFullySelected = (category: string, section: string) => {
    const sectionItems = sectionedItems[category][section];
    const currentItems = form.getValues().items || [];

    return sectionItems.every(item => currentItems.includes(item.id));
  };

  // 섹션 항목들이 일부 선택되었는지 확인
  const isSectionPartiallySelected = (category: string, section: string) => {
    const sectionItems = sectionedItems[category][section];
    const currentItems = form.getValues().items || [];

    const selectedCount = sectionItems.filter(item => currentItems.includes(item.id)).length;
    return selectedCount > 0 && selectedCount < sectionItems.length;
  };

  // 선택된 항목 개수 확인
  const getSelectedItemCount = () => {
    return form.getValues().items?.length || 0;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">측정 항목 로딩 중...</div>;
  }

  return (
    <Form {...form}>
      <form className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>치수 규칙 기본 정보</CardTitle>
            <CardDescription>
              치수 규칙의 기본 정보를 입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 에러 메시지 표시 */}
            {duplicateError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>중복 오류</AlertTitle>
                <AlertDescription>
                  선택한 카테고리와 소매 유형의 조합으로 이미 치수 규칙이 존재합니다. 다른 조합을 선택해주세요.
                </AlertDescription>
              </Alert>
            )}

            {/* 카테고리 선택 */}
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
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>치수 항목 선택</CardTitle>
                <CardDescription>
                  이 규칙에 필요한 치수 항목을 선택해주세요.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                <CheckSquare className="h-4 w-4" />
                <span>선택된 항목: <strong>{getSelectedItemCount()}</strong>개</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200 text-blue-800">
              <Info className="h-4 w-4" />
              <AlertDescription>
                실제 구현 시 측정 항목은 API에서 동적으로 로드됩니다. 카테고리 및 섹션별로 항목이 분류되어 있습니다.
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="items"
              render={() => (
                <FormItem>
                  <Tabs defaultValue="상의" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6 w-full justify-start gap-1 bg-muted/50 p-1">
                      {itemCategories.map(category => (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="px-4 py-1.5"
                        >
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {Object.keys(sectionedItems).map(category => (
                      <TabsContent key={category} value={category} className="mt-0">
                        <div className="space-y-6">
                          {Object.keys(sectionedItems[category]).map(section => {
                            const isFullySelected = isSectionFullySelected(category, section);
                            const isPartiallySelected = isSectionPartiallySelected(category, section);

                            return (
                              <div key={section} className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`section-${category}-${section}`}
                                    checked={isFullySelected}
                                    className={isPartiallySelected ? "opacity-70" : ""}
                                    onCheckedChange={(checked) => handleSectionSelectAll(category, section, !!checked)}
                                  />
                                  <label
                                    htmlFor={`section-${category}-${section}`}
                                    className="font-semibold text-gray-700"
                                  >
                                    {section}
                                  </label>
                                </div>
                                <Separator className="my-2" />
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3 pl-4">
                                  {sectionedItems[category][section].map((item) => (
                                    <div
                                      key={item.id}
                                      className={`flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 ${isItemSelected(item.id) ? 'bg-blue-50/60' : ''}`}
                                    >
                                      <Checkbox
                                        id={`item-${item.id}`}
                                        checked={isItemSelected(item.id)}
                                        onCheckedChange={(checked) => handleItemChange(item.id, !!checked)}
                                        className="mt-0.5"
                                      />
                                      <div>
                                        <label
                                          htmlFor={`item-${item.id}`}
                                          className="font-medium leading-none cursor-pointer"
                                        >
                                          {item.name}
                                        </label>
                                        {/* 단위 표시 부분 제거 */}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => window.history.back()}>취소</Button>
          <Button
            type="button"
            onClick={() => form.handleSubmit((data) => handleSubmit(data, false))()}
          >
            저장
          </Button>
          {!isEdit && (
            <Button
              type="button"
              variant="default"
              onClick={() => form.handleSubmit((data) => handleSubmit(data, true))()}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              저장 후 템플릿 생성
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
