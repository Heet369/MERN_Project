import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAdmin } = useAuth();

  return (
    <footer className="border-t border-gray-200 bg-white py-8 px-4 sm:px-6 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-800 text-base">Blogs</span>
          <span className="text-gray-400">•</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div>
          <Link
            to={isAdmin ? '/admin/dashboard' : '/admin/login'}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
