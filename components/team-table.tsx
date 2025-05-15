"use client"

import { useState, useEffect } from "react"
import { Search, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
import { MembersChart } from "./member-chart"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useQuery } from "@tanstack/react-query"
import { useLocalStorage } from "@/hooks/useLocalStorage"

interface UserData {
  id: number;
}

type MemberStats = {
  calls: number
  appointments: number
  deals: number
  meetings: number
}

type Member = {
  memberName: string
  avatar: string
  phone: string
  email: string
  status: string
  role: string
  lastActive: string
  stats: MemberStats
}

type Lead = {
  id: string
  name: string
  email: string
  source: string
  createdAt: string
}

const member: Member[] = [
    {
      memberName: "Audrey Fathia",
      avatar: "/logo.png", 
      phone: "+108211543",
      email: "audreyfathia@gmail.com",
      status: "New",
      role: 'Member',
      lastActive: '2h ago',
      stats: {
        calls: 45,
        appointments: 12,
        deals: 8,
        meetings: 15
      }
    },
    {
      memberName: "John Smith",
      avatar: "/logo.png",
      phone: "+108211544", 
      email: "johnsmith@gmail.com",
      status: "Active",
      role: 'Member',
      lastActive: '1h ago',
      stats: {
        calls: 38,
        appointments: 9,
        deals: 5,
        meetings: 11
      }
    },
    {
      memberName: "Sarah Johnson",
      avatar: "/logo.png",
      phone: "+108211545",
      email: "sarah.j@gmail.com", 
      status: "Active",
      role: 'Member',
      lastActive: '30m ago',
      stats: {
        calls: 52,
        appointments: 15,
        deals: 10,
        meetings: 18
      }
    },
    {
      memberName: "Michael Chen",
      avatar: "/logo.png",
      phone: "+108211546",
      email: "mchen@gmail.com",
      status: "New",
      role: 'Member',
      lastActive: '5h ago',
      stats: {
        calls: 41,
        appointments: 11,
        deals: 7,
        meetings: 13
      }
    },
    {
      memberName: "Emma Wilson",
      avatar: "/logo.png",
      phone: "+108211547",
      email: "ewilson@gmail.com",
      status: "Active", 
      role: 'Member',
      lastActive: '1d ago',
      stats: {
        calls: 35,
        appointments: 8,
        deals: 4,
        meetings: 10
      }
    },
    {
      memberName: "James Taylor",
      avatar: "/logo.png",
      phone: "+108211548",
      email: "jtaylor@gmail.com",
      status: "New",
      role: 'Member',
      lastActive: '4h ago',
      stats: {
        calls: 48,
        appointments: 14,
        deals: 9,
        meetings: 16
      }
    },
    {
      memberName: "Lisa Anderson",
      avatar: "/logo.png",
      phone: "+108211549",
      email: "lisa.a@gmail.com",
      status: "Active",
      role: 'Member',
      lastActive: '2d ago',
      stats: {
        calls: 39,
        appointments: 10,
        deals: 6,
        meetings: 12
      }
    },
    {
      memberName: "David Miller",
      avatar: "/logo.png",
      phone: "+108211550",
      email: "dmiller@gmail.com", 
      status: "New",
      role: 'Member',
      lastActive: '6h ago',
      stats: {
        calls: 43,
        appointments: 13,
        deals: 8,
        meetings: 14
      }
    },
    {
      memberName: "Anna Martinez",
      avatar: "/logo.png",
      phone: "+108211551",
      email: "amartinez@gmail.com",
      status: "Active",
      role: 'Member',
      lastActive: '1h ago',
      stats: {
        calls: 37,
        appointments: 9,
        deals: 5,
        meetings: 11
      }
    },
    {
      memberName: "Robert Wilson",
      avatar: "/logo.png",
      phone: "+108211552",
      email: "rwilson@gmail.com",
      status: "New",
      role: 'Member',
      lastActive: '3h ago',
      stats: {
        calls: 46,
        appointments: 12,
        deals: 7,
        meetings: 15
      }
    }
  ]
  
export function TeamTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [showAssignLeads, setShowAssignLeads] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const { data: userData} = useLocalStorage<UserData>('user_onboarding');
  useEffect(() => {
    if (userData) {
      setUserId(userData.id.toString())
    }
  }, [userData])

  // Fetch leads data from API
  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await fetch(`/api/leads?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }
      return response.json()
    },
    enabled: !!userId
  })

  const filteredMembers = member.filter((member) => {
    const memberText = `${member.memberName} ${member.email} ${member.phone}`.toLowerCase();
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    return searchWords.every((word) => memberText.includes(word));
  });

  return (
    <div className="md:p-4 md:w-full w-[100vw] h-[180vh] md:h-auto overflow-hidden">
      <div className="w-full">
        <MembersChart />
      </div>

      <div className="mt-4">
        <div className="flex md:flex-row flex-col gap-2 items-center justify-between mb-6">
          <div className="flex md:flex-row flex-col items-center md:space-x-4">
            <h2 className="text-xl font-semibold">{filteredMembers.length} Member Team</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                className="pl-10 w-[340px]"
                placeholder="Search members by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4 relative left-[120px] md:left-0">
            <Button variant="outline" className="h-12">Role: <ChevronDown /> </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table className="px-12">
            <TableHeader className="text-normal">
              <TableRow>
                <TableHead>Member Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member, index) => (
                <TableRow 
                  key={index} 
                  className="h-20 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    setSelectedMember(member)
                    setShowStats(true)
                  }}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3 mr-10 md:mr-0"> 
                      <Image src={"/logo.svg"} alt={member.memberName} width={32} height={32} className="rounded-full bg-primary" />
                      <span>{member.memberName}</span>
                    </div>
                  </TableCell>

                  <TableCell className="font-medium ">
                    <span>{member.email}</span>
                  </TableCell>

                  <TableCell className="font-medium">
                    <span>{member.phone}</span>
                  </TableCell>
                 
                  <TableCell className="font-medium">
                    <div className="flex">
                      {member.role === "Admin" ? (
                        <Image src='/user.svg' alt="user" width={20} height={20} />
                      ): (
                        <Image src='/toolbox.svg' alt="toolbox" width={20} height={20} />
                      )}
                      <span>{member.role}</span>
                    </div>
                  </TableCell>
                 
                  <TableCell className="font-medium">
                    <span>{member.lastActive}</span>
                  </TableCell>

                  <TableCell className=" ">
                    <div className="flex justify-end items-center gap-2">
                      <Button 
                        variant='outline' 
                        className="border-primary text-primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMember(member)
                          setShowAssignLeads(true)
                        }}
                      >
                        Assign Lead
                      </Button>
                      <Button variant='outline' className="border-red-500 w-full text-red-500">Delete</Button>
                      <Button className="font-semibold bg-primary text-white w-full">Edit</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    No Member Found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedMember?.memberName}&apos;s Statistics</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900">Calls</h3>
              <p className="text-2xl font-bold text-blue-700">{selectedMember?.stats.calls}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900">Appointments</h3>
              <p className="text-2xl font-bold text-green-700">{selectedMember?.stats.appointments}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900">Deals</h3>
              <p className="text-2xl font-bold text-purple-700">{selectedMember?.stats.deals}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-900">Meetings</h3>
              <p className="text-2xl font-bold text-orange-700">{selectedMember?.stats.meetings}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignLeads} onOpenChange={setShowAssignLeads}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Lead to {selectedMember?.memberName}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">Loading leads...</TableCell>
                  </TableRow>
                ) : leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>
                      <Button 
                        onClick={async () => {
                          try {
                            await fetch('/api/leads', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                userId: userId,
                                leadId: lead.id,
                                memberId: selectedMember?.memberName,
                              }),
                            })
                            setShowAssignLeads(false)
                          } catch (error) {
                            console.error('Failed to assign lead:', error)
                          }
                        }}
                        className="bg-primary hover:bg-primary/80 text-white"
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
