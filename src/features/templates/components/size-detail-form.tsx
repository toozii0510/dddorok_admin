"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  type Template,
  type MeasurementRule,
  type SizeDetail,
  type MeasurementItem,
  type SizeRange,
  SIZE_RANGES,
  measurementRules,
  MEASUREMENT_ITEMS
} from "@/lib/data";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";

interface SizeDetailFormProps {
  template: Template;
  onSubmit: (updatedTemplate: Template) => void;
}

export function SizeDetailForm({ template, onSubmit }: SizeDetailFormProps) {
  const [measurementRule, setMeasurementRule] = useState<MeasurementRule | undefined>();
  const [selectedItems, setSelectedItems] = useState<MeasurementItem[]>([]);
  const [sizeRanges, setSizeRanges] = useState<SizeRange[]>([]);
  const [sizeDetails, setSizeDetails] = useState<Record<SizeRange, Record<MeasurementItem, string>>>({});

  // Process size details table data when measurement rule is available
  useEffect(() => {
    if (template.measurementRuleId) {
      const rule = measurementRules.find(r => r.id === template.measurementRuleId);
      setMeasurementRule(rule);

      if (rule) {
        setSelectedItems(rule.items);

        // 언제나 모든 사이즈 범위 사용 (SIZE_RANGES에서 정의된 모든 범위)
        // SIZE_RANGES 배열은 이미 'min'이 처음에, 'max'가 마지막에 정렬되어 있음
        setSizeRanges(SIZE_RANGES);

        // 기존 사이즈 세부 정보 로드 또는 새 빈 객체 초기화
        const details: Record<SizeRange, Record<MeasurementItem, string>> = {};

        // 모든 사이즈 범위에 대해 빈 데이터 구조 초기화
        for (const size of SIZE_RANGES) {
          details[size] = {};
          for (const item of rule.items) {
            details[size][item] = '';
          }
        }

        // 기존 sizeDetails가 있으면 로드된 빈 구조에 덮어쓰기
        if (template.sizeDetails && template.sizeDetails.length > 0) {
          for (const detail of template.sizeDetails) {
            for (const [item, value] of Object.entries(detail.measurements)) {
              details[detail.sizeRange][item as MeasurementItem] = value.toString();
            }
          }
        }

        setSizeDetails(details);
      }
    }
  }, [template]);

  // 셀 값 변경 처리
  const handleCellChange = (sizeRange: SizeRange, item: MeasurementItem, value: string) => {
    setSizeDetails(prev => ({
      ...prev,
      [sizeRange]: {
        ...prev[sizeRange],
        [item]: value
      }
    }));
  };

  // 폼 제출 처리
  const handleSubmit = () => {
    // sizeDetails 객체를 Template.sizeDetails 배열 형식으로 변환
    const formattedSizeDetails: SizeDetail[] = Object.entries(sizeDetails).map(([size, measurements]) => {
      const measurementObj: Record<MeasurementItem, number> = {} as Record<MeasurementItem, number>;

      for (const [item, value] of Object.entries(measurements)) {
        // 빈 값은 0으로 처리
        measurementObj[item as MeasurementItem] = value ? Number.parseFloat(value) : 0;
      }

      return {
        sizeRange: size as SizeRange,
        measurements: measurementObj
      };
    });

    onSubmit({
      ...template,
      sizeDetails: formattedSizeDetails
    });
  };

  if (!measurementRule) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>오류</AlertTitle>
        <AlertDescription>
          이 템플릿에 연결된 측정 규칙을 찾을 수 없습니다.
          먼저 측정 규칙을 지정해주세요.
        </AlertDescription>
      </Alert>
    );
  }

  // 측정 규칙이 있지만 선택된 항목이 없는 경우 확인
  if (selectedItems.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>알림</AlertTitle>
        <AlertDescription>
          측정 규칙에 선택된 항목이 없습니다.
          먼저 측정 규칙 설정에서 항목을 추가해주세요.
        </AlertDescription>
      </Alert>
    );
  }

  // 사이즈 범위가 설정되지 않은 경우 처리
  if (sizeRanges.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>알림</AlertTitle>
        <AlertDescription>
          사이즈 범위가 설정되지 않았습니다.
        </AlertDescription>
      </Alert>
    );
  }

  // 표시를 위한 정렬된 사이즈 범위 생성
  const displayOrderedSizeRanges = () => {
    // SIZE_RANGES 배열의 순서를 그대로 사용
    // 이미 data.ts 파일에서 '121-129' 다음에 'min', 그 다음에 'max'가 오도록 정렬되어 있음
    return sizeRanges;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>템플릿 세부 치수 입력</CardTitle>
          <CardDescription>
            각 사이즈별 세부 치수를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="mb-3">
              <p className="text-sm text-muted-foreground">
                <strong>min</strong>과 <strong>max</strong>는 사용자가 프로젝트 생성 시 세부 치수를 조정할 수 있는 범위입니다. 보통 1~5cm 내외로 설정합니다.
              </p>
            </div>
            <Table className="border">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[150px] font-bold border">측정 항목</TableHead>
                  {displayOrderedSizeRanges().map((size) => (
                    <TableHead key={size} className="text-center font-bold border">
                      {size}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedItems.map((item) => (
                  <TableRow key={item} className="border">
                    <TableCell className="font-medium border">{item}</TableCell>
                    {displayOrderedSizeRanges().map((size) => (
                      <TableCell
                        key={`${item}-${size}`}
                        className={`p-2 border ${(size === 'min' || size === 'max') ? 'bg-blue-50' : ''}`}
                      >
                        <Input
                          type="number"
                          step="0.1"
                          value={sizeDetails[size]?.[item] || ''}
                          onChange={(e) => handleCellChange(size, item, e.target.value)}
                          className="w-full text-center"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button">취소</Button>
        <Button type="button" onClick={handleSubmit}>저장</Button>
      </div>
    </div>
  );
}
