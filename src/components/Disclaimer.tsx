import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Disclaimer = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <Card className="max-w-4xl mx-auto border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Important Disclaimer</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    This platform uses conversion guidelines consistent with the methods commonly applied by the 
                    <span className="font-semibold text-foreground"> World Education Services (WES)</span> to estimate 
                    U.S.–equivalent GPA values.
                  </p>
                  <p>
                    However, it <span className="font-semibold text-foreground">does not issue official WES evaluations</span> and 
                    is <span className="font-semibold text-foreground">not affiliated with WES</span>.
                  </p>
                  <p>
                    The results provided are for <span className="font-semibold text-foreground">informational and planning purposes only</span>, 
                    to help users gauge program eligibility, compare academic standings, and make informed decisions before pursuing 
                    official credential evaluation services.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Disclaimer;
