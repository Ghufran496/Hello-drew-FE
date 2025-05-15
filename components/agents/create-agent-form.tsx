'use client';
import React, { useEffect, useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createAgent } from '@/services/agents/agents.services';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  FormData,
  UserData,
  Voice,
} from '@/interfaces/agents/agents.interface';
import { useRouter } from 'next/navigation';
import Wavesurfer from './wavesurfer';
import { getVoices } from '@/services/retail-ai/retailai.services';

function CreateAgentForm() {
  const router = useRouter();
  const [singleVoice, setSingleVoice] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      createAgent({ agentData: data, userId: userData?.id }),
    onSuccess: () => {
      toast.success('Agent created successfully!');
      router.push('/agents');
    },
    onError: () => {
      toast.error('Failed to create agent');
    },
  });

  // Form schema
  const leadFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    welcomeMessage: z.string(),
    prompt: z.string(),
    tone: z.string(),
    voice: z.string(),
  });

  type LeadFormValues = z.infer<typeof leadFormSchema>;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: '',
      welcomeMessage: '',
      prompt: '',
      tone: '',
      voice: '',
    },
  });

  const { data: voices, isLoading } = useQuery({
    queryKey: ['retail-ai-voices'],
    queryFn: () => getVoices(),
    select: (voices) => {
      return voices;
    },
    staleTime: Infinity,
  });

  const onSubmit = async (data: FormData): Promise<void> => {
    mutate(data);
  };

  //filter the single voice from selected voice
  useEffect(() => {
    if (voices) {
      const filteredVoice =
        voices?.find((voice: Voice) => voice.voice_id === singleVoice) || null;
      setAudioUrl(filteredVoice?.preview_audio_url);
    }
  }, [singleVoice, voices]);

  const handleAddVariable = () => {
    if (!inputValue?.trim()) return;
    form?.setValue(
      'prompt',
      `${form?.getValues('prompt') || ''} {${inputValue?.trim()}}`
    );
    setInputValue('');
  };

  return (
    <div>
      {/* Header wavesurfer */}
      <div className="min-h-[100px] flex justify-end items-center w-full p-4 rounded-[8px] bg-white border border-[#E6ECEF]">
        <Wavesurfer audioUrl={audioUrl || ''} />
      </div>
      {/* Agent Form */}
      <div className="h-full w-full p-4 rounded-[8px] bg-white border border-[#E6ECEF] mt-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              disabled={isPending}
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
              name="welcomeMessage"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Welcome Message</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="AI Initates: AI begins with a dynamic begin message"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tone"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tone</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Professional – Clear, concise, and business-oriented. Ideal for corporate settings">
                        Professional – Clear, concise, and business-oriented.
                        Ideal for corporate settings.
                      </SelectItem>
                      <SelectItem value="Sales-Driven – Persuasive, engaging, and goal-oriented to drive conversions">
                        Sales-Driven – Persuasive, engaging, and goal-oriented
                        to drive conversions.
                      </SelectItem>
                      <SelectItem value="Friendly & Conversational – Warm, approachable, and casual to build rapport">
                        Friendly & Conversational – Warm, approachable, and
                        casual to build rapport.
                      </SelectItem>
                      <SelectItem value="Supportive & Empathetic – Understanding and reassuring, great for customer support">
                        Supportive & Empathetic – Understanding and reassuring,
                        great for customer support.
                      </SelectItem>
                      <SelectItem value="Energetic & Enthusiastic – High-energy and motivating, perfect for exciting offers">
                        Energetic & Enthusiastic – High-energy and motivating,
                        perfect for exciting offers.
                      </SelectItem>
                      <SelectItem value="Direct & No-Nonsense – Efficient and straight to the point, minimizing fluff">
                        Direct & No-Nonsense – Efficient and straight to the
                        point, minimizing fluff.
                      </SelectItem>
                      <SelectItem value="Humorous & Playful – Lighthearted and fun, making interactions enjoyable">
                        Humorous & Playful – Lighthearted and fun, making
                        interactions enjoyable.
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voice"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice</FormLabel>
                  <Select
                    onValueChange={(value: string) => {
                      field.onChange(value); // Update the form field value
                      setSingleVoice(value);
                    }}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {voices?.map((voice: Voice) => (
                        <SelectItem
                          key={voice?.voice_id}
                          value={voice?.voice_id}
                        >
                          {voice?.voice_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <hr />

            <FormField
              control={form.control}
              name="prompt"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Prompt</FormLabel>
                    <div className="flex items-center">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Add variable"
                        className="h-8 w-[150px] rounded-md rounded-r-none "
                      />
                      <Button
                        onClick={handleAddVariable}
                        type="button"
                        className="h-8 rounded-md rounded-l-none"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <FormControl>
                    <Textarea placeholder="Prompt here" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isPending}
              >
                {form.formState.isSubmitting || isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Agent'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default CreateAgentForm;
