import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Users, Calendar, FileText, TestTube, Stethoscope, Activity } from "lucide-react"
import { supabase } from "../supabaseClient"

interface DashboardProps {
  onNavigate: (module: string) => void
  user?: {
    role: "admin" | "staff" | "student"
    patient_id?: string
    full_name: string
  }
}

export function Dashboard({ onNavigate, user }: DashboardProps) {
  const [totalPatients, setTotalPatients] = useState<number | string>("...")
  const [todayAppointments, setTodayAppointments] = useState<number | string>("...")
  const [pendingLabs, setPendingLabs] = useState<number | string>("...")
  const [activeCases, setActiveCases] = useState<number | string>("...")

  useEffect(() => {
    async function fetchStats() {
      try {
        if (user?.role === "student" && user.patient_id) {
          const patientId = user.patient_id

          // My Active Cases
          const { count: casesCount, error: err1 } = await supabase
            .from("medical_records")
            .select("*", { count: "exact", head: true })
            .eq("patient_id", patientId)
            .eq("type", "condition")
            .eq("status", "active")
          if (!err1 && casesCount !== null) setActiveCases(casesCount)

          // My Scheduled Appointments
          const { count: apptsCount, error: err2 } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("patient_id", patientId)
            .in("status", ["scheduled", "confirmed"])
          if (!err2 && apptsCount !== null) setTodayAppointments(apptsCount)

          // My Pending Lab Results
          const { count: labsCount, error: err3 } = await supabase
            .from("lab_results")
            .select("*", { count: "exact", head: true })
            .eq("patient_id", patientId)
            .eq("status", "pending")
          if (!err3 && labsCount !== null) setPendingLabs(labsCount)

          // My Total Records
          const { count: totalRecsCount, error: err4 } = await supabase
            .from("medical_records")
            .select("*", { count: "exact", head: true })
            .eq("patient_id", patientId)
          if (!err4 && totalRecsCount !== null) setTotalPatients(totalRecsCount)
        } else {
          // Total Patients
          const { count: patientsCount, error: err1 } = await supabase
            .from("patients")
            .select("*", { count: "exact", head: true })
          if (!err1 && patientsCount !== null) setTotalPatients(patientsCount)

          // Today's Appointments
          const todayStr = new Date().toISOString().split("T")[0]
          const { count: apptsCount, error: err2 } = await supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("date", todayStr)
          if (!err2 && apptsCount !== null) setTodayAppointments(apptsCount)

          // Pending Lab Results
          const { count: labsCount, error: err3 } = await supabase
            .from("lab_results")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending")
          if (!err3 && labsCount !== null) setPendingLabs(labsCount)

          // Active Cases (Conditions that are active)
          const { count: casesCount, error: err4 } = await supabase
            .from("medical_records")
            .select("*", { count: "exact", head: true })
            .eq("type", "condition")
            .eq("status", "active")
          if (!err4 && casesCount !== null) setActiveCases(casesCount)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }
    fetchStats()
  }, [user])

  const isStudent = user?.role === "student"
  const stats = [
    { title: isStudent ? "My Total Records" : "Total Patients", value: String(totalPatients), icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: isStudent ? "My Scheduled Appointments" : "Today's Appointments", value: String(todayAppointments), icon: Calendar, color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { title: isStudent ? "My Pending Lab Results" : "Pending Lab Results", value: String(pendingLabs), icon: TestTube, color: "text-amber-600", bgColor: "bg-amber-50" },
    { title: isStudent ? "My Active Cases" : "Active Cases", value: String(activeCases), icon: Activity, color: "text-teal-600", bgColor: "bg-teal-50" }
  ]

  const modules = [
    ...(user?.role !== "student"
      ? [{
          id: "patients",
          title: "Patient Registration",
          description: "Register new patients and manage personal details",
          icon: Users,
          color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
          iconColor: "text-blue-600"
        }]
      : []),
    {
      id: "history",
      title: "Medical History",
      description: isStudent ? "View your personal medical records and conditions" : "View and update patient medical records",
      icon: FileText,
      color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
      iconColor: "text-emerald-600"
    },
    {
      id: "appointments",
      title: "Appointment Scheduling",
      description: isStudent ? "Schedule and manage your appointments" : "Schedule and manage patient appointments",
      icon: Calendar,
      color: "bg-teal-50 hover:bg-teal-100 border-teal-200",
      iconColor: "text-teal-600"
    },
    {
      id: "lab-results",
      title: "Laboratory Results",
      description: isStudent ? "Track your lab tests and imaging results" : "Track lab tests and imaging results",
      icon: TestTube,
      color: "bg-amber-50 hover:bg-amber-100 border-amber-200",
      iconColor: "text-amber-600"
    },
    {
      id: "notes",
      title: "Doctor Notes",
      description: isStudent ? "Clinical notes and treatment plans from your doctor" : "Clinical notes and treatment plans",
      icon: Stethoscope,
      color: "bg-rose-50 hover:bg-rose-100 border-rose-200",
      iconColor: "text-rose-600"
    }
  ]

  return (
    <div className="p-6 space-y-8">
      <div className="text-center py-8">
        <h1 className="mb-3 text-slate-800">Welcome to MediCare EMR</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          {isStudent 
            ? `Hello, ${user.full_name}. Access your personal health portal to view your medical history, doctor notes, lab results, and appointments.`
            : "Your comprehensive Electronic Medical Records system. Manage patient information, appointments, and medical data with ease and security."
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="mb-4">System Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card 
              key={module.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border ${module.color}`}
              onClick={() => onNavigate(module.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/70">
                    <module.icon className={`h-6 w-6 ${module.iconColor}`} />
                  </div>
                  <CardTitle className="text-lg text-slate-800">{module.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-slate-600">{module.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}