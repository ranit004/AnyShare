import { motion } from "framer-motion";
import { Shield, Zap, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: "shield" | "zap" | "lock";
  iconColor?: string; // Added optional iconColor prop
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
  iconColor = "#ffffff" // Default to bright white if not provided
}: FeatureCardProps) {
  const Icon = icons[icon];
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <Card className="overflow-hidden backdrop-blur-sm bg-background/80 border-primary/20 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 rounded-xl">
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={`p-3 rounded-2xl bg-primary/10 ${
              theme === "dark" ? "shadow-[0px_0px_12px_#ffffff]" : "" // Changed to white glow
            }`}
          >
            {/* Updated to use iconColor and enhanced glow effect */}
            <Icon
              className={`w-8 h-8 ${
                theme === "dark" ? "drop-shadow-[0px_0px_10px_#ffffff]" : ""
              }`}
              color={iconColor} // Use the iconColor prop directly
              strokeWidth={2.5} // Slightly thicker lines for more visibility
            />
          </motion.div>
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}