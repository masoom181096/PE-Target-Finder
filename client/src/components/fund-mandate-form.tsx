import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MultiSelectWithOther } from "./multi-select-with-other";
import { SingleSelectWithOther } from "./single-select-with-other";
import type { FundMandate, OptionSelection } from "@shared/schema";
import { ArrowRight, Briefcase, ChevronDown, ChevronRight } from "lucide-react";

const FUND_TYPE_OPTIONS = [
  "Distressed fund",
  "Subordinated Debt fund",
  "Early-stage fund",
  "Growth & buyout fund",
  "Leveraged Buyout (LBO) fund",
  "Other",
];

const SECTOR_FOCUS_OPTIONS = [
  "Agriculture & agribusiness",
  "Mining & metals",
  "Energy & utilities",
  "Manufacturing",
  "Construction & real estate",
  "Transportation & logistics",
  "Information Technology",
  "Financial services",
  "Healthcare",
  "Consumer goods",
  "Telecommunications",
  "Other",
];

const INVESTMENT_STAGE_OPTIONS = [
  "Startup",
  "Seed",
  "Growth",
  "Mature",
  "Distressed",
  "Pre-IPO",
  "Family-owned",
  "Founder-led",
  "Corporate carve-out",
  "Other",
];

const GEO_FOCUS_OPTIONS = [
  "Middle East & Africa",
  "Latin America",
  "Asia Pacific",
  "Western Europe",
  "North America",
  "India",
  "Singapore",
  "Southeast Asia",
  "Other",
];

const EXCLUDED_SECTOR_OPTIONS = [
  "Tobacco",
  "Alcohol",
  "Gambling",
  "Defence",
  "Fossil-fuel extraction",
  "Adult entertainment",
  "Weapons manufacturing",
  "Other",
];

const VALUE_CREATION_OPTIONS = [
  "Market expansion and internationalization",
  "Strategic repositioning",
  "Digital transformation",
  "Supply chain and procurement optimization",
  "Pricing and commercial excellence",
  "Operational excellence",
  "M&A and bolt-on acquisitions",
  "Management upgrade",
  "Other",
];

const EXIT_PREFERENCE_OPTIONS = [
  "Management buyout",
  "Recapitalization",
  "IPO",
  "Secondary buyout",
  "Strategic sale",
  "Dividend recapitalization",
  "Other",
];

const FINANCIAL_CRITERIA_OPTIONS = [
  "EBITDA",
  "Free cash flows",
  "YoY growth",
  "Leverage capacity",
  "Revenue quality",
  "Gross margin",
  "Other",
];

const RISK_APPETITE_OPTIONS = [
  "Low",
  "Medium",
  "High",
  "Other",
];

const TRANSACTION_TYPE_OPTIONS = [
  "Majority control",
  "Minority stake",
  "Joint venture",
  "Asset purchase",
  "Debt financing",
  "Convertible instruments",
  "Secondary buys",
  "Platform investment",
  "Other",
];

const OWNERSHIP_TARGET_OPTIONS = [
  "Single majority",
  "Plurality with board control",
  "Passive minority",
  "Management roll",
  "Co-investment",
  "Other",
];

interface FundMandateFormProps {
  onSubmit: (data: FundMandate) => void;
  isLoading?: boolean;
}

export function FundMandateForm({ onSubmit, isLoading }: FundMandateFormProps) {
  const [mandate, setMandate] = useState<FundMandate>({
    sectorFocus: [],
    geographicFocus: [{ value: "India" }, { value: "Singapore" }],
    excludedSectors: [],
    valueCreationApproach: [],
    exitPreferences: [],
    financialCriteria: [],
    transactionTypes: [],
    holdingPeriodYears: 5,
    targetIRR: 20,
    dealSizeRange: { min: 10, max: 50, currency: "USD" },
    fundSize: { amount: 250, currency: "USD" },
  });

  const [sectionsOpen, setSectionsOpen] = useState({
    fundProfile: true,
    investmentCriteria: true,
    financials: false,
    valueCreation: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Also populate legacy fields for backwards compatibility with existing logic
    const enrichedMandate: FundMandate = {
      ...mandate,
      sectorsFocus: mandate.sectorFocus.map(s => s.value === "Other" && s.otherText ? s.otherText : s.value),
      geosFocus: mandate.geographicFocus.map(g => g.value === "Other" && g.otherText ? g.otherText : g.value),
      sectorsExcluded: mandate.excludedSectors.map(s => s.value === "Other" && s.otherText ? s.otherText : s.value),
      dealSizeMin: mandate.dealSizeRange?.min,
      dealSizeMax: mandate.dealSizeRange?.max,
      stage: mandate.investmentStage?.value === "Other" && mandate.investmentStage.otherText 
        ? mandate.investmentStage.otherText 
        : mandate.investmentStage?.value,
    };
    
    onSubmit(enrichedMandate);
  };

  const updateField = <K extends keyof FundMandate>(field: K, value: FundMandate[K]) => {
    setMandate(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-3xl mx-auto" data-testid="fund-mandate-form">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Fund Mandate</CardTitle>
        </div>
        <CardDescription>
          Define your fund parameters to guide the target screening process. Expand sections to customize.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Collapsible
            open={sectionsOpen.fundProfile}
            onOpenChange={(open) => setSectionsOpen(prev => ({ ...prev, fundProfile: open }))}
          >
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg hover-elevate active-elevate-2 p-2 rounded-md">
              {sectionsOpen.fundProfile ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Fund Profile
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-6">
              <SingleSelectWithOther
                label="Fund Type"
                options={FUND_TYPE_OPTIONS}
                value={mandate.fundType}
                onChange={(fundType) => updateField("fundType", fundType)}
                columns={3}
                testIdPrefix="fund-type"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fund-size">Fund Size ($M)</Label>
                  <Input
                    id="fund-size"
                    type="number"
                    value={mandate.fundSize?.amount ?? ""}
                    onChange={(e) => updateField("fundSize", { 
                      ...mandate.fundSize, 
                      amount: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    placeholder="e.g., 250"
                    data-testid="input-fund-size"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-irr">Target IRR (%)</Label>
                  <Input
                    id="target-irr"
                    type="number"
                    value={mandate.targetIRR ?? ""}
                    onChange={(e) => updateField("targetIRR", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g., 20"
                    data-testid="input-target-irr"
                  />
                </div>
              </div>

              <SingleSelectWithOther
                label="Risk Appetite"
                options={RISK_APPETITE_OPTIONS}
                value={mandate.riskAppetite}
                onChange={(riskAppetite) => updateField("riskAppetite", riskAppetite)}
                columns={4}
                testIdPrefix="risk-appetite"
              />
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          <Collapsible
            open={sectionsOpen.investmentCriteria}
            onOpenChange={(open) => setSectionsOpen(prev => ({ ...prev, investmentCriteria: open }))}
          >
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg hover-elevate active-elevate-2 p-2 rounded-md">
              {sectionsOpen.investmentCriteria ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Investment Criteria
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-6">
              <MultiSelectWithOther
                label="Sector Focus"
                options={SECTOR_FOCUS_OPTIONS}
                value={mandate.sectorFocus}
                onChange={(sectorFocus) => updateField("sectorFocus", sectorFocus)}
                columns={3}
                testIdPrefix="sector-focus"
              />

              <SingleSelectWithOther
                label="Investment Stage"
                options={INVESTMENT_STAGE_OPTIONS}
                value={mandate.investmentStage}
                onChange={(investmentStage) => updateField("investmentStage", investmentStage)}
                columns={3}
                testIdPrefix="investment-stage"
              />

              <MultiSelectWithOther
                label="Geographic Focus"
                options={GEO_FOCUS_OPTIONS}
                value={mandate.geographicFocus}
                onChange={(geographicFocus) => updateField("geographicFocus", geographicFocus)}
                columns={3}
                testIdPrefix="geo-focus"
              />

              <MultiSelectWithOther
                label="Excluded Sectors"
                options={EXCLUDED_SECTOR_OPTIONS}
                value={mandate.excludedSectors}
                onChange={(excludedSectors) => updateField("excludedSectors", excludedSectors)}
                columns={4}
                testIdPrefix="excluded-sectors"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deal-size-min">Min Deal Size ($M)</Label>
                  <Input
                    id="deal-size-min"
                    type="number"
                    value={mandate.dealSizeRange?.min ?? ""}
                    onChange={(e) => updateField("dealSizeRange", { 
                      ...mandate.dealSizeRange, 
                      min: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    placeholder="e.g., 10"
                    data-testid="input-deal-size-min"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deal-size-max">Max Deal Size ($M)</Label>
                  <Input
                    id="deal-size-max"
                    type="number"
                    value={mandate.dealSizeRange?.max ?? ""}
                    onChange={(e) => updateField("dealSizeRange", { 
                      ...mandate.dealSizeRange, 
                      max: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    placeholder="e.g., 50"
                    data-testid="input-deal-size-max"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="holding-period">Holding Period (Years)</Label>
                <Input
                  id="holding-period"
                  type="number"
                  min={1}
                  max={15}
                  value={mandate.holdingPeriodYears ?? ""}
                  onChange={(e) => updateField("holdingPeriodYears", e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 5"
                  className="max-w-[150px]"
                  data-testid="input-holding-period"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          <Collapsible
            open={sectionsOpen.financials}
            onOpenChange={(open) => setSectionsOpen(prev => ({ ...prev, financials: open }))}
          >
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg hover-elevate active-elevate-2 p-2 rounded-md">
              {sectionsOpen.financials ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Transaction & Ownership
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-6">
              <MultiSelectWithOther
                label="Transaction Types"
                options={TRANSACTION_TYPE_OPTIONS}
                value={mandate.transactionTypes}
                onChange={(transactionTypes) => updateField("transactionTypes", transactionTypes)}
                columns={3}
                testIdPrefix="transaction-types"
              />

              <SingleSelectWithOther
                label="Ownership Target"
                options={OWNERSHIP_TARGET_OPTIONS}
                value={mandate.ownershipTarget}
                onChange={(ownershipTarget) => updateField("ownershipTarget", ownershipTarget)}
                columns={3}
                testIdPrefix="ownership-target"
              />

              <div className="space-y-2">
                <Label htmlFor="equity-stake">Equity Stake Preference</Label>
                <Input
                  id="equity-stake"
                  type="text"
                  value={mandate.equityStakePreference ?? ""}
                  onChange={(e) => updateField("equityStakePreference", e.target.value || undefined)}
                  placeholder="e.g., 51-75% controlling stake"
                  data-testid="input-equity-stake"
                />
              </div>

              <MultiSelectWithOther
                label="Financial Criteria"
                options={FINANCIAL_CRITERIA_OPTIONS}
                value={mandate.financialCriteria}
                onChange={(financialCriteria) => updateField("financialCriteria", financialCriteria)}
                columns={3}
                testIdPrefix="financial-criteria"
              />

              <div className="space-y-2">
                <Label htmlFor="leverage-policy">Leverage Policy</Label>
                <Input
                  id="leverage-policy"
                  type="text"
                  value={mandate.leveragePolicy ?? ""}
                  onChange={(e) => updateField("leveragePolicy", e.target.value || undefined)}
                  placeholder="e.g., Max 3x Debt/EBITDA"
                  data-testid="input-leverage-policy"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          <Collapsible
            open={sectionsOpen.valueCreation}
            onOpenChange={(open) => setSectionsOpen(prev => ({ ...prev, valueCreation: open }))}
          >
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left font-semibold text-lg hover-elevate active-elevate-2 p-2 rounded-md">
              {sectionsOpen.valueCreation ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              Value Creation & Exit
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-6">
              <MultiSelectWithOther
                label="Value Creation Approach"
                options={VALUE_CREATION_OPTIONS}
                value={mandate.valueCreationApproach}
                onChange={(valueCreationApproach) => updateField("valueCreationApproach", valueCreationApproach)}
                columns={2}
                testIdPrefix="value-creation"
              />

              <MultiSelectWithOther
                label="Exit Preferences"
                options={EXIT_PREFERENCE_OPTIONS}
                value={mandate.exitPreferences}
                onChange={(exitPreferences) => updateField("exitPreferences", exitPreferences)}
                columns={3}
                testIdPrefix="exit-preferences"
              />

              <div className="space-y-2">
                <Label htmlFor="time-horizon-plan">Time Horizon & Value Creation Plan</Label>
                <Textarea
                  id="time-horizon-plan"
                  value={mandate.timeHorizonAndValueCreationPlan ?? ""}
                  onChange={(e) => updateField("timeHorizonAndValueCreationPlan", e.target.value || undefined)}
                  placeholder="Describe your typical value creation timeline and key milestones..."
                  className="min-h-[100px]"
                  data-testid="textarea-time-horizon-plan"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="pt-4">
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading} data-testid="button-submit-mandate">
              Continue to Country Screening
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
