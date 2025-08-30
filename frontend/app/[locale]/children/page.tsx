'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/state/auth-store'
import { apiClient } from '@/lib/api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, User, Settings, Shield, Clock } from 'lucide-react'

interface Child {
  id: string
  firstName: string
  birthDate: string
  ageGroup: string
  preferredLanguage: string
  avatar?: string
  totalPoints: number
  currentStreak: number
  enabledSubjects: string[]
  dailyTimeLimit: number
  voiceEnabled: boolean
  chatEnabled: boolean
  voiceRecordingAllowed: boolean
  dataRetentionDays: number
  lastActivity?: string
}

export default function ChildrenManagementPage() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [newChild, setNewChild] = useState({
    firstName: '',
    birthDate: '',
    ageGroup: '',
    preferredLanguage: 'ar'
  })

  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getChildren()
      setChildren(response || [])
    } catch (error) {
      console.error('Failed to load children:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddChild = async () => {
    try {
      setSaving(true)
      await apiClient.createChild(newChild)
      setIsAddDialogOpen(false)
      setNewChild({
        firstName: '',
        birthDate: '',
        ageGroup: '',
        preferredLanguage: 'ar'
      })
      loadChildren()
    } catch (error) {
      console.error('Failed to add child:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateChild = async (childId: string, updates: Partial<Child>) => {
    try {
      setSaving(true)
      await apiClient.updateChild(childId, updates)
      loadChildren()
      setIsEditDialogOpen(false)
      setSelectedChild(null)
    } catch (error) {
      console.error('Failed to update child:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteChild = async (childId: string) => {
    if (confirm('هل أنت متأكد من حذف ملف الطفل؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        await apiClient.deleteChild(childId)
        loadChildren()
      } catch (error) {
        console.error('Failed to delete child:', error)
      }
    }
  }

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    const age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1
    }
    return age
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الأطفال...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الأطفال</h1>
            <p className="text-gray-600">إدارة ملفات الأطفال وإعداداتهم</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                إضافة طفل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle>إضافة طفل جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات الطفل لإنشاء ملف تعريفي جديد
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="firstName">الاسم الأول</Label>
                  <Input
                    id="firstName"
                    value={newChild.firstName}
                    onChange={(e) => setNewChild({...newChild, firstName: e.target.value})}
                    placeholder="أدخل اسم الطفل"
                  />
                </div>
                
                <div>
                  <Label htmlFor="birthDate">تاريخ الميلاد</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={newChild.birthDate}
                    onChange={(e) => setNewChild({...newChild, birthDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="ageGroup">الفئة العمرية</Label>
                  <Select value={newChild.ageGroup} onValueChange={(value) => setNewChild({...newChild, ageGroup: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة العمرية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4-6">4-6 سنوات</SelectItem>
                      <SelectItem value="7-9">7-9 سنوات</SelectItem>
                      <SelectItem value="10-12">10-12 سنة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="language">اللغة المفضلة</Label>
                  <Select value={newChild.preferredLanguage} onValueChange={(value) => setNewChild({...newChild, preferredLanguage: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddChild} disabled={saving || !newChild.firstName || !newChild.birthDate || !newChild.ageGroup}>
                  {saving ? 'جارٍ الإضافة...' : 'إضافة'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Children Grid */}
        {children.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">لا توجد أطفال مسجلون</h2>
            <p className="text-gray-600 mb-6">قم بإضافة طفل لبدء رحلة التعلم</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Card key={child.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {child.firstName.charAt(0)}
                        </div>
                        {child.firstName}
                      </CardTitle>
                      <CardDescription>
                        {calculateAge(child.birthDate)} سنة • {child.ageGroup}
                      </CardDescription>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedChild(child)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteChild(child.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">النقاط</span>
                    <Badge variant="secondary">{child.totalPoints} نقطة</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">السلسلة الحالية</span>
                    <Badge variant="outline">{child.currentStreak} يوم</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">الحد اليومي</span>
                    <span className="text-sm">{child.dailyTimeLimit} دقيقة</span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    {child.enabledSubjects?.map((subject) => (
                      <Badge key={subject} variant="outline" className="text-xs">
                        {subject === 'arabic' ? 'العربية' : subject === 'english' ? 'الإنجليزية' : subject}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push(`/dashboard?child=${child.id}`)}
                  >
                    عرض التقدم
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Child Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>تعديل بيانات {selectedChild?.firstName}</DialogTitle>
              <DialogDescription>
                تحديث إعدادات الطفل والتحكم الأبوي
              </DialogDescription>
            </DialogHeader>
            
            {selectedChild && (
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
                  <TabsTrigger value="settings">الإعدادات</TabsTrigger>
                  <TabsTrigger value="privacy">الخصوصية</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
                  <div>
                    <Label htmlFor="editFirstName">الاسم الأول</Label>
                    <Input
                      id="editFirstName"
                      value={selectedChild.firstName}
                      onChange={(e) => setSelectedChild({...selectedChild, firstName: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="editLanguage">اللغة المفضلة</Label>
                    <Select 
                      value={selectedChild.preferredLanguage} 
                      onValueChange={(value) => setSelectedChild({...selectedChild, preferredLanguage: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ar">العربية</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-4">
                  <div>
                    <Label htmlFor="timeLimit">الحد الزمني اليومي (دقيقة)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      value={selectedChild.dailyTimeLimit}
                      onChange={(e) => setSelectedChild({...selectedChild, dailyTimeLimit: parseInt(e.target.value)})}
                      min="15"
                      max="120"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تفعيل الصوت</Label>
                      <p className="text-sm text-gray-600">السماح للطفل بالتفاعل الصوتي</p>
                    </div>
                    <Switch
                      checked={selectedChild.voiceEnabled}
                      onCheckedChange={(checked) => setSelectedChild({...selectedChild, voiceEnabled: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تفعيل المحادثة</Label>
                      <p className="text-sm text-gray-600">السماح للطفل بالمحادثة النصية</p>
                    </div>
                    <Switch
                      checked={selectedChild.chatEnabled}
                      onCheckedChange={(checked) => setSelectedChild({...selectedChild, chatEnabled: checked})}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="privacy" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>السماح بتسجيل الصوت</Label>
                      <p className="text-sm text-gray-600">حفظ التسجيلات الصوتية للطفل</p>
                    </div>
                    <Switch
                      checked={selectedChild.voiceRecordingAllowed}
                      onCheckedChange={(checked) => setSelectedChild({...selectedChild, voiceRecordingAllowed: checked})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dataRetention">مدة الاحتفاظ بالبيانات (يوم)</Label>
                    <Select 
                      value={selectedChild.dataRetentionDays.toString()} 
                      onValueChange={(value) => setSelectedChild({...selectedChild, dataRetentionDays: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 أيام</SelectItem>
                        <SelectItem value="30">30 يوم</SelectItem>
                        <SelectItem value="90">90 يوم</SelectItem>
                        <SelectItem value="365">سنة واحدة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={() => selectedChild && handleUpdateChild(selectedChild.id, selectedChild)}
                disabled={saving}
              >
                {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
