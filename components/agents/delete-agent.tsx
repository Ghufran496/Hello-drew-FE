import React from 'react';
import { Button } from '../ui/button';
import { useMutation } from '@tanstack/react-query';
import { deleteAgent } from '@/services/agents/agents.services';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserData } from '@/interfaces/agents/agents.interface';

function DeleteAgent({
  agentId,
  refetch,
}: {
  agentId: string;
  refetch: () => void;
}) {
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');

  const { mutate, isPending } = useMutation({
    mutationFn: ({ agentId }: { agentId: string }) =>
      deleteAgent({ userId: userData?.id, agentId }),
    onSuccess: () => {
      toast.success('Agent deleted successfully!');
      refetch();
    },
    onError: () => {
      toast.error('Failed to delete an agent!');
    },
  });

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-red-500  text-red-500 hover:text-red-500 rounded-full w-[100px] ml-1"
      disabled={isPending}
      onClick={() => mutate({ agentId })}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </Button>
  );
}

export default DeleteAgent;
