import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OptionSelection } from "@shared/schema";

interface MultiSelectWithOtherProps {
  label: string;
  options: string[];
  value: OptionSelection[];
  onChange: (next: OptionSelection[]) => void;
  columns?: 2 | 3 | 4;
  testIdPrefix?: string;
}

export function MultiSelectWithOther({
  label,
  options,
  value,
  onChange,
  columns = 2,
  testIdPrefix = "multi-select",
}: MultiSelectWithOtherProps) {
  const handleToggle = (option: string) => {
    const existing = value.find((v) => v.value === option);
    if (existing) {
      onChange(value.filter((v) => v.value !== option));
    } else {
      if (option === "Other") {
        onChange([...value, { value: "Other", otherText: "" }]);
      } else {
        onChange([...value, { value: option }]);
      }
    }
  };

  const handleOtherTextChange = (text: string) => {
    onChange(
      value.map((v) =>
        v.value === "Other" ? { ...v, otherText: text } : v
      )
    );
  };

  const isChecked = (option: string) => value.some((v) => v.value === option);

  const other = value.find((v) => v.value === "Other");

  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      <div className={`grid ${gridCols[columns]} gap-3`}>
        {options.map((option) => (
          <div key={option} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${testIdPrefix}-${option.replace(/\s+/g, "-").toLowerCase()}`}
                checked={isChecked(option)}
                onCheckedChange={() => handleToggle(option)}
                data-testid={`checkbox-${testIdPrefix}-${option.replace(/\s+/g, "-").toLowerCase()}`}
              />
              <Label
                htmlFor={`${testIdPrefix}-${option.replace(/\s+/g, "-").toLowerCase()}`}
                className="text-sm font-normal cursor-pointer"
              >
                {option}
              </Label>
            </div>
            {option === "Other" && isChecked("Other") && (
              <Input
                type="text"
                placeholder="Please specify..."
                value={other?.otherText ?? ""}
                onChange={(e) => handleOtherTextChange(e.target.value)}
                className="ml-6 max-w-[200px]"
                data-testid={`input-${testIdPrefix}-other`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
