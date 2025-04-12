"use client"; 

import React, { useState, useRef, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Stepper, Step } from "@/components/ui/stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Trash2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MeasurementItem, SizeRange } from "@/lib/data";
import { MEASUREMENT_ITEMS, SIZE_RANGES } from "@/lib/data";

// 좌표 시스템 범위 (0 ~ 1000)
const COORD_SCALE = 1000;

// 좌표 타입 (차트 관리자 페이지에서 점을 찍기만 함)
interface Coordinates {
  x: number;
  y: number;
}

// 선(Line) 유형
type LineType = "straight" | "curve";

// 선 연결 정보
interface LineConnection {
  fromIndex: number;
  toIndex: number;
  type: LineType;
  measurementItem?: MeasurementItem;
}

// 최종 저장 데이터 구조 (구조 중첩 없이 단순화)
export interface ChartTypeFormData {
  id: string;
  name: string;
  coordinates: Coordinates[];
  drawOrder: number[];
  lineConnections: LineConnection[];
}

// 폼 기본 타입
interface ChartTypeFormValues {
  id: string;
  name: string;
}

// 컴포넌트 Props
interface ChartTypeFormProps {
  chartType?: any;
  onSubmit: (data: ChartTypeFormData) => void;
}

export function ChartTypeForm({ chartType, onSubmit }: ChartTypeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [patternName, setPatternName] = useState(chartType?.name || "");
  const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
  const [drawOrder, setDrawOrder] = useState<number[]>([]);
  const [lineConnections, setLineConnections] = useState<LineConnection[]>([]);
  const [defaultLineType] = useState<LineType>("straight");
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const form = useForm<ChartTypeFormValues>({
    defaultValues: {
      id: chartType?.id || "",
      name: chartType?.name || "",
    },
  });

  // Stepper 제어 함수
  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // 폼 최종 제출
  const handleFormSubmit = () => {
    const id = form.getValues("id") || crypto.randomUUID();
    const name = patternName || "새 차트";

    const payload: ChartTypeFormData = {
      id,
      name,
      coordinates,
      drawOrder,
      lineConnections
    };
    onSubmit(payload);
  };

  // 관리자가 캔버스에서 클릭 → 좌표 등록 (좌표는 0~1000 범위)
  const addNewCoordinate = (x: number, y: number) => {
    const newCoord: Coordinates = { x, y };
    const newCoords = [...coordinates, newCoord];
    setCoordinates(newCoords);

    const newIndex = newCoords.length - 1;
    if (drawOrder.length > 0) {
      const prevIndex = drawOrder[drawOrder.length - 1];
      setDrawOrder([...drawOrder, newIndex]);
      setLineConnections([...lineConnections, { fromIndex: prevIndex, toIndex: newIndex, type: defaultLineType }]);
    } else {
      setDrawOrder([newIndex]);
    }
  };

  // 캔버스 클릭 → 좌표 추가
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * COORD_SCALE);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * COORD_SCALE);
    addNewCoordinate(x, y);
  };

  // 선택된 좌표 삭제
  const removeCoordinate = (index: number) => {
    const newCoords = [...coordinates];
    newCoords.splice(index, 1);
    setCoordinates(newCoords);

    const newDrawOrder = drawOrder
      .filter((i) => i !== index)
      .map((i) => (i > index ? i - 1 : i));
    setDrawOrder(newDrawOrder);

    const newLineConnections = lineConnections
      .filter((conn) => conn.fromIndex !== index && conn.toIndex !== index)
      .map((conn) => ({
        ...conn,
        fromIndex: conn.fromIndex > index ? conn.fromIndex - 1 : conn.fromIndex,
        toIndex: conn.toIndex > index ? conn.toIndex - 1 : conn.toIndex
      }));
    setLineConnections(newLineConnections);

    if (selectedPoint === index) {
      setSelectedPoint(null);
    }
  };

  // 화면상 좌표(%) 계산 (0~1000 → %)
  const toPercent = (val: number) => (val / COORD_SCALE) * 100;

  return (
    <Form {...form}>
      <Stepper currentStep={currentStep} onStepChange={setCurrentStep} className="mb-8">
        {/* 1단계: 차트 유형 정보 */}
        <Step title="차트 유형 정보" description="차트 이름을 입력하세요.">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">차트 유형 정보</CardTitle>
              <CardDescription className="text-sm mt-1">
                <strong>명확한 차트 이름</strong>을 설정해 주세요.
                <br />
                상의류: "넥라인 + 제작방식 + 부위명" 방식으로 작성
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>차트 이름</FormLabel>
                    <FormControl>
                      <input
                        {...field}
                        type="text"
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                        placeholder="예: 라운드넥 탑다운 앞몸판"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          field.onChange(e);
                          setPatternName(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Alert variant="default" className="bg-gray-50 mt-2">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold">안내</AlertTitle>
                <AlertDescription className="text-sm text-gray-600">
                  여러 차트 유형(앞/뒤/소매)을 각각 등록하거나, 다른 제품(비의류)도 동일한 방식으로 추가할 수 있습니다.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          <div className="flex justify-end mt-6 space-x-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              취소
            </Button>
            <Button onClick={handleNext}>다음 단계</Button>
          </div>
        </Step>

        {/* 2단계: 가이드라인 설정 */}
        <Step title="가이드라인 설정" description="캔버스를 클릭하여 점을 등록하세요.">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">가이드라인 설정</CardTitle>
              <CardDescription className="text-sm mt-1">
                아래 캔버스를 클릭하면 좌표(점)가 추가되고, 찍힌 순서대로 선이 자동으로 연결됩니다.
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* 캔버스 영역 */}
              <div
                ref={canvasRef}
                className="relative w-full min-h-[800px] border bg-white cursor-crosshair"
                onClick={handleCanvasClick}
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #ddd 1px, transparent 1px), linear-gradient(to bottom, #ddd 1px, transparent 1px)',
                  backgroundSize: "50px 50px"
                }}
              >
                {coordinates.map((coord, idx) => (
                  <div
                    key={`point-${idx}`}
                    className="absolute w-3 h-3 rounded-full bg-blue-500 hover:bg-blue-600 cursor-pointer"
                    style={{
                      left: `${toPercent(coord.x)}%`,
                      top: `${toPercent(coord.y)}%`,
                      transform: "translate(-50%, -50%)"
                    }}
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.stopPropagation();
                      setSelectedPoint(idx);
                    }}
                  >
                    <span className="absolute text-xs bg-white border rounded px-1 -mt-6 whitespace-nowrap">
                      {idx + 1}: ({coord.x}, {coord.y})
                    </span>
                  </div>
                ))}

                {/* 선(연결선) 렌더링 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {lineConnections.map((conn, i) => {
                    const fromCoord = coordinates[conn.fromIndex];
                    const toCoord = coordinates[conn.toIndex];
                    if (!fromCoord || !toCoord) return null;
                    return (
                      <line
                        key={`conn-${i}`}
                        x1={`${toPercent(fromCoord.x)}%`}
                        y1={`${toPercent(fromCoord.y)}%`}
                        x2={`${toPercent(toCoord.x)}%`}
                        y2={`${toPercent(toCoord.y)}%`}
                        stroke={conn.measurementItem ? "#4F46E5" : "#999"}
                        strokeWidth={2}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* 선택된 좌표 삭제 버튼 */}
              {selectedPoint !== null && (
                <div className="flex justify-end mt-4">
                  <Button variant="destructive" onClick={() => removeCoordinate(selectedPoint)}>
                    선택된 점 삭제
                  </Button>
                </div>
              )}

              {/* 좌표 목록 */}
              <div className="border p-3 rounded mt-6">
                <h4 className="font-medium mb-2">좌표 목록</h4>
                {coordinates.length === 0 ? (
                  <div className="text-sm text-gray-500">점이 없습니다.</div>
                ) : (
                  <ul className="space-y-1 max-h-[150px] overflow-y-auto text-sm">
                    {coordinates.map((coord, idx) => (
                      <li key={`list-${idx}`} className="flex items-center justify-between px-2 py-1 hover:bg-gray-50">
                        <span>
                          점 {idx + 1}: ({coord.x}, {coord.y})
                        </span>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeCoordinate(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end mt-6 space-x-3">
            <Button variant="outline" onClick={handleBack}>
              뒤로가기
            </Button>
            <Button variant="secondary" onClick={() => window.history.back()}>
              취소
            </Button>
            <Button onClick={handleFormSubmit}>
              완료하기
            </Button>
          </div>
        </Step>
      </Stepper>
    </Form>
  );
}
