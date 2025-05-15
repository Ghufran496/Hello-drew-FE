'use client'
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react'

function TestFollowupBoss() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  )
}

function Content() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const [message, setMessage] = useState<string | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null)
  const [isSynced, setIsSynced] = useState<boolean | null>(null)
  const [apiKey, setApiKey] = useState('')
  interface Lead {
    id: string;
    name: string;
    emails: { value: string }[];
    phones: { value: string }[];
    stage: string;
  }

  const [leads, setLeads] = useState<Lead[]>([])
  interface Task {
    id: string;
    name: string;
    type: string;
    AssignedTo: string;
    dueDate: string | null;
  }

  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    const checkUserRegistrationAndIntegration = async () => {
      if (userId) {
        try {
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/user/fetchUser`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
          });

          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (!userData.user) {
              setMessage('Register yourself first');
              setIsRegistered(false);
              return;
            } else {
              setIsRegistered(true);
            }

            const integrationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/integrations`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ userId }),
            });

            if (integrationResponse.ok) {
              const { userIntegrations } = await integrationResponse.json();
              const followUpBossIntegration = userIntegrations.find((integration: { platformName: string }) => integration.platformName === 'followUpBoss');
              if (followUpBossIntegration) {
                setMessage('Already synced');
                setIsSynced(true);
                setApiKey(followUpBossIntegration.credentials.apiKey);
              } else {
                setIsSynced(false);
              }
            } else {
              console.error('Failed to check user integration');
              setIsSynced(false);
            }
          } else {
            setMessage('Register yourself first');
            setIsRegistered(false);
            console.error('Failed to fetch user');
          }
        } catch (error) {
          console.error('Error checking user registration and integration:', error);
          setIsRegistered(false);
          setIsSynced(false);
        }
      } else {
        setIsRegistered(false);
        setIsSynced(false);
      }
    };

    checkUserRegistrationAndIntegration();
  }, [userId]);

  const fetchLeads = async (userId: string, apiKey: string) => {
    try {
      console.log('apiKey', apiKey, 'userId', userId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/crm/followupboss/fetch-leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, apiKey })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Leads fetched successfully:', data);
        setLeads(data.leads.people);
      } else {
        console.error('Failed to fetch leads:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  }

  const fetchTasks = async (userId: string, apiKey: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/crm/followupboss/fetch-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, apiKey })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Tasks fetched successfully:', data);
        setTasks(data.tasks.tasks);
      } else {
        console.error('Failed to fetch tasks:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching tasks from Follow Up Boss:', error);
    }
  }

  if (!userId) {
    return <div className='flex flex-col items-center justify-center h-screen'>No user ID provided</div>
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      {isRegistered === false ? (
        <div>{message}</div>
      ) : isSynced === true ? (
        <div>{message}</div>
      ) : (
        <>
          <h1>Test FollowupBoss</h1>
          <div className='flex flex-col items-center justify-center'>
            <input
              type="text"
              placeholder="Enter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded"
            />
            <Button onClick={() => saveCredentials(userId, apiKey)}>Save Credentials</Button>
          </div>
        </>
      )}
      {isSynced && (
        <>
          <Button onClick={() => fetchLeads(userId, apiKey)}>Fetch Leads</Button>
          <Button onClick={() => fetchTasks(userId, apiKey)}>Fetch Tasks</Button>
        </>
      )}
      {leads.length > 0 && (
        <table className="table-auto mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Stage</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="border px-4 py-2">{lead.id}</td>
                <td className="border px-4 py-2">{lead.name}</td>
                <td className="border px-4 py-2">{lead.emails.length > 0 ? lead.emails[0].value : 'N/A'}</td>
                <td className="border px-4 py-2">{lead.phones.length > 0 ? lead.phones[0].value : 'N/A'}</td>
                <td className="border px-4 py-2">{lead.stage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {tasks.length > 0 && (
        <table className="table-auto mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Assigned To</th>
              <th className="px-4 py-2">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="border px-4 py-2">{task.id}</td>
                <td className="border px-4 py-2">{task.name}</td>
                <td className="border px-4 py-2">{task.type}</td>
                <td className="border px-4 py-2">{task.AssignedTo}</td>
                <td className="border px-4 py-2">{task.dueDate ? task.dueDate : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}



async function saveCredentials(userId: string, apiKey: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/crm/followupboss/save-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        apiKey: apiKey
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Credentials saved successfully:', data);
    } else {
      console.error('Failed to save credentials:', response.statusText);
    }
  } catch (error) {
    console.error('Error saving credentials:', error);
  }
}

export default TestFollowupBoss
