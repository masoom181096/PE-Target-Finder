import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RotateCcw, FileText, ArrowRight } from "lucide-react";

interface TaskCompletedProps {
  companyName: string;
  companyId: string;
  onStartNew?: () => void;
}

export function TaskCompleted({ companyName, companyId, onStartNew }: TaskCompletedProps) {
  return (
    <div className="w-full max-w-2xl mx-auto py-8" data-testid="task-completed">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3" data-testid="text-task-completed-heading">
          Task Completed
        </h1>
        <p className="text-lg text-muted-foreground max-w-md">
          Congratulations! You have successfully completed the investment screening process.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Investment Decision Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              <span className="font-semibold">{companyName}</span> has been selected as your preferred investment target.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Next Steps</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>
                  The investment memo for <span className="font-medium text-foreground">{companyName}</span> has been generated and is ready for your investment committee review.
                </span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Schedule a preliminary call with the target company management team.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Begin detailed due diligence with external advisors.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Prepare indicative offer letter and term sheet.</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {onStartNew && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onStartNew}
            data-testid="button-start-new-screening"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Start New Screening
          </Button>
        </div>
      )}
    </div>
  );
}
