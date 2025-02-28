import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <Card className="backdrop-blur-xl bg-background/80 border-primary/20 shadow-2xl">
          <CardContent className="pt-6 space-y-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
              className="text-center space-y-2"
            >
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                AnyShare
              </h1>
              <p className="text-muted-foreground">
                Share files up to 10GB with industry-grade security
              </p>
            </motion.div>
            <FileUpload />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}