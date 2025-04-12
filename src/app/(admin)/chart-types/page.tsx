import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";
import { chartTypes } from "@/lib/data";
import { ChartTypeList } from "@/features/chart-types/components/chart-type-list";

export default function ChartTypesPage() {
  return (
    <ChartTypeList />
  );
}
