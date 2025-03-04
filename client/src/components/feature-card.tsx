import { motion } from "framer-motion";
import { Shield, Zap, Lock } from "lucide-react";

const THEME = {
  darkBlue: "#0a192f",
  deeperBlue: "#061429",
  accentBlue: "#3b82f6",
  neonPurple: "#8b5cf6",
  neonPink: "#ec4899",
};

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
      className="h-full"
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div 
        className="h-full min-h-[250px] p-6 rounded-xl bg-blue-900/20 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 shadow-glow-sm"
        style={{
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
        }}
      >
        <div className="flex flex-col items-center text-center space-y-4 h-full">
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg mb-4"
            whileHover={{ rotate: 5 }}
          >
            <Icon 
              className="w-8 h-8 text-white" 
              strokeWidth={2} 
            />
          </motion.div>
          
          <h3 className="text-xl font-semibold text-blue-100">{title}</h3>
          
          <p className="text-sm text-blue-100/70 flex-grow">{description}</p>
          
          <motion.div
            className="flex items-center text-blue-400 text-sm mt-2 group"
            whileHover={{ x: 5 }}
          >
            <span className="mr-1">Learn more</span>
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="group-hover:translate-x-1 transition-transform"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </motion.svg>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}