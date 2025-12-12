import { Mail, Send, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ShortlistedCompanyScore } from "@shared/schema";

interface InfoRequestCardProps {
  companies: ShortlistedCompanyScore[];
  chosenCompanyIds: string[];
  onConfirmEmails: () => void;
  isLoading?: boolean;
}

export function InfoRequestCard({ companies, chosenCompanyIds, onConfirmEmails, isLoading }: InfoRequestCardProps) {
  const selectedCompanies = companies.filter((c) => chosenCompanyIds.includes(c.id));

  return (
    <Card className="w-full max-w-3xl mx-auto" data-testid="info-request-card">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl" data-testid="text-info-request-title">Interest Mail Drafts</CardTitle>
            <CardDescription className="text-sm" data-testid="text-info-request-description">
              {selectedCompanies.length} {selectedCompanies.length === 1 ? "company" : "companies"} selected for due diligence
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground" data-testid="text-info-request-instructions">
          Review the draft emails below. Once confirmed, I will send these to the selected companies and begin collecting due diligence documentation.
        </p>

        <div className="space-y-4">
          {selectedCompanies.map((company) => (
            <div
              key={company.id}
              className="rounded-lg border border-border bg-muted/30 overflow-hidden"
              data-testid={`email-draft-${company.id}`}
            >
              <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/20">
                <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="font-semibold text-foreground" data-testid={`text-company-name-${company.id}`}>
                  {company.name}
                </span>
                <Badge variant="outline" className="ml-auto" data-testid={`badge-draft-${company.id}`}>
                  Draft
                </Badge>
              </div>
              <div className="p-4 text-sm text-muted-foreground space-y-3" data-testid={`email-body-${company.id}`}>
                <p className="font-medium text-foreground" data-testid={`text-email-to-${company.id}`}>
                  To: {company.name} Management Team
                </p>
                <p>Dear {company.name} team,</p>
                <p>
                  We are a Growth &amp; Buyout fund interested in initiating due diligence on your company.
                  We would like to request additional financial, operational, and legal documentation to support our evaluation process.
                </p>
                <p>Please provide the following at your earliest convenience:</p>
                <ul className="list-disc list-inside pl-2 space-y-1">
                  <li>Audited financial statements (last 3 years)</li>
                  <li>Monthly management accounts (last 12 months)</li>
                  <li>Customer contracts and key commercial agreements</li>
                  <li>Organizational chart and key personnel details</li>
                  <li>Technology stack and IP documentation</li>
                </ul>
                <p>We appreciate your cooperation and look forward to engaging further.</p>
                <p className="pt-2">
                  Best regards,<br />
                  PE Target Finder Team
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button
            onClick={onConfirmEmails}
            disabled={isLoading}
            className="w-full"
            data-testid="button-confirm-emails"
          >
            {isLoading ? (
              "Sending..."
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Interest Mails and Start Due Diligence
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
