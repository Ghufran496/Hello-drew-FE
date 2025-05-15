'use client';

import { useState, useEffect, useRef, useCallback } from "react"
import { Download, Plus, Search, Check, Loader2, Trash, MessageSquare, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import Papa from "papaparse";
import { Checkbox } from "@/components/ui/checkbox";

interface UserData {
  id: number;
  drew_voice_accent: {
    personal_drew_id: string;
  };
}

interface LeadEmail {
  type: string;
  value: string;
  status: string;
  isPrimary: number;
}

interface LeadPhone {
  type: string;
  value: string;
  status: string;
  isPrimary: number;
  isLandline: boolean;
  normalized: string;
  isOnboardingNumber: boolean;
}

interface LeadSocialData {
  age: string;
  bio: string;
  name: string;
  title: string;
  gender: string;
  topics: string;
  company: string;
  twitter: string;
  facebook: string;
  lastName: string;
  linkedIn: string;
  location: string;
  firstName: string;
  googlePlus: string;
  googleProfile: string;
}

interface LeadCollaborator {
  id: number;
  name: string;
  role: string;
  assigned: boolean;
}

interface LeadDetails {
  id: number;
  name: string;
  tags?: string[];
  price?: number | null;
  stage: string;
  emails?: LeadEmail[];
  phones?: LeadPhone[];
  source: string;
  claimed: boolean;
  created: string;
  delayed: boolean;
  picture?: {
    small: string;
  };
  stageId: number;
  updated: string;
  dealName?: string;
  lastName: string;
  sourceId: number;
  addresses: [];
  contacted: number;
  dealPrice?: number;
  dealStage?: string;
  firstName: string;
  sourceUrl: string;
  assignedTo?: string;
  createdVia: unknown;
  dealStatus?: string;
  leadFlowId: number | null;
  socialData?: LeadSocialData;
  pondMembers: [];
  teamLeaders: [];
  timeframeId: number;
  lastActivity: string;
  collaborators?: LeadCollaborator[];
  dealCloseDate?: string;
  websiteVisits: number;
  assignedPondId: number | null;
  assignedUserId: number;
  timeframeStatus: string;
  assignedLenderId: number | null;
  timeframeUpdated: string;
  firstToClaimOffer: boolean;
  assignedLenderName: string | null;
}

interface Lead {
  id: number;
  user_id: number;
  external_id?: string;
  source: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  drip_campaign?: string;
  drip_campaign_status?: string;
  lead_details?: LeadDetails;
  created_at?: Date;
  updated_at?: Date;
}

// Form schema
const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  status: z.string(),
  source: z.string(),
  stage: z.string(),
  image: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;


export function LeadsTable() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const { data: userData, isLoading: isUserDataLoading } = useLocalStorage<UserData>('user_onboarding');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [frequency, setFrequency] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can adjust this number
  const [isCallLoading, setIsCallLoading] = useState<boolean>(false);

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      status: "new",
      source: "direct", 
      stage: "prospect",
    },
  });

  const fetchLeads = useCallback(async (): Promise<void> => {
    try {
      if (!userData?.id) {
        return;
      }

      const response = await fetch(`/api/leads?userId=${userData.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }

      const data = await response.json()
      setLeads(data)
      console.log('Fetched leads:', data)
    } catch (err) {
      console.error('Error fetching leads:', err)
      toast.error("Failed to load leads")
    } finally {
      setIsLoading(false)
    }
  }, [userData?.id])

  useEffect(() => {
    if (!isUserDataLoading && userData?.id) {
      fetchLeads()
    }
  }, [isUserDataLoading, userData, fetchLeads])

  const filteredLeads = leads.filter((lead) => {
    const leadText = `${lead.name} ${lead.email} ${lead.phone}`.toLowerCase()
    const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);
    return searchWords.every((word) => leadText.includes(word));
  });

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setSelectedLeads([]); // Clear selections when changing pages
  };
  
  function getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-50 text-blue-600"
      case "contacted":
        return "bg-orange-50 text-orange-600"
      case "qualified":
        return "bg-green-50 text-green-600"
      case "closed":
        return "bg-red-50 text-red-600"
      default:
        return "bg-gray-50 text-gray-600"
    }
  }

  function getPriorityColor(stage: string): string {
    switch (stage?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-600"
      case "medium":
        return "bg-orange-50 text-orange-600"
      case "lead":
        return "bg-green-50 text-green-600"
      default:
        return "bg-gray-50 text-gray-600"
    }
  }

  const onSubmit = async (data: LeadFormValues): Promise<void> => {
    try {
      if (!userData?.id) {
        throw new Error('User ID not found');
      }

      const response = await fetch('/api/leads/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: userData.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create lead');
      }

      await fetchLeads();
      setShowSuccess(true);
      toast.success("Lead created successfully");
      
      setTimeout(() => {
        setShowSuccess(false);
        setIsDialogOpen(false);
        form.reset();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating lead:', error)
      toast.error("Failed to create lead");
    }
  };

  const handleImportClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    setIsImporting(true);
    const file = event.target.files?.[0];
    if (!file || !userData?.id) return;

    Papa.parse(file, {
      header: true,
      complete: async (results: Papa.ParseResult<Lead>) => {
        try {
          const response = await fetch('/api/leads/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              leads: results.data,
              userId: userData.id,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to import leads');
          }

          toast.success('Leads imported successfully');
          await fetchLeads();
        } catch (err) {
          toast.error('Failed to import leads');
          console.error('Import error:', err);
        } finally {
          setIsImporting(false);
        }
      },
      error: (err: Error) => {
        toast.error('Failed to parse CSV file');
        console.error('CSV parse error:', err);
      }
    });

    // Reset file input
    event.target.value = '';
  };

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => {
      if (prev.includes(leadId)) {
        return prev.filter(id => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === currentLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(currentLeads.map(lead => lead.id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedLeads.length} leads?`)) {
      try {
        const response = await fetch('/api/leads/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            leadIds: selectedLeads,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to delete leads');
        }

        toast.success(`${selectedLeads.length} leads deleted`);
        setSelectedLeads([]);
        await fetchLeads();
      } catch (error) {
        console.error("Error deleting leads:", error);
        toast.error("Failed to delete leads");
      }
    }
  };

  const handleSingleCall = async (lead: Lead) => {
    try {
      setIsCallLoading(true);
      const response = await fetch("/api/drip_campaign/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          override_agent_id: "agent_4e19c40e0a8b9a8cb3b8682267",
          to_number: lead.phone,
          operation: "SGL-Outbound-Call",
          lead_name: lead.name,
          lead_id: lead.id.toString(),
          user_id: lead.user_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create single call campaign");
      }

      toast.success("Call campaign created successfully");
    } catch (error) {
      console.error("Error creating call campaign:", error);
      toast.error("Failed to create call campaign");
    } finally {
      setIsCallLoading(false);
    }
  };

  const handleBulkCall = async () => {
    try {
      setIsCallLoading(true);
      const selectedLeadDetails = leads.filter(lead => selectedLeads.includes(lead.id));
      
      for (const lead of selectedLeadDetails) {
        await handleSingleCall(lead);
      }
      
      toast.success(`Calls scheduled for ${selectedLeads.length} leads`);
    } catch (error) {
      console.error("Error scheduling bulk calls:", error);
      toast.error("Failed to schedule some calls");
    } finally {
      setIsCallLoading(false);
    }
  };

  const createDripCampaign = async (lead: Lead) => {
    if (!frequency) return;
    
    try {
      setIsCallLoading(true);
      const response = await fetch("/api/drip_campaign/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          override_agent_id: "agent_4e19c40e0a8b9a8cb3b8682267",
          to_number: lead.phone,
          operation: frequency + "-Outbound-Call",
          lead_name: lead.name,
          lead_id: lead.id.toString(),
          user_id: lead.user_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create drip campaign");
      }

      setIsSuccess(true);
      toast.success("Drip campaign created successfully");
      setTimeout(() => {
        setIsSuccess(false);
        setDialogOpen(false);
        setFrequency("");
      }, 1500);
    } catch (error) {
      console.error("Error creating drip campaign:", error);
      toast.error("Failed to create drip campaign");
    } finally {
      setIsCallLoading(false);
    }
  };

  return (
    <div className="md:p-4 lg:w-full md:w-full w-[100vw] h-[100vh] overflow-hidden">
      <div className="flex lg:flex-row flex-col gap-2 items-center justify-between mb-6">
        <div className="flex md:flex-row flex-col items-center md:space-x-4">
          <h2 className="text-xl font-semibold">{filteredLeads.length} Leads</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              className="pl-10 w-[380px]"
              placeholder="Search leads by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {selectedLeads.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                // onClick={handleBulkSMS}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send SMS
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBulkCall}
                disabled={isCallLoading}
              >
                {isCallLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Phone className="w-4 h-4 mr-2" />
                )}
                Single Call
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(true)}
              >
                Configure Drip Campaign
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button 
            variant="outline" 
            className="font-semibold h-12"
            onClick={handleImportClick}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                Import Leads
                <Download className="ml-2" />
              </>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="font-semibold bg-primary text-white h-12">
                Add New Lead <Plus className="ml-2 !w-4 !h-4" />
              </Button>
            </DialogTrigger>
          </Dialog> 
        </div>
      </div>

      <div className="border rounded-lg">
        <Table className="px-12">
          <TableHeader className="text-normal">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedLeads.length === currentLeads.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || isUserDataLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : currentLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              currentLeads.map((lead) => (
                <TableRow 
                  key={lead.id} 
                  className="h-20 hover:bg-gray-50" 
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={() => handleSelectLead(lead.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell className="font-medium cursor-pointer" onClick={() => router.push(`/leads/${lead.id}`)}>
                    <div className="flex items-center space-x-3">
                      <Image 
                        src={lead.lead_details?.picture?.small || "/logo.svg"} 
                        alt={lead.name} 
                        width={32} 
                        height={32} 
                        className="rounded-full object-cover bg-primary"
                        unoptimized={true}
                      />
                      <span>{lead.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => router.push(`/leads/${lead.id}`)}>
                    <div className="flex flex-col">
                      <span>{lead.phone}</span>
                      <span className="text-gray-500">{lead.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => router.push(`/leads/${lead.id}`)}>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(lead.status)}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => router.push(`/leads/${lead.id}`)}>
                    <div className="flex items-center space-x-2">
                      <Image src="/lofty.png" className="rounded-[2px]" alt={lead.source} width={20} height={20} unoptimized={true} />
                      <span>{lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => router.push(`/leads/${lead.id}`)}>
                    <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(lead.lead_details?.stage || 'low')}`}>
                      {lead.lead_details?.stage?.toUpperCase() === 'Lead' ? 'Low' : (lead.lead_details?.stage || 'Low')}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[300px] cursor-pointer" onClick={() => router.push(`/leads/${lead.id}`)}>
                    <p className="truncate">{'No recent activity'}</p>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filteredLeads.length > 0 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLeads.length)} of {filteredLeads.length} leads
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-lg font-medium text-gray-900">Lead Created Successfully!</p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="direct">Direct</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                          <SelectItem value="zillow">Zillow</SelectItem>
                          <SelectItem value="realtor">Realtor.com</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="prospect">Prospect</SelectItem>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="opportunity">Opportunity</SelectItem>
                          <SelectItem value="customer">Customer</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Lead"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configure Drip Campaign</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Campaign created successfully!
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Campaign Frequency</p>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DLY">Daily Call</SelectItem>
                      <SelectItem value="WKLY">Weekly Call</SelectItem>
                      <SelectItem value="MTHLY">Monthly Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 mt-4"
                  disabled={!frequency || isCallLoading}
                  onClick={() => {
                    const selectedLeadDetails = leads.filter(lead => 
                      selectedLeads.includes(lead.id)
                    );
                    selectedLeadDetails.forEach(lead => createDripCampaign(lead));
                  }}
                >
                  {isCallLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    ""
                  )}
                  Start Campaign
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
