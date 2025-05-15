import axios from 'axios';
import { toast } from 'sonner';

const getCallDetailById = async ({
  userId,
  callId,
}: {
  userId: number | undefined;
  callId: number | undefined;
}) => {
  if (!callId) {
    toast.error('callId is required');
  }

  if (!userId) {
    toast.error('User ID is required');
  }

  return axios
    .get(`/api/call-details/${callId}?userId=${userId}`)
    .then((res: any) => {
      return res.data;
    });
};

export { getCallDetailById };
