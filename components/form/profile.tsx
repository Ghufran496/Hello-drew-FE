import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PhoneInput } from "../phone-input"
import { LanguageSelect } from "../language-input"
import Image from "next/image"
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
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Loader2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query";

interface UserData {
  id: number;
  name: string;
  email: string;
  phone: string;
  image: string;
  drew_voice_accent: {
    personal_drew_id: string;
  };
  language: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  image: string;
  language: string;
}

export function ProfileForm() {
  const { data: userData, setData: setUserData, isLoading } = useLocalStorage<UserData>('user_onboarding');
  const [selectedLanguage, setSelectedLanguage] = React.useState(userData?.language || "en");
  
  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      image: "",
      language: "",
    },
  });

  React.useEffect(() => {
    if (!isLoading && userData) {
      form.reset({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        image: userData.image || "",
        language: userData.language || "",
      });
      setSelectedLanguage(userData.language || "en");
    }
  }, [userData, isLoading, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!userData?.id) {
        throw new Error('User ID is required');
      }

      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          updateData: {
            ...data,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      return response.json();
    },
    onSuccess: (result, variables) => {
      if (userData) {
        setUserData({
          ...userData,
          name: variables.name,
          email: variables.email,
          phone: variables.phone,
          image: variables.image,
          language: variables.language,
        });
      }
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile");
      console.error('Error updating profile:', error);
    }
  });

  const onSubmit = (data: FormData) => {
    updateProfileMutation.mutate(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4 border rounded-lg  bg-white h-[100vh] md:h-auto">
      <div className="flex items-center justify-between p-2 border-b border-[#DFE1E6]  ">
        <div className="flex flex-col justify-start items-start">
          <h2 className="text-xl font-semibold">User Profile</h2>
          <p className="text-[#667287]">Update your personal profile</p>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          className={`font-semibold bg-primary text-white px-6 ${updateProfileMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`} 
          disabled={updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save
        </Button>
      </div>

      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem className="flex justify-between items-center gap-4">
                  <FormLabel className="text-[#667287]">Your Photo</FormLabel>
                  <div className="flex w-[80%] justify-start items-center gap-2 border-b py-3">
                    <Image src={value || "/placeholder.svg"} alt='avatar' width={50} height={50} className="rounded-full" />
                    <FormControl>
                      <div>
                        <input
                          type="file"
                          id="upload"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                onChange(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          {...field}
                          className="hidden"
                        />
                        <label
                          htmlFor="upload"
                          className="inline-block cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-black shadow-sm transition hover:bg-gray-100"
                        >
                          Upload Image
                        </label>
                      </div>
                    </FormControl>
                    <p className='text-[#667287]'>JPG or PNG 1MB, max</p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex justify-between items-center gap-4">
                  <FormLabel className="w-[20%] text-[#667287]">Full Name</FormLabel>
                  <FormControl>
                    <div className="w-[85%] border-b py-3">
                      <Input type="text" placeholder="Enter your name" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex justify-between items-center gap-4">
                  <FormLabel className="w-[20%] text-[#667287]">Email</FormLabel>
                  <FormControl>
                    <div className="w-[85%] border-b py-3">
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex justify-between items-center gap-4">
                  <FormLabel className="w-[20%] text-[#667287]">Phone Number</FormLabel>
                  <FormControl>
                    <div className="w-[85%] border-b py-3">
                      <PhoneInput defaultCountry="US" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={() => (
                <FormItem className="flex justify-between items-center gap-4">
                  <FormLabel className="w-[20%] text-[#667287]">Default Language</FormLabel>
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
          </form>
        </Form>
      </div>
    </div>
  )
}
