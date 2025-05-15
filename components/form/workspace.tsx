'use client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LanguageSelect } from "../language-input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
  import { useForm } from "react-hook-form";
  import React from "react";
  import { toast } from "sonner";

const workspace = [
  {
    name: "Drew",
    country: "",
    city: 'Los Angeles, CA',
    brokerage: "Charles Schwab is one of the largest brokerage firms in the United States that provides investment and financial services to individuals and institutions.",
  },
]

export function WorkspaceForm() {
  const [selectedLanguage, setSelectedLanguage] = React.useState("en");
 

  const form = useForm({
    defaultValues: {
      name: "",
      city: "",
      brokerage: "",
      expertise: "",
    },
  });



 

  async function onSubmit() {
   
    toast.success("Settings saved successfully");
  }



  return (
    <div className="p-4 border rounded-lg  bg-white h-[80vh]">
      <div className="flex items-center justify-between p-2 border-b border-[#DFE1E6]  ">
        <div className="flex flex-col justify-start items-start">
          <h2 className="text-xl font-semibold">Customize Drew</h2>
        </div>
        <Button type="submit" form="workspaceForm" className="font-semibold bg-primary text-white px-6">Save</Button>
      </div>

      <div>
        {workspace.map((workspace, index) => (
          <div key={index}>
            <Form {...form}>
              <form id="workspaceForm" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-center gap-4">
                      <FormLabel className="w-[20%] text-[#667287]">Change Drew Name</FormLabel>
                      <FormControl>
                        <div className="w-[85%] border-b py-3">
                          <Input type="text" placeholder={workspace.name} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expertise"
                  render={() => (
                    <FormItem className="flex justify-between items-center gap-4">
                      <FormLabel className="w-[20%] text-[#667287]">Area of Expertise</FormLabel>
                      <FormControl>
                        <div className="w-[85%] border-b py-3">
                          <LanguageSelect
                            value={selectedLanguage}
                            onChange={(lang) => setSelectedLanguage(lang)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-center gap-4">
                      <FormLabel className="w-[20%] text-[#667287]">City</FormLabel>
                      <FormControl>
                        <div className="w-[85%] border-b py-3">
                          <Input type="text" placeholder={workspace.city} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="brokerage"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-center gap-4">
                      <FormLabel className="w-[20%] text-[#667287]">Describe your brokerage</FormLabel>
                      <FormControl>
                        <div className="w-[85%] py-3">
                          <Input type="text" placeholder={workspace.brokerage} {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          
        </div>
        ))}
      </div>
    </div>
  )
}
