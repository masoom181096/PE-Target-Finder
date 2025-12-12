import type { RiskBucketId, CompanyRiskScores, RiskGrade } from "@shared/schema";
import { RISK_BUCKETS, RISK_SUBCLAUSES, COMPANY_RISK_SCORES } from "../data/riskModel";

const MAX_TOTAL = 72;

export function calculateRiskScores(companyId: string): CompanyRiskScores | null {
  const clauseScores = COMPANY_RISK_SCORES[companyId];
  
  if (!clauseScores) {
    return null;
  }

  const bucketTotals: Record<RiskBucketId, number> = {
    liability: 0,
    nonSolicitation: 0,
    termination: 0,
    personnel: 0,
    stepIn: 0,
    penalty: 0,
    nonCompete: 0,
    confidentiality: 0,
    paymentTerms: 0,
    intellectualProperty: 0,
    indemnities: 0,
  };

  for (const subclause of RISK_SUBCLAUSES) {
    const score = clauseScores[subclause.id] ?? 1;
    bucketTotals[subclause.bucketId] += score;
  }

  const rawTotal = Object.values(bucketTotals).reduce((sum, val) => sum + val, 0);
  const normalizedPercent = (rawTotal / MAX_TOTAL) * 100;

  let grade: RiskGrade;
  if (normalizedPercent <= 35) {
    grade = "Low";
  } else if (normalizedPercent <= 65) {
    grade = "Medium";
  } else {
    grade = "High";
  }

  const keyContributors = identifyKeyContributors(bucketTotals);

  return {
    companyId,
    clauseScores,
    bucketTotals,
    rawTotal,
    normalizedPercent: Math.round(normalizedPercent * 10) / 10,
    grade,
    keyContributors,
  };
}

function identifyKeyContributors(bucketTotals: Record<RiskBucketId, number>): string[] {
  const bucketScores: { id: RiskBucketId; label: string; normalizedScore: number }[] = [];

  for (const bucket of RISK_BUCKETS) {
    const total = bucketTotals[bucket.id];
    const normalizedScore = (total / bucket.maxScore) * bucket.weightPercent;
    bucketScores.push({
      id: bucket.id,
      label: bucket.label,
      normalizedScore,
    });
  }

  bucketScores.sort((a, b) => b.normalizedScore - a.normalizedScore);

  const topContributors = bucketScores.slice(0, 3);
  
  return topContributors.map((c) => {
    const bucket = RISK_BUCKETS.find((b) => b.id === c.id)!;
    const total = bucketTotals[c.id];
    return `${c.label} (${total}/${bucket.maxScore})`;
  });
}

export function getRiskBuckets() {
  return RISK_BUCKETS;
}

export function getRiskSubclauses() {
  return RISK_SUBCLAUSES;
}
