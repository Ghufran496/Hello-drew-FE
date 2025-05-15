"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { signIn, useSession } from "next-auth/react"
import { Icons } from '@/components/icons'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
function GoogleSignin() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      setIsLoading(true);
      // Fetch user data and store in localStorage
      fetch(`/api/user?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(userData => {
          localStorage.setItem('user_onboarding', JSON.stringify(userData));
          if (userData.is_active) {
            router.push('/coming-soon');
          } else if (userData.id) {
            // User exists but not active, redirect to plans
            router.push('/welcome/plans');
          } else {
            // New user, start onboarding
            router.push('/welcome');
          }
        })
        .catch(err => {
          console.error('Error fetching user data:', err);
          setIsLoading(false);
        });
    }
  }, [session, router]);

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    signIn("google");
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full [&_svg]:size-5 h-12 font-medium text-lg relative"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.google />
      )}
      {isLoading ? "Please wait..." : "Sign in with Google for Faster Setup"}
    </Button>
  )
}

export default GoogleSignin