import { useState, useMemo } from "react";
import { ArrowRight, ArrowLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SubParameterUserInput, TopLevelParamId } from "@shared/schema";
import { SUB_PARAMETERS, TOP_LEVEL_PARAM_ORDER, TOP_LEVEL_PARAM_LABELS } from "@shared/schema";

interface SubParameterThresholdsProps {
  onSubmit: (inputs: SubParameterUserInput[]) => void;
  isLoading?: boolean;
  initialInputs?: SubParameterUserInput[];
}

export function SubParameterThresholds({
  onSubmit,
  isLoading,
  initialInputs = [],
}: SubParameterThresholdsProps) {
  const [activeCategory, setActiveCategory] = useState<TopLevelParamId>(TOP_LEVEL_PARAM_ORDER[0]);
  const [inputValues, setInputValues] = useState<Record<string, number | undefined>>(() => {
    const initial: Record<string, number | undefined> = {};
    initialInputs.forEach((input) => {
      initial[input.subParamId] = input.value;
    });
    return initial;
  });

  const activeCategoryIndex = TOP_LEVEL_PARAM_ORDER.indexOf(activeCategory);
  const isFirstCategory = activeCategoryIndex === 0;
  const isLastCategory = activeCategoryIndex === TOP_LEVEL_PARAM_ORDER.length - 1;

  const subParamsByCategory = useMemo(() => {
    const grouped: Record<TopLevelParamId, typeof SUB_PARAMETERS> = {} as any;
    TOP_LEVEL_PARAM_ORDER.forEach((cat) => {
      grouped[cat] = SUB_PARAMETERS.filter((sp) => sp.category === cat);
    });
    return grouped;
  }, []);

  const filledCountByCategory = useMemo(() => {
    const counts: Record<TopLevelParamId, { filled: number; total: number }> = {} as any;
    TOP_LEVEL_PARAM_ORDER.forEach((cat) => {
      const subParams = subParamsByCategory[cat];
      const filled = subParams.filter((sp) => inputValues[sp.id] !== undefined).length;
      counts[cat] = { filled, total: subParams.length };
    });
    return counts;
  }, [inputValues, subParamsByCategory]);

  const handleInputChange = (subParamId: string, value: string) => {
    const numValue = value === "" ? undefined : Number(value);
    setInputValues((prev) => ({
      ...prev,
      [subParamId]: numValue,
    }));
  };

  const handleSelectChange = (subParamId: string, value: string) => {
    const numValue = value === "auto" ? undefined : Number(value);
    setInputValues((prev) => ({
      ...prev,
      [subParamId]: numValue,
    }));
  };

  const handlePrevious = () => {
    if (!isFirstCategory) {
      setActiveCategory(TOP_LEVEL_PARAM_ORDER[activeCategoryIndex - 1]);
    }
  };

  const handleNext = () => {
    if (!isLastCategory) {
      setActiveCategory(TOP_LEVEL_PARAM_ORDER[activeCategoryIndex + 1]);
    }
  };

  const handleSubmit = () => {
    const inputs: SubParameterUserInput[] = Object.entries(inputValues)
      .filter(([_, value]) => value !== undefined)
      .map(([subParamId, value]) => ({
        subParamId,
        value,
      }));
    onSubmit(inputs);
  };

  const getDirectionLabel = (direction: string): string | null => {
    if (direction === "higherIsBetter") return "Min";
    if (direction === "lowerIsBetter") return "Max";
    return null;
  };

  const currentSubParams = subParamsByCategory[activeCategory];

  return (
    <Card className="w-full max-w-5xl mx-auto" data-testid="sub-parameter-thresholds">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-xl">Sub-Parameter Thresholds</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure thresholds for each sub-parameter. Leave blank for automatic inference based on your fund mandate.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6" data-testid="sub-param-layout">
          <div className="w-64 shrink-0" data-testid="category-sidebar">
            <ScrollArea className="h-[500px]">
              <div className="space-y-1 pr-4">
                {TOP_LEVEL_PARAM_ORDER.map((category) => {
                  const counts = filledCountByCategory[category];
                  const isActive = category === activeCategory;
                  return (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`w-full text-left p-3 rounded-md transition-colors flex items-center justify-between gap-2 ${
                        isActive
                          ? "bg-accent"
                          : "hover-elevate"
                      }`}
                      data-testid={`category-${category}`}
                    >
                      <span className={`text-sm ${isActive ? "font-medium" : ""}`}>
                        {TOP_LEVEL_PARAM_LABELS[category]}
                      </span>
                      <Badge
                        variant={counts.filled > 0 ? "default" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {counts.filled}/{counts.total}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 min-w-0" data-testid="sub-param-content">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold" data-testid="active-category-title">
                {TOP_LEVEL_PARAM_LABELS[activeCategory]}
              </h3>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {currentSubParams.length} sub-parameters
              </span>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-4 pr-4">
                {currentSubParams.map((subParam) => {
                  const directionLabel = getDirectionLabel(subParam.direction);
                  const currentValue = inputValues[subParam.id];

                  return (
                    <div
                      key={subParam.id}
                      className="flex items-center gap-4 p-3 rounded-md border"
                      data-testid={`sub-param-row-${subParam.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <Label
                          htmlFor={`input-${subParam.id}`}
                          className="text-sm font-medium block mb-1"
                        >
                          {subParam.label}
                        </Label>
                        {directionLabel && (
                          <span className="text-xs text-muted-foreground">
                            {directionLabel === "Min" ? "Higher is better" : "Lower is better"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {directionLabel && (
                          <Badge variant="outline" className="text-xs">
                            {directionLabel}
                          </Badge>
                        )}

                        {subParam.type === "qualitative" ? (
                          <Select
                            value={currentValue !== undefined ? String(currentValue) : "auto"}
                            onValueChange={(value) => handleSelectChange(subParam.id, value)}
                            data-testid={`select-${subParam.id}`}
                          >
                            <SelectTrigger className="w-36" data-testid={`select-trigger-${subParam.id}`}>
                              <SelectValue placeholder="Auto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Auto</SelectItem>
                              <SelectItem value="1">1 - Very Low</SelectItem>
                              <SelectItem value="2">2 - Low</SelectItem>
                              <SelectItem value="3">3 - Medium</SelectItem>
                              <SelectItem value="4">4 - High</SelectItem>
                              <SelectItem value="5">5 - Very High</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id={`input-${subParam.id}`}
                            type="number"
                            step="0.1"
                            placeholder="Auto"
                            value={currentValue !== undefined ? currentValue : ""}
                            onChange={(e) => handleInputChange(subParam.id, e.target.value)}
                            className="w-28"
                            data-testid={`input-${subParam.id}`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstCategory || isLoading}
                data-testid="button-previous-category"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {!isLastCategory && (
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={isLoading}
                    data-testid="button-next-category"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  data-testid="button-submit-thresholds"
                >
                  Continue to Shortlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
