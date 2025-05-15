'use client';

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Plus, Loader2, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"
import { useFieldArray, useForm } from "react-hook-form";
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

import { useLocalStorage } from "@/hooks/useLocalStorage";

interface UserData {
    id: number;
    drew_voice_accent: {
        personal_drew_id: string;
    };
}

const calls = [
    {
        callsMade: "0",
        callAnswered: '0',
        callsMissed: '0',
        // callDuration: {
        //     hours: '0',
        //     minute: '0',
        //     seconds: '0'
        // },
        // conversionRates: '0'
    },

]


const contracts = [
    {
        contractName: "Contract of Sale Residential",
        deadline: {
            month: "January 09,  2024",
            time: "10:00 AM - 11:00 AM",
        },
        avatar: "https://v0.dev/placeholder.svg",
        name: "Audrey Fathia",
        status: "approved",
        dateUpload: {
            month: "January 09,  2024",
            time: "10:00 AM - 11:00 AM",
        },
    },
    {
        contractName: "Contract of employment agreement",
        deadline: {
            month: "January 09,  2024",
            time: "10:00 AM - 11:00 AM",
        },
        avatar: "https://v0.dev/placeholder.svg",
        name: "Audrey Fathia",
        status: "pending",
        dateUpload: {
            month: "January 09,  2024",
            time: "10:00 AM - 11:00 AM",
        },
    },
    {
        contractName: "Contract of employment agreement",
        deadline: {
            month: "January 09,  2024",
            time: "10:00 AM - 11:00 AM",
        },
        avatar: "https://v0.dev/placeholder.svg",
        name: "Audrey Fathia",
        status: "missed",
        dateUpload: {
            month: "January 09,  2024",
            time: "10:00 AM - 11:00 AM",
        },
    },
];


function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
        case "approved":
            return "bg-green-50 text-green-600";
        case "pending":
            return "bg-orange-50 text-orange-600";
        case "missed":
            return "bg-red-50 text-red-600";
        default:
            return "bg-gray-50 text-gray-600";
    }
}

export function ContractData() {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    const { data: userData } = useLocalStorage<UserData>('user_onboarding');

    const contractFormSchema = z.object({
        contractName: z.string().min(2, "Name must be at least 2 characters"),
        file: z
            .any()
            .refine(
                (file) => file instanceof FileList && file.length > 0, 
                "File is required"
            )
            .refine(
                (file) => file instanceof FileList && file[0]?.type === "application/pdf",
                "Only PDF files are allowed"
            )
            .refine(
                (file) => file instanceof FileList && file[0]?.size <= 10485760,
                "File size must be less than 10MB"
            ),
        recipients: z.array(
            z.object({
                email: z.string().email("Invalid email address"),
                name: z.string().min(2, "Name must be at least 2 characters"),
            })
        ).min(1, "At least one recipient is required"),
    });

    type ContractFormValues = z.infer<typeof contractFormSchema>;

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractFormSchema),
        defaultValues: {
            contractName: "",
            file: undefined,
            recipients: [{ email: "", name: "" }],
        },
    });

    const filteredContracts = contracts.filter((contract) => {
        const contractText = `${contract.contractName} ${contract.name} ${contract.status}`
            .toLowerCase();
        const searchWords = searchTerm.toLowerCase().trim().split(/\s+/);

        return searchWords.every((word) => contractText.includes(word));
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "recipients",
    });

    const onSubmit = async (data: ContractFormValues): Promise<void> => {
        try {
            if (!userData?.id) {
                throw new Error('User not authenticated.');
            }

            console.log(data, 'Data')

            const formData = new FormData();
            if (data.file && data.file.length > 0) {
                formData.append('file', data.file[0]);
            }
            formData.append('contractName', data.contractName);
            formData.append('userId', userData?.id.toString());
            formData.append('recipients', JSON.stringify(data.recipients));

            const response = await fetch('/api/docusign/upload', {
                method: 'POST',
                body: formData, 
            });
            
            console.log(response, 'RESPONSE')

            if (!response.ok) {
                throw new Error('Failed to create lead');
            }


            setShowSuccess(true);
            toast.success("Contract Create successfully");
            setTimeout(() => {
                setShowSuccess(false);
                setIsDialogOpen(false);
                form.reset();
            }, 1500);

            const initiateResponse = await fetch('/api/docusign/initiate', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ userId: userData?.id.toString() })
            });

            if (initiateResponse.ok) {
                const { redirectUrl } = await initiateResponse.json();
                window.location.href = redirectUrl;
            } else {
                const initiateError = await initiateResponse.json()
                toast.error("Failed to initiate DocuSign signing.", initiateError)
            }

        } catch (error) {
            console.error('Error uploading contract:', error);
            toast.error("Failed to upload contract");
        }
    };

    return (
        <div className="md:p-4 w-full ">
            <div >
                <CardContent className="md:p-6">
                    <Tabs defaultValue="calls" className="w-full">
                        <TabsContent value="calls" className="gap-4 pb-8">
                            {calls.map((call, index) => (
                                <div key={index}>
                                    <div className="flex-col md:flex-row flex justify-center items-center gap-2 mb-2">
                                        <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg w-full">
                                            <div className="flex justify-between items-center ">
                                                <div className="flex flex-col gap-2 justify-start items-start">
                                                    <Image src="/pending-signature.svg" alt={call.callsMade} width={40} height={40} />
                                                    <p>Pending Signature </p>
                                                </div>
                                                <span className="text-black text-4xl font-semibold">{call.callsMade}</span>
                                            </div>
                                        </div>
                                        <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg  w-full">
                                            <div className="flex justify-between items-center ">
                                                <div className="flex flex-col gap-2 justify-start items-start">
                                                    <Image src="/missing-clause.svg" alt={call.callAnswered} width={40} height={40} />
                                                    <p>Missing Clause</p>
                                                </div>
                                                <span className="text-black text-4xl font-semibold">{call.callsMade}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 py-6 bg-white border border-gray-200 rounded-lg  w-full">
                                            <div className="flex justify-between items-center ">
                                                <div className="flex flex-col gap-2 justify-start items-start">
                                                    <Image src="/signature-approve.svg" alt={call.callsMissed} width={40} height={40} />
                                                    <p>Approve</p>
                                                </div>
                                                <span className="text-black text-4xl font-semibold">{call.callsMade}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                        </TabsContent>
                        <div className="flex lg:flex-row flex-col items-center  justify-center lg:justify-between mb-6">
                            <div className="flex flex-col md:flex-row items-center space-x-4 gap-2 mb-2">
                                <h2 className="text-md md:text-xl font-semibold">{filteredContracts.length} Contracts</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        className="pl-10 w-[380px]"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex  relative left-[100px] md:left-[35%] lg:left-0  items-center space-x-4">
                                <Button variant="outline" className="font-semibold h-12">
                                    Status: All<ChevronDown />
                                </Button>

                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="font-semibold bg-primary text-white h-12">
                                            New Docusign Contract <Plus className="ml-2 !w-4 !h-4" />
                                        </Button>
                                    </DialogTrigger>
                                </Dialog>
                                <Button className="h-12 font-semibold bg-primary text-white">New Custom Contract <Plus /></Button>
                            </div>
                        </div>

                        <div className="border rounded-lg">
                            <Table className="px-12">
                                <TableHeader className="text-normal">
                                    <TableRow>
                                        <TableHead>Contract Name</TableHead>
                                        <TableHead>Deadline</TableHead>
                                        <TableHead>Agent</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date Upload</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredContracts.map((appointment, index) => (
                                        <TableRow
                                            key={index}
                                            className="h-20 cursor-pointer  hover:bg-gray-50 text-xs lg:text-md"
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex items-center space-x-1">
                                                    <p className="truncate">{appointment.contractName}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col ">
                                                    <span>{appointment.deadline.month}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Image src={"/logo.svg"} alt={appointment.name} width={32} height={32} className="rounded-full bg-primary" />
                                                    <span>{appointment.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-4 ml-2 py-1 rounded-full text-sm ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <div className="flex flex-col ">
                                                    <span>{appointment.dateUpload.month}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="gap-2">
                                                <div className="flex justify-start items-start">
                                                    <Button className="h-12 font-semibold bg-primary text-white w-full">Detail</Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredContracts.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                                                No contract found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Tabs>
                </CardContent>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Add New Contract</DialogTitle>
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
                                    name="contractName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contract Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contract of Sale Residential" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="file"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Upload Contract File</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="file"
                                                    accept="application/pdf"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.files)}
                                                    value={undefined}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="mt-1">
                                    <FormLabel className="font-semibold">Recipients</FormLabel>
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex relative justify-between items-center gap-4 mb-4">
                                            <FormField
                                                control={form.control}
                                                name={`recipients.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <FormLabel>Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Recipient Name" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`recipients.${index}.email`}
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="recipient@example.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {index > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    className="absolute top-0 right-0 w-6 h-6"
                                                >
                                                    <X />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex justify-end">
                                        <Button type="button" variant="secondary" onClick={() => append({ email: "", name: "" })}>
                                            Add Recipient
                                        </Button>
                                    </div>
                                </div>

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
                                            "Create Contract"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    )}
                </DialogContent>
            </Dialog>


        </div>
    )
}