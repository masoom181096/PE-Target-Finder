import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Scale, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { ScoringWeights } from "@shared/schema";
import { defaultScoringWeights, scoringWeightsSchema } from "@shared/schema";
import { cn } from "@/lib/utils";

interface WeightsFormProps {
  onSubmit: (data: ScoringWeights) => void;
  isLoading?: boolean;
  initialWeights?: ScoringWeights;
}

const weightLabels: Record<keyof ScoringWeights, string> = {
  qualityOfEarnings: "Quality of Earnings",
  financialPerformance: "Financial Performance",
  industryAttractiveness: "Industry Attractiveness",
  competitivePositioning: "Competitive Positioning",
  managementGovernance: "Management & Governance",
  operationalEfficiency: "Operational Efficiency",
  customerMarketDynamics: "Customer & Market Dynamics",
  productStrength: "Product Strength",
  exitFeasibility: "Exit Feasibility",
  scalabilityPotential: "Scalability Potential",
};

export function WeightsForm({ onSubmit, isLoading, initialWeights }: WeightsFormProps) {
  const form = useForm<ScoringWeights>({
    resolver: zodResolver(scoringWeightsSchema),
    defaultValues: initialWeights || defaultScoringWeights,
  });

  const watchedValues = form.watch();
  const totalWeight = Object.values(watchedValues).reduce((sum, val) => sum + (val || 0), 0);
  const isValidTotal = totalWeight === 100;

  const handleSubmit = (data: ScoringWeights) => {
    if (isValidTotal) {
      onSubmit(data);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="weights-form">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Scoring Weights</CardTitle>
        </div>
        <CardDescription>
          Adjust the weights for each scoring parameter. The total must equal 100.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              {(Object.keys(weightLabels) as Array<keyof ScoringWeights>).map((key) => (
                <FormField
                  key={key}
                  control={form.control}
                  name={key}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <FormLabel className="text-sm font-medium">{weightLabels[key]}</FormLabel>
                        <span
                          className={cn(
                            "text-sm font-mono font-semibold px-2 py-0.5 rounded",
                            field.value > 15 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          )}
                          data-testid={`weight-value-${key}`}
                        >
                          {field.value}
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={50}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-1"
                          data-testid={`slider-${key}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Alert variant={isValidTotal ? "default" : "destructive"} className="mt-6">
              {isValidTotal ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className="flex items-center justify-between">
                <span>
                  Total Weight: <span className="font-bold font-mono">{totalWeight}</span> / 100
                </span>
                {!isValidTotal && (
                  <span className="text-sm">
                    {totalWeight > 100 ? `Reduce by ${totalWeight - 100}` : `Add ${100 - totalWeight} more`}
                  </span>
                )}
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isLoading || !isValidTotal}
              data-testid="button-submit-weights"
            >
              Continue to Thresholds
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
