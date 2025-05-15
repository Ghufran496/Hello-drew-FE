'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface Attendee {
  email: string;
  status: string;
}

interface Appointment {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: Attendee[];
  description?: string;
  location?: string;
  meetLink?: string;
  status: string;
}

interface AvailableSlot {
  start: string;
  end: string;
}

export default function TestGoogleCalendar() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  )
}

function Content() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isSynced, setIsSynced] = useState<boolean | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])

  useEffect(() => {
    const checkUserAndIntegrationStatus = async () => {
      if (userId) {
        try {
          // Check if user is registered using fetchUser API
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/fetchUser`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          })

          if (userResponse.ok) {
            const userData = await userResponse.json()
            if (!userData.user) {
              setMessage('Register yourself first')
              setIsSynced(false)
              return
            }
            setIsRegistered(true)

            // Check integration status
            const integrationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId }),
            })

            if (integrationResponse.ok) {
              console.log('Integration response:', integrationResponse)
              const { userIntegrations } = await integrationResponse.json()
              const googleCalendarIntegration = userIntegrations.find((integration: { platformName: string }) => integration.platformName === 'google_calendar')
              if (googleCalendarIntegration) {
                setIsSynced(true)
               
              } else {
                setIsSynced(false)
              }
            } else {
              console.error('Failed to check user integration')
              setIsSynced(false) // Set to false if the check fails
            }
          } else {
            setMessage('Register yourself first') // Show message if user is not found
            setIsSynced(false)
            console.error('Failed to fetch user')
          }
        } catch (error) {
          console.error('Error checking user and integration status:', error)
          setIsSynced(false) // Set to false if an error occurs
        }
      } else {
        setIsSynced(false) // Set to false if no userId is found
      }
    }

    checkUserAndIntegrationStatus()
  }, [userId])

  const handleSyncClick = async () => {
    if (userId) {
      try {
        // Generate auth URL
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/google_calendar/login?userId=${userId}`)
        if (response.ok) {
          const { url } = await response.json()
          setAuthUrl(url)
        } else {
          console.error('Failed to generate auth URL')
        }
      } catch (error) {
        console.error('Error:', error)
      }
    } else {
      console.error('User ID not found')
    }
  }

  const fetchAppointments = async () => {
    try {
        const response = await fetch(
            `/api/onboarding/google_calendar/fetch-appointments?userId=${userId}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            setAppointments(data.appointments);
        } else {
            console.error('Failed to fetch appointments');
        }
    } catch (error) {
        console.error('Error:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/google_calendar/available-slots/?userId=${userId}&date=2025-01-09`)
      if (response.ok) {
        const availableSlotsData = await response.json()
        setAvailableSlots(availableSlotsData.availableSlots)
        console.log('Available Slots:', availableSlotsData)
      } else {
        console.error('Failed to fetch available slots')
      }
    } catch (error) {
      console.error('Fetch available slots error:', error)
    }
  }

  const bookSlot = async(slot: AvailableSlot) => {
    console.log('Booking slot:', slot)
    if (userId) {
      try {
        const eventDetails = {
          summary: 'Booked Slot',
          start: {
            dateTime: slot.start,
            timeZone: 'UTC'
          },
          end: {
            dateTime: slot.end,
            timeZone: 'UTC'
          }
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/google_calendar/book-slot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ leadId: 22, eventDetails })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Slot booked successfully:', data);
          // Optionally, you can update the state or UI to reflect the booked slot
        } else {
          console.error('Failed to book slot');
        }
      } catch (error) {
        console.error('Error booking slot:', error);
      }
    } else {
      console.error('User ID not found');
    }
  }
  

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
        {userId && isRegistered ? (
          <>
            {isSynced === null ? (
              <p>Loading...</p>
            ) : isSynced ? (
              <>
                <p>You are already synced</p>
                <Button onClick={fetchAppointments}>
                  Fetch Appointments
                </Button>
                <Button onClick={fetchAvailableSlots}>
                  Fetch Available Slots
                </Button>
                {appointments.length > 0 && (
                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full table-auto border-collapse">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 border">Title</th>
                          <th className="px-4 py-2 border">Start Time</th>
                          <th className="px-4 py-2 border">End Time</th>
                          <th className="px-4 py-2 border">Attendees</th>
                          <th className="px-4 py-2 border">Status</th>
                          <th className="px-4 py-2 border">Location/Meet Link</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{appointment.title}</td>
                            <td className="border px-4 py-2">
                              {new Date(appointment.startTime).toLocaleString()}
                            </td>
                            <td className="border px-4 py-2">
                              {new Date(appointment.endTime).toLocaleString()}
                            </td>
                            <td className="border px-4 py-2">
                              {appointment.attendees.map(attendee => (
                                <div key={attendee.email}>
                                  {attendee.email} ({attendee.status})
                                </div>
                              ))}
                            </td>
                            <td className="border px-4 py-2">{appointment.status}</td>
                            <td className="border px-4 py-2">
                              {appointment.location || appointment.meetLink ? (
                                <a 
                                  href={appointment.meetLink || '#'} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {appointment.location || 'Join Meet'}
                                </a>
                              ) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {availableSlots.length > 0 && (
                  <div className="mt-4">
                    <h3>Available Slots:</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {availableSlots.map((slot, index) => (
                        <Button key={index} onClick={() => bookSlot(slot)}>
                          {new Date(slot.start).toLocaleString()} - {new Date(slot.end).toLocaleString()}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p>You are not synced yet</p>
                <Button onClick={handleSyncClick}>
                  Sync Google Calendar
                </Button>
              </>
            )}
            <p>User ID: {userId}</p>
          </>
        ) : (
          <p>User ID not found</p>
        )}
        
        {authUrl && (
          <a href={authUrl} target="_blank" rel="noopener noreferrer">
            <Button>
              Authorize
            </Button>
          </a>
        )}
        
        {message && <p>{message}</p>}
    </div>
  )
}
