import React from "react";
import { loadCodePracticeSets } from "@/lib/code-practice/load-sets";
import { LabClient } from "../_components/lab/LabClient";

export default async function JsLabPage() {
  const sets = await loadCodePracticeSets("js");
  return <LabClient mode="js" sets={sets} pageTitle="Thực hành JavaScript" />;
}
