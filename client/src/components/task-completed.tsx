import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, FileText, ArrowRight, Download, Loader2 } from "lucide-react";
import { ReportView, TemplatedReportData } from "@/components/report-view";
import { useToast } from "@/hooks/use-toast";
import type { ReportTemplate, Thresholds } from "@shared/schema";
import { defaultThresholds } from "@shared/schema";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface TaskCompletedProps {
  companyName: string;
  companyId: string;
  sessionId: string;
  thresholds?: Thresholds;
  onStartNew?: () => void;
}

export function TaskCompleted({ companyName, companyId, sessionId, thresholds = defaultThresholds, onStartNew }: TaskCompletedProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [report, setReport] = useState<TemplatedReportData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate>("growth");
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (companyId) {
      fetchReport(selectedTemplate);
    }
  }, [companyId, selectedTemplate]);

  const fetchReport = async (template: ReportTemplate) => {
    setIsLoadingReport(true);
    try {
      const response = await fetch(`/api/report/${companyId}?templateType=${template}`);
      if (!response.ok) throw new Error("Failed to fetch report");
      const data = await response.json();
      const reportData: TemplatedReportData = {
        ...data,
        emphasisItems: new Map(Object.entries(data.emphasisItems || {})),
      };
      setReport(reportData);
    } catch (error) {
      console.error("Error fetching report:", error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById("report-pdf-root");
    if (!element) {
      toast({
        title: "Error",
        description: "Report not found for PDF generation",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const finalHeight = Math.min(imgHeight, pageHeight);

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, finalHeight);
      pdf.save(`${companyName.replace(/\s+/g, "_")}_PE_Report.pdf`);

      toast({
        title: "Success",
        description: "PDF report downloaded successfully",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="w-full py-8" data-testid="task-completed">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3" data-testid="text-task-completed-heading">
          Task Completed
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Congratulations! You have successfully completed the investment screening process.
        </p>
      </div>

      <Card className="mb-6 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Investment Decision Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <span className="font-semibold">{companyName}</span> has been selected as your preferred investment target.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Next Steps</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  The investment memo for <span className="font-medium text-foreground">{companyName}</span> has been generated and is ready for your investment committee review.
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Schedule a preliminary call with the target company management team.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Begin detailed due diligence with external advisors.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Prepare indicative offer letter and term sheet.</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 items-center mb-8">
        {companyId ? (
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloading || isLoadingReport || !report}
            data-testid="button-download-report"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Final Report (PDF)
              </>
            )}
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a preferred company in the due diligence view to enable report download.
          </p>
        )}

        {onStartNew && (
          <Button
            variant="outline"
            onClick={onStartNew}
            data-testid="button-start-new-screening"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Start New Screening
          </Button>
        )}
      </div>

      {report && (
        <div id="report-pdf-root" className="bg-white dark:bg-background">
          <ReportView
            report={report}
            selectedTemplate={selectedTemplate}
            onTemplateChange={setSelectedTemplate}
            companyId={companyId}
            thresholds={thresholds}
            embedded={true}
          />
        </div>
      )}

      {isLoadingReport && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
