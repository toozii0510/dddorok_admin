"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Stepper, Step } from "@/components/ui/stepper";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Trash2 } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ChartType, MeasurementItem, SizeRange } from "@/lib/data";
import { MEASUREMENT_ITEMS, SIZE_RANGES } from "@/lib/data";

// 차트 좌표 유형 (각도(angle) 추가)
interface Coordinates {
  x: number;
  y: number;
  angle?: number; // 각도 (예: 회전값, 단위는 degree)
  measurementItem?: MeasurementItem; // 인체 치수 항목 (연결선 측정 항목)
}

// 선 유형 정의
type LineType = 'straight' | 'curve';

// 선 연결 정보
interface LineConnection {
  fromIndex: number;
  toIndex: number;
  type: LineType;
  measurementItem?: MeasurementItem;
}

// 최종 제출 데이터 타입 정의
export interface ChartTypeFormData {
  id: string;
  name: string;
  coordinates: Coordinates[];
  drawOrder: number[];
  lineConnections: LineConnection[];
  structure_data: {
    name: string;
    coordinates: Coordinates[];
    drawOrder: number[];
    lineConnections: LineConnection[];
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
  // 선 연결 정보를 저장하는 상태
  const [lineConnections, setLineConnections] = useState<LineConnection[]>([]);
  const [defaultLineType, setDefaultLineType] = useState<LineType>('straight');
  const [xCoord, setXCoord] = useState<number | undefined>(undefined);
  const [yCoord, setYCoord] = useState<number | undefined>(undefined);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [selectedSizeRange, setSelectedSizeRange] = useState<SizeRange>('74-79'); // 기본 사이즈 범위
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedPoint, setDraggedPoint] = useState<number | null>(null);
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number, y: number } | null>(null);
  const [controlPoints, setControlPoints] = useState<Record<string, {x: number, y: number}>>({});
  const [draggedControlPoint, setDraggedControlPoint] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // 샘플 치수 데이터 (실제로는 API에서 가져오거나 상위 컴포넌트로부터 전달)
  const sizeDetails: Record<SizeRange, Record<string, number>> = {
    "50-53": {},
    "54-57": {},
    "58-61": {},
    "62-65": {},
    "66-69": {},
    "70-73": {},
    '74-79': {},
    "80-84": {},
    "85-89": {},
    "90-94": {},
    "95-99": {},
    "100-104": {},
    "105-109": {},
    "110-114": {},
    "115-120": {},
    "121-129": {},
    min: {},
    max: {}
  };
  const sampleSizeData: Record<SizeRange, Record<string, number>> = useMemo(() => sizeDetails, []);

  // 기준 사이즈 (좌표 조정의 기준)
  const baseSize: SizeRange = '74-79';

  // 연결선의 실제 측정값 계산 함수
  const getMeasurementValue = (connection: LineConnection, sizeRange?: SizeRange): number | null => {
    if (!connection.measurementItem || !sizeRange || !(sizeRange in sampleSizeData)) {
      return null;
    }
    return sampleSizeData[sizeRange][connection.measurementItem] || null;
  };

  // 좌표 조정 함수 (측정값에 따른 변환)
  const calculateAdjustedCoordinates = (coord: Coordinates, sizeRange?: SizeRange) => {
    if (!coord) return { adjustedX: 0, adjustedY: 0 };
    if (!sizeRange) return { adjustedX: coord.x, adjustedY: coord.y };

    const connections = lineConnections.filter(conn =>
      conn.fromIndex === coordinates.indexOf(coord) ||
      conn.toIndex === coordinates.indexOf(coord)
    );
    if (connections.length === 0 || !connections.some(conn => conn.measurementItem)) {
      return { adjustedX: coord.x, adjustedY: coord.y };
    }

    let xAdjustment = 0;
    let yAdjustment = 0;
    let xCount = 0;
    let yCount = 0;
    for (const connection of connections) {
      if (!connection.measurementItem) continue;
      const baseValue = sampleSizeData[baseSize]?.[connection.measurementItem] || 0;
      const targetValue = sampleSizeData[sizeRange]?.[connection.measurementItem] || 0;
      if (baseValue === 0 || targetValue === 0) continue;
      const ratio = targetValue / baseValue;
      if (connection.measurementItem.includes('너비') || connection.measurementItem.includes('목')) {
        xAdjustment += ratio;
        xCount++;
      } else if (connection.measurementItem.includes('길이') || connection.measurementItem.includes('깊이')) {
        yAdjustment += ratio;
        yCount++;
      } else {
        xAdjustment += ratio;
        yAdjustment += ratio;
        xCount++;
        yCount++;
      }
    }
    const xRatio = xCount > 0 ? xAdjustment / xCount : 1;
    const yRatio = yCount > 0 ? yAdjustment / yCount : 1;
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

  // 다음 단계로 이동
  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  // 이전 단계로 이동
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // 실제 거리 계산 (cm 단위)
  const getActualDistance = (connection: LineConnection): number => {
    const fromCoord = coordinates[connection.fromIndex];
    const toCoord = coordinates[connection.toIndex];
    if (!fromCoord || !toCoord) return 0;
    return calculateDistance(fromCoord, toCoord);
  };

  // 좌표를 순서에 추가 (연결선 자동 생성)
  const selectCoordinate = (index: number) => {
    if (drawOrder.includes(index)) return;
    const newDrawOrder = [...drawOrder, index];
    setDrawOrder(newDrawOrder);
    if (drawOrder.length > 0) {
      const fromIndex = drawOrder[drawOrder.length - 1];
      const toIndex = index;
      setLineConnections([...lineConnections, { fromIndex, toIndex, type: defaultLineType }]);
    }
  };

  // 선 연결 유형 변경 함수
  const changeLineType = (connectionIndex: number, newType: LineType) => {
    const newConnections = [...lineConnections];
    newConnections[connectionIndex] = { ...newConnections[connectionIndex], type: newType };
    setLineConnections(newConnections);
  };

  // 연결선 측정 항목 업데이트 함수
  const updateConnectionMeasurement = (connectionIndex: number, measurementItem: MeasurementItem | undefined) => {
    const newConnections = [...lineConnections];
    newConnections[connectionIndex] = { ...newConnections[connectionIndex], measurementItem };
    setLineConnections(newConnections);
  };

  // react-hook-form 설정
  const form = useForm<ChartTypeFormValues>({
    defaultValues: {
      id: chartType?.id || "",
      name: chartType?.name || "",
    },
  });

  // 캔버스 클릭 (좌표 추가)
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / rect.width * 100);
    const y = Math.round((e.clientY - rect.top) / rect.height * 100);
    const newCoordinate: Coordinates = { x, y };
    const newCoordinates = [...coordinates, newCoordinate];
    setCoordinates(newCoordinates);
    const newIndex = newCoordinates.length - 1;
    if (drawOrder.length > 0) {
      const fromIndex = drawOrder[drawOrder.length - 1];
      setDrawOrder([...drawOrder, newIndex]);
      setLineConnections([...lineConnections, { fromIndex, toIndex: newIndex, type: defaultLineType }]);
    } else {
      setDrawOrder([newIndex]);
    }
  };

  // 좌표 직접 입력 추가 함수
  const addCoordinate = () => {
    if (xCoord !== undefined && yCoord !== undefined) {
      const newCoordinate: Coordinates = { x: xCoord, y: yCoord };
      const newCoordinates = [...coordinates, newCoordinate];
      setCoordinates(newCoordinates);
      const newIndex = newCoordinates.length - 1;
      if (drawOrder.length > 0) {
        const fromIndex = drawOrder[drawOrder.length - 1];
        setDrawOrder([...drawOrder, newIndex]);
        setLineConnections([...lineConnections, { fromIndex, toIndex: newIndex, type: defaultLineType }]);
      } else {
        setDrawOrder([newIndex]);
      }
      setXCoord(undefined);
      setYCoord(undefined);
    }
  };

  // 좌표 삭제 함수 (순서, 연결선도 업데이트)
  const removeCoordinate = (index: number) => {
    const newCoordinates = [...coordinates];
    newCoordinates.splice(index, 1);
    setCoordinates(newCoordinates);
    const newDrawOrder = drawOrder.filter(i => i !== index).map(i => i > index ? i - 1 : i);
    setDrawOrder(newDrawOrder);
    const newLineConnections = lineConnections
      .filter(conn => conn.fromIndex !== index && conn.toIndex !== index)
      .map(conn => ({
        fromIndex: conn.fromIndex > index ? conn.fromIndex - 1 : conn.fromIndex,
        toIndex: conn.toIndex > index ? conn.toIndex - 1 : conn.toIndex,
        type: conn.type,
        measurementItem: conn.measurementItem
      }));
    setLineConnections(newLineConnections);
    if (selectedPoint === index) setSelectedPoint(null);
  };

  // 연결선 제거 함수 (순서에서 제거)
  const removeFromDrawOrder = (index: number) => {
    const newLineConnections = [...lineConnections];
    newLineConnections.splice(index, 1);
    setLineConnections(newLineConnections);
  };

  // 연결선 재정렬 함수
  const reorderConnection = (fromIndex: number, toIndex: number) => {
    const newConnections = [...lineConnections];
    const [moved] = newConnections.splice(fromIndex, 1);
    newConnections.splice(toIndex, 0, moved);
    setLineConnections(newConnections);
  };

  // 선택된 점의 각도 업데이트 (방향성 설정)
  const updateSelectedPointAngle = (angleStr: string) => {
    if (selectedPoint === null) return;
    const angle = parseFloat(angleStr);
    if (isNaN(angle)) return;
    const newCoords = [...coordinates];
    newCoords[selectedPoint] = { ...newCoords[selectedPoint], angle };
    setCoordinates(newCoords);
  };

  // 드래그 핸들러 (점 이동)
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedPoint(index);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragStartPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
    setSelectedPoint(index);
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging || draggedPoint === null || !dragStartPosition || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round((e.clientX - rect.left) / rect.width * 100)));
    const y = Math.max(0, Math.min(100, Math.round((e.clientY - rect.top) / rect.height * 100)));
    const newCoords = [...coordinates];
    newCoords[draggedPoint] = { ...newCoords[draggedPoint], x, y };
    setCoordinates(newCoords);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedPoint(null);
    setDragStartPosition(null);
    setDraggedControlPoint(null);
  };

  // 컨트롤 포인트 드래그 핸들러 (곡선 보조점)
  const handleControlPointDragStart = (e: React.MouseEvent<HTMLDivElement>, connectionId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setDraggedControlPoint(connectionId);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setDragStartPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleControlPointDrag = (e: MouseEvent) => {
    if (!isDragging || !draggedControlPoint || !dragStartPosition || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round((e.clientX - rect.left) / rect.width * 100)));
    const y = Math.max(0, Math.min(100, Math.round((e.clientY - rect.top) / rect.height * 100)));
    setControlPoints({ ...controlPoints, [draggedControlPoint]: { x, y } });
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
      structure_data: {
        name: patternName,
        coordinates,
        drawOrder,
        lineConnections,
      }
    };
    onSubmit(formData);
  };

  // 정규화된 측정값 (0~100)
  const getNormalizedMeasurementValue = (connection: LineConnection, sizeRange: SizeRange): number => {
    if (!connection.measurementItem) return 50;
    const minValue = sampleSizeData['min']?.[connection.measurementItem] || 0;
    const maxValue = sampleSizeData['max']?.[connection.measurementItem] || 100;
    const currentValue = sampleSizeData[sizeRange]?.[connection.measurementItem] || 0;
    if (maxValue === minValue) return 50;
    return ((currentValue - minValue) / (maxValue - minValue)) * 100;
  };

  // 측정 텍스트 (연결선 라벨)
  const getMeasurementText = (connection: LineConnection, sizeRange: SizeRange): string => {
    const value = getMeasurementValue(connection, sizeRange);
    if (value === null) return connection.measurementItem || '';
    return `${connection.measurementItem}: ${value.toFixed(1)}cm`;
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <Stepper currentStep={currentStep} onStepChange={setCurrentStep}>
          {/* 1단계: 차트명 입력 */}
          <Step title="차트명 입력" description="기본 정보를 입력하세요.">
            <Card>
              <CardHeader>
                <CardTitle>차트 유형 기본 정보</CardTitle>
                <CardDescription>차트의 이름과 기본 정보를 입력합니다.</CardDescription>
              </CardHeader>
              <CardContent>
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
                        의류 차트인 경우 "넥라인 유형+제작 방식+부위명" 형식 사용을 권장합니다. (예: 라운드넥 탑다운 앞몸판)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="mt-4">
                  <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>안내</AlertTitle>
                    <AlertDescription>
                      각 차트는 독립적인 패턴으로 다른 템플릿에서도 재사용할 수 있습니다.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                취소
              </Button>
              <Button type="button" onClick={handleNext}>
                다음 단계
              </Button>
            </div>
          </Step>

          {/* 2단계: 가이드라인 설정 (좌표, 연결 및 방향 설정) */}
          <Step title="가이드라인 설정" description="점 찍기 및 연결, 방향 입력">
            <Card>
              <CardHeader>
                <CardTitle>가이드라인 설정</CardTitle>
                <CardDescription>
                  캔버스를 클릭하거나 직접 좌표를 입력해 점을 추가하고, 각 점의 방향(각도) 및 연결선(직선/곡선, 측정 항목)을 지정하세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* 좌표 수동 입력 영역 */}
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <FormLabel>패턴 영역 좌표 추가 (0~100)</FormLabel>
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
                      <Button type="button" onClick={addCoordinate} disabled={xCoord === undefined || yCoord === undefined}>
                        추가
                      </Button>
                    </div>
                    <FormDescription>
                      X, Y 좌표는 0~100 범위 내에서 입력합니다.
                    </FormDescription>
                  </div>
                  {/* 캔버스 영역 */}
                  <div
                    ref={canvasRef}
                    className="h-[500px] border rounded-md bg-gray-50 p-2 relative cursor-crosshair"
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
                    {/* 캔버스 내 좌표 렌더링 (각 점에 선택/드래그 및 방향 아이콘 포함) */}
                    {coordinates.map((coord, index) => {
                      const { adjustedX, adjustedY } = calculateAdjustedCoordinates(coord, undefined);
                      return (
                        <div
                          key={`coord-${coord.x}-${coord.y}-${index}`}
                          className={`absolute w-3 h-3 rounded-full flex items-center justify-center 
                            ${selectedPoint === index ? 'bg-green-500' : coord.measurementItem ? 'bg-blue-600' : 'bg-blue-500'}
                            hover:bg-blue-600 transition-colors cursor-pointer`}
                          style={{
                            left: `${(adjustedX / 100) * 100}%`,
                            top: `${(adjustedY / 100) * 100}%`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: isDragging && draggedPoint === index ? 20 : 10
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
                          {coord.angle !== undefined && (
                            <div className="absolute" style={{ top: '100%', left: '50%', transform: 'translate(-50%, 0)' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                style={{ transform: `rotate(${coord.angle}deg)` }}
                              >
                                <line x1="12" y1="2" x2="12" y2="18" />
                                <polyline points="6,12 12,18 18,12" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* 선택된 점에 대한 정보 및 방향(각도) 입력 */}
                {selectedPoint !== null && (
                  <div className="mt-4 flex flex-col bg-blue-50 p-2 rounded-md">
                    <span>
                      선택된 점: {selectedPoint + 1} ({coordinates[selectedPoint]?.x}, {coordinates[selectedPoint]?.y})
                    </span>
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700">방향 (각도)</label>
                      <Input
                        type="number"
                        value={coordinates[selectedPoint]?.angle ?? 0}
                        onChange={(e) => updateSelectedPointAngle(e.target.value)}
                        className="mt-1 w-24"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => selectCoordinate(selectedPoint)}>
                        순서에 추가
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => removeCoordinate(selectedPoint)}>
                        삭제
                      </Button>
                    </div>
                  </div>
                )}
                {/* 좌표 목록 및 연결선 설정 */}
                <div className="mt-6 grid lg:grid-cols-12 gap-4">
                  {/* 좌표 목록 */}
                  <div className="lg:col-span-4 border rounded-md p-3">
                    <h3 className="text-sm font-medium mb-2">추가된 좌표 목록</h3>
                    <div className="mt-2 border rounded-md p-2 max-h-[150px] overflow-y-auto">
                      {coordinates.length === 0 ? (
                        <p className="text-sm text-gray-500">추가된 좌표가 없습니다.</p>
                      ) : (
                        <ul className="space-y-1">
                          {coordinates.map((coord, index) => {
                            const isInOrder = drawOrder.includes(index);
                            const orderNumber = drawOrder.indexOf(index) + 1;
                            return (
                              <li key={`list-coord-${coord.x}-${coord.y}-${index}`} className={`flex justify-between items-center px-2 py-1 rounded ${isInOrder ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                <div>
                                  <span>점 {index + 1}: ({coord.x}, {coord.y})</span>
                                  {coord.angle !== undefined && (
                                    <span className="ml-2 text-sm text-gray-600">방향: {coord.angle}°</span>
                                  )}
                                  {isInOrder && <span className="ml-2 text-blue-600">순서: {orderNumber}</span>}
                                </div>
                                <Button
                                  variant="ghost"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => removeCoordinate(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>
                  {/* 연결선 및 측정 항목 설정 */}
                  <div className="lg:col-span-8 border rounded-md p-3">
                    <h3 className="text-sm font-medium mb-2">연결선 및 측정 항목</h3>
                    {drawOrder.length === 0 ? (
                      <p className="text-sm text-gray-500">지정된 연결이 없습니다.</p>
                    ) : (
                      <div className="overflow-x-auto max-h-[250px]">
                        <table className="w-full border-collapse">
                          <thead className="sticky top-0 bg-white">
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
                                    ({coordinates[connection.toIndex]?.x}, {coordinates[connection.toIndex]?.y})&nbsp;
                                    <span className="text-blue-600">
                                      거리: {getActualDistance(connection).toFixed(1)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-2 py-2">
                                  <ToggleGroup
                                    type="single"
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
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="m18 15-6-6-6 6"/>
                                        </svg>
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
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="m6 9 6 6 6-6"/>
                                        </svg>
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
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end space-x-4 mt-4">
              <Button type="button" variant="outline" onClick={handleBack}>
                이전 단계
              </Button>
              <Button type="button" variant="secondary" onClick={() => window.history.back()}>
                취소
              </Button>
              <Button type="button" onClick={handleNext}>
                다음 단계
              </Button>
            </div>
          </Step>

          {/* 3단계: 인체 이미지 미리보기 */}
          <Step title="미리보기" description="인체 이미지에 템플릿을 오버레이합니다.">
            <Card>
              <CardHeader>
                <CardTitle>인체 이미지 미리보기</CardTitle>
                <CardDescription>
                  선택한 템플릿이 사이즈별 인체 이미지 위에 어떻게 입혀지는지 확인하세요. (현재는 대충 그려진 더미 이미지를 사용)
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                    선택한 사이즈의 인체에 패턴이 어떻게 보일지 미리볼 수 있습니다.
                  </p>
                </div>
                <div className="relative h-[500px] border rounded-md overflow-hidden" style={{ background: "#f8f8f8" }}>
                  {/* 인체 이미지 더미 (간단한 SVG로 대체) */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 500" preserveAspectRatio="none">
                    <rect width="200" height="500" fill="#ddd" />
                    <circle cx="100" cy="60" r="40" fill="#bbb" />
                    <rect x="70" y="110" width="60" height="120" fill="#bbb" />
                    <rect x="50" y="230" width="20" height="80" fill="#bbb" />
                    <rect x="130" y="230" width="20" height="80" fill="#bbb" />
                    <rect x="80" y="230" width="40" height="100" fill="#bbb" />
                  </svg>
                  {/* 템플릿 오버레이 SVG */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <defs>
                      <marker id="arrowhead-preview" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L6,3 z" fill="#4F46E5" />
                      </marker>
                    </defs>
                    {lineConnections.map((connection, index) => {
                      const fromCoord = coordinates[connection.fromIndex];
                      const toCoord = coordinates[connection.toIndex];
                      if (!fromCoord || !toCoord) return null;
                      const { adjustedX: fromX, adjustedY: fromY } = calculateAdjustedCoordinates(fromCoord, selectedSizeRange);
                      const { adjustedX: toX, adjustedY: toY } = calculateAdjustedCoordinates(toCoord, selectedSizeRange);
                      const lineColor = connection.measurementItem ? '#4F46E5' : '#9CA3AF';
                      const connectionId = `conn-${connection.fromIndex}-${connection.toIndex}`;
                      if (connection.type === 'straight') {
                        return (
                          <g key={`preview-line-${connection.fromIndex}-${connection.toIndex}-${index}`}>
                            <line
                              x1={`${fromX}%`}
                              y1={`${fromY}%`}
                              x2={`${toX}%`}
                              y2={`${toY}%`}
                              stroke={lineColor}
                              strokeWidth="2"
                              markerEnd={connection.measurementItem ? "url(#arrowhead-preview)" : ""}
                            />
                          </g>
                        );
                      } else {
                        let controlPoint = controlPoints[connectionId];
                        let controlX = (fromX + toX) / 2;
                        let controlY = Math.min(fromY, toY) - 20;
                        if (controlPoint) {
                          controlX = controlPoint.x;
                          controlY = controlPoint.y;
                        }
                        return (
                          <g key={`preview-curve-${connection.fromIndex}-${connection.toIndex}-${index}`}>
                            <path
                              d={`M ${fromX}% ${fromY}% Q ${controlX}% ${controlY}%, ${toX}% ${toY}%`}
                              fill="none"
                              stroke={lineColor}
                              strokeWidth="2"
                              markerEnd={connection.measurementItem ? "url(#arrowhead-preview)" : ""}
                            />
                            <circle
                              cx={`${controlX}%`}
                              cy={`${controlY}%`}
                              r="4"
                              fill="#D1D5DB"
                              stroke="#6366F1"
                              strokeWidth="1"
                            />
                          </g>
                        );
                      }
                    })}
                  </svg>
                </div>
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
