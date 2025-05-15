import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/form/login-form";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center py-24 px-4">
      <section className="flex flex-col items-center w-fit">
        <Link href="/" className="mb-14">
          <Image
            src="/logo-light.svg"
            width={230}
            height={40}
            alt="Hello drew"
          />
        </Link>

        <LoginForm />
      </section>
    </main>
  );
}
