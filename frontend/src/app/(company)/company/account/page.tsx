"use client";

import { CompanyProfile } from "@/components/CompanyProfile";
import { useData } from "@/lib/store";

export default function Account() {
  const { company } = useData();
  return <CompanyProfile company={company!} own />;
}
