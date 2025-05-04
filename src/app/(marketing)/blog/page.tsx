"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

const posts = [
  {
    title: "How to Protect Your Brand from Social Media Crises",
    excerpt: "Learn the essential steps to monitor, detect, and respond to online threats before they escalate.",
    date: "2024-06-01",
    slug: "protect-your-brand"
  },
  {
    title: "AI-Powered Sentiment Analysis: The Future of Reputation Management",
    excerpt: "Discover how AI is transforming the way brands track and understand public sentiment.",
    date: "2024-05-20",
    slug: "ai-sentiment-analysis"
  },
  {
    title: "Competitor Tracking: Stay Ahead in the Reputation Game",
    excerpt: "Why monitoring your competitors is just as important as tracking your own brand.",
    date: "2024-05-10",
    slug: "competitor-tracking"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1b17] to-[#1a2a2f] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-green-300">Blog</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="bg-[#162825] border-0 shadow-xl flex flex-col h-full">
                <CardContent className="py-8 px-6 flex flex-col flex-1">
                  <div className="text-green-400 text-xs mb-2">{new Date(post.date).toLocaleDateString()}</div>
                  <h2 className="text-xl font-bold mb-2 text-green-200">{post.title}</h2>
                  <p className="text-green-100 mb-4 flex-1">{post.excerpt}</p>
                  <Button asChild variant="outline" className="mt-auto w-full">
                    <Link href={`/blog/${post.slug}`}>Read More</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
