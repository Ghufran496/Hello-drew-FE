'use client';
import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getAgents } from '@/services/agents/agents.services';
import useDebounce from '@/hooks/useDebounce';
import { getVoices } from '@/services/retail-ai/retailai.services';
import { UserData, Voice } from '@/interfaces/agents/agents.interface';
import Wavesurfer from './wavesurfer';
import DeleteAgent from './delete-agent';

export function AgentsTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedCoaSearchTerm = useDebounce(searchTerm, 300);

  // Get user ID from local storage
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');

  // Infinite Query for fetching agents
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: agentRefetch,
  } = useInfiniteQuery({
    queryKey: ['agents', debouncedCoaSearchTerm],
    queryFn: ({ pageParam = 0 }) =>
      getAgents({
        skip: pageParam,
        take: 10,
        userId: userData?.id,
        searchTerm: debouncedCoaSearchTerm,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.skip + lastPage.pagination.take <
      lastPage.pagination.total
        ? lastPage.pagination.skip + lastPage.pagination.take
        : undefined,
    enabled: !!userData?.id,
  });

  // Flatten paginated data
  const agents = data?.pages.flatMap((page) => page.agents) || [];

  const { data: voices } = useQuery({
    queryKey: ['retail-ai-voices'],
    queryFn: () => getVoices(),
    select: (voices) => {
      return voices;
    },
  });

  return (
    <div className="md:p-4 lg:w-full w-[100vw] h-[100vh] overflow-hidden">
      {/* Search & Create Button */}
      <div className="flex lg:flex-row flex-col gap-2 items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            className="pl-10 w-[380px]"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={() => router.push('/agents/create-agent')}
          className="font-semibold bg-primary text-white h-12 rounded-full"
        >
          Create New Agent <Plus className="ml-2 !w-4 !h-4" />
        </Button>
      </div>

      {/* Agents Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Voice</TableHead>
              <TableHead>Tone</TableHead>
              <TableHead>System Prompt</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Loading State */}
            {!data ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading agents...
                </TableCell>
              </TableRow>
            ) : agents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-4 text-gray-500"
                >
                  No agents found.
                </TableCell>
              </TableRow>
            ) : (
              agents?.map((agent) => (
                <TableRow key={agent?.id} className="h-20 hover:bg-gray-50">
                  <TableCell>{agent?.name}</TableCell>
                  <TableCell className="w-[240px]">
                    <Wavesurfer
                      audioUrl={
                        voices?.find(
                          (voice: Voice) => voice?.voice_id === agent?.voiceId
                        )?.preview_audio_url || ''
                      }
                    />
                  </TableCell>
                  <TableCell className="min-w-[220px]">{agent?.tone}</TableCell>
                  <TableCell className="min-w-[220px]">
                    {agent?.prompt}
                  </TableCell>
                  <TableCell className="space-y-1">
                    <DeleteAgent
                      agentId={agent?.id?.toString()}
                      refetch={agentRefetch}
                    />
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full w-[100px] ml-1"
                      disabled
                    >
                      Duplicate
                    </Button> */}
                    <Button
                      size="sm"
                      className="bg-primary text-white rounded-full w-[100px] ml-1"
                      onClick={() =>
                        router.push(`/agents/edit-agent?id=${agent?.id}`)
                      }
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading more...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
