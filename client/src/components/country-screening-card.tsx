import { ArrowRight, Globe, CheckCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CountryScreeningCardProps {
  onContinue: () => void;
  isLoading?: boolean;
}

const countryData = [
  {
    name: "India",
    flag: "IN",
    highlights: [
      "Strong market size: $3.2T GDP, 1.4B population",
      "Mature tech ecosystem with deep talent pool",
      "25%+ CAGR in target sectors (CPaaS, SaaS)",
      "Active IPO and M&A exit environment",
    ],
    score: "Passed",
  },
  {
    name: "Singapore",
    flag: "SG",
    highlights: [
      "Business-friendly regulatory environment",
      "Regional tech hub with strong infrastructure",
      "Excellent capital markets access",
      "World-leading ease of doing business",
    ],
    score: "Passed",
  },
];

export function CountryScreeningCard({ onContinue, isLoading }: CountryScreeningCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="country-screening-card">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Country Screening Complete</CardTitle>
        </div>
        <CardDescription>
          Based on your fund mandate, I've screened candidate markets on macro and regulatory factors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {countryData.map((country) => (
            <div
              key={country.name}
              className="p-4 rounded-lg border border-border bg-muted/20"
              data-testid={`country-card-${country.name.toLowerCase()}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{country.name}</span>
                </div>
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {country.score}
                </Badge>
              </div>
              <ul className="space-y-1.5">
                {country.highlights.map((highlight, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1.5">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-4">
            Both India and Singapore meet your criteria. I'll proceed to configure the scoring framework for target company evaluation.
          </p>
          <Button onClick={onContinue} disabled={isLoading} className="w-full md:w-auto" data-testid="button-continue-to-weights">
            Continue to Scoring Framework
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
