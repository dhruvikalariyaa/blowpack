import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import api from '../config/axios';
import { API_ENDPOINTS } from '../config/api';

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [submitMessage, setSubmitMessage] = useState('');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage('');

    try {
      const response = await api.post(API_ENDPOINTS.CONTACT, data);
      
      if (response.data.success) {
        setSubmitStatus('success');
        setSubmitMessage(response.data.message);
        reset();
      } else {
        setSubmitStatus('error');
        setSubmitMessage(response.data.message || 'Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitStatus('error');
      
      if (error.response?.data?.message) {
        setSubmitMessage(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        setSubmitMessage(validationErrors);
      } else {
        setSubmitMessage('Failed to submit form. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPinIcon className="h-6 w-6" />,
      title: 'Address',
      details: [
        'Gala no- 06, Pali industry estate,',
        'Wagdhara road, Near by jalaram temple',
        'Dadra nagar, Dadra and Nagar Haveli, Gujarat, India'
      ]
    },
    {
      icon: <PhoneIcon className="h-6 w-6" />,
      title: 'Phone',
      details: [
        '+91 95378 94448',
        '+91 97274 28583',
        '+91 99984 98721'
      ]
    },
    {
      icon: <EnvelopeIcon className="h-6 w-6" />,
      title: 'Email',
      details: [
        'blowpackplastic@gmail.com'
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
        <title>Contact Us - Blow Pack Plastic Industries</title>
        <meta name="description" content="Get in touch with Blow Pack Plastic Industries. We're here to help with all your plastic product needs." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Contact Blow Pack Plastic
            </h1>
            <p className="text-lg text-primary-100 max-w-3xl mx-auto">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Send us a Message</h2>
            
            {/* Success/Error Message */}
            {submitStatus && (
              <div className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                submitStatus === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {submitStatus === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
                )}
                <p className="text-sm font-medium">{submitMessage}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  {...register('subject', { required: 'Please select a subject' })}
                  className="input-field"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="product">Product Information</option>
                  <option value="order">Order Support</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Enter your message here..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                )}
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full py-3 text-base font-semibold"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Send Message
                </Button>
              </div>
            </form>

            {/* Map Placeholder */}
          
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-base text-gray-600 mb-6">
                We're here to help and answer any question you might have. 
                We look forward to hearing from you.
              </p>
            </div>

            <div className="space-y-5">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-primary-100 rounded-full p-3">
                      <div className="text-primary-600">
                        {info.icon}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {info.title}
                    </h3>
                    <div className="space-y-1">
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-gray-600 text-sm">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="mt-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Find Us</h2>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3954.9429314020995!2d72.96149804680157!3d20.31665328309525!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be0cc39282f1655%3A0xad2a1c390201cba!2sBlow%20Pack%20Plastic!5e0!3m2!1sen!2sin!4v1757393768771!5m2!1sen!2sin" 
              width="100%" 
              height="350" 
              style={{border: 0}} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Blow Pack Plastic Location"
            ></iframe>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quick answers to common questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What is your minimum order quantity?
              </h3>
              <p className="text-gray-600 text-sm">
                Our minimum order quantity varies by product. For most standard products, 
                the minimum order is 100 pieces. Custom products may have different requirements.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you offer custom manufacturing?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, we specialize in custom plastic manufacturing. We can create products 
                according to your specifications, including size, color, and material requirements.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What are your delivery times?
              </h3>
              <p className="text-gray-600 text-sm">
                Standard products are typically delivered within 3-5 business days. 
                Custom products may take 2-4 weeks depending on complexity and quantity.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Do you provide samples?
              </h3>
              <p className="text-gray-600 text-sm">
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
