import { motion } from "framer-motion";
import { Shield, Zap, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: "shield" | "zap" | "lock";
  iconColor?: string;
};

const icons = {
  shield: Shield,
  zap: Zap,
  lock: Lock,
};

export default function FeatureCard({ 
  title, 
  description, 
  icon,
  iconColor = "#ffffff" 
}: FeatureCardProps) {
  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="h-full"
    >
      <Card className="h-full min-h-[200px] flex flex-col justify-between overflow-hidden backdrop-blur-sm bg-background/80 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 rounded-xl">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="p-3 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <Icon className="w-8 h-8" color={iconColor} strokeWidth={2.5} />
          </motion.div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
