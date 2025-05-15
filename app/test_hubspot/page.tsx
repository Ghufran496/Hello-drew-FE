'use client'
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react'

function HubspotTest() {
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
  const [accessToken, setAccessToken] = useState('')
  const [deals, setDeals] = useState<DealStage[]>([])
  const [engagements, setEngagements] = useState<Engagement[]>([])
  interface Contact {
    id: string;
    properties: {
      firstname: string;
      lastname: string;
      email: string;
      phone: string;
    };
  }

  interface DealStage {
    stageId: string;
    label: string;
    displayOrder: number;
    metadata: {
      isClosed: boolean;
      probability: number;
    };
  }

  interface Engagement {
    engagement: {
      id: string;
      type: string;
      createdAt: string;
      lastUpdated: string;
      createdBy: string;
    };
    metadata: {
      body?: string;
      durationMilliseconds?: number;
    };
  }

  const [contacts, setContacts] = useState<Contact[]>([])

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
              const hubspotIntegration = userIntegrations.find((integration: { platformName: string }) => integration.platformName === 'hubspot');
              if (hubspotIntegration) {
                setMessage('Already synced');
                setIsSynced(true);
                setAccessToken(hubspotIntegration.credentials.accessToken);
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

  const fetchDeals = async (userId: string, accessToken: string) => {
    try {
      console.log('accessToken', accessToken, 'userId', userId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/crm/hubspot/fetch-deals`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Deals fetched successfully:', data);
        setDeals(data.results[0].stages);
      } else {
        console.error('Failed to fetch deals:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  }

  const fetchEngagements = async (userId: string, accessToken: string) => {
    try {
      console.log('accessToken', accessToken, 'userId', userId);
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/crm/hubspot/fetch-engagements`, {         
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Engagements fetched successfully:', data);
        setEngagements(data.results);
      } else {
        console.error('Failed to fetch engagements:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching engagements:', error);
    }
  } 

  const fetchContacts = async (userId: string, accessToken: string) => {
    try {
      console.log('accessToken', accessToken, 'userId', userId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/crm/hubspot/fetch-contacts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Contacts fetched successfully:', data);
        setContacts(data.results);
      } else {
        console.error('Failed to fetch contacts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
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
          <h1>Test Hubspot</h1>
          <div className='flex flex-col items-center justify-center'>
            <input
              type="text"
              placeholder="Enter Access Token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded"
            />
            <Button onClick={() => saveCredentials(userId, accessToken)}>Save Credentials</Button>
          </div>
        </>
      )}
      {isSynced && (
        <>
          <Button onClick={() => fetchContacts(userId, accessToken)}>Fetch Contacts</Button>
          <Button onClick={() => fetchDeals(userId, accessToken)}>Fetch Deals</Button>
          <Button onClick={() => fetchEngagements(userId, accessToken)}>Fetch Engagements</Button>
        </>
      )}
      {contacts.length > 0 && (
        <table className="table-auto mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">First Name</th>
              <th className="px-4 py-2">Last Name</th>
              <th className="px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td className="border px-4 py-2">{contact.id}</td>
                <td className="border px-4 py-2">{contact.properties.firstname}</td>
                <td className="border px-4 py-2">{contact.properties.lastname}</td>
                <td className="border px-4 py-2">{contact.properties.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {deals.length > 0 && (
        <table className="table-auto mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">Label</th>
              <th className="px-4 py-2">Display Order</th>
              <th className="px-4 py-2">Is Closed</th>
              <th className="px-4 py-2">Probability</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr key={deal.stageId}>
                <td className="border px-4 py-2">{deal.label}</td>
                <td className="border px-4 py-2">{deal.displayOrder}</td>
                <td className="border px-4 py-2">{deal.metadata.isClosed}</td>
                <td className="border px-4 py-2">{deal.metadata.probability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {engagements.length > 0 && (
        <table className="table-auto mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Created At</th>
              <th className="px-4 py-2">Last Updated</th>
              <th className="px-4 py-2">Created By</th>
              <th className="px-4 py-2">Body</th>
            </tr>
          </thead>
          <tbody>
            {engagements.map((engagement) => (
              <tr key={engagement.engagement.id}>
                <td className="border px-4 py-2">{engagement.engagement.id}</td>
                <td className="border px-4 py-2">{engagement.engagement.type}</td>
                <td className="border px-4 py-2">{new Date(engagement.engagement.createdAt).toLocaleString()}</td>
                <td className="border px-4 py-2">{new Date(engagement.engagement.lastUpdated).toLocaleString()}</td>
                <td className="border px-4 py-2">{engagement.engagement.createdBy}</td>
                <td className="border px-4 py-2">{engagement.metadata.body || engagement.metadata.durationMilliseconds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

async function saveCredentials(userId: string, accessToken: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/crm/hubspot/save-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: userId,
        accessToken: accessToken
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

export default HubspotTest
