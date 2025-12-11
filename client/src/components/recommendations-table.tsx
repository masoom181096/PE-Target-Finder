import { Building2, MapPin, TrendingUp, FileText, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ShortlistedCompanyScore } from "@shared/schema";
import { cn } from "@/lib/utils";

interface RecommendationsTableProps {
  companies: ShortlistedCompanyScore[];
  onGenerateReport: (companyId: string) => void;
  isLoading?: boolean;
  selectedCompanyId?: string;
}

export function RecommendationsTable({
  companies,
  onGenerateReport,
  isLoading,
  selectedCompanyId,
}: RecommendationsTableProps) {
  const sortedCompanies = [...companies].sort((a, b) => a.rank - b.rank);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4" data-testid="recommendations-table">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Shortlisted Companies</h2>
      </div>

      {sortedCompanies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onGenerateReport={onGenerateReport}
          isLoading={isLoading && selectedCompanyId === company.id}
          isSelected={selectedCompanyId === company.id}
        />
      ))}

      <p className="text-sm text-muted-foreground text-center mt-6 px-4">
        Review the three shortlisted companies and click "Generate Report" on your preferred target.
        This is your decision; I'm only providing structure and scoring.
      </p>
    </div>
  );
}

interface CompanyCardProps {
  company: ShortlistedCompanyScore;
  onGenerateReport: (companyId: string) => void;
  isLoading?: boolean;
  isSelected?: boolean;
}

function CompanyCard({ company, onGenerateReport, isLoading, isSelected }: CompanyCardProps) {
  const isTopRanked = company.rank === 1;

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isTopRanked && "ring-2 ring-primary/50",
        isSelected && "ring-2 ring-primary"
      )}
      data-testid={`company-card-${company.id}`}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div
            className={cn(
              "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold",
              isTopRanked
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
            data-testid={`rank-badge-${company.id}`}
          >
            {company.rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-foreground">{company.name}</h3>
              {isTopRanked && (
                <Badge variant="default" className="text-xs">
                  Top Pick
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {company.country}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {company.sector}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  Composite Score
                </span>
                <span className="text-sm font-bold text-foreground">{company.score}/100</span>
              </div>
              <Progress value={company.score} className="h-2" />
            </div>

            <ul className="space-y-1 mb-4">
              {company.highlights.map((highlight, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-shrink-0 md:self-center">
            <Button
              onClick={() => onGenerateReport(company.id)}
              disabled={isLoading}
              className="w-full md:w-auto"
              data-testid={`button-generate-report-${company.id}`}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isLoading ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
