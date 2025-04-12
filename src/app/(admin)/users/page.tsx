import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { users } from "@/lib/data";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">사용자 관리</h1>
        <p className="text-muted-foreground">
          시스템 사용자를 관리합니다. 새 사용자를 추가하거나 기존 사용자 권한을 수정할 수 있습니다.
        </p>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-800 flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5" />
            기획 의도 및 개발 지침 (미정)
          </CardTitle>
        </CardHeader>
        <CardContent className="text-amber-700 space-y-2 text-sm">
          <p>
            <strong>알림:</strong> 사용자 관리 페이지의 정확한 기획 의도와 개발 지침은 아직 확정되지 않았습니다.
            이 섹션은 샘플 UI 구현 용도로만 제공되며, 실제 개발 시 기획에 맞게 수정되어야 합니다.
          </p>
          <p className="mt-2">
            <strong>개발자 참고사항:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>사용자 관리와 관련된 기능 요구사항은 기획 진행 중입니다.</li>
            <li>인증 및 권한 관리 시스템은 별도 기획을 통해 결정될 예정입니다.</li>
            <li>현재 표시된 UI와 필드는 예시용이며 실제 구현 시 변경될 수 있습니다.</li>
            <li>필요한 API 엔드포인트와 인증 방식은 백엔드 개발팀과 협의 후 결정됩니다.</li>
            <li>이 섹션은 기획 확정 후 실제 요구사항으로 대체해 주세요.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg">
          새 사용자 추가
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>
            시스템에 등록된 사용자 목록입니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>마지막 로그인</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${user.status === '활성' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">사용자 정보 수정</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Alert variant="info" className="bg-blue-50 border-blue-200 text-blue-800">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p><strong>샘플 데이터 안내:</strong> 현재 보이는 데이터는 예시용입니다. 실제 구현 시 백엔드 API와 연동하여 실제 데이터를 표시해야 합니다.</p>
          <p className="mt-1"><strong>개발 예정:</strong> 사용자 관리 기능은 추후 보안 요구사항과 인증 시스템 구현에 따라 수정될 예정입니다.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
