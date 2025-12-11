import { useRef, useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  MapPin,
  Building2,
  Database,
  TrendingUp,
  Globe,
  BarChart3,
  Zap,
  DollarSign,
  ArrowLeft,
  Download,
  ChevronDown,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { jsPDF } from "jspdf";
import type { CompanyReport, ReportTemplate } from "@shared/schema";
import { reportTemplateLabels, reportTemplateDescriptions } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export interface TemplatedReportData extends CompanyReport {
  templateType: ReportTemplate;
  templateSubtitle: string;
  sectionOrder: string[];
  emphasisItems: Record<string, number[]>;
}

function generatePDF(report: CompanyReport): { success: boolean; error?: string } {
  try {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  const addSectionHeader = (title: string) => {
    addNewPageIfNeeded(20);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175);
    doc.text(title, margin, yPosition);
    yPosition += 8;
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
  };

  const addParagraph = (text: string, indent = 0) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    lines.forEach((line: string) => {
      addNewPageIfNeeded(6);
      doc.text(line, margin + indent, yPosition);
      yPosition += 5;
    });
    yPosition += 2;
  };

  const addBulletPoint = (text: string) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const bulletX = margin + 3;
    doc.setFillColor(30, 64, 175);
    addNewPageIfNeeded(6);
    doc.circle(bulletX, yPosition - 1.5, 1, "F");
    const lines = doc.splitTextToSize(text, contentWidth - 10);
    lines.forEach((line: string, idx: number) => {
      addNewPageIfNeeded(6);
      doc.text(line, margin + 8, yPosition);
      if (idx < lines.length - 1) yPosition += 5;
    });
    yPosition += 6;
  };

  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(report.header.companyName, margin, 25);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Private Equity Investment Memo", margin, 35);

  yPosition = 55;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const headerInfo = `Date: ${report.header.date}  |  Sector: ${report.header.sector}  |  HQ: ${report.header.headquarters}`;
  doc.text(headerInfo, margin, yPosition);
  yPosition += 6;
  
  const sources = `Data Sources: ${report.header.sourceDatabases.join(", ")}`;
  const sourcesLines = doc.splitTextToSize(sources, contentWidth);
  sourcesLines.forEach((line: string) => {
    doc.text(line, margin, yPosition);
    yPosition += 5;
  });
  yPosition += 10;

  addSectionHeader("Executive Summary");
  report.executiveSummary.forEach((point, idx) => {
    addNewPageIfNeeded(10);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 64, 175);
    doc.text(`${idx + 1}.`, margin, yPosition);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(point, contentWidth - 10);
    lines.forEach((line: string, lineIdx: number) => {
      addNewPageIfNeeded(6);
      doc.text(line, margin + 8, yPosition);
      if (lineIdx < lines.length - 1) yPosition += 5;
    });
    yPosition += 8;
  });

  yPosition += 5;
  addSectionHeader("Country Analysis");
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  addNewPageIfNeeded(8);
  
  const colWidth = contentWidth / 3;
  doc.text("Parameter", margin, yPosition);
  doc.text("India", margin + colWidth, yPosition);
  doc.text("Singapore", margin + colWidth * 2, yPosition);
  yPosition += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  const cellWidth = colWidth - 5;
  report.countryAnalysis.table.forEach((row) => {
    const paramLines = doc.splitTextToSize(row.parameter, cellWidth);
    const indiaLines = doc.splitTextToSize(row.india, cellWidth);
    const singaporeLines = doc.splitTextToSize(row.singapore, cellWidth);
    const maxLines = Math.max(paramLines.length, indiaLines.length, singaporeLines.length);
    const rowHeight = maxLines * 5 + 3;
    
    addNewPageIfNeeded(rowHeight);
    
    for (let i = 0; i < maxLines; i++) {
      doc.setFont("helvetica", i === 0 ? "bold" : "normal");
      if (paramLines[i]) doc.text(paramLines[i], margin, yPosition);
      doc.setFont("helvetica", "normal");
      if (indiaLines[i]) doc.text(indiaLines[i], margin + colWidth, yPosition);
      if (singaporeLines[i]) doc.text(singaporeLines[i], margin + colWidth * 2, yPosition);
      yPosition += 5;
    }
    yPosition += 2;
  });

  yPosition += 5;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  addNewPageIfNeeded(8);
  doc.text("Key Insights", margin, yPosition);
  yPosition += 6;

  report.countryAnalysis.keyPoints.forEach((point) => {
    addBulletPoint(point);
  });

  yPosition += 5;
  addSectionHeader("Financial Analysis");
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  addNewPageIfNeeded(8);
  doc.text("Quality of Earnings", margin, yPosition);
  yPosition += 6;

  report.financialAnalysis.qualityOfEarnings.forEach((item) => {
    addNewPageIfNeeded(12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(`${item.label}:`, margin + 3, yPosition);
    yPosition += 5;
    addParagraph(item.detail, 3);
  });

  yPosition += 3;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  addNewPageIfNeeded(8);
  doc.text("Growth & Positioning", margin, yPosition);
  yPosition += 6;

  report.financialAnalysis.growthAndPositioning.forEach((item) => {
    addNewPageIfNeeded(12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(`${item.label}:`, margin + 3, yPosition);
    yPosition += 5;
    addParagraph(item.detail, 3);
  });

  yPosition += 5;
  addSectionHeader("Operational Strength & Value Creation");
  report.operationalAndValueCreation.forEach((point) => {
    addBulletPoint(point);
  });

  yPosition += 5;
  addSectionHeader("Exit Feasibility");
  report.exitFeasibility.forEach((point) => {
    addBulletPoint(point);
  });

  yPosition += 10;
  addNewPageIfNeeded(20);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(120, 120, 120);
  doc.text("This document is confidential and intended for the recipient only.", margin, yPosition);
  yPosition += 5;
  doc.text(`Generated on ${new Date().toLocaleDateString()} by PE Target Finder`, margin, yPosition);

  const fileName = `${report.header.companyName.replace(/\s+/g, "_")}_Investment_Memo.pdf`;
  doc.save(fileName);
  return { success: true };
  } catch (error) {
    console.error("PDF generation failed:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
}

interface ReportViewProps {
  report: TemplatedReportData;
  onBack?: () => void;
  className?: string;
  selectedTemplate: ReportTemplate;
  onTemplateChange: (template: ReportTemplate) => void;
}

const sections = [
  { id: "executive-summary", label: "Executive Summary", icon: FileText },
  { id: "country-analysis", label: "Country Analysis", icon: Globe },
  { id: "financial-analysis", label: "Financial Analysis", icon: BarChart3 },
  { id: "operational", label: "Operational Strength", icon: Zap },
  { id: "exit-feasibility", label: "Exit Feasibility", icon: DollarSign },
];

export function ReportView({ report, onBack, className, selectedTemplate, onTemplateChange }: ReportViewProps) {
  const [activeSection, setActiveSection] = useState("executive-summary");
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const sectionComponents: Record<string, () => JSX.Element> = {
    executiveSummary: () => (
      <section id="executive-summary" key="executive-summary">
        <ExecutiveSummarySection 
          summary={report.executiveSummary} 
          emphasisIndices={report.emphasisItems?.executiveSummary || []}
        />
      </section>
    ),
    countryAnalysis: () => (
      <section id="country-analysis" key="country-analysis">
        <CountryAnalysisSection 
          analysis={report.countryAnalysis}
          emphasisIndices={report.emphasisItems?.countryAnalysisKeyPoints || []}
        />
      </section>
    ),
    financialAnalysis: () => (
      <section id="financial-analysis" key="financial-analysis">
        <FinancialAnalysisSection analysis={report.financialAnalysis} />
      </section>
    ),
    operationalAndValueCreation: () => (
      <section id="operational" key="operational">
        <OperationalSection 
          points={report.operationalAndValueCreation}
          emphasisIndices={report.emphasisItems?.operationalAndValueCreation || []}
        />
      </section>
    ),
    exitFeasibility: () => (
      <section id="exit-feasibility" key="exit-feasibility">
        <ExitFeasibilitySection 
          points={report.exitFeasibility}
          emphasisIndices={report.emphasisItems?.exitFeasibility || []}
        />
      </section>
    ),
  };

  const orderedSections = report.sectionOrder || [
    "executiveSummary",
    "countryAnalysis",
    "financialAnalysis",
    "operationalAndValueCreation",
    "exitFeasibility",
  ];

  const handleExportPdf = () => {
    const result = generatePDF(report);
    if (result.success) {
      toast({
        title: "PDF exported",
        description: `${report.header.companyName} investment memo has been downloaded.`,
      });
    } else {
      toast({
        title: "Export failed",
        description: result.error || "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const sectionElements = sections.map(s => ({
        id: s.id,
        element: document.getElementById(s.id)
      })).filter(s => s.element);

      for (const section of sectionElements) {
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    const scrollContainer = contentRef.current;
    scrollContainer?.addEventListener("scroll", handleScroll);
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn("flex h-full", className)} data-testid="report-view">
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-muted/30 p-4">
        <div className="mb-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-4" data-testid="button-back-to-comparison">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Report Navigation
          </h3>
        </div>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md transition-colors text-left",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover-elevate"
              )}
              data-testid={`nav-${section.id}`}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
            </button>
          ))}
        </nav>
      </aside>

      <ScrollArea ref={contentRef} className="flex-1">
        <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-8">
          <ReportHeader 
            report={report} 
            onBack={onBack} 
            onExportPdf={handleExportPdf}
            selectedTemplate={selectedTemplate}
            onTemplateChange={onTemplateChange}
          />
          
          {orderedSections.map((sectionKey) => {
            const Component = sectionComponents[sectionKey];
            return Component ? Component() : null;
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ReportHeaderProps {
  report: TemplatedReportData;
  onBack?: () => void;
  onExportPdf: () => void;
  selectedTemplate: ReportTemplate;
  onTemplateChange: (template: ReportTemplate) => void;
}

function ReportHeader({ report, onBack, onExportPdf, selectedTemplate, onTemplateChange }: ReportHeaderProps) {
  return (
    <div className="space-y-4" data-testid="report-header">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden" data-testid="button-back-mobile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Comparison
          </Button>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Select value={selectedTemplate} onValueChange={(v) => onTemplateChange(v as ReportTemplate)}>
            <SelectTrigger className="w-[180px]" data-testid="select-report-template">
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(reportTemplateLabels) as ReportTemplate[]).map((template) => (
                <SelectItem key={template} value={template} data-testid={`template-option-${template}`}>
                  <div className="flex items-center gap-2">
                    <span>{reportTemplateLabels[template]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onExportPdf} data-testid="button-export-pdf">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-6 border border-primary/20">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline" className="text-xs">
            {report.templateSubtitle || "Investment Memo"}
          </Badge>
          <span className="text-muted-foreground/50">|</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {report.header.date}
          </span>
          <span className="text-muted-foreground/50">|</span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {report.header.sector}
          </span>
          <span className="text-muted-foreground/50">|</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {report.header.headquarters}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {report.header.companyName}
        </h1>
        
        <p className="text-sm text-muted-foreground mb-4">
          {reportTemplateDescriptions[selectedTemplate]}
        </p>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Database className="h-3.5 w-3.5" />
            Data Sources:
          </span>
          {report.header.sourceDatabases.map((source) => (
            <Badge key={source} variant="secondary" className="text-xs">
              {source}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExecutiveSummarySection({ summary, emphasisIndices = [] }: { summary: string[]; emphasisIndices?: number[] }) {
  return (
    <Card data-testid="section-executive-summary">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          Executive Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {summary.map((point, idx) => {
            const isEmphasis = emphasisIndices.includes(idx);
            return (
              <li key={idx} className={cn(
                "flex items-start gap-3 text-base leading-relaxed",
                isEmphasis && "bg-primary/5 rounded-lg p-3 -mx-3"
              )}>
                <span className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center mt-0.5",
                  isEmphasis ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                )}>
                  {isEmphasis ? <Star className="h-3 w-3" /> : idx + 1}
                </span>
                <div className="flex-1">
                  {isEmphasis && (
                    <Badge variant="outline" className="text-xs mb-1 mr-2">
                      Key Focus
                    </Badge>
                  )}
                  <span className="text-foreground">{point}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function CountryAnalysisSection({ analysis, emphasisIndices = [] }: { analysis: CompanyReport["countryAnalysis"]; emphasisIndices?: number[] }) {
  return (
    <Card data-testid="section-country-analysis">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Globe className="h-5 w-5 text-primary" />
          Country Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Parameter</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">India</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Singapore</th>
              </tr>
            </thead>
            <tbody>
              {analysis.table.map((row, idx) => (
                <tr key={idx} className={cn("border-b border-border/50", idx % 2 === 0 && "bg-muted/20")}>
                  <td className="py-3 px-4 font-medium text-foreground">{row.parameter}</td>
                  <td className="py-3 px-4 text-muted-foreground">{row.india}</td>
                  <td className="py-3 px-4 text-muted-foreground">{row.singapore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-foreground mb-3">Key Insights</h4>
          <ul className="space-y-2">
            {analysis.keyPoints.map((point, idx) => {
              const isEmphasis = emphasisIndices.includes(idx);
              return (
                <li key={idx} className={cn(
                  "flex items-start gap-2 text-sm",
                  isEmphasis ? "text-foreground bg-primary/5 rounded-lg p-2 -mx-2" : "text-muted-foreground"
                )}>
                  {isEmphasis ? (
                    <Star className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    {isEmphasis && (
                      <Badge variant="outline" className="text-xs mb-1 mr-2">
                        Key Focus
                      </Badge>
                    )}
                    {point}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialAnalysisSection({ analysis }: { analysis: CompanyReport["financialAnalysis"] }) {
  return (
    <Card data-testid="section-financial-analysis">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="h-5 w-5 text-primary" />
          Financial Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-foreground mb-4">Quality of Earnings</h4>
          <div className="grid gap-3">
            {analysis.qualityOfEarnings.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3 bg-muted/30 rounded-lg">
                <span className="font-medium text-foreground min-w-[180px]">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-semibold text-foreground mb-4">Growth & Positioning</h4>
          <div className="grid gap-3">
            {analysis.growthAndPositioning.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-3 bg-muted/30 rounded-lg">
                <span className="font-medium text-foreground min-w-[180px]">{item.label}</span>
                <span className="text-sm text-muted-foreground">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OperationalSection({ points, emphasisIndices = [] }: { points: string[]; emphasisIndices?: number[] }) {
  return (
    <Card data-testid="section-operational">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="h-5 w-5 text-primary" />
          Operational Strength & Value Creation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {points.map((point, idx) => {
            const isEmphasis = emphasisIndices.includes(idx);
            return (
              <li key={idx} className={cn(
                "flex items-start gap-3 text-sm",
                isEmphasis ? "text-foreground bg-primary/5 rounded-lg p-3 -mx-3" : "text-muted-foreground"
              )}>
                {isEmphasis ? (
                  <Star className="flex-shrink-0 h-4 w-4 text-primary mt-0.5" />
                ) : (
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                )}
                <div>
                  {isEmphasis && (
                    <Badge variant="outline" className="text-xs mb-1 mr-2">
                      Key Focus
                    </Badge>
                  )}
                  {point}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

function ExitFeasibilitySection({ points, emphasisIndices = [] }: { points: string[]; emphasisIndices?: number[] }) {
  return (
    <Card data-testid="section-exit-feasibility">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <DollarSign className="h-5 w-5 text-primary" />
          Exit Feasibility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {points.map((point, idx) => {
            const isEmphasis = emphasisIndices.includes(idx);
            return (
              <li key={idx} className={cn(
                "flex items-start gap-3 text-sm",
                isEmphasis ? "text-foreground bg-primary/5 rounded-lg p-3 -mx-3" : "text-muted-foreground"
              )}>
                {isEmphasis ? (
                  <Star className="flex-shrink-0 h-4 w-4 text-primary mt-0.5" />
                ) : (
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                )}
                <div>
                  {isEmphasis && (
                    <Badge variant="outline" className="text-xs mb-1 mr-2">
                      Key Focus
                    </Badge>
                  )}
                  {point}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
