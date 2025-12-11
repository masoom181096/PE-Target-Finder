import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { FundMandate } from "@shared/schema";
import { ArrowRight, Briefcase } from "lucide-react";

const formSchema = z.object({
  fundType: z.string().min(1, "Please select a fund type"),
  fundSize: z.string().min(1, "Please select a fund size"),
  sectorsFocus: z.array(z.string()).min(1, "Select at least one sector"),
  geosFocus: z.array(z.string()).min(1, "Select at least one geography"),
  dealSizeMin: z.number().min(1, "Minimum deal size is required"),
  dealSizeMax: z.number().min(1, "Maximum deal size is required"),
  stage: z.string().min(1, "Please select an investment stage"),
  holdingPeriodYears: z.number().min(1).max(15),
  riskAppetite: z.enum(["Low", "Medium", "High"]),
});

type FormData = z.infer<typeof formSchema>;

interface FundMandateFormProps {
  onSubmit: (data: FundMandate) => void;
  isLoading?: boolean;
}

const sectors = [
  { id: "technology", label: "Technology" },
  { id: "healthcare", label: "Healthcare" },
  { id: "fintech", label: "Fintech" },
  { id: "saas", label: "SaaS" },
  { id: "cpaas", label: "CPaaS" },
  { id: "edtech", label: "EdTech" },
  { id: "consumer", label: "Consumer" },
  { id: "industrials", label: "Industrials" },
];

const geographies = [
  { id: "india", label: "India" },
  { id: "singapore", label: "Singapore" },
  { id: "southeast-asia", label: "Southeast Asia" },
  { id: "middle-east", label: "Middle East" },
];

export function FundMandateForm({ onSubmit, isLoading }: FundMandateFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fundType: "",
      fundSize: "",
      sectorsFocus: ["technology", "saas"],
      geosFocus: ["india", "singapore"],
      dealSizeMin: 10,
      dealSizeMax: 50,
      stage: "",
      holdingPeriodYears: 5,
      riskAppetite: "Medium",
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto" data-testid="fund-mandate-form">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Fund Mandate</CardTitle>
        </div>
        <CardDescription>
          Define your fund parameters to guide the target screening process
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fundType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fund Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-fund-type">
                          <SelectValue placeholder="Select fund type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="growth-equity">Growth Equity</SelectItem>
                        <SelectItem value="buyout">Buyout</SelectItem>
                        <SelectItem value="venture">Venture Capital</SelectItem>
                        <SelectItem value="mezzanine">Mezzanine</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fundSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fund Size (USD)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-fund-size">
                          <SelectValue placeholder="Select fund size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="50-100m">$50M - $100M</SelectItem>
                        <SelectItem value="100-250m">$100M - $250M</SelectItem>
                        <SelectItem value="250-500m">$250M - $500M</SelectItem>
                        <SelectItem value="500m-1b">$500M - $1B</SelectItem>
                        <SelectItem value="1b+">$1B+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sectorsFocus"
              render={() => (
                <FormItem>
                  <FormLabel>Target Sectors</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {sectors.map((sector) => (
                      <FormField
                        key={sector.id}
                        control={form.control}
                        name="sectorsFocus"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(sector.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, sector.id])
                                    : field.onChange(field.value?.filter((value) => value !== sector.id));
                                }}
                                data-testid={`checkbox-sector-${sector.id}`}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {sector.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="geosFocus"
              render={() => (
                <FormItem>
                  <FormLabel>Target Geographies</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {geographies.map((geo) => (
                      <FormField
                        key={geo.id}
                        control={form.control}
                        name="geosFocus"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(geo.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, geo.id])
                                    : field.onChange(field.value?.filter((value) => value !== geo.id));
                                }}
                                data-testid={`checkbox-geo-${geo.id}`}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {geo.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dealSizeMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Deal Size ($M)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-deal-size-min"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dealSizeMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Deal Size ($M)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-deal-size-max"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-stage">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="early">Early Stage</SelectItem>
                        <SelectItem value="growth">Growth Stage</SelectItem>
                        <SelectItem value="late">Late Stage</SelectItem>
                        <SelectItem value="expansion">Expansion</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="holdingPeriodYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Holding Period (Years)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={15}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        data-testid="input-holding-period"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskAppetite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Appetite</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-risk-appetite">
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full md:w-auto" disabled={isLoading} data-testid="button-submit-mandate">
              Continue to Country Screening
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
