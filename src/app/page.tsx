'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, QrCode, Shield, Smartphone, Store, CheckCircle, Users, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold font-heading">T</span>
              </div>
              <span className="text-xl font-bold font-heading text-gray-900">Tokify</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 font-body">Features</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-body">How it Works</Link>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900 font-body">Login</Link>
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white px-4 py-2 rounded-lg font-body hover:from-indigo-800 hover:to-indigo-600 transition-all"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
              Trusted by 100+ Indian businesses
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-bold font-heading text-gray-900 mb-6"
            >
              Stop Trusting.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-900 to-indigo-700">
                Start Verifying.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600 font-body max-w-3xl mx-auto mb-10"
            >
              Tokify brings QR-based verification and payments to small Indian businesses. 
              Build trust with your customers through transparent, verifiable transactions.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/auth/register"
                className="bg-gradient-to-r from-indigo-900 to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold font-body hover:from-indigo-800 hover:to-indigo-600 transition-all flex items-center gap-2 text-lg"
              >
                Register Your Shop
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/login"
                className="bg-white text-indigo-900 px-8 py-4 rounded-lg font-semibold font-body border-2 border-indigo-900 hover:bg-indigo-50 transition-all text-lg"
              >
                Login
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-gray-900 mb-4">
              How Tokify Works
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto">
              Get started in minutes with our simple 3-step process
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-gray-900 mb-3">
                1. Register Your Shop
              </h3>
              <p className="text-gray-600 font-body">
                Create your account, set up your shop profile, and add your products in minutes
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-gray-900 mb-3">
                2. Generate QR Code
              </h3>
              <p className="text-gray-600 font-body">
                Get your unique shop QR code and display it for customers to scan and order
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold font-heading text-gray-900 mb-3">
                3. Start Receiving Orders
              </h3>
              <p className="text-gray-600 font-body">
                Customers scan, order, and pay. You get verified, trackable transactions instantly
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-gray-900 mb-4">
              Built for Indian Businesses
            </h2>
            <p className="text-xl text-gray-600 font-body max-w-2xl mx-auto">
              Everything you need to modernize your business and build customer trust
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <Shield className="w-8 h-8 text-indigo-900 mb-4" />
              <h3 className="text-lg font-semibold font-heading text-gray-900 mb-2">
                Secure & Verified
              </h3>
              <p className="text-gray-600 font-body">
                Every transaction is cryptographically secured and verifiable
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <Smartphone className="w-8 h-8 text-indigo-900 mb-4" />
              <h3 className="text-lg font-semibold font-heading text-gray-900 mb-2">
                Mobile First
              </h3>
              <p className="text-gray-600 font-body">
                Works perfectly on smartphones. No app download required
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <Users className="w-8 h-8 text-indigo-900 mb-4" />
              <h3 className="text-lg font-semibold font-heading text-gray-900 mb-2">
                Customer Trust
              </h3>
              <p className="text-gray-600 font-body">
                Build transparency and trust with verifiable order history
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <TrendingUp className="w-8 h-8 text-indigo-900 mb-4" />
              <h3 className="text-lg font-semibold font-heading text-gray-900 mb-2">
                Grow Your Business
              </h3>
              <p className="text-gray-600 font-body">
                Analytics and insights to help you make better business decisions
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <QrCode className="w-8 h-8 text-indigo-900 mb-4" />
              <h3 className="text-lg font-semibold font-heading text-gray-900 mb-2">
                QR Powered
              </h3>
              <p className="text-gray-600 font-body">
                Modern QR technology for fast, reliable customer interactions
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <Store className="w-8 h-8 text-indigo-900 mb-4" />
              <h3 className="text-lg font-semibold font-heading text-gray-900 mb-2">
                Easy Setup
              </h3>
              <p className="text-gray-600 font-body">
                Get started in minutes with our simple onboarding process
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
              Ready to Modernize Your Business?
            </h2>
            <p className="text-xl text-indigo-100 font-body mb-8 max-w-2xl mx-auto">
              Join hundreds of Indian businesses already using Tokify to build customer trust and grow their revenue
            </p>
            <Link
              href="/auth/register"
              className="bg-white text-indigo-900 px-8 py-4 rounded-lg font-semibold font-body hover:bg-gray-50 transition-all inline-flex items-center gap-2 text-lg"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold font-heading">T</span>
              </div>
              <span className="text-lg font-bold font-heading">Tokify</span>
            </div>
            <p className="text-gray-400 font-body">
              © 2024 Tokify. Scan. Pay. Trust.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
