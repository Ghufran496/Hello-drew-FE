"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface UserData {
  id: number;
  drew_voice_accent: {
    personal_drew_id: string;
  };
}
export function LeadsFunnel() {
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');
  const userId = userData?.id;
  const [hoveredSection, setHoveredSection] = useState<number | null>(null)
  const [leadData, setLeadData] = useState<{id: number, status: "new" | "contacted" | "qualified" | "closed", user_id: number}[]>([])

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch('/api/analytics/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: userId }),
        });
        const data = await response.json();
        setLeadData(data.leadRecords || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
      }
    };

    fetchLeads();
  }, [userId]);

  const sections = [
    { id: 0, label: "New Leads", value: leadData.filter(lead => lead.status === "new").length },
    { id: 1, label: "Contacted", value: leadData.filter(lead => lead.status === "contacted").length },
    { id: 2, label: "Qualified", value: leadData.filter(lead => lead.status === "qualified").length },
    { id: 3, label: "Closed", value: leadData.filter(lead => lead.status === "closed").length }
  ]

  return (
    <Card className="h-full ">
      <CardHeader>
        <CardTitle className="text-xl">Appointments Scheduled</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full max-w-[600px] mt-6 mx-auto">
          <motion.svg 
            viewBox="-10 0 300 200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <defs>
              <linearGradient id="funnelGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: "#99C6FE", stopOpacity: 1 }} />
                <stop offset="33%" style={{ stopColor: "#66A4FC", stopOpacity: 1 }} />
                <stop offset="66%" style={{ stopColor: "#4087FA", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#0357F8", stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            <motion.g
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.polygon
                points="100,0 200,200 0,200"
                fill="url(#funnelGradient)"
                style={{ opacity: hoveredSection !== null ? 0.7 : 1 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Interactive sections */}
              <path 
                d="M 100,0 L 125,50 L 75,50 Z" 
                fill="transparent"
                stroke="#ffffff"
                strokeWidth="2"
                onMouseEnter={() => setHoveredSection(0)}
                onMouseLeave={() => setHoveredSection(null)}
                style={{ cursor: 'pointer' }}
              />
              <path 
                d="M 75,50 L 125,50 L 150,100 L 50,100 Z" 
                fill="transparent"
                stroke="#ffffff"
                strokeWidth="2"
                onMouseEnter={() => setHoveredSection(1)}
                onMouseLeave={() => setHoveredSection(null)}
                style={{ cursor: 'pointer' }}
              />
              <path 
                d="M 50,100 L 150,100 L 175,150 L 25,150 Z" 
                fill="transparent"
                stroke="#ffffff"
                strokeWidth="2"
                onMouseEnter={() => setHoveredSection(2)}
                onMouseLeave={() => setHoveredSection(null)}
                style={{ cursor: 'pointer' }}
              />
              <path 
                d="M 25,150 L 175,150 L 200,200 L 0,200 Z" 
                fill="transparent"
                stroke="#ffffff"
                strokeWidth="2"
                onMouseEnter={() => setHoveredSection(3)}
                onMouseLeave={() => setHoveredSection(null)}
                style={{ cursor: 'pointer' }}
              />

              {/* Labels and values */}
              <AnimatePresence>
                {sections.map((section, index) => (
                  <motion.g 
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: hoveredSection === null || hoveredSection === index ? 1 : 0.5,
                      x: 0
                    }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <text 
                      x="220" 
                      y={25 + (50 * index)} 
                      fontSize="12" 
                      fill="#667287"
                    >
                      {section.label}
                    </text>
                    <text 
                      x="220" 
                      y={45 + (50 * index)} 
                      fontSize="14" 
                      fontWeight="600" 
                      fill="#0357F8"
                    >
                      {section.value}
                    </text>
                  </motion.g>
                ))}
              </AnimatePresence>
            </motion.g>
          </motion.svg>
        </div>
      </CardContent>
    </Card>
  )
}
