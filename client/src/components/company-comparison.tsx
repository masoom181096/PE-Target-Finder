import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Building2, Trophy, Loader2, Target } from "lucide-react";
import type { ShortlistedCompanyScore } from "@shared/schema";
import { cn } from "@/lib/utils";

interface CompanyComparisonProps {
  companies: ShortlistedCompanyScore[];
  companyDetails?: CompanyScoreDetails[];
  isLoading?: boolean;
  className?: string;
}

interface CompanyScoreDetails {
  id: string;
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

const COMPANY_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(280, 65%, 60%)",
];

const DIMENSION_LABELS: Record<string, string> = {
  qualityOfEarningsScore: "Quality of Earnings",
  financialPerformanceScore: "Financial Performance",
  industryAttractivenessScore: "Industry Attractiveness",
  competitivePositioningScore: "Competitive Positioning",
  managementGovernanceScore: "Management & Governance",
  operationalEfficiencyScore: "Operational Efficiency",
  customerMarketDynamicsScore: "Customer & Market",
  productStrengthScore: "Product Strength",
  exitFeasibilityScore: "Exit Feasibility",
  scalabilityPotentialScore: "Scalability Potential",
};

const DIMENSIONS = Object.keys(DIMENSION_LABELS);

export function CompanyComparison({
  companies,
  companyDetails,
  isLoading,
  className,
}: CompanyComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    companies.slice(0, Math.min(3, companies.length)).map((c) => c.id)
  );
  const [chartView, setChartView] = useState<"bar" | "radar">("bar");

  const toggleCompany = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((s) => s !== id));
      }
    } else if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectedCompanies = companies.filter((c) => selectedIds.includes(c.id));
  const sortedSelected = [...selectedCompanies].sort((a, b) => a.rank - b.rank);
  
  const hasScoreData = companyDetails && companyDetails.length > 0;

  const chartData = DIMENSIONS.map((dimension) => {
    const dataPoint: Record<string, string | number> = {
      dimension: DIMENSION_LABELS[dimension],
      dimensionKey: dimension,
    };

    sortedSelected.forEach((company) => {
      const details = companyDetails?.find((d) => d.id === company.id);
      if (details) {
        dataPoint[company.id] = details[dimension as keyof CompanyScoreDetails] as number;
      } else {
        dataPoint[company.id] = 0;
      }
    });

    return dataPoint;
  });

  if (isLoading || !hasScoreData) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto flex items-center justify-center py-20", className)} data-testid="company-comparison-loading">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading company score data...</p>
        </div>
      </div>
    );
  }

  if (companies.length < 2) {
    return (
      <div className={cn("w-full max-w-4xl mx-auto flex items-center justify-center py-20", className)} data-testid="company-comparison-error">
        <p className="text-muted-foreground text-center">
          At least 2 companies are needed for comparison.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)} data-testid="company-comparison">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Side-by-Side Comparison</h2>
      </div>

      {companies.length > 2 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Select Companies to Compare (2-3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {companies.map((company, index) => (
                <label
                  key={company.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors",
                    selectedIds.includes(company.id)
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                  data-testid={`checkbox-company-${company.id}`}
                >
                  <Checkbox
                    checked={selectedIds.includes(company.id)}
                    onCheckedChange={() => toggleCompany(company.id)}
                    disabled={
                      !selectedIds.includes(company.id) && selectedIds.length >= 3
                    }
                  />
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COMPANY_COLORS[index % COMPANY_COLORS.length] }}
                  />
                  <span className="text-sm font-medium">{company.name}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Total Weighted Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedSelected.map((company, index) => (
              <div key={company.id} className="space-y-1" data-testid={`score-summary-${company.id}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COMPANY_COLORS[index % COMPANY_COLORS.length] }}
                    />
                    <span className="font-medium text-sm">{company.name}</span>
                    {company.rank === 1 && (
                      <Badge variant="default" className="text-xs">
                        Top Pick
                      </Badge>
                    )}
                  </div>
                  <span className="font-bold text-lg">{company.score}/100</span>
                </div>
                <Progress 
                  value={company.score} 
                  className="h-3"
                  style={{ 
                    ["--progress-background" as string]: COMPANY_COLORS[index % COMPANY_COLORS.length] 
                  }}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Scoring Breakdown by Dimension
            </CardTitle>
            <div className="flex items-center gap-1" data-testid="chart-view-toggle">
              <Button
                variant={chartView === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartView("bar")}
                data-testid="button-bar-chart-view"
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Bar
              </Button>
              <Button
                variant={chartView === "radar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartView("radar")}
                data-testid="button-radar-chart-view"
              >
                <Target className="h-4 w-4 mr-1" />
                Radar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartView === "bar" ? (
            <div className="h-[400px] md:h-[500px]" data-testid="comparison-bar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tickCount={6} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    type="category"
                    dataKey="dimension"
                    width={110}
                    tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ fontWeight: 600 }}
                    formatter={(value: number, name: string) => {
                      const company = companies.find((c) => c.id === name);
                      return [`${value}/100`, company?.name || name];
                    }}
                  />
                  <Legend
                    formatter={(value: string) => {
                      const company = companies.find((c) => c.id === value);
                      return <span className="text-sm text-foreground">{company?.name || value}</span>;
                    }}
                  />
                  {sortedSelected.map((company, index) => (
                    <Bar
                      key={company.id}
                      dataKey={company.id}
                      fill={COMPANY_COLORS[index % COMPANY_COLORS.length]}
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] md:h-[500px]" data-testid="comparison-radar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
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
                  {sortedSelected.map((company, index) => (
                    <Radar
                      key={company.id}
                      name={company.name}
                      dataKey={company.id}
                      stroke={COMPANY_COLORS[index % COMPANY_COLORS.length]}
                      fill={COMPANY_COLORS[index % COMPANY_COLORS.length]}
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  ))}
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
                    formatter={(value: number, name: string) => [`${value}/100`, name]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSelected.map((company, index) => (
          <Card key={company.id} data-testid={`company-detail-card-${company.id}`}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COMPANY_COLORS[index % COMPANY_COLORS.length] }}
                  />
                  <CardTitle className="text-base">{company.name}</CardTitle>
                </div>
                <Badge variant={company.rank === 1 ? "default" : "secondary"}>
                  #{company.rank}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {company.country}
                </span>
                <span>{company.sector}</span>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Composite Score</span>
                  <span className="font-semibold">{company.score}</span>
                </div>
                <Progress value={company.score} className="h-2" />
              </div>
              <ul className="space-y-1">
                {company.highlights.slice(0, 2).map((highlight, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center px-4">
        Compare scoring dimensions to understand each company's strengths and weaknesses.
        Use this analysis to inform your investment decision.
      </p>
    </div>
  );
}
