import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-400">InteractUI</h3>
            <p className="text-gray-400 text-sm">
              Building beautiful and interactive web experiences for the modern web.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white hover:underline transition-all group">
                  <span className="relative">About Us</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white hover:underline transition-all group">
                  <span className="relative">Services</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white hover:underline transition-all group">
                  <span className="relative">Portfolio</span>
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white hover:underline transition-all group relative">
                  <span>Blog</span>
                  <span className="absolute left-0 -top-8 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Coming Soon
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Mail className="w-4 h-4" />
                info@interactui.com
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-400 hover:scale-110 transition-all" title="Facebook">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-blue-400 hover:scale-110 transition-all" title="Twitter">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-pink-400 hover:scale-110 transition-all" title="Instagram">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-blue-400 hover:scale-110 transition-all" title="LinkedIn">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 InteractUI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
