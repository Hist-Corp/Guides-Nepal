import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { Search, Star, Clock, MapPin, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { guidesApi, Experience } from '../services/guidesApi';

const cities = ['All', 'Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Bharatpur'];
const categories = ['All', 'Cultural', 'Nature', 'Adventure', 'Food', 'Workshop'];
const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' }
];

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(query);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchExperiences();
  }, [query, selectedCity, selectedCategory, selectedSort, priceRange]);

  const fetchExperiences = async () => {
    setLoading(true);
    try {
      const results = await guidesApi.getExperiences(
        selectedCity !== 'All' ? selectedCity : undefined,
        selectedCategory !== 'All' ? selectedCategory : undefined,
        query
      );
      setExperiences(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error('Search error:', error);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearFilters = () => {
    setSelectedCity('All');
    setSelectedCategory('All');
    setSelectedSort('popular');
    setPriceRange([0, 200]);
    setSearchQuery('');
    navigate('/search');
  };

  const activeFiltersCount = [
    selectedCity !== 'All',
    selectedCategory !== 'All',
    priceRange[0] > 0 || priceRange[1] < 200
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        <section className="bg-primary py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-6">Search Experiences</h1>
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search experiences, cities, or activities..."
                  className="w-full px-5 py-4 pl-12 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow shadow-lg" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover transition-colors">
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg hover:border-primary transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />Filters
                  {activeFiltersCount > 0 && (
                    <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{activeFiltersCount}</span>
                  )}
                </button>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-slate-500 hover:text-primary flex items-center gap-1">
                    <X className="w-4 h-4" />Clear all
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{experiences.length} experiences found</span>
                <div className="relative">
                  <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}
                    className="appearance-none bg-white border border-slate-200 px-4 py-2 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {sortOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {showFilters && (
              <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                    <div className="flex flex-wrap gap-2">
                      {cities.map((city) => (
                        <button key={city} onClick={() => setSelectedCity(city)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCity === city ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Price: ${priceRange[0]} - ${priceRange[1]}</label>
                    <div className="space-y-2">
                      <input type="range" min="0" max="200" value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-full" />
                      <input type="range" min="0" max="200" value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick City Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {cities.map((city) => (
                <button key={city} onClick={() => setSelectedCity(city)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCity === city ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-primary'}`}>
                  {city}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="ml-3 text-slate-500">Loading experiences...</span>
              </div>
            ) : experiences.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experiences.map((exp) => (
                  <Link key={exp.id} to={`/experience/${exp.id}`}
                    className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group">
                    <div className="h-48 overflow-hidden relative">
                      <img src={exp.heroImage} alt={exp.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-2 py-1 rounded-full">{exp.category}</div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 text-brand-yellow fill-brand-yellow" />{exp.rating}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2"><MapPin className="w-3 h-3" />{exp.city}</div>
                      <h3 className="font-bold text-lg mb-2 text-slate-900 group-hover:text-primary transition-colors">{exp.title}</h3>
                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">{exp.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          {exp.duration && (<span className="flex items-center gap-1"><Clock className="w-3 h-3" />{exp.duration}</span>)}
                          <span className="flex items-center gap-1"><Star className="w-3 h-3 text-brand-yellow fill-brand-yellow" />{exp.reviews} reviews</span>
                        </div>
                        <div className="font-bold text-primary">${exp.price}</div>
                      </div>
                      {exp.host && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                          <img src={exp.host.image} alt={exp.host.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-xs text-slate-500">{exp.host.name}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No experiences found</h3>
                <p className="text-slate-500 mb-4">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="text-primary font-semibold hover:underline">Clear all filters</button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
