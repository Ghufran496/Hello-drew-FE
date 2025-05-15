import React from "react";
import type { Metadata } from "next";
import { WelcomeWrapper } from "@/components/welcome-wrapper";

export const metadata: Metadata = {
  title: "Welcome to HelloDrew",
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WelcomeWrapper>{children}</WelcomeWrapper>;
}
