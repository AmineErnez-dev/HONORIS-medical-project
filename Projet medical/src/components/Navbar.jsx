import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b h-16 flex items-center justify-between px-8">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.svg" alt="HONORIS Logo" className="h-8 object-contain" />
      </Link>
      
      <div className="hidden md:block text-blue-600 font-medium text-sm border-b-2 border-blue-600 pb-1 cursor-pointer">
        Classificateur d'Images Médicales
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden lg:block bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold mr-2">
          IA en Santé · v1.0
        </div>
        <Link to="/login" className="text-sm font-semibold text-gray-600 hover:text-[#0f4ed8] transition-colors">
          Connexion
        </Link>
        <Link to="/signup" className="bg-[#0f4ed8] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors">
          S'inscrire
        </Link>
      </div>
    </nav>
  );
}
