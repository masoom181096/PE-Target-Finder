import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { OptionSelection } from "@shared/schema";

interface SingleSelectWithOtherProps {
  label: string;
  options: string[];
  value?: OptionSelection;
  onChange: (next: OptionSelection) => void;
  columns?: 2 | 3 | 4;
  testIdPrefix?: string;
}

export function SingleSelectWithOther({
  label,
  options,
  value,
  onChange,
  columns = 2,
  testIdPrefix = "single-select",
}: SingleSelectWithOtherProps) {
  const handleSelect = (option: string) => {
    if (option === "Other") {
      onChange({ value: "Other", otherText: value?.otherText ?? "" });
    } else {
      onChange({ value: option });
    }
  };

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <RadioGroup
        value={value?.value}
        onValueChange={handleSelect}
        className={`grid ${gridCols[columns]} gap-3`}
        data-testid={`radio-group-${testIdPrefix}`}
      >
        {options.map((option) => {
          const isSelected = value?.value === option;
          return (
            <div key={option} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`${testIdPrefix}-${option.replace(/\s+/g, "-").toLowerCase()}`}
                  data-testid={`radio-${testIdPrefix}-${option.replace(/\s+/g, "-").toLowerCase()}`}
                />
                <Label
                  htmlFor={`${testIdPrefix}-${option.replace(/\s+/g, "-").toLowerCase()}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option}
                </Label>
              </div>
              {option === "Other" && isSelected && (
                <Input
                  type="text"
                  placeholder="Please specify..."
                  value={value?.otherText ?? ""}
                  onChange={(e) =>
                    onChange({ value: "Other", otherText: e.target.value })
                  }
                  className="ml-6 max-w-[200px]"
                  data-testid={`input-${testIdPrefix}-other`}
                />
              )}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}
