import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserData } from '@/interfaces/agents/agents.interface';
import { getCallDetailById } from '@/services/call-details/calldetails.services';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogOverlay,
  DialogTitle,
} from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';

interface CommunicationDrawerProps {
  selectedCommId: number;
  open: boolean;
  onClose: () => void;
}

export default function CommunicationDrawer({
  selectedCommId,
  open,
  onClose,
}: CommunicationDrawerProps) {
  // Get user ID from local storage
  const { data: userData } = useLocalStorage<UserData>('user_onboarding');

  // useQuery for fetching call details
  const { data } = useQuery({
    queryKey: ['agentById', selectedCommId],
    queryFn: () =>
      getCallDetailById({
        userId: userData?.id,
        callId: Number(selectedCommId),
      }),
    select: (response) => {
      return response.agent;
    },
    enabled: !!userData?.id && !!selectedCommId,
  });

  console.log('data', data);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      {/* Background Overlay (Mask) */}
      <DialogOverlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />

      <DialogContent className="fixed inset-y-0 right-0 w-[450px] bg-white shadow-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-xl font-semibold">
            Communication Details
          </DialogTitle>
          <DialogClose className="text-gray-500 hover:text-gray-700 cursor-pointer">
            ✖
          </DialogClose>
        </div>
        <p>Selected ID: {selectedCommId}</p>
        {/* Add more details as needed */}
      </DialogContent>
    </Dialog>
  );
}
