import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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



const password = [
  {
    oldPassword: "Test",
  },
]



export function PasswordForm() {


  const form = useForm({
    defaultValues: {
      title: "",
      date: new Date(),
      time: new Date(),
      participants: "",
      platform: "",
      agenda: "",
    },
  });

  async function onSubmit() {
    toast.success("Schedule added successfully");
  }


  return (
    <div className="p-4 border rounded-lg  bg-white h-[80vh]">
      <div className="flex items-center justify-between p-2 border-b border-[#DFE1E6]  ">
        <div className="flex flex-col justify-start items-start">
          <h2 className="text-xl font-semibold">Password Management</h2>
        </div>
        <Button className="font-semibold bg-primary text-white px-6">Save</Button>
      </div>


      <div>
        {password.map((password, index) => (
          <div key={index}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col  gap-4 mt-4">


                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-center gap-4">
                      <FormLabel className="w-[20%] text-[#667287]">Old Password</FormLabel>
                      <FormControl >
                        <div className="w-[85%] border-b py-3">
                          <Input type="text" placeholder={password.oldPassword} {...field} />
                        </div>

                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="flex justify-between items-center gap-4">
                      <FormLabel className="w-[20%] text-[#667287]">New Password</FormLabel>
                      <FormControl >
                        <div className="w-[85%] ">
                          <Input type="text" placeholder="Enter Your New Password...." {...field} />
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
