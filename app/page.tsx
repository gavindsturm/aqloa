'use client'

import { useState } from 'react'
import { 
  ArrowRight, 
  Calendar, 
  Users, 
  TrendingUp, 
  Brain, 
  Phone,
  BarChart3,
  Shield,
  Zap,
  Clock,
  DollarSign,
  CheckCircle2,
  Menu,
  X,
  PlayCircle
} from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault()
    alert(`Thank you for subscribing with ${email}! We'll be in touch soon.`)
    setEmail('')
  }

  const handleScheduleDemo = () => {
    setShowContactModal(true)
  }

  const handleWatchDemo = () => {
    setShowVideoModal(true)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Demo request submitted! Our team will contact you within 24 hours.')
    setShowContactModal(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-neutral-900">Aqloa</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="text-neutral-600 hover:text-neutral-900 font-medium">
                Features
              </button>
              <button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="text-neutral-600 hover:text-neutral-900 font-medium">
                Pricing
              </button>
              <button onClick={handleScheduleDemo} className="text-neutral-600 hover:text-neutral-900 font-medium">
                Demo
              </button>
              <Link href="/login">
                <button className="btn-ghost">Sign In</button>
              </Link>
              <Link href="/login">
                <button className="btn-primary">Get Started</button>
              </Link>
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <button 
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left text-neutral-600 hover:text-neutral-900 font-medium py-2"
              >
                Features
              </button>
              <button 
                onClick={() => {
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left text-neutral-600 hover:text-neutral-900 font-medium py-2"
              >
                Pricing
              </button>
              <button 
                onClick={() => {
                  handleScheduleDemo()
                  setMobileMenuOpen(false)
                }}
                className="block w-full text-left text-neutral-600 hover:text-neutral-900 font-medium py-2"
              >
                Demo
              </button>
              <Link href="/login">
                <button className="btn-secondary w-full">Sign In</button>
              </Link>
              <Link href="/login">
                <button className="btn-primary w-full">Get Started</button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-neutral-100 rounded-full mb-6 border border-neutral-300">
              <span className="text-neutral-700 font-medium text-sm">Enterprise Insurance CRM</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Close More Deals with
              <br />
              Professional Sales Tools
            </h1>
            
            <p className="text-xl text-neutral-600 mb-8 leading-relaxed">
              Complete platform for insurance sales teams. AI-powered automation, real-time analytics, and team management in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/login">
                <button className="btn-primary text-lg px-8 py-4 flex items-center justify-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </Link>
              <button 
                onClick={handleWatchDemo}
                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center"
              >
                <PlayCircle className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              { value: '500+', label: 'Active Users' },
              { value: '40%', label: 'Higher Close Rate' },
              { value: '2.5hrs', label: 'Saved Daily' },
              { value: '$250K', label: 'Avg Revenue Increase' },
            ].map((stat, i) => (
              <div key={i} className="stat-card text-center">
                <div className="text-3xl font-bold text-neutral-900">{stat.value}</div>
                <div className="text-sm text-neutral-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Professional tools designed for insurance sales teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Medical Underwriting",
                description: "Instant carrier recommendations based on health conditions. Save 30 minutes per application.",
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                description: "Automated appointment booking via SMS. Reduce no-shows by 60% with smart reminders.",
              },
              {
                icon: TrendingUp,
                title: "Lead ROI Tracking",
                description: "Track cost-per-acquisition by vendor. Know which lead sources drive profitability.",
              },
              {
                icon: Phone,
                title: "Call Intelligence",
                description: "Real-time transcription and sentiment analysis. Identify coaching opportunities instantly.",
              },
              {
                icon: Users,
                title: "Team Performance",
                description: "Live leaderboards and activity tracking. Motivate your team with real-time metrics.",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Conversion funnels, retention rates, and revenue forecasting in detailed dashboards.",
              },
              {
                icon: Zap,
                title: "Lead Distribution",
                description: "Smart auto-assignment based on performance, specialty, and availability.",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "SOC 2 certified, HIPAA compliant, with full audit trails and data encryption.",
              },
              {
                icon: Clock,
                title: "Automated Workflows",
                description: "Custom triggers for follow-ups, reminders, and status updates. Set it and forget it.",
              },
            ].map((feature, i) => (
              <div key={i} className="card group">
                <div className="w-12 h-12 bg-neutral-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={handleScheduleDemo}
              className="btn-primary text-lg px-8 py-4"
            >
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-neutral-600">
              Choose the plan that fits your team
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: '$49',
                period: 'per user/month',
                features: [
                  'Up to 5 users',
                  'Basic CRM features',
                  'Lead management',
                  'Email support',
                  'Mobile app access',
                ],
                cta: 'Start Free Trial',
              },
              {
                name: 'Professional',
                price: '$99',
                period: 'per user/month',
                features: [
                  'Up to 25 users',
                  'AI underwriting',
                  'Call intelligence',
                  'Advanced analytics',
                  'Priority support',
                  'Custom integrations',
                ],
                cta: 'Start Free Trial',
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'contact sales',
                features: [
                  'Unlimited users',
                  'White-label options',
                  'Dedicated support',
                  'Custom development',
                  'SLA guarantee',
                  'On-premise option',
                ],
                cta: 'Contact Sales',
              },
            ].map((plan, i) => (
              <div key={i} className={`card ${plan.popular ? 'border-2 border-neutral-900 shadow-lg' : ''} relative`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-neutral-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-neutral-900">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-neutral-600 ml-2">{plan.period}</span>}
                    {plan.price === 'Custom' && <div className="text-neutral-600 text-sm mt-1">{plan.period}</div>}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login">
                  <button className={plan.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Sales?
          </h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join 500+ insurance agencies using Aqloa to close more deals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <button className="bg-white text-neutral-900 hover:bg-neutral-100 font-semibold px-8 py-4 rounded-md text-lg transition-all shadow-lg">
                Start Free Trial
              </button>
            </Link>
            <button 
              onClick={handleScheduleDemo}
              className="border-2 border-white text-white hover:bg-white hover:text-neutral-900 font-semibold px-8 py-4 rounded-md text-lg transition-all"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <span className="text-2xl font-bold text-neutral-900">Aqloa</span>
              <p className="text-sm text-neutral-600 mt-4">
                Professional insurance sales platform for modern agencies
              </p>
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li>
                  <button 
                    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-neutral-900"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hover:text-neutral-900"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <Link href="/login" className="hover:text-neutral-900">Sign In</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-neutral-600">
                <li><button onClick={() => alert('About page coming soon!')} className="hover:text-neutral-900">About</button></li>
                <li><button onClick={() => alert('Blog coming soon!')} className="hover:text-neutral-900">Blog</button></li>
                <li><button onClick={handleScheduleDemo} className="hover:text-neutral-900">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-neutral-900 mb-4">Newsletter</h4>
              <form onSubmit={handleNewsletterSignup} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input text-sm"
                  required
                />
                <button type="submit" className="btn-primary w-full text-sm">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-8 text-center text-sm text-neutral-600">
            <p>&copy; 2026 Aqloa. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Video Demo Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowVideoModal(false)}>
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-neutral-900">Product Demo</h3>
              <button onClick={() => setShowVideoModal(false)} className="text-neutral-500 hover:text-neutral-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-neutral-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <PlayCircle className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600">Demo video would play here</p>
              </div>
            </div>
            <p className="text-neutral-600">
              This is a demo placeholder. In production, this would show a full product walkthrough video.
            </p>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-neutral-900">Schedule a Demo</h3>
              <button onClick={() => setShowContactModal(false)} className="text-neutral-500 hover:text-neutral-700">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Name</label>
                <input type="text" required className="input" placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Email</label>
                <input type="email" required className="input" placeholder="john@company.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Phone</label>
                <input type="tel" required className="input" placeholder="(555) 123-4567" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Company Size</label>
                <select required className="input">
                  <option value="">Select size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201+">201+ employees</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">
                Request Demo
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
