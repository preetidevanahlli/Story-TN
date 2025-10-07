import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import VoiceUploadSection from "./VoiceUploadSection";
export default async function ProfilePage() {
  const session = await getServerSession();
  const userId = (session as any)?.user?.id;
  if (!userId) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const prompts = await prisma.prompt.findMany({
    where: { userId },
    include: { purchases: true },
    orderBy: { createdAt: "desc" },
  });

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "User";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span>Back to Dashboard</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI Merge
            </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>
                {(fullName || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{fullName}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Prompts</CardTitle>
            <CardDescription>
              Open a prompt to purchase or view generated content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {prompts.length === 0 && (
              <div className="text-muted-foreground">No prompts yet.</div>
            )}
            {prompts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border rounded p-3"
              >
                <div>
                  <div className="font-medium">
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Purchases: {p.purchases.map((x) => x.product).join(", ") || "None"}
                  </div>
                </div>
                <Link href={`/prompt/${p.id}`}>
                  <Button variant="outline">Open</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      {/* Voice upload section as a client component */}
      <VoiceUploadSection />
    </div>
  );
}