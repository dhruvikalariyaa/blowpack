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
import { fetchFeaturedProducts } from '../store/slices/productSlice';
import { fetchCategories } from '../store/slices/categorySlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts, loading: productsLoading } = useSelector((state) => state.products);
  const { categories, loading: categoriesLoading, isRateLimited, lastFetched } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchFeaturedProducts({ limit: 8 }));
    
    // Only fetch categories if we don't have them, not rate limited, and haven't fetched recently
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    if (categories.length === 0 && !isRateLimited && (!lastFetched || lastFetched < fiveMinutesAgo)) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length, isRateLimited, lastFetched]);


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

  const stats = [
    { label: 'Products', value: '500+' },
    { label: 'Happy Customers', value: '10,000+' },
    { label: 'Years Experience', value: '25+' },
    { label: 'Cities Served', value: '50+' }
  ];

  if (productsLoading || categoriesLoading) {
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

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Product Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our diverse range of plastic products designed for various industries and applications
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories?.slice(0, 6).map((category) => (
              <Link
                key={category._id}
                to={`/products?category=${category._id}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-primary-300"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                    <div className="w-8 h-8 bg-primary-600 rounded-full"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {category.description || 'High-quality plastic products for your needs'}
                  </p>
                </div>
              </Link>
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
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most popular and highly-rated plastic products
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts?.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                  <img
                    src={product.images?.[0]?.url || '/placeholder-product.svg'}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust Packwell Plastic for their plastic product needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary-600">
                Browse Products
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="bg-white text-primary-600 hover:bg-gray-100">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
