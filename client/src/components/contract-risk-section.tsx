import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { CompanyRiskScores, RiskBucketId, RiskGrade } from "@shared/schema";

const RISK_BUCKET_LABELS: Record<RiskBucketId, string> = {
  liability: "Liability",
  nonSolicitation: "Non-Solicitation",
  termination: "Termination",
  personnel: "Personnel",
  stepIn: "Step-in",
  penalty: "Penalty / LDs",
  nonCompete: "Non-compete",
  confidentiality: "Confidentiality",
  paymentTerms: "Payment Terms",
  intellectualProperty: "Intellectual Property",
  indemnities: "Indemnities",
};

const RISK_BUCKET_MAX_SCORES: Record<RiskBucketId, number> = {
  liability: 13,
  nonSolicitation: 4,
  termination: 17,
  personnel: 5,
  stepIn: 4,
  penalty: 3,
  nonCompete: 7,
  confidentiality: 3,
  paymentTerms: 7,
  intellectualProperty: 4,
  indemnities: 5,
};

function getRiskGradeColor(grade: RiskGrade): string {
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

function getRiskGradeBgColor(grade: RiskGrade): string {
  switch (grade) {
    case "Low":
      return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
    case "Medium":
      return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800";
    case "High":
      return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800";
    default:
      return "bg-muted";
  }
}

function getRiskGradeIcon(grade: RiskGrade) {
  switch (grade) {
    case "Low":
      return <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />;
    case "Medium":
      return <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    case "High":
      return <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />;
    default:
      return <Shield className="h-5 w-5 text-muted-foreground" />;
  }
}

function getBucketScoreColor(score: number, maxScore: number): string {
  const percent = (score / maxScore) * 100;
  if (percent <= 33) {
    return "text-green-600 dark:text-green-400";
  } else if (percent <= 66) {
    return "text-yellow-600 dark:text-yellow-400";
  } else {
    return "text-red-600 dark:text-red-400";
  }
}

interface ContractRiskSectionProps {
  riskAssessment: CompanyRiskScores | undefined;
  className?: string;
}

export function ContractRiskSection({ riskAssessment, className }: ContractRiskSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!riskAssessment) {
    return null;
  }

  const bucketIds = Object.keys(RISK_BUCKET_LABELS) as RiskBucketId[];
  const topContributors = riskAssessment.keyContributors.slice(0, 3);

  return (
    <Card className={cn("", className)} data-testid="section-contract-risk">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Contract Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={cn(
            "flex flex-wrap items-center gap-4 p-4 rounded-lg border",
            getRiskGradeBgColor(riskAssessment.grade)
          )}
        >
          <div className="flex items-center gap-3">
            {getRiskGradeIcon(riskAssessment.grade)}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Overall Risk Grade:</span>
                <span
                  className={cn("text-lg font-semibold", getRiskGradeColor(riskAssessment.grade))}
                  data-testid="text-risk-grade"
                >
                  {riskAssessment.grade}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Normalized Score:{" "}
                <span className="font-medium text-foreground" data-testid="text-risk-score">
                  {riskAssessment.normalizedPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {topContributors.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Key Risk Contributors:</span>
            <div className="flex flex-wrap gap-2">
              {topContributors.map((contributor, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs"
                  data-testid={`badge-contributor-${idx}`}
                >
                  {contributor}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <button
              className="flex items-center gap-2 text-sm font-medium text-primary hover-elevate px-3 py-2 rounded-md w-full justify-between"
              data-testid="button-toggle-risk-details"
            >
              <span>View All Risk Buckets ({bucketIds.length})</span>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3">
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm" data-testid="table-risk-buckets">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Risk Bucket
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">
                      Score
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">
                      Max
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bucketIds.map((bucketId, idx) => {
                    const score = riskAssessment.bucketTotals[bucketId] || 0;
                    const maxScore = RISK_BUCKET_MAX_SCORES[bucketId];
                    return (
                      <tr
                        key={bucketId}
                        className={cn(
                          "border-b last:border-b-0",
                          idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                        )}
                        data-testid={`row-risk-bucket-${bucketId}`}
                      >
                        <td className="py-3 px-4 text-foreground">
                          {RISK_BUCKET_LABELS[bucketId]}
                        </td>
                        <td
                          className={cn(
                            "py-3 px-4 text-right font-medium",
                            getBucketScoreColor(score, maxScore)
                          )}
                        >
                          {score}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground">
                          {maxScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 border-t">
                    <td className="py-3 px-4 font-semibold text-foreground">Total</td>
                    <td className="py-3 px-4 text-right font-semibold text-foreground">
                      {riskAssessment.rawTotal}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      {Object.values(RISK_BUCKET_MAX_SCORES).reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
