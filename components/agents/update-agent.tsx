'use client';
import Image from 'next/image';
import React from 'react';
import AgentSidebar from './agents-sidebar';
import { useRouter } from 'next/navigation';
import UpdateAgentForm from './update-agent-form';
import { Suspense } from 'react';

function UpdateAgent() {
  const router = useRouter();

  return (
    <div className="lg:w-full md:w-full w-[100vw] h-[100vh]">
      <div className="flex justify-between items-center bg-white w-full min-h-[92px] px-6">
        <div className="cursor-pointer" onClick={() => router.back()}>
          <Image
            src="/arrow-left.svg"
            alt="arrow-left"
            width={32}
            height={32}
          />
        </div>
        <div className="cursor-pointer">
          <Image src="/info.svg" alt="info" width={24} height={24} />
        </div>
      </div>
      <div className="md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 bg-[#171B1A] text-white p-4 rounded-[8px]">
            <AgentSidebar />
          </div>
          <div className="md:col-span-3 rounded-[8px]">
            <Suspense fallback={<p>Loading...</p>}>
              <UpdateAgentForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpdateAgent;
