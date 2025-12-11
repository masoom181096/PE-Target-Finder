import { ArrowRight, Trophy, Building2, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ShortlistedCompanyScore } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ShortlistCardProps {
  companies: ShortlistedCompanyScore[];
  onContinue: () => void;
  isLoading?: boolean;
}

export function ShortlistCard({ companies, onContinue, isLoading }: ShortlistCardProps) {
  const sortedCompanies = [...companies].sort((a, b) => a.rank - b.rank);

  return (
    <Card className="w-full max-w-3xl mx-auto" data-testid="shortlist-card">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Screening Complete</CardTitle>
        </div>
        <CardDescription>
          I've analyzed the universe of companies against your criteria and identified {companies.length} candidates that best match your mandate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {sortedCompanies.map((company) => (
            <div
              key={company.id}
              className={cn(
                "p-4 rounded-lg border border-border",
                company.rank === 1 ? "bg-primary/5 border-primary/30" : "bg-muted/20"
              )}
              data-testid={`shortlist-company-${company.id}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                      company.rank === 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {company.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{company.name}</h3>
                      {company.rank === 1 && (
                        <Badge variant="default" className="text-xs">Top Pick</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.country}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {company.sector}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:min-w-[140px]">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold">{company.score}/100</span>
                    </div>
                    <Progress value={company.score} className="h-1.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-4">
            Click continue to review detailed profiles and select which company you'd like me to generate a comprehensive investment memo for.
          </p>
          <Button onClick={onContinue} disabled={isLoading} className="w-full md:w-auto" data-testid="button-continue-to-comparison">
            Continue to Review
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
