import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

export default function ContactPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      console.log(form);
      setForm({ name: "", email: "", message: "" });
    }, 800);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0c1b17] to-[#1a2a2f] py-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card className="bg-[#162825] border-0 shadow-2xl">
          <CardContent className="py-10 px-8">
            <h1 className="text-3xl font-bold mb-6 text-green-300 text-center">Contact Us</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="bg-[#0c1b17] border-green-700 text-green-100 placeholder:text-green-400"
                required
              />
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="bg-[#0c1b17] border-green-700 text-green-100 placeholder:text-green-400"
                required
              />
              <textarea
                name="message"
                placeholder="Message"
                value={form.message}
                onChange={handleChange}
                rows={5}
                className="w-full rounded-lg border border-green-700 bg-[#0c1b17] text-green-100 placeholder:text-green-400 p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <Button type="submit" className="w-full text-lg font-semibold" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
