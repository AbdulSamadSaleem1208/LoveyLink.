import Link from "next/link";
import { Heart, Sparkles, Share2, QrCode, Star, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-primary to-pink-hot py-2 text-center text-white text-sm font-bold tracking-wide">
        <span className="mr-2">✨</span>
        Only today! All plans 50% off, enjoy!
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Background Hearts Pattern can be added here using CSS or SVG */}
          <div className="absolute top-20 left-10 text-red-primary animate-bounce delay-100"><Heart size={40} className="fill-current" /></div>
          <div className="absolute top-40 right-20 text-red-primary animate-pulse"><Heart size={60} className="fill-current" /></div>
          <div className="absolute bottom-20 left-1/4 text-red-primary animate-bounce delay-700"><Heart size={30} className="fill-current" /></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">

            {/* Left Content */}
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center px-4 py-2 rounded-full border border-red-primary/30 bg-red-primary/10 text-red-primary text-sm backdrop-blur-sm shadow-[0_0_15px_rgba(255,0,51,0.3)]">
                <Heart className="w-4 h-4 mr-2 text-red-primary fill-current" />
                Want to start?
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                Declare your love <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-primary to-pink-hot">
                  for someone special!
                </span>
              </h1>

              <p className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Create a personalized page for who you love and surprise that person with a special declaration that will last forever.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link
                  href={user ? "/dashboard" : "/register"}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-lg text-white bg-button-gradient hover:opacity-90 shadow-lg shadow-red-900/50 transition-all transform hover:scale-105"
                >
                  <Heart className="w-5 h-5 mr-3 fill-white" />
                  {user ? "Go to Dashboard" : "Create my page"}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Link>
              </div>

              {/* Review Snippet */}
              <div className="bg-background-card/50 backdrop-blur-md p-4 rounded-xl border border-white/10 inline-block text-left mt-8 max-w-sm">
                <div className="flex text-yellow-400 mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-sm font-medium text-gray-300">"User reviews"</p>
                <p className="text-xs text-gray-500 mt-1">Join 10,000+ happy couples</p>
              </div>
            </div>

            {/* Right Image (Phone Mockup) */}
            <div className="flex-1 relative">
              {/* Floating Elements */}
              <div className="absolute -left-10 top-1/4 bg-background-card border border-white/10 p-3 rounded-lg text-xs text-white z-20 shadow-xl hidden md:block animate-fade-in">
                ♡ Custom Design
              </div>
              <div className="absolute -right-5 top-1/2 bg-background-card border border-white/10 p-3 rounded-lg text-xs text-white z-20 shadow-xl hidden md:block animate-fade-in delay-150">
                Share the love ♡
              </div>

              {/* Mockup Container */}
              <div className="relative mx-auto border-gray-800 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden">
                <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
                <div className="rounded-[2rem] overflow-hidden w-full h-full bg-black relative">
                  {/* Mockup Screen Content */}
                  <div className="w-full h-full bg-black text-white p-4 flex flex-col items-center pt-10">
                    <div className="w-full h-48 bg-gray-800 rounded-xl mb-4 relative overflow-hidden group">
                      <img
                        src="https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop"
                        alt="Couple"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <h3 className="font-serif text-2xl text-red-primary mb-2">Jose e Lara</h3>
                    <p className="text-center text-gray-400 text-xs leading-relaxed px-2">
                      "My love, I made this page to eternalize everything we live. Each memory here is a piece of my heart..."
                    </p>
                    <div className="mt-8">
                      <Heart className="w-12 h-12 text-red-primary fill-current animate-pulse mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-24 bg-background-card border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-red-primary font-bold tracking-wide uppercase text-sm mb-2">How it works</h2>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Create your surprise in 3 steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard
              icon={<Star className="h-8 w-8 text-red-primary" />}
              title="1. Customize"
              description="Choose your colors, photos, and write a message from your heart."
            />
            <FeatureCard
              icon={<QrCode className="h-8 w-8 text-red-primary" />}
              title="2. Generate QR"
              description="Get a unique QR code automatically created for your page."
            />
            <FeatureCard
              icon={<Share2 className="h-8 w-8 text-red-primary" />}
              title="3. Surprise!"
              description="Share the link or print the QR code to surprise your love."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-black/50 rounded-2xl border border-white/10 hover:border-red-primary/50 transition-colors group">
      <div className="mb-6 p-4 bg-red-primary/10 rounded-xl inline-block group-hover:bg-red-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}
