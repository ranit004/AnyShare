import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6 space-y-6">
          <h1 className="text-4xl font-bold text-black text-center animate-pulse">
            AnyShare
          </h1>
          <p className="text-black text-center">
            Anonymously share files up to 10GB
          </p>
          <FileUpload />
        </CardContent>
      </Card>
    </div>
  );
}