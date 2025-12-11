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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CompanyReport } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ReportViewProps {
  report: CompanyReport;
  onBack?: () => void;
  className?: string;
}

const sections = [
  { id: "executive-summary", label: "Executive Summary", icon: FileText },
  { id: "country-analysis", label: "Country Analysis", icon: Globe },
  { id: "financial-analysis", label: "Financial Analysis", icon: BarChart3 },
  { id: "operational", label: "Operational Strength", icon: Zap },
  { id: "exit-feasibility", label: "Exit Feasibility", icon: DollarSign },
];

export function ReportView({ report, onBack, className }: ReportViewProps) {
  const [activeSection, setActiveSection] = useState("executive-summary");
  const contentRef = useRef<HTMLDivElement>(null);

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
          <ReportHeader report={report} onBack={onBack} />
          
          <section id="executive-summary">
            <ExecutiveSummarySection summary={report.executiveSummary} />
          </section>

          <section id="country-analysis">
            <CountryAnalysisSection analysis={report.countryAnalysis} />
          </section>

          <section id="financial-analysis">
            <FinancialAnalysisSection analysis={report.financialAnalysis} />
          </section>

          <section id="operational">
            <OperationalSection points={report.operationalAndValueCreation} />
          </section>

          <section id="exit-feasibility">
            <ExitFeasibilitySection points={report.exitFeasibility} />
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}

function ReportHeader({ report, onBack }: { report: CompanyReport; onBack?: () => void }) {
  return (
    <div className="space-y-4" data-testid="report-header">
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden" data-testid="button-back-mobile">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Comparison
        </Button>
      )}
      
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg p-6 border border-primary/20">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
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
        
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {report.header.companyName}
        </h1>
        
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

function ExecutiveSummarySection({ summary }: { summary: string[] }) {
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
          {summary.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3 text-base leading-relaxed">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <span className="text-foreground">{point}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function CountryAnalysisSection({ analysis }: { analysis: CompanyReport["countryAnalysis"] }) {
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
            {analysis.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                {point}
              </li>
            ))}
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

function OperationalSection({ points }: { points: string[] }) {
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
          {points.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              {point}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ExitFeasibilitySection({ points }: { points: string[] }) {
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
          {points.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              {point}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
