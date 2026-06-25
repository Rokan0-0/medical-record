import { useState } from "react"
import { Button } from "./components/ui/button"
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar"
import { Dashboard } from "./components/Dashboard"
import { PatientRegistration } from "./components/PatientRegistration"
import { AppointmentScheduling } from "./components/AppointmentScheduling"
import { MedicalHistory } from "./components/MedicalHistory"
import { LabResults } from "./components/LabResults"
import { DoctorNotes } from "./components/DoctorNotes"
import { Login } from "./components/Login"
import { Home, Users, Calendar, FileText, TestTube, Stethoscope } from "lucide-react"

export interface UserSession {
  id: string
  username: string
  email: string
  role: "admin" | "staff" | "student"
  full_name: string
  patient_id?: string
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("emr_user")
    return saved ? JSON.parse(saved) : null
  })
  
  const [activeModule, setActiveModule] = useState("dashboard")

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    ...(currentUser.role !== "student" 
      ? [{ id: "patients", label: "Patient Registration", icon: Users }] 
      : []),
    { id: "history", label: "Medical History", icon: FileText },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "lab-results", label: "Lab Results", icon: TestTube },
    { id: "notes", label: "Doctor Notes", icon: Stethoscope },
  ]

  const renderActiveModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <Dashboard onNavigate={setActiveModule} user={currentUser} />
      case "patients":
        return <PatientRegistration user={currentUser} />
      case "history":
        return <MedicalHistory user={currentUser} />
      case "appointments":
        return <AppointmentScheduling user={currentUser} />
      case "lab-results":
        return <LabResults user={currentUser} />
      case "notes":
        return <DoctorNotes user={currentUser} />
      default:
        return <Dashboard onNavigate={setActiveModule} user={currentUser} />
    }
  }

  const getCurrentModuleTitle = () => {
    const item = navigationItems.find(item => item.id === activeModule)
    return item ? item.label : "Dashboard"
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="border-r bg-gradient-to-b from-slate-50 to-blue-50">
          <SidebarHeader className="border-b px-6 py-4 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">MediCare EMR</h2>
                <p className="text-xs text-blue-600">Healthcare Management System</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-6">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeModule === item.id
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 h-11 transition-all duration-200 ${
                      isActive 
                        ? "bg-blue-600 text-white shadow-md hover:bg-blue-700" 
                        : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                    onClick={() => setActiveModule(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                )
              })}
            </nav>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white/95 backdrop-blur-sm px-4 shadow-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-slate-600 hover:text-blue-600" />
              <div className="h-4 w-px bg-slate-300" />
              <h1 className="font-semibold text-slate-800">{getCurrentModuleTitle()}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border hidden md:block">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">{currentUser.full_name}</p>
                  <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">{currentUser.role}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    localStorage.removeItem("emr_user")
                    setCurrentUser(null)
                    setActiveModule("dashboard")
                  }}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                >
                  Logout
                </Button>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
            {renderActiveModule()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}