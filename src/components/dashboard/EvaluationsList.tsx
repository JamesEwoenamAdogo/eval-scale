import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useEvaluations, Evaluation } from "@/hooks/use-evaluations";
import { conversionScales, getGPAStrength } from "@/lib/gpa-scales";
import { getUniversityRecommendations } from "@/lib/university-recommendations";
import { Calendar, TrendingUp, Award, BarChart3, GraduationCap, Target, Shield } from "lucide-react";
import { format } from "date-fns";

const EvaluationsList = () => {
  const { evaluations, getEvaluationStats, getRecentEvaluations } = useEvaluations();
  const stats = getEvaluationStats();
  const recentEvaluations = getRecentEvaluations(2);

  const getScaleName = (scaleId: string) => {
    return conversionScales.find(s => s.id === scaleId)?.name || scaleId;
  };

  if (evaluations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Evaluations Yet</h3>
          <p className="text-muted-foreground">
            Start a new evaluation to see your GPA conversion history here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Evaluations</p>
                <p className="text-2xl font-bold">{stats.totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-accent/10">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last 2 Years</p>
                <p className="text-2xl font-bold">{stats.recentCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. GPA (2 years)</p>
                <p className="text-2xl font-bold">{stats.averageGPA}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GPA Strength Indicator */}
      {recentEvaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              GPA Strength Indicator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-4 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0.0</span>
                  <span>2.0</span>
                  <span>3.0</span>
                  <span>4.0</span>
                </div>
              </div>
              <div className="text-center min-w-[100px]">
                <p className="text-3xl font-bold text-primary">{stats.averageGPA}</p>
                <p className={`text-sm font-medium ${getGPAStrength(parseFloat(stats.averageGPA), 'us_4').color}`}>
                  {getGPAStrength(parseFloat(stats.averageGPA), 'us_4').label}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* University Recommendations */}
      {recentEvaluations.length > 0 && (() => {
        const gpa = parseFloat(stats.averageGPA);
        const recommendations = getUniversityRecommendations(gpa);
        const hasRecommendations = recommendations.reach.length > 0 || recommendations.target.length > 0 || recommendations.safety.length > 0;
        
        if (!hasRecommendations) return null;
        
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                University Admission Recommendations
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on your average GPA of {stats.averageGPA}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {recommendations.reach.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-amber-500" />
                    <h4 className="font-semibold text-amber-600">Reach Schools</h4>
                    <Badge variant="outline" className="text-amber-600 border-amber-300">Ambitious</Badge>
                  </div>
                  <div className="grid gap-3">
                    {recommendations.reach.map((uni, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{uni.name}</p>
                            <p className="text-sm text-muted-foreground">{uni.country} • Min GPA: {uni.minGPA}</p>
                          </div>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">{uni.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {recommendations.target.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-blue-500" />
                    <h4 className="font-semibold text-blue-600">Target Schools</h4>
                    <Badge variant="outline" className="text-blue-600 border-blue-300">Good Match</Badge>
                  </div>
                  <div className="grid gap-3">
                    {recommendations.target.map((uni, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{uni.name}</p>
                            <p className="text-sm text-muted-foreground">{uni.country} • Min GPA: {uni.minGPA}</p>
                          </div>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">{uni.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {recommendations.safety.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-4 h-4 text-green-500" />
                    <h4 className="font-semibold text-green-600">Safety Schools</h4>
                    <Badge variant="outline" className="text-green-600 border-green-300">Likely Admit</Badge>
                  </div>
                  <div className="grid gap-3">
                    {recommendations.safety.map((uni, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{uni.name}</p>
                            <p className="text-sm text-muted-foreground">{uni.country} • Min GPA: {uni.minGPA}</p>
                          </div>
                        </div>
                        <p className="text-sm mt-1 text-muted-foreground">{uni.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Evaluations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluation History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>University</TableHead>
                  <TableHead>Scale</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>GPA</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations.map((evaluation) => {
                  const strength = getGPAStrength(evaluation.averageGPA, evaluation.conversionType);
                  return (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {format(new Date(evaluation.createdAt), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(evaluation.createdAt), 'h:mm a')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {evaluation.university}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getScaleName(evaluation.conversionType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{evaluation.grades.length}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{evaluation.averageGPA.toFixed(2)}</span>
                          <span className={`text-xs ${strength.color}`}>
                            ({strength.label})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {evaluation.isPaid ? (
                          <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                            Completed
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationsList;
