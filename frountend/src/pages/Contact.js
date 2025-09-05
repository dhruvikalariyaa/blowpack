import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Form submitted:', data);
    reset();
    setIsSubmitting(false);
    alert('Thank you for your message! We will get back to you soon.');
  };

  const contactInfo = [
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: 'Address',
      details: [
        '123 Industrial Area,',
        'Mumbai, Maharashtra 400001',
        'India'
      ]
    },
    {
      icon: <PhoneIcon className="h-6 w-6" />,
      title: 'Phone',
      details: [
        '+91 98765 43210',
        '+91 22 1234 5678'
      ]
    },
    {
      icon: <EnvelopeIcon className="h-6 w-6" />,
      title: 'Email',
      details: [
        'info@packwellplastic.com',
        'support@packwellplastic.com'
      ]
    },
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: 'Business Hours',
      details: [
        'Monday - Friday: 9:00 AM - 6:00 PM',
        'Saturday: 9:00 AM - 2:00 PM',
        'Sunday: Closed'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Contact Us - Packwell Plastic Industries</title>
        <meta name="description" content="Get in touch with Packwell Plastic Industries. We're here to help with all your plastic product needs." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  name="firstName"
                  register={register}
                  validation={{ required: 'First name is required' }}
                  error={errors.firstName?.message}
                  placeholder="Enter your first name"
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  register={register}
                  validation={{ required: 'Last name is required' }}
                  error={errors.lastName?.message}
                  placeholder="Enter your last name"
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                name="email"
                register={register}
                validation={{
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                }}
                error={errors.email?.message}
                placeholder="Enter your email address"
              />

              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                register={register}
                validation={{
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                }}
                error={errors.phone?.message}
                placeholder="Enter your phone number"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  {...register('subject', { required: 'Please select a subject' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="product">Product Information</option>
                  <option value="order">Order Support</option>
                  <option value="technical">Technical Support</option>
                  <option value="partnership">Partnership</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your message here..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8">
                We're here to help and answer any question you might have. 
                We look forward to hearing from you.
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-primary-100 rounded-full p-3">
                      <div className="text-primary-600">
                        {info.icon}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {info.title}
                    </h3>
                    {info.details.map((detail, detailIndex) => (
                      <p key={detailIndex} className="text-gray-600">
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPinIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Interactive Map</p>
                <p className="text-sm">123 Industrial Area, Mumbai</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What is your minimum order quantity?
              </h3>
              <p className="text-gray-600">
                Our minimum order quantity varies by product. For most standard products, 
                the minimum order is 100 pieces. Custom products may have different requirements.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer custom manufacturing?
              </h3>
              <p className="text-gray-600">
                Yes, we specialize in custom plastic manufacturing. We can create products 
                according to your specifications, including size, color, and material requirements.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What are your delivery times?
              </h3>
              <p className="text-gray-600">
                Standard products are typically delivered within 3-5 business days. 
                Custom products may take 2-4 weeks depending on complexity and quantity.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you provide samples?
              </h3>
              <p className="text-gray-600">
                Yes, we provide samples for most of our products. Sample charges may apply, 
                but they are usually credited against your first order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
