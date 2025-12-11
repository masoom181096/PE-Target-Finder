import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, FileText } from "lucide-react";
import { ReportView, TemplatedReportData } from "@/components/report-view";
import type { ShortlistedCompanyScore, ReportTemplate, Thresholds } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DueDiligenceReportsProps {
  companyIds: string[];
  companies: ShortlistedCompanyScore[];
  reportTemplate: ReportTemplate;
  onTemplateChange: (template: ReportTemplate) => void;
  thresholds: Thresholds;
}

export function DueDiligenceReports({
  companyIds,
  companies,
  reportTemplate,
  onTemplateChange,
  thresholds,
}: DueDiligenceReportsProps) {
  const [activeTab, setActiveTab] = useState(companyIds[0] || "");
  const [reports, setReports] = useState<Record<string, TemplatedReportData>>({});

  const selectedCompanies = companies.filter((c) => companyIds.includes(c.id));

  useEffect(() => {
    companyIds.forEach((id) => {
      if (!reports[id]) {
        fetch(`/api/report/${id}?templateType=${reportTemplate}`)
          .then((res) => res.json())
          .then((data) => {
            setReports((prev) => ({ ...prev, [id]: data }));
          });
      }
    });
  }, [companyIds, reportTemplate]);

  const handleTemplateChange = (template: ReportTemplate) => {
    onTemplateChange(template);
    setReports({});
  };

  return (
    <div className="w-full max-w-5xl mx-auto" data-testid="due-diligence-reports">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Due Diligence Reports</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Review detailed investment memos for your selected companies. Use the tabs to switch between reports.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {selectedCompanies.map((company) => (
            <TabsTrigger
              key={company.id}
              value={company.id}
              className="flex items-center gap-2"
              data-testid={`tab-report-${company.id}`}
            >
              <Building2 className="h-4 w-4" />
              {company.name}
              <Badge variant="outline" className="ml-1 text-xs">
                {company.score}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {selectedCompanies.map((company) => (
          <TabsContent key={company.id} value={company.id} className="mt-0">
            {reports[company.id] ? (
              <ReportView
                report={reports[company.id]}
                selectedTemplate={reportTemplate}
                onTemplateChange={handleTemplateChange}
                companyId={company.id}
                thresholds={thresholds}
                className="border-0"
                embedded
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Generating report for {company.name}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
