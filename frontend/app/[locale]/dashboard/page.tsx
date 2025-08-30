'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/state/auth-store'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, BookOpen, Trophy, Clock, TrendingUp, Users, MessageCircle } from 'lucide-react'

interface Child {
  id: string
  firstName: string
  birthDate: string
  ageGroup: string
  preferredLanguage: string
  createdAt: string
}

interface ProgressData {
  childId: string
  totalSessions: number
  totalTimeMinutes: number
  completedLessons: number
  currentLevel: number
  xpPoints: number
  badges: string[]
  weeklyProgress: {
    week: string
    sessions: number
    timeMinutes: number
  }[]
  subjectProgress: {
    subject: string
    progress: number
    lessons: number
  }[]
}

interface ProgressReport {
  childId: string
  reportPeriod: string
  summary: string
  achievements: string[]
  recommendations: string[]
  detailedProgress: {
    subject: string
    improvement: string
    nextSteps: string[]
  }[]
}

export default function GuardianDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<string | null>(null)
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [progressReport, setProgressReport] = useState<ProgressReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(false)
  
  const { user } = useAuthStore()

  useEffect(() => {
    loadChildren()
  }, [])

  useEffect(() => {
    if (selectedChild) {
      loadChildProgress(selectedChild)
    }
  }, [selectedChild])

  const loadChildren = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getChildren()
      setChildren(response.children || [])
      if (response.children?.length > 0) {
        setSelectedChild(response.children[0].id)
      }
    } catch (error) {
      console.error('Failed to load children:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadChildProgress = async (childId: string) => {
    try {
      const progress = await apiClient.getChildProgress(childId)
      setProgressData(progress)
    } catch (error) {
      console.error('Failed to load child progress:', error)
    }
  }

  const generateReport = async (childId: string, days: number = 7) => {
    try {
      setReportLoading(true)
      const report = await apiClient.generateProgressReport(childId, days)
      setProgressReport(report)
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setReportLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">جاري تحميل لوحة القيادة...</p>
          </div>
        </div>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              لم يتم إضافة أطفال بعد
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              قم بإضافة طفل لبدء رحلة التعلم معنا
            </p>
            <Button onClick={() => window.location.href = '/add-child'}>
              إضافة طفل جديد
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const selectedChildData = children.find(child => child.id === selectedChild)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            لوحة قيادة الولي
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            متابعة تقدم أطفالك في رحلة التعلم
          </p>
        </div>

        {/* Child Selector */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">اختر طفل</h2>
          <div className="flex gap-3 flex-wrap">
            {children.map((child) => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? "default" : "outline"}
                onClick={() => setSelectedChild(child.id)}
                className="h-auto p-4 flex flex-col items-start"
              >
                <span className="font-medium">{child.firstName}</span>
                <span className="text-xs opacity-75">{child.ageGroup}</span>
              </Button>
            ))}
          </div>
        </div>

        {selectedChildData && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="progress">التقدم التفصيلي</TabsTrigger>
              <TabsTrigger value="reports">التقارير</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Cards */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي الجلسات</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData?.totalSessions || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% من الأسبوع الماضي
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">وقت التعلم</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData?.totalTimeMinutes || 0} دقيقة</div>
                    <p className="text-xs text-muted-foreground">
                      +8% من الأسبوع الماضي
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">نقاط الخبرة</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData?.xpPoints || 0} XP</div>
                    <p className="text-xs text-muted-foreground">
                      المستوى {progressData?.currentLevel || 1}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الدروس المكتملة</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{progressData?.completedLessons || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      من أصل 25 درس
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress by Subject */}
              <Card>
                <CardHeader>
                  <CardTitle>التقدم حسب المادة</CardTitle>
                  <CardDescription>مستوى التقدم في كل مادة دراسية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {progressData?.subjectProgress?.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{subject.subject}</span>
                        <span className="text-sm text-muted-foreground">
                          {subject.progress}% ({subject.lessons} دروس)
                        </span>
                      </div>
                      <Progress value={subject.progress} className="w-full" />
                    </div>
                  )) || (
                    <p className="text-center text-muted-foreground py-4">
                      لا توجد بيانات متاحة
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Badges */}
              <Card>
                <CardHeader>
                  <CardTitle>الجوائز والإنجازات</CardTitle>
                  <CardDescription>الشارات التي حصل عليها طفلك</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {progressData?.badges?.map((badge, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        🏆 {badge}
                      </Badge>
                    )) || (
                      <p className="text-center text-muted-foreground py-4">
                        لم يتم الحصول على شارات بعد
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>التقدم الأسبوعي</CardTitle>
                  <CardDescription>عدد الجلسات والوقت المستغرق كل أسبوع</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {progressData?.weeklyProgress?.map((week, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{week.week}</p>
                          <p className="text-sm text-muted-foreground">
                            {week.sessions} جلسة • {week.timeMinutes} دقيقة
                          </p>
                        </div>
                        <div className="text-right">
                          <Progress value={(week.sessions / 7) * 100} className="w-20" />
                        </div>
                      </div>
                    )) || (
                      <p className="text-center text-muted-foreground py-8">
                        لا توجد بيانات أسبوعية متاحة
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>تقارير التقدم</CardTitle>
                  <CardDescription>تقارير مفصلة عن أداء طفلك</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => generateReport(selectedChild!, 7)}
                      disabled={reportLoading}
                    >
                      تقرير أسبوعي
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => generateReport(selectedChild!, 30)}
                      disabled={reportLoading}
                    >
                      تقرير شهري
                    </Button>
                  </div>
                  
                  {reportLoading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                      <p className="text-muted-foreground">جاري إنشاء التقرير...</p>
                    </div>
                  )}

                  {progressReport && (
                    <div className="space-y-4 mt-6">
                      <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">ملخص الفترة: {progressReport.reportPeriod}</h3>
                        <p className="text-sm text-muted-foreground">{progressReport.summary}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">الإنجازات</h4>
                        <ul className="space-y-1">
                          {progressReport.achievements?.map((achievement, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <span className="mr-2">✅</span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">التوصيات</h4>
                        <ul className="space-y-1">
                          {progressReport.recommendations?.map((recommendation, index) => (
                            <li key={index} className="flex items-center text-sm">
                              <span className="mr-2">💡</span>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">التقدم التفصيلي</h4>
                        {progressReport.detailedProgress?.map((progress, index) => (
                          <Card key={index}>
                            <CardHeader>
                              <CardTitle className="text-base">{progress.subject}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm mb-2">{progress.improvement}</p>
                              <div>
                                <p className="text-sm font-medium mb-1">الخطوات التالية:</p>
                                <ul className="text-sm space-y-1">
                                  {progress.nextSteps?.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex items-center">
                                      <span className="mr-2">•</span>
                                      {step}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
