import { useState } from "react"
import { supabase } from "../supabaseClient"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Lock, User, AlertCircle, Eye, EyeOff, Mail, Award } from "lucide-react"
import calebLogo from "../../assets/caleb_logo.png"

interface LoginProps {
  onLogin: (user: {
    id: string
    username: string
    email: string
    role: "admin" | "staff" | "student"
    full_name: string
    patient_id?: string
  }) => void
}

export function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  
  // Login states
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
  // Signup states
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupUsername, setSignupUsername] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { data, error: dbError } = await supabase
        .from("users")
        .select("id, username, password, email, role, full_name, patient_id")
        .eq("username", username.trim().toLowerCase())
        .single()

      if (dbError) {
        throw new Error("Invalid username or password")
      }

      if (data && data.password === password) {
        // Successful login
        const loggedInUser = {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role as "admin" | "staff" | "student",
          full_name: data.full_name,
          patient_id: data.patient_id || undefined
        }
        
        // Save to localStorage
        localStorage.setItem("emr_user", JSON.stringify(loggedInUser))
        onLogin(loggedInUser)
      } else {
        setError("Invalid username or password")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupName.trim() || !signupEmail.trim() || !signupUsername.trim() || !signupPassword.trim()) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { error: dbError } = await supabase
        .from("users")
        .insert({
          username: signupUsername.trim().toLowerCase(),
          password: signupPassword,
          email: signupEmail.trim().toLowerCase(),
          role: "staff", // Signup is specifically for Doctors/Staff
          full_name: signupName.trim()
        })

      if (dbError) {
        throw dbError
      }

      alert("Doctor registered successfully! You can now log in.")
      setMode("login")
      setUsername(signupUsername)
      setPassword(signupPassword)
    } catch (err: any) {
      console.error("Sign up error:", err)
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-green-950 p-4 relative overflow-hidden">
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md border-slate-700/50 bg-slate-900/60 backdrop-blur-xl shadow-2xl text-slate-100 relative z-10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto flex h-20 items-center justify-center rounded-2xl p-1 bg-slate-900/30">
            <img src={calebLogo} alt="Logo" className="h-20 w-auto object-contain rounded-xl" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white mt-4">CUL Medical Centre</CardTitle>
          <CardDescription className="text-slate-400">
            Electronic Medical Records System
          </CardDescription>
          
          <div className="flex gap-2 mt-4 p-1 bg-slate-950/40 rounded-xl">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === "login"
                  ? "bg-green-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(""); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                mode === "signup"
                  ? "bg-green-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Doctor Sign Up
            </button>
          </div>
        </CardHeader>
        
        {mode === "login" ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-red-500/15 border border-red-500/30 text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin, doctor, or student"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-slate-950/40 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-green-500 focus:ring-green-500/20"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-950/40 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-green-500 focus:ring-green-500/20"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-green-500/10 hover:shadow-green-500/25 transition-all duration-200"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-red-500/15 border border-red-500/30 text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="signupName" className="text-slate-300">Full Name</Label>
                <div className="relative">
                  <Award className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signupName"
                    type="text"
                    placeholder="Dr. John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="pl-10 bg-slate-950/40 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-green-500 focus:ring-green-500/20"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupEmail" className="text-slate-300">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signupEmail"
                    type="email"
                    placeholder="doctor@cul.edu.ng"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="pl-10 bg-slate-950/40 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-green-500 focus:ring-green-500/20"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupUsername" className="text-slate-300">Desired Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signupUsername"
                    type="text"
                    placeholder="e.g. drjohndoe"
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    className="pl-10 bg-slate-950/40 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-green-500 focus:ring-green-500/20"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signupPassword" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="signupPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-950/40 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-green-500 focus:ring-green-500/20"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4 pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-6 rounded-xl shadow-lg shadow-green-500/10 hover:shadow-green-500/25 transition-all duration-200"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register & Sign Up"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  )
}
