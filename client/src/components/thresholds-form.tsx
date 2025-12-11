import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Thresholds } from "@shared/schema";
import { defaultThresholds, thresholdsSchema } from "@shared/schema";

interface ThresholdsFormProps {
  onSubmit: (data: Thresholds) => void;
  isLoading?: boolean;
  initialThresholds?: Thresholds;
}

const thresholdConfig: {
  key: keyof Thresholds;
  label: string;
  description: string;
  suffix: string;
  placeholder: string;
}[] = [
  {
    key: "recurringRevenueMin",
    label: "Recurring Revenue",
    description: "Minimum percentage of recurring revenue",
    suffix: "%",
    placeholder: "50",
  },
  {
    key: "debtToEbitdaMax",
    label: "Debt / EBITDA",
    description: "Maximum acceptable leverage ratio",
    suffix: "x",
    placeholder: "3.0",
  },
  {
    key: "revenueGrowthMin",
    label: "Revenue Growth",
    description: "Minimum year-over-year revenue growth",
    suffix: "%",
    placeholder: "15",
  },
  {
    key: "fcfConversionMin",
    label: "FCF Conversion",
    description: "Minimum free cash flow conversion rate",
    suffix: "%",
    placeholder: "20",
  },
  {
    key: "industryGrowthMin",
    label: "Industry Growth",
    description: "Minimum industry CAGR requirement",
    suffix: "%",
    placeholder: "10",
  },
  {
    key: "maxCustomerConcentration",
    label: "Customer Concentration",
    description: "Maximum revenue from top customer",
    suffix: "%",
    placeholder: "30",
  },
];

export function ThresholdsForm({ onSubmit, isLoading, initialThresholds }: ThresholdsFormProps) {
  const form = useForm<Thresholds>({
    resolver: zodResolver(thresholdsSchema),
    defaultValues: initialThresholds || defaultThresholds,
  });

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="thresholds-form">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Screening Thresholds</CardTitle>
        </div>
        <CardDescription>
          Set minimum and maximum thresholds for key financial metrics. Companies not meeting these criteria will be filtered out.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {thresholdConfig.map((config) => (
                <FormField
                  key={config.key}
                  control={form.control}
                  name={config.key}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{config.label}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            placeholder={config.placeholder}
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            className="pr-8"
                            data-testid={`input-${config.key}`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            {config.suffix}
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        {config.description}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={isLoading} data-testid="button-submit-thresholds">
              Screen Companies
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
