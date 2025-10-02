import { useState, ChangeEvent, FormEvent } from 'react';
import { Mail, Phone, MapPin, Upload, Calendar } from 'lucide-react';

interface ContactProps {
  showModal: (title: string, message: string) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function Contact({ showModal, showToast }: ContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    subject: '',
    priority: 'medium',
    subscribe: false,
    notification: 'email',
    country: '',
    date: '',
    time: '',
    file: null as File | null,
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [progress, setProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);

  const subjects = ['General Inquiry', 'Technical Support', 'Sales', 'Partnership', 'Feedback'];

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    return /^\+?[\d\s-()]+$/.test(phone);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'subject' && value.length > 0) {
      const filtered = subjects.filter(s => s.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else if (name === 'subject') {
      setShowSuggestions(false);
    }

    setErrors(prev => ({ ...prev, [name]: '' }));
    updateProgress();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
    updateProgress();
  };

  const updateProgress = () => {
    const fields = ['name', 'email', 'phone', 'message', 'subject', 'country', 'date'];
    const filled = fields.filter(field => formData[field as keyof typeof formData]).length;
    setProgress((filled / fields.length) * 100);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      showModal(
        'Success!',
        'Thank you for your message. We will get back to you within 24 hours.'
      );
      showToast('Form submitted successfully!', 'success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        subject: '',
        priority: 'medium',
        subscribe: false,
        notification: 'email',
        country: '',
        date: '',
        time: '',
        file: null,
        agreeToTerms: false,
      });
      setProgress(0);
    } else {
      showToast('Please fix the errors in the form', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Get In Touch
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          We'd love to hear from you. Fill out the form below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Form Progress</span>
              <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div className="relative">
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  onFocus={() => formData.subject && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                  placeholder="Type to search..."
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, subject: suggestion }));
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                >
                  <option value="">Select a country</option>
                  <option value="us">United States</option>
                  <option value="uk">United Kingdom</option>
                  <option value="ca">Canada</option>
                  <option value="au">Australia</option>
                  <option value="de">Germany</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Priority
                </label>
                <div className="flex gap-4">
                  {['low', 'medium', 'high'].map((priority) => (
                    <label key={priority} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        value={priority}
                        checked={formData.priority === priority}
                        onChange={handleInputChange}
                        className="mr-2 cursor-pointer"
                      />
                      <span className="capitalize dark:text-white">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">
                  Preferred Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">
                Interest Level: {sliderValue}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all resize-none`}
                placeholder="Tell us what's on your mind..."
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 dark:text-white flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Attach File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all"
              />
              {formData.file && (
                <p className="text-sm text-green-600 mt-1">Selected: {formData.file.name}</p>
              )}
            </div>

            <div className="space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="subscribe"
                  checked={formData.subscribe}
                  onChange={handleInputChange}
                  className="mr-2 cursor-pointer"
                />
                <span className="dark:text-white">Subscribe to our newsletter</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mr-2 cursor-pointer"
                />
                <span className="dark:text-white">I agree to the terms and conditions *</span>
              </label>
              {errors.agreeToTerms && <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
              >
                Submit
              </button>
              <button
                type="reset"
                onClick={() => {
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    message: '',
                    subject: '',
                    priority: 'medium',
                    subscribe: false,
                    notification: 'email',
                    country: '',
                    date: '',
                    time: '',
                    file: null,
                    agreeToTerms: false,
                  });
                  setErrors({});
                  setProgress(0);
                }}
                className="px-8 py-4 rounded-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all dark:text-white"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <div className="font-semibold dark:text-white">Email</div>
                  <div className="text-gray-600 dark:text-gray-300">info@interactui.com</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <div className="font-semibold dark:text-white">Phone</div>
                  <div className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <div className="font-semibold dark:text-white">Address</div>
                  <div className="text-gray-600 dark:text-gray-300">
                    123 Web Street<br />
                    San Francisco, CA 94102
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Quick Response</h3>
            <p className="text-blue-100 mb-4">We typically respond within 24 hours</p>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
