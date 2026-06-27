import { useState, useEffect } from "react"
import { supabase } from "../supabaseClient"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { FileText, Plus, Calendar, AlertTriangle, Pill, Activity, Heart, Brain } from "lucide-react"

interface MedicalRecord {
  id: string
  type: "condition" | "surgery" | "allergy" | "medication"
  title: string
  description: string
  date: string
  severity?: "low" | "medium" | "high"
  status: "active" | "resolved" | "chronic"
  doctor: string
  notes: string
}

interface Patient {
  id: string
  patientId: string
  name: string
  dateOfBirth: string
  bloodType: string
  medicalRecords: MedicalRecord[]
}

interface MedicalHistoryProps {
  user?: {
    role: "admin" | "staff" | "student"
    patient_id?: string
  }
}

export function MedicalHistory({ user }: MedicalHistoryProps) {
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [activeTab, setActiveTab] = useState("overview")
  const [patients, setPatients] = useState<Patient[]>([])
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchPatients() {
      try {
        if (user?.role === "student" && user.patient_id) {
          const { data, error } = await supabase
            .from("patients")
            .select("id, first_name, last_name, date_of_birth, blood_type")
            .eq("id", user.patient_id)
            .single()
          if (error) throw error
          
          const formatted: Patient = {
            id: data.id,
            patientId: data.id,
            name: `${data.first_name} ${data.last_name}`,
            dateOfBirth: data.date_of_birth,
            bloodType: data.blood_type || "O+",
            medicalRecords: []
          }
          setPatients([formatted])
          setSelectedPatient(data.id)
        } else {
          const { data, error } = await supabase
            .from("patients")
            .select("id, first_name, last_name, date_of_birth, blood_type")
            .order("last_name", { ascending: true })
          if (error) throw error
          
          const formatted: Patient[] = (data || []).map(row => ({
            id: row.id,
            patientId: row.id,
            name: `${row.first_name} ${row.last_name}`,
            dateOfBirth: row.date_of_birth,
            bloodType: row.blood_type || "O+",
            medicalRecords: []
          }))
          setPatients(formatted)
          if (formatted.length > 0) {
            setSelectedPatient(formatted[0].id)
          }
        }
      } catch (err) {
        console.error("Error fetching patients:", err)
      }
    }
    fetchPatients()
  }, [user])

  const fetchMedicalRecords = async (patientId: string) => {
    if (!patientId) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("patient_id", patientId)
        .order("date", { ascending: false })
      if (error) throw error
      
      const formatted: MedicalRecord[] = (data || []).map(row => ({
        id: row.id,
        type: row.type,
        title: row.title,
        description: row.description,
        date: row.date,
        severity: row.severity,
        status: row.status,
        doctor: row.doctor,
        notes: row.notes || ""
      }))
      setMedicalRecords(formatted)
    } catch (err) {
      console.error("Error fetching medical records:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedPatient) {
      fetchMedicalRecords(selectedPatient)
    }
  }, [selectedPatient])

  const [newRecord, setNewRecord] = useState({
    type: "" as "condition" | "surgery" | "allergy" | "medication" | "",
    title: "",
    description: "",
    date: "",
    severity: "" as "low" | "medium" | "high" | "",
    status: "" as "active" | "resolved" | "chronic" | "",
    doctor: "",
    notes: ""
  })

  const currentPatient = patients.find(p => p.id === selectedPatient)
  const records = medicalRecords

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "condition": return <Heart className="h-4 w-4" />
      case "surgery": return <Activity className="h-4 w-4" />
      case "allergy": return <AlertTriangle className="h-4 w-4" />
      case "medication": return <Pill className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "condition": return "bg-red-100 text-red-800"
      case "surgery": return "bg-emerald-100 text-emerald-800"
      case "allergy": return "bg-yellow-100 text-yellow-800"
      case "medication": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "chronic": return "bg-orange-100 text-orange-800"
      case "resolved": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filterRecordsByType = (type: string) => {
    return records.filter(record => record.type === type)
  }

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return
    try {
      const { error } = await supabase.from("medical_records").insert({
        patient_id: selectedPatient,
        type: newRecord.type,
        title: newRecord.title,
        description: newRecord.description,
        date: newRecord.date,
        severity: newRecord.severity || null,
        status: newRecord.status,
        doctor: newRecord.doctor,
        notes: newRecord.notes
      })
      if (error) throw error
      
      alert("Medical record added successfully!")
      setNewRecord({
        type: "",
        title: "",
        description: "",
        date: "",
        severity: "",
        status: "",
        doctor: "",
        notes: ""
      })
      fetchMedicalRecords(selectedPatient)
    } catch (err: any) {
      console.error("Error adding medical record:", err)
      alert(`Error adding medical record: ${err.message || err}`)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="mb-2">Medical History</h1>
        <p className="text-muted-foreground">
          Comprehensive medical records and health history management.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Patient Selection Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{user?.role === "student" ? "My Health Profile" : "Select Patient"}</CardTitle>
              <CardDescription>
                {user?.role === "student" ? "Your registration details" : "Choose a patient to view their medical history"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.role !== "student" ? (
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        <div className="flex flex-col">
                          <span>{patient.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{patient.patientId}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-green-50/50 border border-green-100 rounded-lg">
                  <div className="text-sm font-semibold text-slate-800">{currentPatient?.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{currentPatient?.patientId}</div>
                </div>
              )}

              {currentPatient && (
                <div className="space-y-2 pt-4 border-t">
                  <div className="text-sm">
                    <span className="font-medium text-green-700">Matric Number:</span> 
                    <span className="font-mono text-green-800 ml-1">{currentPatient.patientId}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">DOB:</span> {new Date(currentPatient.dateOfBirth).toLocaleDateString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Blood Type:</span> {currentPatient.bloodType}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Total Records:</span> {records.length}
                  </div>
                </div>
              )}

              {user?.role !== "student" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Record
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Medical Record</DialogTitle>
                      <DialogDescription>
                        Add a new medical record for {currentPatient?.name}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddRecord} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Record Type</Label>
                          <Select 
                            value={newRecord.type} 
                            onValueChange={(value: any) => setNewRecord(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="condition">Medical Condition</SelectItem>
                              <SelectItem value="surgery">Surgery</SelectItem>
                              <SelectItem value="allergy">Allergy</SelectItem>
                              <SelectItem value="medication">Medication</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recordDate">Date</Label>
                          <Input
                            id="recordDate"
                            type="date"
                            value={newRecord.date}
                            onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recordTitle">Title</Label>
                        <Input
                          id="recordTitle"
                          value={newRecord.title}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Hypertension, Appendectomy, Penicillin Allergy"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recordDescription">Description</Label>
                        <Textarea
                          id="recordDescription"
                          value={newRecord.description}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Detailed description of the condition, procedure, or medication"
                          rows={3}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Severity</Label>
                          <Select 
                            value={newRecord.severity} 
                            onValueChange={(value: any) => setNewRecord(prev => ({ ...prev, severity: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select 
                            value={newRecord.status} 
                            onValueChange={(value: any) => setNewRecord(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="chronic">Chronic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="recordDoctor">Doctor</Label>
                          <Input
                            id="recordDoctor"
                            value={newRecord.doctor}
                            onChange={(e) => setNewRecord(prev => ({ ...prev, doctor: e.target.value }))}
                            placeholder="Attending physician"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recordNotes">Clinical Notes</Label>
                        <Textarea
                          id="recordNotes"
                          value={newRecord.notes}
                          onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional clinical notes, treatment plans, or observations"
                          rows={3}
                        />
                      </div>

                      <Button type="submit" className="w-full">
                        Add Medical Record
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {currentPatient ? (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {currentPatient.name} - Medical History
                  </CardTitle>
                  <CardDescription>
                    Comprehensive medical records and health timeline
                  </CardDescription>
                </CardHeader>
              </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="conditions">Conditions</TabsTrigger>
                  <TabsTrigger value="surgeries">Surgeries</TabsTrigger>
                  <TabsTrigger value="allergies">Allergies</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Conditions</p>
                            <p className="text-xl font-semibold">{filterRecordsByType("condition").length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-emerald-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Surgeries</p>
                            <p className="text-xl font-semibold">{filterRecordsByType("surgery").length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Allergies</p>
                            <p className="text-xl font-semibold">{filterRecordsByType("allergy").length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Pill className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm text-muted-foreground">Medications</p>
                            <p className="text-xl font-semibold">{filterRecordsByType("medication").length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Medical Records</CardTitle>
                      <CardDescription>Latest entries in chronological order</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {records
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 5)
                          .map((record) => (
                          <div key={record.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Badge className={getTypeColor(record.type)}>
                                  <div className="flex items-center gap-1">
                                    {getTypeIcon(record.type)}
                                    {record.type}
                                  </div>
                                </Badge>
                                <h3 className="font-medium">{record.title}</h3>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline" className={getStatusColor(record.status)}>
                                  {record.status}
                                </Badge>
                                {record.severity && (
                                  <Badge variant="outline" className={getSeverityColor(record.severity)}>
                                    {record.severity}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(record.date).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{record.doctor}</span>
                              </div>
                            </div>
                            {record.notes && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm">{record.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {["conditions", "surgeries", "allergies", "medications"].map(type => (
                  <TabsContent key={type} value={type}>
                    <Card>
                      <CardHeader>
                        <CardTitle className="capitalize">{type}</CardTitle>
                        <CardDescription>
                          {filterRecordsByType(type === "surgeries" ? "surgery" : type === "medications" ? "medication" : type === "allergies" ? "allergy" : "condition").length} record(s)
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {filterRecordsByType(type === "surgeries" ? "surgery" : type === "medications" ? "medication" : type === "allergies" ? "allergy" : "condition").map((record) => (
                            <div key={record.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-medium">{record.title}</h3>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className={getStatusColor(record.status)}>
                                    {record.status}
                                  </Badge>
                                  {record.severity && (
                                    <Badge variant="outline" className={getSeverityColor(record.severity)}>
                                      {record.severity}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{record.description}</p>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(record.date).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span>{record.doctor}</span>
                                </div>
                              </div>
                              {record.notes && (
                                <div className="pt-3 border-t">
                                  <p className="text-sm">{record.notes}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Select a patient to view their medical history</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}