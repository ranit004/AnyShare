import { Card, CardContent } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Footer from "@/components/footer";
import FeatureCard from "@/components/feature-card";
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Secure Sharing",
    description: "Advanced encryption ensures your files remain private and secure.",
    icon: "shield" as const,
  },
  {
    title: "Lightning Fast",
    description: "Upload and share files instantly with optimized chunk transfer.",
    icon: "zap" as const,
  },
  {
    title: "Reliable Storage",
    description: "Your files are safely stored with redundant backups.",
    icon: "lock" as const,
  },
];

const steps = [
  {
    title: "Upload File",
    description: "Drag & drop or select your file to begin.",
  },
  {
    title: "Get Share Link",
    description: "Receive an instant secure sharing link.",
  },
  {
    title: "Share Securely",
    description: "Share the link with anyone you choose.",
  },
];

export default function Home() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="min-h-screen flex flex-col">
      <div ref={ref} className="flex-1 relative">
        {/* Hero Section */}
        <div className="relative z-10 flex items-center justify-center min-h-[80vh] p-4">
          <motion.div 
            className="absolute inset-0 -z-10"
            style={{ y: backgroundY }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--primary)_0%,_transparent_35%)] opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--primary)_0%,_transparent_35%)] opacity-20" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-2xl"
          >
            <Card className="backdrop-blur-xl bg-background/80 border-primary/20 shadow-2xl hover:shadow-primary/20 hover:shadow-2xl transition-all duration-300">
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
                  <motion.h1 
                    className="text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    AnyShare
                  </motion.h1>
                  <motion.p 
                    className="text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Share files up to 10GB with industry-grade security
                  </motion.p>
                </motion.div>
                <FileUpload />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="py-12 px-4 backdrop-blur-sm bg-background/50">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Why Choose AnyShare?
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              How It Works
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">{index + 1}</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-[5.5rem] right-0">
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        transition={{ delay: index * 0.2 + 0.3, duration: 0.5 }}
                        viewport={{ once: true }}
                      >
                        <ArrowRight className="w-6 h-6 text-primary/40" />
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}