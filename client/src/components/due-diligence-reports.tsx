import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Building2,
  FileText,
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Star,
} from "lucide-react";
import { ReportView, TemplatedReportData } from "@/components/report-view";
import type { ShortlistedCompanyScore, ReportTemplate, Thresholds, RiskGrade } from "@shared/schema";
import { cn } from "@/lib/utils";

function getRiskGradeColor(grade: RiskGrade | undefined): string {
  switch (grade) {
    case "Low":
      return "text-green-600 dark:text-green-400";
    case "Medium":
      return "text-yellow-600 dark:text-yellow-400";
    case "High":
      return "text-red-600 dark:text-red-400";
    default:
      return "text-muted-foreground";
  }
}

function getRiskGradeBgColor(grade: RiskGrade | undefined): string {
  switch (grade) {
    case "Low":
      return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
    case "Medium":
      return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
    case "High":
      return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
    default:
      return "bg-muted border-border";
  }
}

function getRiskGradeIcon(grade: RiskGrade | undefined) {
  switch (grade) {
    case "Low":
      return <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case "Medium":
      return <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    case "High":
      return <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />;
    default:
      return <Shield className="h-4 w-4 text-muted-foreground" />;
  }
}

interface DueDiligenceReportsProps {
  companyIds: string[];
  companies: ShortlistedCompanyScore[];
  reportTemplate: ReportTemplate;
  onTemplateChange: (template: ReportTemplate) => void;
  thresholds: Thresholds;
  onSelectPreferred?: (companyId: string) => void;
  preferredCompanyId?: string;
}

export function DueDiligenceReports({
  companyIds,
  companies,
  reportTemplate,
  onTemplateChange,
  thresholds,
  onSelectPreferred,
  preferredCompanyId,
}: DueDiligenceReportsProps) {
  const [activeTab, setActiveTab] = useState(companyIds[0] || "");
  const [reports, setReports] = useState<Record<string, TemplatedReportData>>({});
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<string | null>(null);

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

  const handleSelectPreferred = (companyId: string) => {
    setPendingSelection(companyId);
    setConfirmDialogOpen(true);
  };

  const confirmSelection = () => {
    if (pendingSelection && onSelectPreferred) {
      onSelectPreferred(pendingSelection);
    }
    setConfirmDialogOpen(false);
    setPendingSelection(null);
  };

  const pendingCompany = pendingSelection
    ? selectedCompanies.find((c) => c.id === pendingSelection)
    : null;

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

      {selectedCompanies.length > 1 && (
        <Card className="mb-6" data-testid="risk-comparison-strip">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Risk Comparison</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {selectedCompanies.map((company) => {
                const report = reports[company.id];
                const riskGrade = report?.riskAssessment?.grade;
                const isPreferred = preferredCompanyId === company.id;
                return (
                  <div
                    key={company.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                      getRiskGradeBgColor(riskGrade),
                      isPreferred && "ring-2 ring-primary ring-offset-2"
                    )}
                    data-testid={`risk-card-${company.id}`}
                  >
                    {isPreferred && (
                      <Star className="h-4 w-4 text-primary fill-primary" />
                    )}
                    <span className="text-sm font-medium text-foreground">{company.name}</span>
                    {report?.riskAssessment ? (
                      <div className="flex items-center gap-1">
                        {getRiskGradeIcon(riskGrade)}
                        <span className={cn("text-sm font-semibold", getRiskGradeColor(riskGrade))}>
                          {riskGrade}
                        </span>
                      </div>
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {selectedCompanies.map((company) => {
            const isPreferred = preferredCompanyId === company.id;
            return (
              <TabsTrigger
                key={company.id}
                value={company.id}
                className="flex items-center gap-2"
                data-testid={`tab-report-${company.id}`}
              >
                {isPreferred && <Star className="h-3 w-3 text-primary fill-primary" />}
                <Building2 className="h-4 w-4" />
                {company.name}
                <Badge variant="outline" className="ml-1 text-xs">
                  {company.score}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {selectedCompanies.map((company) => {
          const isPreferred = preferredCompanyId === company.id;
          return (
            <TabsContent key={company.id} value={company.id} className="mt-0">
              {onSelectPreferred && (
                <div className="mb-4 flex items-center justify-end gap-2">
                  {isPreferred ? (
                    <Badge className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20">
                      <CheckCircle2 className="h-3 w-3" />
                      Selected as Preferred
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectPreferred(company.id)}
                      data-testid={`button-select-preferred-${company.id}`}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Select as Preferred
                    </Button>
                  )}
                </div>
              )}
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
          );
        })}
      </Tabs>

      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Selection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to select{" "}
              <span className="font-semibold text-foreground">
                {pendingCompany?.name}
              </span>{" "}
              as your preferred company for this investment?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-selection">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSelection}
              data-testid="button-confirm-selection"
            >
              Confirm Selection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
