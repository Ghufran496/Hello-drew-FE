"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Building2,
  Folders,
  CircleDashed,
  Crosshair,
  Check,
  Loader2,
  Pencil,
  MessageSquare,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLocalStorage } from '@/hooks/useLocalStorage';
interface Lead {
  id: number;
  name: string;
  user_id: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  lead_details: {
    stage: string;
    company?: string;
    picture?: {
      small: string;
    };
  };
  apiKey: string;
}

interface UserData {
  id: number;
  brokerage_name: string;
}

interface CommunicationRecord {
  lead_id: string;
  details: {
    notes: string;
  };
}

export function LeadProfile({ leadId }: { leadId: string }) {
  const [status, setStatus] = useState("New");
  const [stage, setStage] = useState("High");
  const [frequency, setFrequency] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoadingLead, setIsLoadingLead] = useState(true);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [tempEditValue, setTempEditValue] = useState<string>("");
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');
  const userId = userData?.id;
  const brokerageName = userData?.brokerage_name;
  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await fetch(`/api/leads/${leadId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch lead");
        }
        const data = await response.json();
        setLead(data);
        setStatus(data.status || "New");
        setStage(data.lead_details?.stage || "High");
      } catch (error) {
        console.error("Error fetching lead:", error);
      } finally {
        setIsLoadingLead(false);
      }
    };

    if (leadId) {
      fetchLead();
    }
  }, [leadId]);

  const updateField = async (field: string, value: string) => {
    if (!lead) return;

    setUpdating((prev) => ({ ...prev, [field]: true }));
    try {
      const updateData: Record<string, string> = {
        apiKey: lead.apiKey,
      };

      // Handle different field types
      if (field === "company") {
        updateData.company = value;
      } else if (field === "stage") {
        updateData.stage = value;
      } else if (field === "source") {
        updateData.source = value;
      } else {
        updateData[field] = value;
      }

      const response = await fetch(`/api/leads/update/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update lead");
      }

      setLead((prev) => {
        if (!prev) return null;

        if (field === "company") {
          return {
            ...prev,
            lead_details: {
              ...prev.lead_details,
              company: value,
            },
          };
        }

        if (field === "stage") {
          return {
            ...prev,
            lead_details: {
              ...prev.lead_details,
              stage: value,
            },
          };
        }

        return {
          ...prev,
          [field]: value,
        };
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    } finally {
      setUpdating((prev) => ({ ...prev, [field]: false }));
      setIsEditing((prev) => ({ ...prev, [field]: false }));
      setTempEditValue("");
    }
  };

  const handleEdit = (field: string, value: string) => {
    setIsEditing((prev) => ({ ...prev, [field]: true }));
    setTempEditValue(value);
  };

  const renderEditableField = (
    field: string,
    value: string,
    label: string,
    icon: React.ReactNode,
    showInitial?: boolean
  ) => {
    return (
      <div className="flex items-center gap-3">
        {icon}
        <div className="flex items-center">
          {label && <p className="text-sm text-gray-500 w-24">{label}</p>}
          {isEditing[field] ? (
            <div className="flex items-center gap-2">
              <Input
                defaultValue={value}
                onChange={(e) => setTempEditValue(e.target.value)}
                className="h-8 w-48"
                autoFocus
                onBlur={() => {
                  if (tempEditValue && tempEditValue !== value) {
                    updateField(field, tempEditValue);
                  } else {
                    setIsEditing((prev) => ({ ...prev, [field]: false }));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsEditing((prev) => ({ ...prev, [field]: false }));
                    setTempEditValue("");
                  } else if (e.key === "Enter") {
                    if (tempEditValue && tempEditValue !== value) {
                      updateField(field, tempEditValue);
                    } else {
                      setIsEditing((prev) => ({ ...prev, [field]: false }));
                    }
                  }
                }}
              />
              {updating[field] && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              {showInitial ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                    <span className="text-purple-600 text-sm">
                      {value[0] || "C"}
                    </span>
                  </div>
                  <p>{value}</p>
                </div>
              ) : (
                <p>{value}</p>
              )}
              <button
                onClick={() => handleEdit(field, value)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Pencil className="w-4 h-4 text-gray-400" />
              </button>
              {updating[field] && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
          )}
        </div>
      </div>
    );
  };

  const createDripCampaign = async () => {
    console.log(frequency, "frequency")
    if (!frequency) return;
    
    try {
      setLoading(true);

      // Get previous interactions
      const insightsResponse = await fetch(`/api/analytics/drew-lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          type: 'CALL'
        })
      });

      const insights = await insightsResponse.json();
      let isFirstInteraction = false;
      let previousNotes = "";
      insights.communicationRecords.map((record: CommunicationRecord) => {
        if (record.lead_id == leadId) {
          console.log(record, "record")
          isFirstInteraction = !record;
          previousNotes = record?.details?.notes || '';
        }
      });
      console.log(previousNotes)
      const response = await fetch("/api/drip_campaign/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          override_agent_id: "agent_4e19c40e0a8b9a8cb3b8682267",
          to_number: lead?.phone,
          operation: frequency + "-Outbound-Call",
          lead_name: lead?.name,
          lead_id: leadId.toString(),
          user_id: lead?.user_id,
          first_interaction: isFirstInteraction.toString() || "false",
          additional_information: previousNotes || "" ,
          brokerage_name: brokerageName || ""
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create drip campaign");
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDialogOpen(false);
      }, 1500);
    } catch (error) {
      console.error("Error creating drip campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingLead) {
    return (
      <div className="p-6 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return <div className="p-6">Lead not found</div>;
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Image
            src={lead.lead_details?.picture?.small || "/logo.svg"}
            alt={lead.name}
            width={32}
            height={32}
            className="rounded-full object-cover bg-primary"
            unoptimized={true}
          />
          {renderEditableField("name", lead.name, "", null)}
        </div>
        <div className="flex gap-3">
          <Button
            variant="default"
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              setFrequency("SGL");
              createDripCampaign();
            }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            <Phone className="w-4 h-4 mr-2" />
            Send Call
          </Button>
          <Button
            variant="default"
            className="bg-primary hover:bg-primary/90"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send SMS
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90"
              >
                Drip Campaign
              </Button>
            </DialogTrigger>
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
                      disabled={!frequency || loading}
                      onClick={createDripCampaign}
                    >
                      {loading ? (
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
          <Button
            variant="default"
            className="bg-primary hover:bg-primary/90"
          >
            Schedule Follow-Up
          </Button>
          <Button variant="outline" className="border-gray-200">
            Send Email
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          {renderEditableField(
            "email",
            lead.email,
            "Email",
            <Mail className="w-5 h-5 text-gray-400" />
          )}
          {renderEditableField(
            "phone",
            lead.phone,
            "Phone",
            <Phone className="w-5 h-5 text-gray-400" />
          )}
          {renderEditableField(
            "company",
            lead.lead_details?.company || "Code Sphere",
            "Company",
            <Building2 className="w-5 h-5 text-gray-400" />,
            true
          )}
        </div>
        <div className="space-y-4">
          <div className="flex gap-12">
            <div className="flex items-center gap-2">
              <Folders className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-500">Source</p>
            </div>
            {isEditing["source"] ? (
              <div className="flex items-center gap-2">
                <Input
                  defaultValue={lead.source}
                  onChange={(e) => setTempEditValue(e.target.value)}
                  className="h-8 w-48"
                  autoFocus
                  onBlur={() => {
                    if (tempEditValue && tempEditValue !== lead.source) {
                      updateField("source", tempEditValue);
                    } else {
                      setIsEditing((prev) => ({ ...prev, source: false }));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsEditing((prev) => ({ ...prev, source: false }));
                      setTempEditValue("");
                    } else if (e.key === "Enter") {
                      if (tempEditValue && tempEditValue !== lead.source) {
                        updateField("source", tempEditValue);
                      } else {
                        setIsEditing((prev) => ({ ...prev, source: false }));
                      }
                    }
                  }}
                />
                {updating["source"] && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <Image
                  src="/zillow.png"
                  alt={lead.source}
                  width={25}
                  height={25}
                />
                <p>{lead.source}</p>
                <button
                  onClick={() => handleEdit("source", lead.source)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="w-4 h-4 text-gray-400" />
                </button>
                {updating["source"] && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </div>
            )}
          </div>
          <div className="flex gap-12">
            <div className="flex items-center gap-2">
              <CircleDashed className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-500 mb-1">Status</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  updateField("status", value);
                }}
              >
                <SelectTrigger
                  className={` h-8 w-fit border-none focus:ring-0 ${
                    status === "New"
                      ? "bg-blue-50 text-blue-700"
                      : status === "In Progress"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  <SelectValue>
                    <span
                      className={`inline-flex items-center rounded-full text-xs font-medium ${
                        status === "New"
                          ? "text-blue-700"
                          : status === "In Progress"
                          ? "text-yellow-700"
                          : "text-green-700"
                      }`}
                    >
                      {status}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">
                    <span className="inline-flex items-center text-xs font-medium text-blue-700">
                      New
                    </span>
                  </SelectItem>
                  <SelectItem value="In Progress">
                    <span className="inline-flex items-center text-xs font-medium text-yellow-700">
                      In Progress
                    </span>
                  </SelectItem>
                  <SelectItem value="Closed">
                    <span className="inline-flex items-center text-xs font-medium text-green-700">
                      Closed
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {updating["status"] && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
            </div>
          </div>
          <div className="flex gap-12">
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-500 mb-1">Stage</p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={stage}
                onValueChange={(value) => {
                  setStage(value);
                  updateField("stage", value);
                }}
              >
                <SelectTrigger
                  className={`h-8 w-fit border-none focus:ring-0 ${
                    stage === "Hot"
                      ? "bg-red-50 text-red-700"
                      : stage === "Warm"
                      ? "bg-orange-50 text-orange-700" 
                      : stage === "Cold"
                      ? "bg-blue-50 text-blue-700"
                      : stage === "Attempting Contact"
                      ? "bg-purple-50 text-purple-700"
                      : stage === "Nurturing"
                      ? "bg-yellow-50 text-yellow-700"
                      : stage === "Active Lead"
                      ? "bg-green-50 text-green-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <SelectValue>
                    <span
                      className={`inline-flex items-center rounded-full text-xs font-medium ${
                        stage === "Hot"
                          ? "text-red-700"
                          : stage === "Warm"
                          ? "text-orange-700"
                          : stage === "Cold" 
                          ? "text-blue-700"
                          : stage === "Attempting Contact"
                          ? "text-purple-700"
                          : stage === "Nurturing"
                          ? "text-yellow-700"
                          : stage === "Active Lead"
                          ? "text-green-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {stage}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Attempting Contact">
                    <span className="inline-flex items-center text-xs font-medium text-purple-700">
                      Attempting Contact
                    </span>
                  </SelectItem>
                  <SelectItem value="Nurturing">
                    <span className="inline-flex items-center text-xs font-medium text-yellow-700">
                      Nurturing
                    </span>
                  </SelectItem>
                  <SelectItem value="Cold">
                    <span className="inline-flex items-center text-xs font-medium text-blue-700">
                      Cold
                    </span>
                  </SelectItem>
                  <SelectItem value="Warm">
                    <span className="inline-flex items-center text-xs font-medium text-orange-700">
                      Warm
                    </span>
                  </SelectItem>
                  <SelectItem value="Hot">
                    <span className="inline-flex items-center text-xs font-medium text-red-700">
                      Hot
                    </span>
                  </SelectItem>
                  <SelectItem value="Active Lead">
                    <span className="inline-flex items-center text-xs font-medium text-green-700">
                      Active Lead
                    </span>
                  </SelectItem>
                  <SelectItem value="Appointment Set">
                    <span className="inline-flex items-center text-xs font-medium text-emerald-700">
                      Appointment Set
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {updating["stage"] && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
