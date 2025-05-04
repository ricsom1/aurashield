import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const features = [
  {
    icon: "🚨",
    title: "Crisis Detection",
    desc: "Mentions are scored for urgency using sentiment, velocity, and platform impact."
  },
  {
    icon: "📊",
    title: "Competitor Tracking",
    desc: "Track your competitors' mentions and compare sentiment trends in real time."
  },
  {
    icon: "📄",
    title: "Automated PDF Reports",
    desc: "Get beautiful, actionable PDF reports delivered to your inbox automatically."
  },
  {
    icon: "🤖",
    title: "AI-Powered Insights",
    desc: "Leverage AI to surface emerging threats and opportunities before they go viral."
  },
  {
    icon: "🔔",
    title: "Real-Time Alerts",
    desc: "Receive instant alerts via email, Slack, or SMS when a crisis is detected."
  },
  {
    icon: "🔒",
    title: "Privacy First",
    desc: "Your data is encrypted and never sold. AuraShield is built for trust."
  }
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1b17] to-[#1a2a2f] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-green-300">Features</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="bg-[#162825] border-0 shadow-xl hover:scale-[1.03] transition-transform duration-200">
                <CardContent className="py-8 px-6 flex flex-col items-center">
                  <span className="text-4xl mb-4">{f.icon}</span>
                  <h3 className="text-xl font-semibold mb-2 text-green-200">{f.title}</h3>
                  <p className="text-green-100 text-center">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
