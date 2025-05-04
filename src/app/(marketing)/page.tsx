"use client";
import React, { useState } from "react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    quote: "AuraShield warned me of a Reddit thread before it went viral.",
    author: "@creatorsafe"
  },
  {
    quote: "We saved a 6-figure campaign thanks to AuraShield alerts.",
    author: "@brandmgr"
  },
  {
    quote: "This platform is like Google Alerts on steroids.",
    author: "@riskwatcher"
  }
];

export default function Home() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c1b17] to-[#1a2a2f] flex flex-col">
      {/* Hero Section with animated background */}
      <section className="flex-1 flex items-center justify-center relative overflow-hidden py-16">
        {/* Animated Aura background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-green-500/30 via-green-700/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute left-1/3 top-1/2 w-[400px] h-[400px] bg-green-400/20 rounded-full blur-2xl animate-pulse" />
        </motion.div>
        <Card className="z-10 max-w-2xl w-full mx-auto shadow-2xl border-0 bg-white/5 backdrop-blur-lg">
          <CardContent className="py-12 px-8 flex flex-col items-center">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <ShieldCheck className="w-14 h-14 text-green-400 mb-4 animate-bounce-slow" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-green-100 text-center mb-4"
            >
              The Early Warning System for Your Reputation
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-green-300 text-center mb-8 max-w-xl"
            >
              AuraShield monitors Twitter, Reddit, and news sources in real time to detect brand risks before they go viral.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full justify-center"
            >
              <Button asChild size="lg" className="w-full sm:w-auto text-lg font-semibold shadow-lg">
                <Link href="/register">Get Early Access</Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-green-400 tracking-widest uppercase mb-2">
              Reputation Protection
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-green-100 sm:text-4xl">
              Everything you need to protect your online presence
            </p>
            <p className="mt-6 text-lg leading-8 text-green-300">
              AuraShield provides comprehensive tools to monitor, analyze, and respond to your online reputation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <span className="text-2xl">🚨</span>, title: "Real-Time Crisis Alerts", desc: "Instantly get notified when your brand is mentioned in a risky or viral post."
              },
              {
                icon: <span className="text-2xl">📊</span>, title: "Competitor Intelligence", desc: "See how you're being talked about compared to competitors across platforms."
              },
              {
                icon: <span className="text-2xl">📄</span>, title: "Automated PDF Reports", desc: "Weekly summaries delivered to your inbox with trends, sentiment, and alerts."
              }
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="shadow-lg border-0 bg-[#162825] hover:scale-[1.03] transition-transform duration-200">
                  <CardContent className="py-8 px-6 flex flex-col items-center">
                    <span className="mb-4">{f.icon}</span>
                    <h3 className="text-lg font-semibold mb-2 text-green-200">{f.title}</h3>
                    <p className="text-green-100 text-center">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-10">
        <div className="mx-auto max-w-2xl flex flex-col items-center">
          <h3 className="text-green-300 text-lg font-semibold mb-6">What our users say</h3>
          <div className="relative w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIdx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="bg-[#162825] border border-green-700 rounded-xl shadow-lg px-8 py-8 text-center"
              >
                <div className="text-xl text-green-100 mb-2">“{testimonials[testimonialIdx].quote}”</div>
                <div className="text-green-400 font-mono">{testimonials[testimonialIdx].author}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="w-full"
          >
            <div className="w-full h-[400px] bg-neutral-800 rounded-xl flex items-center justify-center text-muted-foreground border border-neutral-700 text-green-200 text-2xl font-semibold">
              Dashboard Preview Coming Soon
            </div>
            <div className="text-green-100 text-center text-lg mt-4">Built for creators. Trusted by teams.</div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="bg-gradient-to-r from-green-900 to-green-700 py-24"
      >
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Don't wait for a headline to ruin your reputation
          </h2>
          <Button asChild size="lg" className="text-lg font-semibold shadow-xl bg-white text-green-900 hover:bg-green-100">
            <Link href="/register">Join the Waitlist</Link>
          </Button>
        </div>
      </motion.section>
    </div>
  );
}
