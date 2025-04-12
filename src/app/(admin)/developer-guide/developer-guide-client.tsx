"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, ArrowRight, Workflow, Database, Share2, Settings, Code } from "lucide-react";

export default function DeveloperGuideClient() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">개발자 가이드</h1>
        <p className="text-muted-foreground">
          이 가이드는 뜨도록 관리자페이지의 개발 흐름과 주요 컴포넌트를 설명합니다.
        </p>
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertTitle className="text-blue-700">가이드 사용 방법</AlertTitle>
        <AlertDescription className="text-blue-600">
          이 가이드는 전체 시스템 흐름과 각 기능의 관계를 설명합니다. 각 섹션별 세부 개발 지침은 해당 페이지의 기획 의도 및 개발 지침 카드를 참고하세요.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            시스템 흐름도
          </CardTitle>
          <CardDescription>
            뜨도록 관리자페이지의 주요 워크플로우와 데이터 흐름
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto p-4 bg-slate-50 rounded-md">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1 bg-violet-50 text-violet-700 border-violet-200">1. 치수 규칙 설정</Badge>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">2. 템플릿 생성</Badge>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <Badge variant="outline" className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-200">3. 템플릿 세부 치수 관리</Badge>
              </div>
              <div className="text-sm text-slate-500 pl-4">
                <p>각 단계는 이전 단계에 의존하며, 치수 규칙 → 템플릿 → 세부 치수 순으로 데이터가 흐릅니다.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="dataflow">데이터 흐름</TabsTrigger>
          <TabsTrigger value="components">주요 컴포넌트</TabsTrigger>
          <TabsTrigger value="api">API 엔드포인트</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                시스템 개요
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                뜨도록 관리자페이지는 사용자들이 니팅 도안과 템플릿을 관리할 수 있게 해주는 관리자 대시보드입니다.
                이 시스템은 다음 주요 기능을 제공합니다:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>치수 규칙 관리</strong>: 각 카테고리(상의, 하의 등)와 소매 유형별로 필요한 측정 항목을 정의합니다.
                </li>
                <li>
                  <strong>템플릿 관리</strong>: 치수 규칙을 기반으로 템플릿을 생성하고 관리합니다. 템플릿명은 입력 필드값을 조합하여 자동 생성됩니다.
                </li>
                <li>
                  <strong>세부 치수 관리</strong>: 각 템플릿의 사이즈별 세부 치수를 설정하고 관리합니다.
                </li>
                <li>
                  <strong>차트 유형 관리</strong>: 니트/뜨개 도안에 사용되는 차트 유형을 관리합니다.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                기본 워크플로우
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-violet-50 border-violet-200">
                  <h3 className="font-medium text-violet-800 mb-2">1. 치수 규칙 설정</h3>
                  <p className="text-violet-700">
                    - 카테고리와 소매 유형을 선택하여 새 치수 규칙을 생성합니다.<br />
                    - 각 규칙에 필요한 측정 항목을 선택합니다.<br />
                    - 측정 항목들은 몸통, 소매 등의 섹션으로 그룹화됩니다.
                  </p>
                </div>

                <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">2. 템플릿 생성 및 관리</h3>
                  <p className="text-blue-700">
                    - 치수 규칙을 선택하여 새 템플릿을 생성합니다.<br />
                    - 도구 유형(대바늘/코바늘), 도안 유형(서술형/차트형/혼합형)을 설정합니다.<br />
                    - 조건부 입력 필드(제작 방식, 소매 유형, 넥라인 등)가 선택에 따라 나타납니다.<br />
                    - 입력값을 기반으로 템플릿명이 자동 생성됩니다.
                  </p>
                </div>

                <div className="p-4 border rounded-md bg-emerald-50 border-emerald-200">
                  <h3 className="font-medium text-emerald-800 mb-2">3. 세부 치수 관리</h3>
                  <p className="text-emerald-700">
                    - 템플릿 세부 페이지에서 각 사이즈별 세부 치수를 관리합니다.<br />
                    - 엑셀과 유사한 표 형식으로 데이터를 한번에 복사/붙여넣기할 수 있습니다.<br />
                    - 각 측정 항목별로 사이즈 범위에 따른 치수를 설정합니다.<br />
                    - 'min'과 'max' 값으로 사용자가 조정 가능한 범위를 설정합니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dataflow" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                데이터 모델 및 관계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                시스템의 주요 데이터 엔티티와 그 관계는 다음과 같습니다:
              </p>

              <div className="my-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">주요 엔티티</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>카테고리(Category)</strong>: 계층형 카테고리 구조</li>
                      <li><strong>치수 규칙(MeasurementRule)</strong>: 측정 항목 그룹</li>
                      <li><strong>측정 항목(MeasurementItem)</strong>: 개별 측정 항목</li>
                      <li><strong>템플릿(Template)</strong>: 도안 템플릿</li>
                      <li><strong>차트 유형(ChartType)</strong>: 니팅 차트 유형</li>
                      <li><strong>사이즈 세부 정보(SizeDetail)</strong>: 사이즈별 치수</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">엔티티 관계</h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>치수 규칙 → 카테고리</strong>: 각 치수 규칙은 특정 카테고리에 속함</li>
                      <li><strong>치수 규칙 → 측정 항목</strong>: 치수 규칙은 여러 측정 항목을 포함</li>
                      <li><strong>템플릿 → 치수 규칙</strong>: 각 템플릿은 하나의 치수 규칙에 연결됨</li>
                      <li><strong>템플릿 → 차트 유형</strong>: 템플릿은 여러 차트 유형을 가질 수 있음</li>
                      <li><strong>템플릿 → 사이즈 세부 정보</strong>: 템플릿은 여러 사이즈별 세부 정보를 가짐</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-md bg-amber-50 border-amber-200">
                <h3 className="font-medium text-amber-800 mb-2">데이터 흐름 로직</h3>
                <ol className="list-decimal pl-6 space-y-2 text-amber-700">
                  <li>
                    <strong>카테고리 선택</strong>: 먼저 카테고리(상의, 하의 등)를 선택하여 치수 규칙을 생성합니다.
                  </li>
                  <li>
                    <strong>측정 항목 선택</strong>: 카테고리에 따라 필요한 측정 항목(가슴너비, 소매길이 등)을 선택합니다.
                  </li>
                  <li>
                    <strong>치수 규칙 생성</strong>: 카테고리와 측정 항목을 결합하여 치수 규칙을 생성합니다.
                  </li>
                  <li>
                    <strong>템플릿 생성</strong>: 생성된 치수 규칙을 선택하여 템플릿을 만듭니다.
                  </li>
                  <li>
                    <strong>템플릿 속성 설정</strong>: 템플릿의 도구 유형, 도안 유형, 제작 방식 등을 설정합니다.
                  </li>
                  <li>
                    <strong>세부 치수 입력</strong>: 각 사이즈별로 템플릿에 필요한 세부 치수를 입력합니다.
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                주요 컴포넌트 및 기능
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-md bg-slate-50 border-slate-200">
                  <h3 className="font-medium mb-3">치수 규칙 관련 컴포넌트</h3>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>
                      <strong>MeasurementRuleList</strong>: 치수 규칙 목록 표시 및 관리
                      <p className="text-slate-500 mt-1">- 치수 규칙의 카테고리, 소매 유형, 포함된 측정 항목을 표시</p>
                    </li>
                    <li>
                      <strong>MeasurementRuleForm</strong>: 치수 규칙 생성 및 편집 폼
                      <p className="text-slate-500 mt-1">- 카테고리 선택 및 측정 항목 관리 UI 제공</p>
                    </li>
                    <li>
                      <strong>조건부 입력 필드</strong>: 카테고리에 따라 필요한 필드만 표시
                      <p className="text-slate-500 mt-1">- 상의는 소매 유형 선택 필드가 표시됨</p>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border rounded-md bg-slate-50 border-slate-200">
                  <h3 className="font-medium mb-3">템플릿 관련 컴포넌트</h3>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>
                      <strong>TemplateList</strong>: 템플릿 목록 표시 및 관리
                      <p className="text-slate-500 mt-1">- 자동 생성된 템플릿명과 템플릿 속성을 표 형식으로 표시</p>
                    </li>
                    <li>
                      <strong>TemplateForm</strong>: 템플릿 생성 및 편집 폼
                      <p className="text-slate-500 mt-1">- 치수 규칙 선택 및 템플릿 속성 설정 UI 제공</p>
                      <p className="text-slate-500">- 선택한 항목에 따라 동적으로 입력 필드 표시</p>
                    </li>
                    <li>
                      <strong>자동 템플릿명 생성</strong>: 입력 필드값을 조합하여 템플릿명 자동 생성
                      <p className="text-slate-500 mt-1">- (제작 방식) + (넥라인) + (소매 유형) + (카테고리) 형식으로 생성</p>
                    </li>
                  </ul>
                </div>

                <div className="p-4 border rounded-md bg-slate-50 border-slate-200">
                  <h3 className="font-medium mb-3">세부 치수 관련 컴포넌트</h3>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>
                      <strong>SizeDetailForm</strong>: 세부 치수 입력 및 관리 폼
                      <p className="text-slate-500 mt-1">- 엑셀 형식의 표로 세부 치수 관리</p>
                      <p className="text-slate-500">- 복사/붙여넣기로 한번에 여러 셀 입력 가능</p>
                    </li>
                    <li>
                      <strong>사이즈 범위 관리</strong>: 모든 사이즈 범위에 대한 치수 관리
                      <p className="text-slate-500 mt-1">- min/max 범위 설정으로 사용자가 조정 가능한 범위 지정</p>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                API 엔드포인트 및 개발 참고사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 border rounded-md bg-slate-50 border-slate-200">
                  <h3 className="font-medium mb-3">주요 API 엔드포인트</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    실제 구현 시 다음 API 엔드포인트와 연동해야 합니다:
                  </p>
                  <div className="space-y-3">
                    <div className="p-2 bg-slate-100 rounded">
                      <h4 className="text-sm font-semibold">카테고리 API</h4>
                      <ul className="text-xs text-slate-600 pl-4 mt-1 space-y-1">
                        <li>GET /api/categories - 모든 카테고리 가져오기</li>
                        <li>GET /api/categories/[id] - 특정 카테고리 가져오기</li>
                      </ul>
                    </div>

                    <div className="p-2 bg-slate-100 rounded">
                      <h4 className="text-sm font-semibold">치수 규칙 API</h4>
                      <ul className="text-xs text-slate-600 pl-4 mt-1 space-y-1">
                        <li>GET /api/measurement-rules - 모든 치수 규칙 가져오기</li>
                        <li>GET /api/measurement-rules/[id] - 특정 치수 규칙 가져오기</li>
                        <li>POST /api/measurement-rules - 새 치수 규칙 생성</li>
                        <li>PUT /api/measurement-rules/[id] - 치수 규칙 업데이트</li>
                        <li>DELETE /api/measurement-rules/[id] - 치수 규칙 삭제</li>
                      </ul>
                    </div>

                    <div className="p-2 bg-slate-100 rounded">
                      <h4 className="text-sm font-semibold">템플릿 API</h4>
                      <ul className="text-xs text-slate-600 pl-4 mt-1 space-y-1">
                        <li>GET /api/templates - 모든 템플릿 가져오기</li>
                        <li>GET /api/templates/[id] - 특정 템플릿 가져오기</li>
                        <li>POST /api/templates - 새 템플릿 생성</li>
                        <li>PUT /api/templates/[id] - 템플릿 업데이트</li>
                        <li>PUT /api/templates/[id]/size-details - 템플릿 세부 치수 업데이트</li>
                        <li>DELETE /api/templates/[id] - 템플릿 삭제</li>
                      </ul>
                    </div>

                    <div className="p-2 bg-slate-100 rounded">
                      <h4 className="text-sm font-semibold">차트 유형 API</h4>
                      <ul className="text-xs text-slate-600 pl-4 mt-1 space-y-1">
                        <li>GET /api/chart-types - 모든 차트 유형 가져오기</li>
                        <li>GET /api/chart-types/[id] - 특정 차트 유형 가져오기</li>
                        <li>POST /api/chart-types - 새 차트 유형 생성</li>
                        <li>PUT /api/chart-types/[id] - 차트 유형 업데이트</li>
                        <li>DELETE /api/chart-types/[id] - 차트 유형 삭제</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-200">
                  <Settings className="h-5 w-5 text-amber-500" />
                  <AlertTitle className="text-amber-700">개발 환경 설정</AlertTitle>
                  <AlertDescription className="text-amber-600">
                    <p>개발 시 다음 사항을 참고하세요:</p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>이 프로젝트는 Next.js 프레임워크를 사용합니다.</li>
                      <li>UI 컴포넌트는 shadcn/ui 라이브러리를 기반으로 합니다.</li>
                      <li>상태 관리는 React의 기본 훅(useState, useEffect 등)을 사용합니다.</li>
                      <li>실제 구현 시 API 통신에는 SWR 또는 React Query를 사용하는 것을 권장합니다.</li>
                      <li>현재 데이터는 모의 데이터로 src/lib/data.ts 파일에서 관리됩니다.</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            추가 개발 참고사항
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            이 시스템을 개발하면서 특히 유의해야 할 사항들입니다:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>조건부 UI 렌더링</strong>:
              <p className="text-slate-600 mt-1">
                사용자 선택에 따라 적절한 입력 필드가 동적으로 표시되어야 합니다.
                특히 TemplateForm 컴포넌트에서 도구 유형, 카테고리, 도안 유형 등에 따라 다른 입력 필드가 표시됩니다.
              </p>
            </li>
            <li>
              <strong>데이터 관계 유지</strong>:
              <p className="text-slate-600 mt-1">
                치수 규칙과 템플릿 간의 관계, 템플릿과 세부 치수 간의 관계가 항상 유지되어야 합니다.
                치수 규칙이 변경되면 연결된 템플릿의 세부 치수도 적절히 조정되어야 합니다.
              </p>
            </li>
            <li>
              <strong>자동 템플릿명 생성</strong>:
              <p className="text-slate-600 mt-1">
                템플릿명은 입력된 필드값들을 조합하여 자동으로 생성됩니다.
                이를 위해 generateTemplateName 함수를 사용하여 일관된 형식의 템플릿명을 생성합니다.
              </p>
            </li>
            <li>
              <strong>엑셀 스타일 데이터 입력</strong>:
              <p className="text-slate-600 mt-1">
                SizeDetailForm 컴포넌트는 엑셀과 유사한 표 형식의 UI를 제공합니다.
                복사/붙여넣기 기능을 통해 한번에 여러 셀의 데이터를 입력할 수 있도록 구현되어 있습니다.
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
