"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UserData {
  id: number;
  drew_voice_accent: {
    personal_drew_id: string;
  };
}
interface CommunicationRecord {
  id: number
  user_id: number
  drew_id: string
  lead_id: number
  type: string
  status: string
  details: {
    notes: string
    call_id: string
  }
  created_at: string
  updated_at: string
}

export function PostMeetingInsights() {
  const [lastCall, setLastCall] = useState<CommunicationRecord | null>(null)
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');

  useEffect(() => {
    const fetchCommunications = async () => {
      try {
        const userId = userData?.id

        const response = await fetch('/api/analytics/appointments-insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        })

        if (!response.ok) {
          throw new Error('Failed to fetch communications')
        }

        const data = await response.json()
        // Get the most recent communication
        const sortedComms = data.communicationRecords.sort((a: CommunicationRecord, b: CommunicationRecord) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setLastCall(sortedComms[0] || null)
      } catch (error) {
        console.error('Error fetching communications:', error)
      }
    }

    fetchCommunications()
  }, [userData])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CardTitle className="text-xl font-semibold">Post-Meeting Insights</CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          {lastCall ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://v0.dev/placeholder.svg" />
                  <AvatarFallback>CM</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{lastCall.type}</div>
                  <div className="text-sm text-[#667287]">{lastCall.status}</div>
                </div>
                <div className="text-sm text-[#667287] ml-auto">
                  {new Date(lastCall.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="bg-gray-50 p-4 rounded-lg"
              >
                <p className="text-sm text-[#667287] leading-relaxed">
                  {lastCall.details.notes}
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <div className="text-center text-[#667287] py-8">
              No meeting insights available
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
