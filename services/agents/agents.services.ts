import { FormData } from '@/interfaces/agents/agents.interface';
import axios from 'axios';
import { toast } from 'sonner';

const createAgent = async ({
  userId,
  agentData,
}: {
  userId: number | undefined;
  agentData: FormData;
}) => {
  if (!userId) {
    toast.error('User ID is required');
  }

  return axios
    .post(`/api/agents?userId=${userId}`, agentData)
    .then((res: any) => res.data);
};

const getAgents = async ({
  skip = 0,
  take = 10,
  userId,
  searchTerm,
}: {
  skip: number;
  take: number;
  userId: number | undefined;
  searchTerm: string;
}) => {
  if (!userId) {
    toast.error('User ID is required');
  }

  return axios
    .get(
      `/api/agents?skip=${skip}&take=${take}&userId=${userId}&searchTerm=${searchTerm}`
    )
    .then((res: any) => res.data);
};

const getAgentById = async ({
  userId,
  agentId,
}: {
  userId: number | undefined;
  agentId: number | undefined;
}) => {
  if (!agentId) {
    toast.error('AgentId is required');
  }

  if (!userId) {
    toast.error('User ID is required');
  }

  return axios
    .get(`/api/agents/${agentId}?userId=${userId}`)
    .then((res: any) => {
      return res.data;
    });
};

const updateAgent = async ({
  userId,
  agentData,
  agentId,
}: {
  userId: number | undefined;
  agentData: FormData;
  agentId: string | null | undefined;
}) => {
  if (!userId) {
    toast.error('User ID is required');
  }

  if (!agentId) {
    toast.error('Agent ID is required');
  }

  return axios
    .patch(`/api/agents/${agentId}?userId=${userId}}`, agentData)
    .then((res: any) => res.data);
};

const deleteAgent = async ({
  userId,
  agentId,
}: {
  userId: number | undefined;
  agentId: string | null | undefined;
}) => {
  if (!userId) {
    toast.error('User ID is required');
  }

  if (!agentId) {
    toast.error('Agent ID is required');
  }

  return axios
    .delete(`/api/agents/${agentId}?userId=${userId}}`)
    .then((res: any) => res.data);
};

export { createAgent, getAgents, getAgentById, updateAgent, deleteAgent };
