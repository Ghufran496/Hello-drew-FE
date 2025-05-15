"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, VideoIcon, Calendar, Video, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import Image from "next/image"
import { format, addDays, startOfWeek, isSameDay, parseISO, isPast } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Appointment {
  id: number
  userId: number
  appointmentTime: string
  status: string
  participantDetails: {
    lead: {
      id: number
      name: string
      picture?: string
    }
    duration: number
    description?: string
    meetingUrl?: string
  }
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8) // 8 AM to 6 PM
const DAYS = ["MON", "TUE", "WED", "THU", "FRI"]

function AppointmentBlock({ appointment }: { appointment: Appointment }) {
  const duration = appointment.participantDetails.duration || 60 // default 60 minutes
  const isPastAppointment = isPast(parseISO(appointment.appointmentTime))

  const getStatusStyles = () => {
    if (isPastAppointment) {
      return "bg-gray-200 border border-gray-300"
    }
    switch (appointment.status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-200 border border-blue-300 shadow-sm"
      case "confirmed":
        return "bg-green-200 border border-green-300 shadow-sm"
      case "pending":
        return "bg-yellow-200 border border-yellow-300 shadow-sm"
      default:
        return "bg-purple-200 border border-purple-300 shadow-sm"
    }
  }

  const handleJoinMeeting = () => {
    if (appointment.participantDetails.meetingUrl) {
      window.open(appointment.participantDetails.meetingUrl, '_blank')
    }
  }

  const handleReschedule = () => {
    // Add reschedule logic here
    console.log("Reschedule meeting:", appointment.id)
  }

  return (
    <div
      className={cn(
        "absolute w-full z-10 rounded-md p-2.5 mb-1 transition-all hover:shadow-md",
        getStatusStyles()
      )}
      style={{
        height: `${(duration / 60) * 96}px`, // 1 hour = 96px
        opacity: isPastAppointment ? 0.75 : 1,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2.5">
          <div className="relative ">
            <Image
              src={appointment.participantDetails.lead.picture || "/logo.svg"}
              alt={appointment.participantDetails.lead.name}
              width={28}
              height={28}
              className="rounded-full bg-primary border-2 border-white shadow-sm"
            />
            <div className={cn(
              "absolute -bottom-1 -right-1 w-3 h-3  rounded-full border-2 border-white",
              isPastAppointment ? "bg-gray-500" :
              appointment.status.toLowerCase() === "scheduled" ? "bg-blue-600" :
              appointment.status.toLowerCase() === "confirmed" ? "bg-green-600" :
              "bg-yellow-600"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-gray-900">
              {appointment.participantDetails.lead.name}
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-1.5 mt-0.5">
              <VideoIcon className="w-3 h-3" /> Virtual Meeting
            </p>
            <p className="text-xs font-medium text-gray-700 mt-0.5">
              {format(parseISO(appointment.appointmentTime), "HH:mm")}
            </p>
            {appointment.participantDetails.description && (
              <p className="text-xs text-gray-500 truncate mt-1.5 italic">
                {appointment.participantDetails.description}
              </p>
            )}
          </div>
        </div>

        {!isPastAppointment && (
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleJoinMeeting}>
                <Video className="mr-2 h-4 w-4" />
                Join Meeting
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReschedule}>
                <Calendar className="mr-2 h-4 w-4" />
                Reschedule
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}

export function AppointmentsTable() {
  const [mounted, setMounted] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: userData } = useLocalStorage<{ id: number }>("user_onboarding")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!userData?.id) return

    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/analytics/appointments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userData.id,
          }),
        })
        const data = await response.json()
        setAppointments(data.appointmentRecords || [])
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }

    fetchAppointments()
  }, [userData?.id])

  if (!mounted) return null

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    setCurrentDate(newDate)
  }

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })

  const getAppointmentsForDay = (dayIndex: number) => {
    const day = addDays(weekStart, dayIndex)
    return appointments.filter((appointment) => {
      const appointmentDate = parseISO(appointment.appointmentTime)
      return isSameDay(appointmentDate, day)
    })
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          
        </div>

        <div className="flex items-center space-x-2">
          <Select defaultValue="today">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="week">
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-1 h-full">
        {/* Main Calendar */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-5 border-b">
            {DAYS.map((day, i) => {
              const date = addDays(weekStart, i)
              return (
                <div key={day} className="p-4 text-center border-r last:border-r-0">
                  <div className="text-sm text-gray-500">{day}</div>
                  <div className="text-xl font-semibold">{format(date, "d")}</div>
                </div>
              )
            })}
          </div>

          <div className="relative grid grid-cols-5">
            {/* Time Labels */}
            <div className="absolute -left-16 top-0 w-16 space-y-[5.75rem] pt-4">
              {HOURS.map((hour) => (
                <div key={hour} className="text-sm text-gray-500">
                  {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {Array.from({ length: 5 }).map((_, dayIndex) => {
              const dayAppointments = getAppointmentsForDay(dayIndex)
              return (
                <div key={dayIndex} className="border-r last:border-r-0">
                  {HOURS.map((hour) => (
                    <div key={hour} className={cn("h-24 border-b p-1 relative bg-gray-50", hour === 17 && "border-b-0")}>
                      {dayAppointments.map((appointment) => {
                        const appointmentHour = parseISO(appointment.appointmentTime).getHours()
                        const appointmentMinute = parseISO(appointment.appointmentTime).getMinutes()
                        if (appointmentHour === hour) {
                          return (
                            <div
                              key={appointment.id}
                              style={{
                                top: `${(appointmentMinute / 60) * 100}%`,
                                position: "absolute",
                                width: "100%",
                                left: 0,
                              }}
                            >
                              <AppointmentBlock appointment={appointment} />
                            </div>
                          )
                        }
                        return null
                      })}
                      <div className="absolute top-0 left-0 w-full text-xs text-gray-400 pointer-events-none flex justify-between px-2">
                        <span>{hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</span>
                        <span>Available</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
