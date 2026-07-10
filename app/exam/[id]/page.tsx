import React from "react";
import { ExamClient } from "./_components/ExamClient";

type ExamRoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExamRoomPage({ params }: ExamRoomPageProps) {
  const { id } = await params;
  return <ExamClient examId={id} />;
}
