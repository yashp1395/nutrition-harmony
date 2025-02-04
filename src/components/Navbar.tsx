import { Link } from "react-router-dom";
import { Home, Search, Upload, User, Info } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Calorie Tracker</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="nav-link">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            <Link to="/search" className="nav-link">
              <Search className="w-5 h-5" />
              <span>Search</span>
            </Link>
            <Link to="/upload" className="nav-link">
              <Upload className="w-5 h-5" />
              <span>Upload</span>
            </Link>
            <Link to="/about" className="nav-link">
              <Info className="w-5 h-5" />
              <span>About</span>
            </Link>
            <Link to="/profile" className="nav-link">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;