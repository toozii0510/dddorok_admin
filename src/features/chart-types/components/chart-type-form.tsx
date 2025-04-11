"use client";

import { useState, useRef, useMemo, useEffect } from "react"; // 추가된 useEffect
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChartType, MeasurementItem, SizeRange } from "@/lib/data";
import { MEASUREMENT_ITEMS, SIZE_RANGES } from "@/lib/data";
import { Stepper, Step } from "@/components/ui/stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 차트 좌표 유형
interface Coordinates {
  x: number;
  y: number;
  measurementItem?: MeasurementItem; // 인체 치수 항목 추가
}

// 선 유형 정의
type LineType = 'straight' | 'curve';

// 선 연결 정보
interface LineConnection {
  fromIndex: number;
  toIndex: number;
  type: LineType;
  measurementItem?: MeasurementItem; // 측정 항목 추가
}

// 최종 제출 데이터 타입 정의
export interface ChartTypeFormData {
  id: string;
  name: string;
  coordinates: Coordinates[];
  drawOrder: number[];
  lineConnections: LineConnection[];  // 선 연결 정보 추가
  armholeDepth: number | null;
  structure_data: {
    name: string;
    coordinates: Coordinates[];
    drawOrder: number[];
    lineConnections: LineConnection[];  // 선 연결 정보 추가
    armholeDepth: number | null;
  };
}

interface ChartTypeFormProps {
  chartType?: ChartType;
  onSubmit: (data: ChartTypeFormData) => void;
}

// 폼 데이터 타입 정의
interface ChartTypeFormValues {
  id: string;
  name: string;
}

export function ChartTypeForm({ chartType, onSubmit }: ChartTypeFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [patternName, setPatternName] = useState(chartType?.name || "");
  const [coordinates, setCoordinates] = useState<Coordinates[]>([]);
  const [drawOrder, setDrawOrder] = useState<number[]>([]);
  // 선 연결 정보를 저장하는 상태 추가
  const [lineConnections, setLineConnections] = useState<LineConnection[]>([]);
  const [defaultLineType, setDefaultLineType] = useState<LineType>('straight');
  const [armholeDepth, setArmholeDepth] = useState<number | null>(null);
  const [xCoord, setXCoord] = useState<number | undefined>(undefined);
  const [yCoord, setYCoord] = useState<number | undefined>(undefined);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [selectedSizeRange, setSelectedSizeRange] = useState<SizeRange>('74-79'); // 기본 사이즈 범위 추가
  const [isDragging, setIsDragging] = useState<boolean>(false); // 드래그 상태 추가
  const [draggedPoint, setDraggedPoint] = useState<number | null>(null); // 드래그된 점 추가
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number, y: number } | null>(null); // 드래그 시작 위치 추가
  const [controlPoints, setControlPoints] = useState<Record<string, {x: number, y: number}>>({});
  const [draggedControlPoint, setDraggedControlPoint] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 샘플 치수 데이터 (실제로는 API에서 가져오거나 상위 컴포넌트에서 props로 받아와야 함)
  const sampleSizeData = useMemo(() => ({
    '50-53': { '어깨너비': 34.0, '가슴너비': 42.0, '소매 길이': 30.0, '진동길이': 15.0, '목너비': 14.0 },
    '74-79': { '어깨너비': 40.0, '가슴너비': 50.0, '소매 길이': 60.0, '진동길이': 19.0, '목너비': 18.0 },
    '95-99': { '어깨너비': 48.0, '가슴너비': 58.0, '소매 길이': 64.0, '진동길이': 24.0, '목너비': 22.0 },
    'min': { '어깨너비': 32.0, '가슴너비': 40.0, '소매 길이': 28.0, '진동길이': 14.0, '목너비': 13.0 },
    'max': { '어깨너비': 52.0, '가슴너비': 62.0, '소매 길이': 66.0, '진동길이': 26.0, '목너비': 24.0 }
  }), []);

  // 기준 사이즈 (좌표 조정의 기준점)
  const baseSize: SizeRange = '74-79';

  // 연결선의 실제 측정값 계산 함수
  const getMeasurementValue = (connection: LineConnection, sizeRange?: SizeRange): number | null => {
    if (!connection.measurementItem || !sizeRange || !sampleSizeData[sizeRange]) {
      return null;
    }

    return sampleSizeData[sizeRange][connection.measurementItem] || null;
  };

  // 좌표 조정값 계산 함수 개선
  const calculateAdjustedCoordinates = (coord: Coordinates, sizeRange?: SizeRange) => {
    // coord가 undefined인 경우 기본값 반환
    if (!coord) {
      return { adjustedX: 0, adjustedY: 0 };
    }

    // 사이즈가 선택되지 않았으면 원래 좌표 반환
    if (!sizeRange) {
      return { adjustedX: coord.x, adjustedY: coord.y };
    }

    // 측정 항목이 할당된 좌표인지 확인
    const connections = lineConnections.filter(conn =>
      conn.fromIndex === coordinates.indexOf(coord) ||
      conn.toIndex === coordinates.indexOf(coord)
    );

    // 연결된 측정 항목이 없으면 원래 좌표 반환
    if (connections.length === 0 || !connections.some(conn => conn.measurementItem)) {
      return { adjustedX: coord.x, adjustedY: coord.y };
    }

    // 좌표와 관련된 모든 측정 항목을 고려
    let xAdjustment = 0;
    let yAdjustment = 0;
    let xCount = 0;
    let yCount = 0;

    for (const connection of connections) {
      if (!connection.measurementItem) continue;

      // 기준 사이즈와 선택된 사이즈의 측정값
      const baseValue = sampleSizeData[baseSize]?.[connection.measurementItem] || 0;
      const targetValue = sampleSizeData[sizeRange]?.[connection.measurementItem] || 0;

      if (baseValue === 0 || targetValue === 0) continue;

      // 변화 비율 계산
      const ratio = targetValue / baseValue;

      // 가로 방향 측정(너비)인지 세로 방향 측정(길이)인지 확인
      if (connection.measurementItem.includes('너비') || connection.measurementItem.includes('목')) {
        xAdjustment += ratio;
        xCount++;
      } else if (connection.measurementItem.includes('길이') || connection.measurementItem.includes('깊이')) {
        yAdjustment += ratio;
        yCount++;
      } else {
        // 기타 측정의 경우 양방향으로 조정
        xAdjustment += ratio;
        yAdjustment += ratio;
        xCount++;
        yCount++;
      }
    }

    // 평균 조정 비율 계산
    const xRatio = xCount > 0 ? xAdjustment / xCount : 1;
    const yRatio = yCount > 0 ? yAdjustment / yCount : 1;

    // 좌표 조정
    const adjustedX = Math.round(coord.x * xRatio);
    const adjustedY = Math.round(coord.y * yRatio);

    return { adjustedX, adjustedY };
  };

  // 두 점 사이의 거리 계산 함수
  const calculateDistance = (point1: Coordinates, point2: Coordinates): number => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 다음 단계로 이동하는 함수
  const handleNext = () => {
    // 현재 단계를 다음 단계로 이동
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 2));
  };

  // 이전 단계로 이동하는 함수
  const handleBack = () => {
    // 현재 단계를 이전 단계로 이동
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  // 실제 거리 계산 함수 (cm 단위)
  const getActualDistance = (connection: LineConnection): number => {
    const fromCoord = coordinates[connection.fromIndex];
    const toCoord = coordinates[connection.toIndex];

    if (!fromCoord || !toCoord) return 0;

    return calculateDistance(fromCoord, toCoord);
  };

  // 좌표를 그리기 순서에 추가하는 함수
  const selectCoordinate = (index: number) => {
    // 이미 순서에 있는지 확인
    if (drawOrder.includes(index)) return;

    // 순서에 좌표 추가
    const newDrawOrder = [...drawOrder, index];
    setDrawOrder(newDrawOrder);

    // 연결선 추가 (이전에 추가된 점과 연결)
    if (drawOrder.length > 0) {
      const fromIndex = drawOrder[drawOrder.length - 1];
      const toIndex = index;

      setLineConnections([
        ...lineConnections,
        { fromIndex, toIndex, type: defaultLineType }
      ]);
    }
  };

  // 연결선 유형 변경 함수
  const changeLineType = (connectionIndex: number, newType: LineType) => {
    const newConnections = [...lineConnections];
    newConnections[connectionIndex] = {
      ...newConnections[connectionIndex],
      type: newType
    };
    setLineConnections(newConnections);
  };

  // 연결선 측정 항목 업데이트 함수
  const updateConnectionMeasurement = (connectionIndex: number, measurementItem: MeasurementItem | undefined) => {
    const newConnections = [...lineConnections];
    newConnections[connectionIndex] = {
      ...newConnections[connectionIndex],
      measurementItem
    };
    setLineConnections(newConnections);
  };

  // 폼 설정
  const form = useForm<ChartTypeFormValues>({
    defaultValues: {
      id: chartType?.id || "",
      name: chartType?.name || "",
    },
  });

  // 캔버스 클릭 처리 함수
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 좌표 정규화 (0-100 범위로)
    const normalizedX = Math.round(x / rect.width * 100);
    const normalizedY = Math.round(y / rect.height * 100);

    // 좌표 추가
    const newCoordinate = {
      x: normalizedX,
      y: normalizedY
    };

    const newCoordinates = [...coordinates, newCoordinate];
    setCoordinates(newCoordinates);

    // 새로 추가된 좌표의 인덱스
    const newIndex = newCoordinates.length - 1;

    // 새로 추가된 점을 순서에도 자동 추가
    if (drawOrder.length > 0) {
      const fromIndex = drawOrder[drawOrder.length - 1];
      const toIndex = newIndex;

      // 순서에 추가
      setDrawOrder([...drawOrder, newIndex]);

      // 연결선 정보 추가
      setLineConnections([
        ...lineConnections,
        { fromIndex, toIndex, type: defaultLineType }
      ]);
    } else {
      // 첫 점이면 순서에만 추가
      setDrawOrder([newIndex]);
    }
  };

  // 좌표 추가 함수 수정
  const addCoordinate = () => {
    if (xCoord !== undefined && yCoord !== undefined) {
      const newCoordinate = {
        x: xCoord,
        y: yCoord
      };

      const newCoordinates = [...coordinates, newCoordinate];
      setCoordinates(newCoordinates);

      // 새로 추가된 좌표의 인덱스
      const newIndex = newCoordinates.length - 1;

      // 새로 추가된 점을 순서에도 자동 추가
      if (drawOrder.length > 0) {
        const fromIndex = drawOrder[drawOrder.length - 1];
        const toIndex = newIndex;

        // 순서에 추가
        setDrawOrder([...drawOrder, newIndex]);

        // 연결선 정보 추가
        setLineConnections([
          ...lineConnections,
          { fromIndex, toIndex, type: defaultLineType }
        ]);
      } else {
        // 첫 점이면 순서에만 추가
        setDrawOrder([newIndex]);
      }

      setXCoord(undefined);
      setYCoord(undefined);
    }
  };

  // 좌표 삭제 함수 수정
  const removeCoordinate = (index: number) => {
    const newCoordinates = [...coordinates];
    newCoordinates.splice(index, 1);
    setCoordinates(newCoordinates);

    // 그리기 순서에서도 해당 인덱스 제거
    const newDrawOrder = drawOrder.filter(pointIndex => pointIndex !== index);

    // 그리기 순서의 인덱스 조정 (삭제된 인덱스보다 큰 값들을 1씩 감소)
    const adjustedDrawOrder = newDrawOrder.map(pointIndex =>
      pointIndex > index ? pointIndex - 1 : pointIndex
    );
    setDrawOrder(adjustedDrawOrder);

    // 연결선 정보도 업데이트 - 해당 점과 연결된 모든 연결선 제거
    const newLineConnections = lineConnections.filter(conn =>
      conn.fromIndex !== index && conn.toIndex !== index
    );

    // 인덱스 조정
    const adjustedLineConnections = newLineConnections.map(conn => ({
      fromIndex: conn.fromIndex > index ? conn.fromIndex - 1 : conn.fromIndex,
      toIndex: conn.toIndex > index ? conn.toIndex - 1 : conn.toIndex,
      type: conn.type,
      measurementItem: conn.measurementItem
    }));

    setLineConnections(adjustedLineConnections);
  };

  // 연결선 제거 함수
  const removeFromDrawOrder = (index: number) => {
    const newLineConnections = [...lineConnections];
    newLineConnections.splice(index, 1);
    setLineConnections(newLineConnections);
  };

  // 연결선 재정렬 함수
  const reorderConnection = (fromIndex: number, toIndex: number) => {
    const newConnections = [...lineConnections];
    const [movedConnection] = newConnections.splice(fromIndex, 1);
    newConnections.splice(toIndex, 0, movedConnection);
    setLineConnections(newConnections);
  };

  // 연결선 추가 함수
  const addConnectionWithType = (index: number, type: LineType) => {
    const newConnection = {
      fromIndex: drawOrder[drawOrder.length - 1],
      toIndex: index,
      type,
    };
    setLineConnections([...lineConnections, newConnection]);
  };

  // 측정 비교 데이터 가져오기
  const getComparisonData = (connection: LineConnection) => {
    return SIZE_RANGES.filter(size => sampleSizeData[size]).map(size => ({
      size,
      value: getMeasurementValue(connection, size)
    }));
  };

  // 정규화된 측정값 계산 (차트 표시용)
  const getNormalizedMeasurementValue = (connection: LineConnection, sizeRange: SizeRange): number => {
    if (!connection.measurementItem) return 50; // 중간값 반환

    // 최소값, 최대값 찾기
    const minValue = sampleSizeData['min']?.[connection.measurementItem] || 0;
    const maxValue = sampleSizeData['max']?.[connection.measurementItem] || 100;
    const currentValue = sampleSizeData[sizeRange]?.[connection.measurementItem] || 0;

    // 값 범위에 따라 0-100 사이로 정규화
    if (maxValue === minValue) return 50;
    return ((currentValue - minValue) / (maxValue - minValue)) * 100;
  };

  // 측정 텍스트 가져오기
  const getMeasurementText = (connection: LineConnection, sizeRange: SizeRange): string => {
    const value = getMeasurementValue(connection, sizeRange);
    if (value === null) return connection.measurementItem || '';
    return `${connection.measurementItem}: ${value.toFixed(1)}cm`;
  };

  // 드래그 시작 핸들러
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedPoint(index);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragStartPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }

    // 선택된 점도 업데이트
    setSelectedPoint(index);
  };

  // 드래그 중 핸들러
  const handleDrag = (e: MouseEvent) => {
    if (!isDragging || draggedPoint === null || !dragStartPosition || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round((e.clientX - rect.left) / rect.width * 100)));
    const y = Math.max(0, Math.min(100, Math.round((e.clientY - rect.top) / rect.height * 100)));

    // 좌표 업데이트
    const newCoordinates = [...coordinates];
    newCoordinates[draggedPoint] = {
      ...newCoordinates[draggedPoint],
      x,
      y
    };
    setCoordinates(newCoordinates);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedPoint(null);
    setDragStartPosition(null);
    setDraggedControlPoint(null);
  };

  // 컨트롤 포인트 드래그 시작 핸들러
  const handleControlPointDragStart = (e: React.MouseEvent<HTMLDivElement>, connectionId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedControlPoint(connectionId);

    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragStartPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // 컨트롤 포인트 드래그 중 핸들러
  const handleControlPointDrag = (e: MouseEvent) => {
    if (!isDragging || !draggedControlPoint || !dragStartPosition || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round((e.clientX - rect.left) / rect.width * 100)));
    const y = Math.max(0, Math.min(100, Math.round((e.clientY - rect.top) / rect.height * 100)));

    // 컨트롤 포인트 업데이트
    setControlPoints({
      ...controlPoints,
      [draggedControlPoint]: { x, y }
    });
  };

  // 연결선 경로 계산 함수
  const getConnectionPath = (fromCoord: Coordinates, toCoord: Coordinates, connectionId: string, type: LineType): string => {
    if (type === 'straight') {
      return `M ${fromCoord.x} ${fromCoord.y} L ${toCoord.x} ${toCoord.y}`;
    }

    // 곡선의 경우 컨트롤 포인트 사용
    const controlPoint = controlPoints[connectionId];

    // 컨트롤 포인트가 없으면 기본값 생성
    if (!controlPoint) {
      // 중앙 위쪽으로 약간 이동한 기본 컨트롤 포인트
      const midX = (fromCoord.x + toCoord.x) / 2;
      const midY = Math.min(fromCoord.y, toCoord.y) - 20;
      return `M ${fromCoord.x} ${fromCoord.y} Q ${midX} ${midY}, ${toCoord.x} ${toCoord.y}`;
    }

    return `M ${fromCoord.x} ${fromCoord.y} Q ${controlPoint.x} ${controlPoint.y}, ${toCoord.x} ${toCoord.y}`;
  };

  // 마우스 이벤트 리스너 등록
  useEffect(() => {
    if (isDragging) {
      if (draggedControlPoint) {
        window.addEventListener('mousemove', handleControlPointDrag);
      } else if (draggedPoint !== null) {
        window.addEventListener('mousemove', handleDrag);
      }
      window.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mousemove', handleControlPointDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, draggedPoint, draggedControlPoint]);

  // 폼 제출 처리
  const handleFormSubmit = () => {
    const formData: ChartTypeFormData = {
      id: form.getValues().id || crypto.randomUUID(),
      name: patternName,
      coordinates,
      drawOrder,
      lineConnections,
      armholeDepth,
      structure_data: {
        name: patternName,
        coordinates,
        drawOrder,
        lineConnections,
        armholeDepth
      }
    };

    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <Stepper currentStep={currentStep} onStepChange={setCurrentStep}>
          <Step title="차트명 입력" description="차트 유형 기본 정보 입력">
            <Card>
              <CardHeader>
                <CardTitle>차트 유형 기본 정보</CardTitle>
                <CardDescription>차트의 이름과 기본 정보를 입력하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>차트 유형 이름</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="예: 라운드넥 탑다운 앞몸판, 브이넥 셋인 소매 등"
                            onChange={(e) => {
                              field.onChange(e);
                              setPatternName(e.target.value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          의류 차트인 경우 "넥라인 유형+제작 방식+부위명" 형식으로 작성을 권장합니다. (예: 라운드넥 탑다운 앞몸판)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mt-4">
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>안내</AlertTitle>
                    <AlertDescription>
                      각 차트는 독립적인 패턴을 가질 수 있으며, 여러 템플릿에서 재사용할 수 있습니다.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end space-x-4 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                취소
              </Button>
              <Button type="button" onClick={handleNext}>
                다음 단계
              </Button>
            </div>
          </Step>

          <Step title="가이드라인 설정" description="차트의 좌표 및 위치 설정">
            <Card>
              <CardHeader>
                <CardTitle>가이드라인 설정</CardTitle>
                <CardDescription>
                  차트의 좌표 및 위치를 설정하세요. 아래 그리드를 클릭하거나 직접 좌표를 입력하여 점을 추가하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <FormLabel>패턴 영역 좌표 추가</FormLabel>
                    <div className="flex gap-2 flex-wrap">
                      <Input
                        type="number"
                        placeholder="X 좌표"
                        className="w-1/3"
                        min={0}
                        max={100}
                        step={1}
                        value={xCoord ?? ""}
                        onChange={(e) => setXCoord(Number(e.target.value) || undefined)}
                      />
                      <Input
                        type="number"
                        placeholder="Y 좌표"
                        className="w-1/3"
                        min={0}
                        max={100}
                        step={1}
                        value={yCoord ?? ""}
                        onChange={(e) => setYCoord(Number(e.target.value) || undefined)}
                      />
                      <Button
                        type="button"
                        onClick={addCoordinate}
                        disabled={xCoord === undefined || yCoord === undefined}
                      >
                        추가
                      </Button>
                    </div>
                    <FormDescription>
                      X, Y 좌표는 0-100 범위 내에서 입력 가능합니다. 일반적인 의류 사이즈를 고려하여 설정하세요.
                      예를 들어, 어깨너비가 45cm인 경우 X 좌표를 45로 설정하면 됩니다.
                    </FormDescription>
                  </div>

                  <div className="space-y-2">
                    <FormLabel>그리드에서 클릭으로 추가 (0-100 범위)</FormLabel>
                    <FormDescription>
                      의류 패턴을 만들기 위한 표준화된 좌표계로, 어깨, 가슴, 허리, 소매 등의 부위별 사이즈를 cm 단위처럼 표현할 수 있습니다.
                    </FormDescription>
                    <div
                      ref={canvasRef}
                      className="h-64 border rounded-md bg-gray-50 p-2 relative cursor-crosshair"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, #ddd 1px, transparent 1px),
                          linear-gradient(to bottom, #ddd 1px, transparent 1px),
                          linear-gradient(to right, #eee 0.5px, transparent 0.5px),
                          linear-gradient(to bottom, #eee 0.5px, transparent 0.5px)
                        `,
                        backgroundSize: '10% 10%, 10% 10%, 5% 5%, 5% 5%'
                      }}
                      onClick={handleCanvasClick}
                    >
                      {/* 눈금 표시 개선 */}
                      <div className="absolute top-0 left-0 w-full flex justify-between px-2 text-xs text-gray-500">
                        <span>0</span>
                        <span>100cm</span>
                      </div>
                      <div className="absolute top-0 left-0 h-full flex flex-col justify-between py-2 text-xs text-gray-500">
                        <span>0</span>
                        <span>100cm</span>
                      </div>

                      {/* 중간 눈금 표시 */}
                      <div className="absolute top-0 left-1/4 -ml-2 text-xs text-gray-500">25cm</div>
                      <div className="absolute top-0 left-1/2 -ml-2 text-xs text-gray-500">50cm</div>
                      <div className="absolute top-0 left-3/4 -ml-2 text-xs text-gray-500">75cm</div>

                      <div className="absolute top-1/4 left-0 -mt-2 text-xs text-gray-500">25cm</div>
                      <div className="absolute top-1/2 left-0 -mt-2 text-xs text-gray-500">50cm</div>
                      <div className="absolute top-3/4 left-0 -mt-2 text-xs text-gray-500">75cm</div>

                      {/* 좌표 표시 */}
                      {coordinates.map((coord, index) => {
                        const { adjustedX, adjustedY } = calculateAdjustedCoordinates(coord, undefined);
                        return (
                          <div
                            key={`coord-${coord.x}-${coord.y}-${index}`}
                            className={`absolute w-3 h-3 rounded-full flex items-center justify-center
                              ${selectedPoint === index ? 'bg-green-500' : coord.measurementItem ? 'bg-blue-600' : 'bg-blue-500'}
                              hover:bg-blue-600 transition-colors cursor-pointer z-10`}
                            style={{
                              left: `${(adjustedX / 100) * 100}%`,
                              top: `${(adjustedY / 100) * 100}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPoint(index);
                            }}
                            onMouseDown={(e) => handleDragStart(e, index)}
                          >
                            <span className="absolute whitespace-nowrap text-xs bg-white px-1 rounded border -mt-5">
                              {index + 1}: ({coord.x}, {coord.y})
                              {coord.measurementItem && (
                                <span className="ml-1 text-blue-600">{coord.measurementItem}</span>
                              )}
                            </span>
                          </div>
                        );
                      })}

                      {/* 선 연결 표시 */}
                      {drawOrder.length > 1 && (
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          <polyline
                            points={drawOrder.map(index => {
                              const coord = coordinates[index];
                              const { adjustedX, adjustedY } = calculateAdjustedCoordinates(coord, undefined);
                              return `${(adjustedX / 100) * 100},${(adjustedY / 100) * 100}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#4F46E5"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                          />
                        </svg>
                      )}
                    </div>

                    {selectedPoint !== null && (
                      <div className="flex justify-between items-center bg-blue-50 p-2 rounded-md">
                        <span>선택된 점: {selectedPoint + 1} ({coordinates[selectedPoint]?.x}, {coordinates[selectedPoint]?.y})</span>
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => selectCoordinate(selectedPoint)}
                          >
                            순서에 추가
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeCoordinate(selectedPoint)}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium">추가된 좌표 목록</h3>
                    <div className="mt-2 border rounded-md p-2 min-h-12">
                      {coordinates.length === 0 ? (
                        <p className="text-sm text-gray-500">추가된 좌표가 없습니다.</p>
                      ) : (
                        <ul className="space-y-1">
                          {coordinates.map((coord, index) => {
                            const isInDrawOrder = drawOrder.includes(index);
                            const orderNumber = drawOrder.indexOf(index) + 1;
                            return (
                              <li
                                key={`list-coord-${coord.x}-${coord.y}-${index}`}
                                className={`flex justify-between items-center px-2 py-1 rounded ${isInDrawOrder ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                              >
                                <div className="flex flex-col">
                                  <span>
                                    점 {index + 1}: ({coord.x}, {coord.y})
                                    {isInDrawOrder && <span className="ml-2 text-blue-600">순서: {orderNumber}</span>}
                                  </span>
                                </div>
                                <div className="flex gap-2 items-center">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => removeCoordinate(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                이전 단계
              </Button>
              <Button type="button" onClick={handleNext}>
                다음 단계
              </Button>
            </div>
          </Step>

          <Step title="디테일 설정" description="차트 상세 설정">
            <Card>
              <CardHeader>
                <CardTitle>디테일 설정</CardTitle>
                <CardDescription>
                  차트의 추가 설정을 입력하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="connections">
                  <TabsList className="mb-4">
                    <TabsTrigger value="connections">연결선 및 측정 정보</TabsTrigger>
                    <TabsTrigger value="preview">측정 시각화</TabsTrigger>
                  </TabsList>

                  <TabsContent value="connections">
                    <div className="space-y-4">
                      <FormItem>
                        <FormLabel>점 연결 순서 및 측정 항목 지정</FormLabel>
                        <FormDescription>
                          점 연결 순서를 지정하고 각 연결선의 유형(직선/곡선)과 측정 항목을 설정합니다.
                          연결선에 측정 항목을 할당하면 사이즈에 따른 치수 변화를 미리볼 수 있습니다.
                        </FormDescription>
                      </FormItem>

                      <div className="border rounded-md p-3">
                        <h3 className="text-sm font-medium mb-2">현재 연결선 및 측정 항목</h3>
                        {drawOrder.length === 0 ? (
                          <p className="text-sm text-gray-500">지정된 연결이 없습니다.</p>
                        ) : (
                          <div className="space-y-4">
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-muted">
                                    <th className="px-2 py-2 text-left text-xs font-medium">순서</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium">연결선</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium">선 유형</th>
                                    <th className="px-2 py-2 text-left text-xs font-medium">측정 항목</th>
                                    <th className="px-2 py-2 text-right text-xs font-medium">작업</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {lineConnections.map((connection, index) => (
                                    <tr key={`connection-${connection.fromIndex}-${connection.toIndex}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                      <td className="px-2 py-2 text-sm">{index + 1}</td>
                                      <td className="px-2 py-2 text-sm">
                                        점 {connection.fromIndex + 1} → 점 {connection.toIndex + 1}
                                        <div className="text-xs text-gray-500">
                                          ({coordinates[connection.fromIndex]?.x}, {coordinates[connection.fromIndex]?.y}) →
                                          ({coordinates[connection.toIndex]?.x}, {coordinates[connection.toIndex]?.y})
                                          <span className="ml-2 text-blue-600">
                                            거리: {getActualDistance(connection).toFixed(1)}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-2 py-2">
                                        <ToggleGroup
                                          type="single"
                                          size="sm"
                                          value={connection.type}
                                          onValueChange={(value) => {
                                            if (value) changeLineType(index, value as LineType);
                                          }}
                                        >
                                          <ToggleGroupItem value="straight" aria-label="직선">
                                            <span className="text-xs">직선</span>
                                          </ToggleGroupItem>
                                          <ToggleGroupItem value="curve" aria-label="곡선">
                                            <span className="text-xs">곡선</span>
                                          </ToggleGroupItem>
                                        </ToggleGroup>
                                      </td>
                                      <td className="px-2 py-2">
                                        <Select
                                          value={connection.measurementItem}
                                          onValueChange={(value) => updateConnectionMeasurement(index, value as MeasurementItem)}
                                        >
                                          <SelectTrigger className="h-8">
                                            <SelectValue placeholder="측정 항목 선택" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {MEASUREMENT_ITEMS.map((item) => (
                                              <SelectItem key={item} value={item}>
                                                {item}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </td>
                                      <td className="px-2 py-2 text-right">
                                        <div className="flex justify-end space-x-1">
                                          {index > 0 && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7"
                                              onClick={() => reorderConnection(index, index - 1)}
                                              title="위로 이동"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                                            </Button>
                                          )}
                                          {index < lineConnections.length - 1 && (
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-7 w-7"
                                              onClick={() => reorderConnection(index, index + 1)}
                                              title="아래로 이동"
                                            >
                                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                            </Button>
                                          )}
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-500"
                                            onClick={() => removeFromDrawOrder(index)}
                                            title="제거"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-md mt-4">
                              <h4 className="text-sm font-medium mb-2">사용 가능한 좌표</h4>
                              <div className="flex flex-wrap gap-2">
                                {coordinates.map((coord, index) => (
                                  !drawOrder.includes(index) && (
                                    <div key={`available-${coord.x}-${coord.y}-${index}`} className="flex flex-col gap-1 border rounded p-2 bg-white">
                                      <div className="text-xs">점 {index + 1}: ({coord.x}, {coord.y})</div>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-6 text-xs px-1 py-0 flex-1"
                                          onClick={() => addConnectionWithType(index, 'straight')}
                                        >
                                          <span className="mr-1">직선</span>
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-6 text-xs px-1 py-0 flex-1"
                                          onClick={() => addConnectionWithType(index, 'curve')}
                                        >
                                          <span className="mr-1">곡선</span>
                                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3,12 Q12,3 21,12" /></svg>
                                        </Button>
                                      </div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="h-64 border rounded-md bg-gray-50 p-2 relative">
                        {/* 순서 시각화 */}
                        <h3 className="text-sm font-medium text-center mb-2">점 및 연결선 미리보기</h3>

                        {/* 점 표시 */}
                        {coordinates.map((coord, index) => {
                          const { adjustedX, adjustedY } = calculateAdjustedCoordinates(coord, selectedSizeRange);
                          return (
                            <div
                              key={`preview-point-${coord.x}-${coord.y}-${index}`}
                              className={`absolute w-3 h-3 rounded-full
                                ${drawOrder.includes(index) ? 'bg-blue-500' : 'bg-gray-300'}
                                transition-all duration-300 ease-in-out
                                ${isDragging && draggedPoint === index ? 'scale-150 ring-2 ring-blue-300' : ''}
                                ${!isDragging ? 'hover:scale-125 cursor-grab' : ''}`}
                              style={{
                                left: `${adjustedX}%`,
                                top: `${adjustedY}%`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: isDragging && draggedPoint === index ? 20 : 10
                              }}
                              onMouseDown={(e) => handleDragStart(e, index)}
                            >
                              <span className="absolute whitespace-nowrap text-xs bg-white px-1 rounded border -mt-5">
                                {index + 1}
                              </span>
                            </div>
                          );
                        })}

                        {/* 연결선 그리기 */}
                        {lineConnections.length > 0 && (
                          <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {lineConnections.map((connection, index) => {
                              const fromCoord = coordinates[connection.fromIndex];
                              const toCoord = coordinates[connection.toIndex];

                              if (!fromCoord || !toCoord) return null;

                              const { adjustedX: fromX, adjustedY: fromY } = calculateAdjustedCoordinates(fromCoord, selectedSizeRange);
                              const { adjustedX: toX, adjustedY: toY } = calculateAdjustedCoordinates(toCoord, selectedSizeRange);

                              // 측정 항목 라벨 위치 계산
                              const midX = (fromX + toX) / 2;
                              const midY = (fromY + toY) / 2;

                              // 선 색상 설정 (측정 항목이 있으면 파란색, 없으면 회색)
                              const lineColor = connection.measurementItem ? '#4F46E5' : '#9CA3AF';

                              // 연결ID 생성
                              const connectionId = `conn-${connection.fromIndex}-${connection.toIndex}`;

                              if (connection.type === 'straight') {
                                return (
                                  <g key={`preview-line-${connection.fromIndex}-${connection.toIndex}-${index}`} className="transition-all duration-300 ease-in-out">
                                    <line
                                      x1={`${fromX}%`}
                                      y1={`${fromY}%`}
                                      x2={`${toX}%`}
                                      y2={`${toY}%`}
                                      stroke={lineColor}
                                      strokeWidth="2"
                                      markerEnd={connection.measurementItem ? "url(#arrowhead-preview)" : ""}
                                    />

                                    {connection.measurementItem && selectedSizeRange && (
                                      <g>
                                        <rect
                                          x={`${midX - 8}%`}
                                          y={`${midY - 3}%`}
                                          width="16%"
                                          height="6%"
                                          fill="white"
                                          stroke={lineColor}
                                          strokeWidth="1"
                                          rx="2"
                                          ry="2"
                                        />
                                        <text
                                          x={`${midX}%`}
                                          y={`${midY + 1}%`}
                                          fontSize="8"
                                          textAnchor="middle"
                                          fill={lineColor}
                                        >
                                          {getMeasurementText(connection, selectedSizeRange)}
                                        </text>
                                      </g>
                                    )}
                                  </g>
                                );
                              }

                              // 곡선 처리 - 컨트롤 포인트 계산
                              const controlPoint = controlPoints[connectionId];
                              let controlX = (fromX + toX) / 2;
                              let controlY = Math.min(fromY, toY) - 20;

                              if (controlPoint) {
                                controlX = controlPoint.x;
                                controlY = controlPoint.y;
                              }

                              return (
                                <g key={`preview-curve-${connection.fromIndex}-${connection.toIndex}-${index}`} className="transition-all duration-300 ease-in-out">
                                  <path
                                    d={`M ${fromX}% ${fromY}% Q ${controlX}% ${controlY}%, ${toX}% ${toY}%`}
                                    fill="none"
                                    stroke={lineColor}
                                    strokeWidth="2"
                                    markerEnd={connection.measurementItem ? "url(#arrowhead-preview)" : ""}
                                  />

                                  {/* 컨트롤 포인트 */}
                                  <circle
                                    cx={`${controlX}%`}
                                    cy={`${controlY}%`}
                                    r={isDragging && draggedControlPoint === connectionId ? "5" : "4"}
                                    fill={isDragging && draggedControlPoint === connectionId ? "#8B5CF6" : "#D1D5DB"}
                                    stroke="#6366F1"
                                    strokeWidth="1"
                                    className={`cursor-grab ${isDragging && draggedControlPoint === connectionId ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                                    onMouseDown={(e) => handleControlPointDragStart(e as any, connectionId)}
                                  />

                                  {/* 컨트롤 라인 (보조선) */}
                                  <line
                                    x1={`${fromX}%`}
                                    y1={`${fromY}%`}
                                    x2={`${controlX}%`}
                                    y2={`${controlY}%`}
                                    stroke="#CBD5E1"
                                    strokeWidth="1"
                                    strokeDasharray="2,2"
                                    className="opacity-40"
                                  />
                                  <line
                                    x1={`${controlX}%`}
                                    y1={`${controlY}%`}
                                    x2={`${toX}%`}
                                    y2={`${toY}%`}
                                    stroke="#CBD5E1"
                                    strokeWidth="1"
                                    strokeDasharray="2,2"
                                    className="opacity-40"
                                  />

                                  {connection.measurementItem && selectedSizeRange && (
                                    <g>
                                      <rect
                                        x={`${controlX - 8}%`}
                                        y={`${controlY - 5}%`}
                                        width="16%"
                                        height="6%"
                                        fill="white"
                                        stroke={lineColor}
                                        strokeWidth="1"
                                        rx="2"
                                        ry="2"
                                      />
                                      <text
                                        x={`${controlX}%`}
                                        y={`${controlY - 1}%`}
                                        fontSize="8"
                                        textAnchor="middle"
                                        fill={lineColor}
                                      >
                                        {getMeasurementText(connection, selectedSizeRange)}
                                      </text>
                                    </g>
                                  )}
                                </g>
                              );
                            })}
                          </svg>
                        )}
                      </div>

                      <div className="mt-4">
                        <Alert className="bg-blue-50 border-blue-200">
                          <InfoIcon className="h-4 w-4 text-blue-600" />
                          <AlertTitle className="text-blue-800">측정 항목 설정 안내</AlertTitle>
                          <AlertDescription className="text-blue-700">
                            <ul className="list-disc pl-5 space-y-1 mt-2">
                              <li>각 연결선은 하나의 측정 항목과 연결될 수 있습니다.</li>
                              <li>측정 항목이 지정된 연결선은 패턴 제작 시 사이즈별 치수에 따라 자동으로 조정됩니다.</li>
                              <li>연결선의 유형은 '직선' 또는 '곡선'으로 설정할 수 있습니다.</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">측정 항목 시각화</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          연결선별 측정 항목을 시각화합니다. 연결선의 길이는 실제 측정값에 비례하여 표시됩니다.
                        </p>

                        <div className="mb-4">
                          <FormLabel>사이즈 범위 미리보기</FormLabel>
                          <Select
                            value={selectedSizeRange}
                            onValueChange={(value) => setSelectedSizeRange(value as SizeRange)}
                          >
                            <SelectTrigger className="w-full max-w-xs">
                              <SelectValue placeholder="사이즈 범위 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {SIZE_RANGES.filter(size => sampleSizeData[size]).map((size) => (
                                <SelectItem key={size} value={size}>
                                  {size}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-gray-500 mt-1">
                            특정 사이즈를 선택하면 해당 사이즈의 측정값에 따라 연결선이 어떻게 변경될지 미리볼 수 있습니다.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* 왼쪽에 미리보기 섹션 추가 */}
                          <div className="lg:col-span-4 border rounded-md p-4 bg-white">
                            <h4 className="text-sm font-medium mb-4 text-center">사이즈 미리보기</h4>

                            {selectedSizeRange ? (
                              <div className="space-y-6">
                                <div className="text-center text-lg font-medium text-blue-600">
                                  사이즈: {selectedSizeRange}
                                </div>

                                <div className="space-y-4">
                                  {lineConnections
                                    .filter(conn => conn.measurementItem)
                                    .map((connection, index) => {
                                      const value = getMeasurementValue(connection, selectedSizeRange);
                                      return (
                                        <div
                                          key={`preview-meas-${connection.fromIndex}-${connection.toIndex}-${index}`}
                                          className="flex justify-between items-center bg-gray-50 p-2 rounded"
                                        >
                                          <div className="text-sm">
                                            <div className="font-medium">{connection.measurementItem}</div>
                                            <div className="text-xs text-gray-500">
                                              점 {connection.fromIndex + 1} → 점 {connection.toIndex + 1}
                                            </div>
                                          </div>
                                          <div className="text-lg font-bold text-blue-600">
                                            {value !== null ? `${value.toFixed(1)}cm` : '-'}
                                          </div>
                                        </div>
                                      );
                                    })}
                                </div>

                                <div className="mt-6">
                                  <h5 className="text-sm font-medium mb-2">사이즈별 비교</h5>
                                  <div className="space-y-4">
                                    {lineConnections
                                      .filter(conn => conn.measurementItem)
                                      .map((connection, index) => {
                                        const comparisonData = getComparisonData(connection)
                                          .filter(data => data.value !== null && ['min', '50-53', '74-79', '95-99', 'max'].includes(data.size));

                                        if (comparisonData.length === 0) return null;

                                        return (
                                          <div key={`comparison-${connection.fromIndex}-${connection.toIndex}-${index}`} className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                              <span>{connection.measurementItem}</span>
                                              <span>{getMeasurementValue(connection, selectedSizeRange)?.toFixed(1) || '-'}cm</span>
                                            </div>
                                            <div className="h-6 w-full bg-gray-100 rounded-full relative">
                                              {comparisonData.map(data => {
                                                const normalizedValue = getNormalizedMeasurementValue(connection, data.size);
                                                const isSelected = data.size === selectedSizeRange;

                                                return (
                                                  <div
                                                    key={`marker-${data.size}`}
                                                    className={`absolute h-6 w-2 -ml-1 rounded-full transition-all duration-300 ease-in-out
                                                      ${isSelected ? 'bg-blue-600' : 'bg-gray-400'}`}
                                                    style={{ left: `${normalizedValue}%` }}
                                                    title={`${data.size}: ${data.value?.toFixed(1) || '-'}cm`}
                                                  >
                                                    {isSelected && (
                                                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-1 rounded">
                                                        {data.size}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>

                                <div className="mt-6">
                                  <h5 className="text-sm font-medium mb-2">빠른 사이즈 선택</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {['50-53', '74-79', '95-99'].map(size => (
                                      <Button
                                        key={`size-button-${size}`}
                                        variant={selectedSizeRange === size ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedSizeRange(size as SizeRange)}
                                      >
                                        {size}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="h-64 flex items-center justify-center text-gray-500">
                                사이즈를 선택하면 상세 정보가 표시됩니다.
                              </div>
                            )}
                          </div>

                          {/* 오른쪽에 차트 시각화 */}
                          <div className="lg:col-span-8 border rounded-md p-4 bg-white">
                            <h4 className="text-sm font-medium mb-4 text-center">측정 시각화</h4>

                            <div className="h-[500px] relative bg-gray-50 p-4 overflow-hidden">
                              {/* 그리드 */}
                              <div className="absolute inset-0" style={{
                                backgroundImage: `
                                  linear-gradient(to right, #ddd 1px, transparent 1px),
                                  linear-gradient(to bottom, #ddd 1px, transparent 1px),
                                  linear-gradient(to right, #eee 0.5px, transparent 0.5px),
                                  linear-gradient(to bottom, #eee 0.5px, transparent 0.5px)
                                `,
                                backgroundSize: '10% 10%, 10% 10%, 5% 5%, 5% 5%'
                              }} />

                              {/* cm 눈금 */}
                              <div className="absolute top-0 left-0 w-full flex justify-between px-2 text-xs text-gray-500">
                                <span>0</span>
                                <span>100cm</span>
                              </div>
                              <div className="absolute top-0 left-0 h-full flex flex-col justify-between py-2 text-xs text-gray-500">
                                <span>0</span>
                                <span>100cm</span>
                              </div>

                              {/* 중간 눈금 */}
                              <div className="absolute top-0 left-1/4 -ml-2 text-xs text-gray-500">25cm</div>
                              <div className="absolute top-0 left-1/2 -ml-2 text-xs text-gray-500">50cm</div>
                              <div className="absolute top-0 left-3/4 -ml-2 text-xs text-gray-500">75cm</div>

                              <div className="absolute top-1/4 left-0 -mt-2 text-xs text-gray-500">25cm</div>
                              <div className="absolute top-1/2 left-0 -mt-2 text-xs text-gray-500">50cm</div>
                              <div className="absolute top-3/4 left-0 -mt-2 text-xs text-gray-500">75cm</div>

                              {/* 좌표 표시 */}
                              {coordinates.map((coord, index) => {
                                const { adjustedX, adjustedY } = calculateAdjustedCoordinates(coord, selectedSizeRange);
                                return (
                                  <div
                                    key={`preview-point-${coord.x}-${coord.y}-${index}`}
                                    className={`absolute w-3 h-3 rounded-full
                                      ${drawOrder.includes(index) ? 'bg-blue-500' : 'bg-gray-300'}
                                      transition-all duration-300 ease-in-out
                                      ${isDragging && draggedPoint === index ? 'scale-150 ring-2 ring-blue-300' : ''}
                                      ${!isDragging ? 'hover:scale-125 cursor-grab' : ''}`}
                                    style={{
                                      left: `${adjustedX}%`,
                                      top: `${adjustedY}%`,
                                      transform: 'translate(-50%, -50%)'
                                    }}
                                    onMouseDown={(e) => handleDragStart(e, index)}
                                  >
                                    <span className="absolute whitespace-nowrap text-xs bg-white px-1 rounded border -mt-5">
                                      {index + 1}
                                    </span>
                                  </div>
                                );
                              })}

                              {/* 연결선 및 측정 항목 표시 */}
                              {lineConnections.length > 0 && (
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                  <defs>
                                    <marker
                                      id="arrowhead-preview"
                                      markerWidth="6"
                                      markerHeight="6"
                                      refX="6"
                                      refY="3"
                                      orient="auto"
                                    >
                                      <path d="M0,0 L0,6 L6,3 z" fill="#4F46E5" />
                                    </marker>
                                  </defs>

                                  {lineConnections.map((connection, index) => {
                                    const fromCoord = coordinates[connection.fromIndex];
                                    const toCoord = coordinates[connection.toIndex];

                                    if (!fromCoord || !toCoord) return null;

                                    const { adjustedX: fromX, adjustedY: fromY } = calculateAdjustedCoordinates(fromCoord, selectedSizeRange);
                                    const { adjustedX: toX, adjustedY: toY } = calculateAdjustedCoordinates(toCoord, selectedSizeRange);

                                    // 측정 항목 라벨 위치 계산
                                    const midX = (fromX + toX) / 2;
                                    const midY = (fromY + toY) / 2;

                                    // 선 색상 설정 (측정 항목이 있으면 파란색, 없으면 회색)
                                    const lineColor = connection.measurementItem ? '#4F46E5' : '#9CA3AF';

                                    // 연결ID 생성
                                    const connectionId = `conn-${connection.fromIndex}-${connection.toIndex}`;

                                    if (connection.type === 'straight') {
                                      return (
                                        <g key={`preview-line-${connection.fromIndex}-${connection.toIndex}-${index}`} className="transition-all duration-300 ease-in-out">
                                          <line
                                            x1={`${fromX}%`}
                                            y1={`${fromY}%`}
                                            x2={`${toX}%`}
                                            y2={`${toY}%`}
                                            stroke={lineColor}
                                            strokeWidth="2"
                                            markerEnd={connection.measurementItem ? "url(#arrowhead-preview)" : ""}
                                          />

                                          {connection.measurementItem && selectedSizeRange && (
                                            <g>
                                              <rect
                                                x={`${midX - 8}%`}
                                                y={`${midY - 3}%`}
                                                width="16%"
                                                height="6%"
                                                fill="white"
                                                stroke={lineColor}
                                                strokeWidth="1"
                                                rx="2"
                                                ry="2"
                                              />
                                              <text
                                                x={`${midX}%`}
                                                y={`${midY + 1}%`}
                                                fontSize="8"
                                                textAnchor="middle"
                                                fill={lineColor}
                                              >
                                                {getMeasurementText(connection, selectedSizeRange)}
                                              </text>
                                            </g>
                                          )}
                                        </g>
                                      );
                                    }

                                    // 곡선 처리 - 컨트롤 포인트 계산
                                    const controlPoint = controlPoints[connectionId];
                                    let controlX = (fromX + toX) / 2;
                                    let controlY = Math.min(fromY, toY) - 20;

                                    if (controlPoint) {
                                      controlX = controlPoint.x;
                                      controlY = controlPoint.y;
                                    }

                                    return (
                                      <g key={`preview-curve-${connection.fromIndex}-${connection.toIndex}-${index}`} className="transition-all duration-300 ease-in-out">
                                        <path
                                          d={`M ${fromX}% ${fromY}% Q ${controlX}% ${controlY}%, ${toX}% ${toY}%`}
                                          fill="none"
                                          stroke={lineColor}
                                          strokeWidth="2"
                                          markerEnd={connection.measurementItem ? "url(#arrowhead-preview)" : ""}
                                        />

                                        {/* 컨트롤 포인트 */}
                                        <circle
                                          cx={`${controlX}%`}
                                          cy={`${controlY}%`}
                                          r={isDragging && draggedControlPoint === connectionId ? "5" : "4"}
                                          fill={isDragging && draggedControlPoint === connectionId ? "#8B5CF6" : "#D1D5DB"}
                                          stroke="#6366F1"
                                          strokeWidth="1"
                                          className={`cursor-grab ${isDragging && draggedControlPoint === connectionId ? 'scale-110' : 'opacity-60 hover:opacity-100'}`}
                                          onMouseDown={(e) => handleControlPointDragStart(e as any, connectionId)}
                                        />

                                        {/* 컨트롤 라인 (보조선) */}
                                        <line
                                          x1={`${fromX}%`}
                                          y1={`${fromY}%`}
                                          x2={`${controlX}%`}
                                          y2={`${controlY}%`}
                                          stroke="#CBD5E1"
                                          strokeWidth="1"
                                          strokeDasharray="2,2"
                                          className="opacity-40"
                                        />
                                        <line
                                          x1={`${controlX}%`}
                                          y1={`${controlY}%`}
                                          x2={`${toX}%`}
                                          y2={`${toY}%`}
                                          stroke="#CBD5E1"
                                          strokeWidth="1"
                                          strokeDasharray="2,2"
                                          className="opacity-40"
                                        />

                                        {connection.measurementItem && selectedSizeRange && (
                                          <g>
                                            <rect
                                              x={`${controlX - 8}%`}
                                              y={`${controlY - 5}%`}
                                              width="16%"
                                              height="6%"
                                              fill="white"
                                              stroke={lineColor}
                                              strokeWidth="1"
                                              rx="2"
                                              ry="2"
                                            />
                                            <text
                                              x={`${controlX}%`}
                                              y={`${controlY - 1}%`}
                                              fontSize="8"
                                              textAnchor="middle"
                                              fill={lineColor}
                                            >
                                              {getMeasurementText(connection, selectedSizeRange)}
                                            </text>
                                          </g>
                                        )}
                                      </g>
                                    );
                                  })}
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                이전 단계
              </Button>
              <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                취소
              </Button>
              <Button type="button" onClick={handleFormSubmit}>
                저장하기
              </Button>
            </div>
          </Step>
        </Stepper>
      </Form>
    </div>
  );
}
