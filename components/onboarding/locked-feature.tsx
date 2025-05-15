import React from 'react';
import Image from 'next/image';

const LockedFeature = () => {
  return (
    <div className="flex items-center gap-2">
      <Image
        src={'/lock.svg'}
        alt="lock"
        width={15}
        height={15}
      />
      <div className="relative cursor-pointer group">
        <p className="text-sm text-gray-500">
          Locked
        </p>
        <div className="absolute z-10 top-full mt-2 hidden w-max bg-black text-white text-xs rounded py-1 
        px-2 group-hover:block after:content-[''] after:absolute after:top-0 after:left-1/2 
        after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-black 
        before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 
        before:border-4 before:border-transparent before:border-b-black">
          Add advanced scheduling tools with Growth!
        </div>
      </div>
    </div>
  );
};

export default LockedFeature;