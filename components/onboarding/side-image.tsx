import Image from "next/image";

export const SideImage = () => (
    <div className="hidden lg:block relative">
        <div className="h-[calc(100vh-2rem)] w-full sticky top-4">
            <Image
                src="/welcome.svg"
                alt="HelloDrew Logo"
                width={200}
                height={40}
                className="h-full w-full px-6"
            />
        </div>
    </div>
);
