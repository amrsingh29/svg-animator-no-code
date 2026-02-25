import FlowWorkspace from "@/components/FlowWorkspace";
import LandingPage from "@/components/LandingPage";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main>
      {session ? <FlowWorkspace /> : <LandingPage />}
    </main>
  );
}
