import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Footer from '@/components/Footer';
import { 
  Users, 
  MessageCircle, 
  BarChart3, 
  Calendar, 
  Shield, 
  Globe, 
  Zap, 
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  Award
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function AboutUs() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero section animations
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    )
    .fromTo(subtitleRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.5"
    )
    .fromTo(ctaRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      "-=0.3"
    );

    // Features section animations
    gsap.fromTo(".feature-card",
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Stats section animations
    gsap.fromTo(".stat-number",
      { textContent: 0 },
      {
        textContent: (i, target) => {
          const finalValue = parseInt(target.getAttribute('data-value') || '0');
          return finalValue;
        },
        duration: 2,
        ease: "power2.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Floating animation for hero elements
    gsap.to(".floating", {
      y: -20,
      duration: 3,
      ease: "power2.inOut",
      yoyo: true,
      repeat: -1
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const features = [
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Community Chat",
      description: "Connect with neighbors in real-time through our secure community chat system."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Interactive Polls",
      description: "Voice your opinion on community matters with our dynamic polling system."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Surveys",
      description: "Participate in detailed surveys to help shape your community's future."
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Local Events",
      description: "Discover and join community events, meetings, and activities."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Platform",
      description: "Your data is protected with enterprise-grade security measures."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Smart City Integration",
      description: "Seamlessly connect with local government services and initiatives."
    }
  ];

  const stats = [
    { number: 50, label: "Cities Connected", suffix: "+" },
    { number: 10000, label: "Active Users", suffix: "+" },
    { number: 500, label: "Community Events", suffix: "+" },
    { number: 95, label: "User Satisfaction", suffix: "%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Menu */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="text-2xl font-bold text-gray-900">
              CityConnect
            </div>
            <div className="hidden md:flex space-x-8">
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('stats')}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium"
              >
                Stats
              </button>
              <button 
                onClick={() => scrollToSection('mission')}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300 font-medium"
              >
                Mission
              </button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-full transition-all duration-300"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden min-h-screen flex items-center pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* City Skyline Silhouette */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
          
          {/* Floating Buildings */}
          <div className="absolute bottom-20 left-10 w-16 h-24 bg-gradient-to-t from-blue-600/30 to-blue-400/20 rounded-t-lg floating"></div>
          <div className="absolute bottom-20 left-32 w-12 h-32 bg-gradient-to-t from-purple-600/30 to-purple-400/20 rounded-t-lg floating" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-20 right-20 w-20 h-28 bg-gradient-to-t from-indigo-600/30 to-indigo-400/20 rounded-t-lg floating" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 right-40 w-14 h-36 bg-gradient-to-t from-blue-600/30 to-blue-400/20 rounded-t-lg floating" style={{ animationDelay: '1.5s' }}></div>
          
          {/* Animated Circles */}
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 floating"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 floating" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 floating" style={{ animationDelay: '2s' }}></div>
          
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.1 }}>
            <defs>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-6xl mx-auto">
            {/* Top Badge */}
            <Badge className="mb-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-6 py-3 text-lg font-semibold shadow-lg">
              <Star className="h-5 w-5 mr-2" />
              Empowering Communities Since 2024
            </Badge>
            
            {/* Main Title */}
            <h1 ref={titleRef} className="text-6xl lg:text-8xl xl:text-9xl font-black text-gray-900 mb-8 leading-none">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                CityConnect
              </span>
            </h1>
            
            {/* Subtitle */}
            <p ref={subtitleRef} className="text-2xl lg:text-3xl xl:text-4xl text-gray-600 mb-12 leading-relaxed max-w-5xl mx-auto font-light">
              The revolutionary platform that brings communities together, 
              <br className="hidden lg:block" />
              empowering citizens to shape the future of their cities through 
              <br className="hidden lg:block" />
              <span className="font-semibold text-blue-600">real-time communication</span> and 
              <span className="font-semibold text-purple-600"> collaborative decision-making</span>.
            </p>
            
            {/* Stats Preview */}
            <div className="flex justify-center items-center space-x-8 mb-12 text-center">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-blue-600">50+</div>
                <div className="text-sm lg:text-base text-gray-600">Cities Connected</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-purple-600">10K+</div>
                <div className="text-sm lg:text-base text-gray-600">Active Users</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-indigo-600">95%</div>
                <div className="text-sm lg:text-base text-gray-600">Satisfaction</div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 border-0"
              >
                Get Started Now
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              <Button 
                onClick={() => scrollToSection('features')}
                variant="outline" 
                size="lg"
                className="border-3 border-gray-300 text-gray-700 px-12 py-6 text-xl font-semibold rounded-full hover:bg-gray-50 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              >
                Learn More
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Real-time Updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium">Community Driven</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CityConnect?
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building the future of community engagement with cutting-edge technology 
              and user-centered design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white mx-auto mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" ref={statsRef} className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              See how CityConnect is transforming communities across the country.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  <span className="stat-number" data-value={stat.number}>0</span>
                  {stat.suffix}
                </div>
                <p className="text-blue-100 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white mx-auto mb-8">
              <Heart className="h-10 w-10" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              To create more connected, engaged, and empowered communities by providing 
              innovative digital solutions that bridge the gap between citizens and their local governments. 
              We believe that every voice matters and every community deserves to be heard.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-green-100 text-green-800 border-green-200 px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Transparent
              </Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Secure
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Innovative
              </Badge>
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-4 py-2">
                <Users className="h-4 w-4 mr-2" />
                Community-First
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Community?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of citizens who are already making a difference in their communities.
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-4 text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 