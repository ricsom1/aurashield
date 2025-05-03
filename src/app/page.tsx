import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-40" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-blue-200 rounded-full blur-3xl opacity-30" />
        </div>
        <Card className="z-10 max-w-2xl w-full mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-lg animate-fade-in">
          <CardContent className="py-12 px-8 flex flex-col items-center">
            <ShieldCheck className="w-14 h-14 text-blue-500 mb-4 animate-bounce-slow" />
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 text-center mb-4">
              Protect Your Online Reputation
            </h1>
            <p className="text-lg text-gray-600 text-center mb-8 max-w-xl">
              AuraShield monitors your online presence across platforms, detects potential crises, and helps you respond effectively to protect your reputation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto text-lg font-semibold shadow-lg">
                <Link href="/dashboard">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto text-lg font-semibold">
                <Link href="#features">Learn more</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-blue-600 tracking-widest uppercase mb-2">
              Reputation Protection
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to protect your online presence
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              AuraShield provides comprehensive tools to monitor, analyze, and respond to your online reputation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-lg border-0 hover:scale-[1.03] transition-transform duration-200">
              <CardContent className="py-8 px-6 flex flex-col items-center">
                <span className="mb-4"><ShieldCheck className="w-8 h-8 text-blue-500" /></span>
                <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
                <p className="text-gray-600 text-center">
                  Track mentions across social media platforms in real-time, with instant alerts for potential crises.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0 hover:scale-[1.03] transition-transform duration-200">
              <CardContent className="py-8 px-6 flex flex-col items-center">
                <span className="mb-4"><svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg></span>
                <h3 className="text-lg font-semibold mb-2">Sentiment Analysis</h3>
                <p className="text-gray-600 text-center">
                  AI-powered sentiment analysis to understand the tone and impact of online conversations about you.
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-lg border-0 hover:scale-[1.03] transition-transform duration-200">
              <CardContent className="py-8 px-6 flex flex-col items-center">
                <span className="mb-4"><svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 014-4h2" /></svg></span>
                <h3 className="text-lg font-semibold mb-2">Crisis Response</h3>
                <p className="text-gray-600 text-center">
                  Generate AI-powered response plans and track competitor mentions to stay ahead of potential issues.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-600 py-24">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to protect your reputation?
          </h2>
          <p className="max-w-xl text-lg text-blue-100 mb-8">
            Join AuraShield today and take control of your online presence with our comprehensive reputation management tools.
          </p>
          <Button asChild size="lg" className="text-lg font-semibold shadow-xl bg-white text-blue-900 hover:bg-blue-100">
            <Link href="/dashboard">Get started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
