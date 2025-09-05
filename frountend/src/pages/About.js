import React from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  CheckIcon, 
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const values = [
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: 'Quality First',
      description: 'We never compromise on quality. Every product undergoes rigorous testing to ensure it meets our high standards.'
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: 'Customer Focus',
      description: 'Our customers are at the heart of everything we do. We strive to exceed expectations with every interaction.'
    },
    {
      icon: <TruckIcon className="h-8 w-8" />,
      title: 'Reliable Service',
      description: 'We deliver on time, every time. Our logistics network ensures your products reach you safely and quickly.'
    },
    {
      icon: <CurrencyRupeeIcon className="h-8 w-8" />,
      title: 'Fair Pricing',
      description: 'We believe in transparent, competitive pricing that offers real value for money to our customers.'
    }
  ];

  const milestones = [
    { year: '1998', title: 'Company Founded', description: 'Started as a small plastic manufacturing unit' },
    { year: '2005', title: 'First Major Contract', description: 'Secured our first major industrial contract' },
    { year: '2010', title: 'Expansion', description: 'Expanded operations to 5 cities across India' },
    { year: '2015', title: 'Digital Transformation', description: 'Launched our online platform for better customer service' },
    { year: '2020', title: 'Sustainability Initiative', description: 'Introduced eco-friendly manufacturing processes' },
    { year: '2023', title: 'Present', description: 'Serving 10,000+ customers with 500+ products' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>About Us - Blow Pack Plastic Industries</title>
        <meta name="description" content="Learn about Blow Pack Plastic Industries - a leading manufacturer of high-quality plastic products with 25+ years of experience." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Blow Pack Plastic
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
              Leading the plastic industry with innovation, quality, and customer satisfaction for over 25 years
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 1998, Packwell Plastic Industries began as a small family business 
                  with a vision to provide high-quality plastic products to the Indian market. 
                  What started as a modest operation has grown into one of the most trusted names 
                  in the plastic manufacturing industry.
                </p>
                <p>
                  Over the years, we have continuously evolved, adopting new technologies and 
                  manufacturing processes to meet the changing needs of our customers. Today, 
                  we serve thousands of customers across India with our comprehensive range of 
                  plastic products.
                </p>
                <p>
                  Our commitment to quality, innovation, and customer satisfaction has been the 
                  driving force behind our success. We believe in building long-term relationships 
                  with our customers by delivering products that exceed their expectations.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">25+</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">10,000+</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                  <div className="text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                  <div className="text-gray-600">Cities Served</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-600">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in our growth and development
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="text-primary-600 font-bold text-lg mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-1/2 flex justify-center">
                    <div className="bg-primary-600 rounded-full w-4 h-4 border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="text-center">
              <div className="bg-primary-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <StarIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 text-lg">
                To provide high-quality plastic products that meet the diverse needs of our 
                customers while maintaining the highest standards of quality, innovation, and 
                environmental responsibility.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 text-lg">
                To be the leading plastic manufacturing company in India, recognized for our 
                innovation, quality, and commitment to customer satisfaction, while contributing 
                to a sustainable future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Work With Us?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Packwell Plastic for their plastic product needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-100 transition-colors"
            >
              Browse Our Products
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
