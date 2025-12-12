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
  ChevronUp,
  Loader2,
  Target,
  AlertTriangle,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { jsPDF } from "jspdf";
import type { CompanyReport, ReportTemplate, Thresholds } from "@shared/schema";
import { reportTemplateLabels, reportTemplateDescriptions, defaultThresholds } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ContractRiskSection } from "@/components/contract-risk-section";

interface CompanyDetails {
  id: string;
  name: string;
  recurringRevenuePct: number;
  revenueGrowthPct: number;
  fcfConversionPct: number;
  debtToEbitda: number;
  industryGrowthPct: number;
  customerConcentrationPct: number;
  qualityOfEarningsScore: number;
  financialPerformanceScore: number;
  industryAttractivenessScore: number;
  competitivePositioningScore: number;
  managementGovernanceScore: number;
  operationalEfficiencyScore: number;
  customerMarketDynamicsScore: number;
  productStrengthScore: number;
  exitFeasibilityScore: number;
  scalabilityPotentialScore: number;
}

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
  companyId?: string;
  thresholds?: Thresholds;
  embedded?: boolean;
}

const sections = [
  { id: "executive-summary", label: "Executive Summary", icon: FileText },
  { id: "country-analysis", label: "Country Analysis", icon: Globe },
  { id: "financial-analysis", label: "Financial Analysis", icon: BarChart3 },
  { id: "operational", label: "Operational Strength", icon: Zap },
  { id: "exit-feasibility", label: "Exit Feasibility", icon: DollarSign },
  { id: "contract-risk", label: "Contract Risk", icon: AlertTriangle },
];

export function ReportView({ report, onBack, className, selectedTemplate, onTemplateChange, companyId, thresholds = defaultThresholds, embedded = false }: ReportViewProps) {
  const [activeSection, setActiveSection] = useState("executive-summary");
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [scoringChartOpen, setScoringChartOpen] = useState(true);
  const [financialChartOpen, setFinancialChartOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (companyId) {
      setIsLoadingDetails(true);
      setCompanyDetails(null);
      fetch(`/api/companies/${companyId}/details`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data && data.id) {
            setCompanyDetails(data);
          } else {
            setCompanyDetails(null);
          }
          setIsLoadingDetails(false);
        })
        .catch((err) => {
          console.error("Failed to fetch company details:", err);
          setCompanyDetails(null);
          setIsLoadingDetails(false);
        });
    }
  }, [companyId]);

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
          
          {orderedSections.map((sectionKey, index) => {
            const Component = sectionComponents[sectionKey];
            return (
              <div key={sectionKey}>
                {Component ? Component() : null}
                {sectionKey === "executiveSummary" && (
                  <div className="mt-8">
                    <ScoringRadarChartSection
                      companyDetails={companyDetails}
                      isLoading={isLoadingDetails}
                      isOpen={scoringChartOpen}
                      onOpenChange={setScoringChartOpen}
                    />
                  </div>
                )}
                {sectionKey === "financialAnalysis" && (
                  <div className="mt-8">
                    <FinancialMetricsChartSection
                      companyDetails={companyDetails}
                      thresholds={thresholds}
                      isLoading={isLoadingDetails}
                      isOpen={financialChartOpen}
                      onOpenChange={setFinancialChartOpen}
                    />
                  </div>
                )}
                {sectionKey === "exitFeasibility" && report.riskAssessment && (
                  <section id="contract-risk" className="mt-8">
                    <ContractRiskSection riskAssessment={report.riskAssessment} />
                  </section>
                )}
              </div>
            );
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

const SCORING_DIMENSIONS = [
  { key: "qualityOfEarningsScore", label: "Quality of Earnings", shortLabel: "QoE" },
  { key: "financialPerformanceScore", label: "Financial Performance", shortLabel: "Financial" },
  { key: "industryAttractivenessScore", label: "Industry Attractiveness", shortLabel: "Industry" },
  { key: "competitivePositioningScore", label: "Competitive Positioning", shortLabel: "Competitive" },
  { key: "managementGovernanceScore", label: "Management & Governance", shortLabel: "Mgmt" },
  { key: "operationalEfficiencyScore", label: "Operational Efficiency", shortLabel: "Operations" },
  { key: "customerMarketDynamicsScore", label: "Customer & Market", shortLabel: "Customer" },
  { key: "productStrengthScore", label: "Product Strength", shortLabel: "Product" },
  { key: "exitFeasibilityScore", label: "Exit Feasibility", shortLabel: "Exit" },
  { key: "scalabilityPotentialScore", label: "Scalability Potential", shortLabel: "Scalability" },
];

const BENCHMARK_THRESHOLD = 70;

interface ScoringRadarChartSectionProps {
  companyDetails: CompanyDetails | null;
  isLoading: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function ScoringRadarChartSection({ companyDetails, isLoading, isOpen, onOpenChange }: ScoringRadarChartSectionProps) {
  const radarData = SCORING_DIMENSIONS.map((dim) => ({
    dimension: dim.shortLabel,
    fullName: dim.label,
    score: companyDetails ? (companyDetails[dim.key as keyof CompanyDetails] as number) : 0,
    benchmark: BENCHMARK_THRESHOLD,
  }));

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card data-testid="section-scoring-radar">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover-elevate">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="h-5 w-5 text-primary" />
                Scoring Analysis
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12" data-testid="scoring-radar-loading">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">Loading scoring data...</p>
                </div>
              </div>
            ) : !companyDetails ? (
              <div className="flex items-center justify-center py-12" data-testid="scoring-radar-empty">
                <p className="text-muted-foreground text-sm">Scoring data not available</p>
              </div>
            ) : (
              <div className="h-[400px] md:h-[450px]" data-testid="scoring-radar-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="dimension" 
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      axisLine={false}
                    />
                    <Radar
                      name="Benchmark"
                      dataKey="benchmark"
                      stroke="hsl(var(--muted-foreground))"
                      fill="hsl(var(--muted-foreground))"
                      fillOpacity={0.1}
                      strokeDasharray="5 5"
                    />
                    <Radar
                      name="Company Score"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: "20px" }}
                      formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [
                        `${value}/100`,
                        name === "score" ? props.payload.fullName : name,
                      ]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
            {companyDetails && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  The radar chart displays the company's scores across 10 dimensions compared to the benchmark threshold of {BENCHMARK_THRESHOLD}/100.
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface FinancialMetricsChartSectionProps {
  companyDetails: CompanyDetails | null;
  thresholds: Thresholds;
  isLoading: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function FinancialMetricsChartSection({ companyDetails, thresholds, isLoading, isOpen, onOpenChange }: FinancialMetricsChartSectionProps) {
  const metricsData = companyDetails ? [
    {
      name: "Recurring Revenue",
      value: companyDetails.recurringRevenuePct,
      benchmark: thresholds.recurringRevenueMin || 50,
      unit: "%",
      higherIsBetter: true,
    },
    {
      name: "Revenue Growth",
      value: companyDetails.revenueGrowthPct,
      benchmark: thresholds.revenueGrowthMin || 15,
      unit: "%",
      higherIsBetter: true,
    },
    {
      name: "FCF Conversion",
      value: companyDetails.fcfConversionPct,
      benchmark: thresholds.fcfConversionMin || 20,
      unit: "%",
      higherIsBetter: true,
    },
    {
      name: "Industry Growth",
      value: companyDetails.industryGrowthPct,
      benchmark: thresholds.industryGrowthMin || 10,
      unit: "%",
      higherIsBetter: true,
    },
    {
      name: "Customer Concentration",
      value: companyDetails.customerConcentrationPct,
      benchmark: thresholds.maxCustomerConcentration || 30,
      unit: "%",
      higherIsBetter: false,
    },
  ] : [];
  
  const ratioMetric = companyDetails ? {
    name: "Debt/EBITDA",
    value: companyDetails.debtToEbitda,
    benchmark: thresholds.debtToEbitdaMax || 3,
    unit: "x",
    higherIsBetter: false,
  } : null;

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <Card data-testid="section-financial-metrics-chart">
        <CardHeader className="pb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover-elevate">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5 text-primary" />
                Financial Metrics Overview
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12" data-testid="financial-metrics-loading">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">Loading financial metrics...</p>
                </div>
              </div>
            ) : !companyDetails ? (
              <div className="flex items-center justify-center py-12" data-testid="financial-metrics-empty">
                <p className="text-muted-foreground text-sm">Financial metrics not available</p>
              </div>
            ) : (
              <div className="h-[280px]" data-testid="financial-metrics-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metricsData}
                    layout="vertical"
                    margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: number, name: string) => [
                        `${value}%`,
                        name === "value" ? "Company Value" : "Benchmark",
                      ]}
                    />
                    <Legend 
                      formatter={(value) => (
                        <span className="text-sm text-foreground">
                          {value === "value" ? "Company Value" : "Benchmark Threshold"}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                    <Bar
                      dataKey="benchmark"
                      fill="hsl(var(--muted-foreground))"
                      fillOpacity={0.4}
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {companyDetails && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {metricsData.map((metric) => {
                    const meetsThreshold = metric.higherIsBetter 
                      ? metric.value >= metric.benchmark 
                      : metric.value <= metric.benchmark;
                    return (
                      <div key={metric.name} className="text-center">
                        <div className={cn(
                          "text-2xl font-bold",
                          meetsThreshold ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                        )}>
                          {metric.value}{metric.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">{metric.name}</div>
                        <div className="text-xs text-muted-foreground/60">
                          {metric.higherIsBetter ? "Min" : "Max"}: {metric.benchmark}{metric.unit}
                        </div>
                      </div>
                    );
                  })}
                  {ratioMetric && (() => {
                    const meetsThreshold = ratioMetric.value <= ratioMetric.benchmark;
                    return (
                      <div key={ratioMetric.name} className="text-center">
                        <div className={cn(
                          "text-2xl font-bold",
                          meetsThreshold ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
                        )}>
                          {ratioMetric.value}{ratioMetric.unit}
                        </div>
                        <div className="text-xs text-muted-foreground">{ratioMetric.name}</div>
                        <div className="text-xs text-muted-foreground/60">
                          Max: {ratioMetric.benchmark}{ratioMetric.unit}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
