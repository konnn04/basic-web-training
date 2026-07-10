import React from "react";
import { loadCodePracticeSets } from "@/lib/code-practice/load-sets";
import { LabClient } from "../_components/lab/LabClient";

export default async function CssLabPage() {
  const sets = await loadCodePracticeSets("css");
  return <LabClient mode="css" sets={sets} pageTitle="Thực hành CSS" />;
}
