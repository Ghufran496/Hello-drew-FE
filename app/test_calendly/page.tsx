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

interface Interval {
  from: string;
  to: string;
}

interface AvailableSlot {
  wday: string;
  intervals: Interval[];
}

export default function TestCalendly() {
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
              const calendlyIntegration = userIntegrations.find((integration: { platformName: string }) => integration.platformName === 'calendly')
              if (calendlyIntegration) {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/calendly/login?userId=${userId}`)
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
      // Fetch integration to get token
      const integrationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (integrationResponse.ok) {
        const { userIntegrations } = await integrationResponse.json()
        const calendlyIntegration = userIntegrations.find((integration: { platformName: string }) => integration.platformName === 'calendly')

        if (calendlyIntegration && calendlyIntegration.credentials) {
          const token = calendlyIntegration.credentials.token

          const response = await fetch(
            `/api/onboarding/calendly/fetch-appointments?userId=${userId}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (response.ok) {
            const data = await response.json();
            const appointmentsData = data.appointments.collection.map((appointment: {
              uri: string;
              name: string;
              start_time: string;
              end_time: string;
              event_memberships: { user_email: string }[];
              location: { join_url: string };
              status: string;
            }) => ({
              id: appointment.uri,
              title: appointment.name,
              startTime: appointment.start_time,
              endTime: appointment.end_time,
              attendees: appointment.event_memberships.map((member: { user_email: string }) => ({
                email: member.user_email,
                status: 'confirmed'
              })),
              location: appointment.location.join_url,
              status: appointment.status
            }));
            setAppointments(appointmentsData);
          } else {
            console.error('Failed to fetch appointments');
          }
        } else {
          console.error('Calendly integration or token not found');
        }
      } else {
        console.error('Failed to fetch integration');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/calendly/available-slots/?userId=${userId}`)
      if (response.ok) {
        const availableSlotsData = await response.json()
        const slots = availableSlotsData.collection[0].rules.map((rule: { wday: string }) => {
          const intervals = []
          for (let hour = 9; hour < 17; hour++) {
            intervals.push({
              from: `${hour}:00`,
              to: `${hour + 1}:00`
            })
          }
          return {
            wday: rule.wday,
            intervals
          }
        })
        setAvailableSlots(slots)
        console.log('Available Slots:', slots)
      } else {
        console.error('Failed to fetch available slots')
      }
    } catch (error) {
      console.error('Fetch available slots error:', error)
    }
  }

  const bookSlot = async(slot: Interval) => {
    console.log('Booking slot:', slot)
    if (userId) {
      try {
        const eventDetails = {
          summary: 'Booked Slot',
          start: {
            dateTime: slot.from,
            timeZone: 'UTC'
          },
          end: {
            dateTime: slot.to,
            timeZone: 'UTC'
          }
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/calendly/book-slot`, {
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
                              {appointment.location ? (
                                <a 
                                  href={appointment.location} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Join Meet
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
                  <div className="mt-4 h-[500px] overflow-y-scroll">
                    <h3>Available Slots:</h3>
                    <div className="overflow-x-auto mt-4">
                      <table className="w-full table-auto border-collapse border-2 border-gray-300">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 border">Day</th>
                            <th className="px-4 py-2 border">From</th>
                            <th className="px-4 py-2 border">To</th>
                            <th className="px-4 py-2 border">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availableSlots.map((rule, index) => (
                            rule.intervals.map((interval, idx) => (
                              <tr key={`${index}-${idx}`} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{rule.wday}</td>
                                <td className="border px-4 py-2">{interval.from}</td>
                                <td className="border px-4 py-2">{interval.to}</td>
                                <td className="border px-4 py-2">
                                  <Button onClick={() => bookSlot(interval)}>
                                    Book Slot
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p>You are not synced yet</p>
                <Button onClick={handleSyncClick}>
                  Sync Calendly
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