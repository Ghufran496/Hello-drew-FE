'use client'
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react'

function SalesforceTest() {
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
  const [contacts, setContacts] = useState<Contact[]>([])

  interface Contact {
    Id: string;
    Name: string;
    Email: string;
    attributes: {
      type: string;
      url: string;
    };
  }

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
              const salesforceIntegration = userIntegrations.find((integration: { platformName: string }) => integration.platformName === 'salesforce');
              if (salesforceIntegration) {
                setMessage('Already synced');
                setIsSynced(true);
                setAccessToken(salesforceIntegration.credentials.accessToken);
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

  const fetchContacts = async (userId: string, accessToken: string) => {
    try {
      console.log('accessToken', accessToken, 'userId', userId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/crm/salesforce/fetch-contacts?userId=${userId}`, {
        method: 'GET',  
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Contacts fetched successfully:', data);
        setContacts(data.contacts);
      } else {
        console.error('Failed to fetch contacts:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }

  const handleSalesforceAuth = () => {
    const authUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/onboarding/crm/salesforce/login?userId=${userId}`;
    window.location.href = authUrl;
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
          <h1>Test Salesforce</h1>
          <div className='flex flex-col items-center justify-center'>
            <Button onClick={handleSalesforceAuth}>Authenticate with Salesforce</Button>
          </div>
        </>
      )}
      {isSynced && (
        <>
          <Button onClick={() => fetchContacts(userId, accessToken)}>Fetch Contacts</Button>
        </>
      )}
      {contacts.length > 0 && (
        <table className="table-auto mt-4">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.Id}>
                <td className="border px-4 py-2">{contact.Id}</td>
                <td className="border px-4 py-2">{contact.Name}</td>
                <td className="border px-4 py-2">{contact.Email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default SalesforceTest
