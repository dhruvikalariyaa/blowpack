import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ArrowRightIcon, 
  CheckIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { fetchFeaturedProducts, fetchBestSellingProducts } from '../store/slices/productSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts, bestSellingProducts, loading: productsLoading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts({ limit: 8 }));
    dispatch(fetchBestSellingProducts({ limit: 8 }));
  }, [dispatch]);


  const features = [
    {
      icon: <TruckIcon className="h-8 w-8" />,
      title: 'Free Shipping',
      description: 'Free shipping on orders above ₹500'
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: 'Quality Guarantee',
      description: '100% quality assured products'
    },
    {
      icon: <CurrencyRupeeIcon className="h-8 w-8" />,
      title: 'Best Prices',
      description: 'Competitive pricing for all products'
    }
  ];


  if (productsLoading) {
    return <LoadingSpinner size="xl" className="min-h-screen" />;
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Blow Pack Plastic Industries - Premium Plastic Products</title>
        <meta name="description" content="Discover our wide range of high-quality plastic products including bottles, containers, and custom solutions for all your needs." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Premium Plastic
                <span className="block text-primary-200">Products</span>
              </h1>
              <p className="text-xl text-primary-100 leading-relaxed">
                Discover our extensive collection of high-quality plastic products designed 
                to meet all your industrial and commercial needs. From bottles to containers, 
                we have everything you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products">
                  <Button size="lg" className="w-full sm:w-auto">
                    Shop Now
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-primary-600">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h3 className="text-2xl font-semibold mb-6">Why Choose Us?</h3>
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="text-primary-200">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{feature.title}</h4>
                        <p className="text-primary-100 text-sm">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Best Sellers Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🔥 Best Sellers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our most popular products loved by thousands of customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellingProducts?.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
                {/* Best Seller Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    🔥 Best Seller
                  </span>
                </div>
                
                <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || '/placeholder-product.svg'}
                    alt={product.name}
                    className="w-full h-full object-contain bg-white p-2"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.svg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.ratings?.average || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      ({product.ratings?.count || 0})
                    </span>
                  </div>
                  
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary-600">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/products/${product._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg">
                View All Products
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ⭐ Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Handpicked premium products with exceptional quality and customer satisfaction
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
                {/* Featured Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                </div>
                
                <div className="aspect-[4/3] bg-gray-50 overflow-hidden">
                  <img
                    src={product.images?.[0]?.url || '/placeholder-product.svg'}
                    alt={product.name}
                    className="w-full h-full object-contain bg-white p-2"
                    onError={(e) => {
                      e.target.src = '/placeholder-product.svg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.ratings?.average || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      ({product.ratings?.count || 0})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-primary-600">
                        ₹{product.price}
                      </span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/products/${product._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg">
                View All Products
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🚀 Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join 10,000+ satisfied customers who trust Blow Pack Plastic Industries for their premium plastic product needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary-600">
                🛍️ Shop Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                📞 Get Quote
              </Button>
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-200">500+</div>
              <div className="text-sm text-primary-100">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-200">10K+</div>
              <div className="text-sm text-primary-100">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-200">25+</div>
              <div className="text-sm text-primary-100">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-200">50+</div>
              <div className="text-sm text-primary-100">Cities Served</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
