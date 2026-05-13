import { 
  Mail, 
  Lock, 
  ShieldCheck 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <main className="flex-grow flex items-center justify-center bg-[#f4f7fe] py-12 px-4 w-full">
      <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full max-w-[440px]">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Connexion</h1>
          <p className="text-gray-500 text-sm px-4 leading-relaxed">
            Accédez à votre espace sécurisé d'analyse médicale.
          </p>
        </div>

        <form className="space-y-5">
          
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="text-gray-400" size={18} />
              </div>
              <input 
                type="email" 
                placeholder="nom@hopital.fr" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-3 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide">Mot de passe</label>
              <Link to="#" className="text-[11px] font-bold text-[#0f4ed8] hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={18} />
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-3 transition-colors"
              />
            </div>
          </div>

          <button type="submit" className="w-full text-white bg-[#0f4ed8] hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm px-5 py-3.5 text-center transition-colors mt-2">
            Se connecter
          </button>

          <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-gray-500 font-medium">Ou continuer avec</span>
              <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <button type="button" className="w-full text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-semibold rounded-lg text-sm px-5 py-3.5 text-center flex items-center justify-center gap-2 transition-colors">
            <ShieldCheck className="text-[#0f4ed8]" size={18} />
            S'identifier avec un certificat professionnel
          </button>

          <p className="text-sm font-medium text-gray-600 text-center mt-8 pt-4">
            Pas encore de compte ? <Link to="/signup" className="text-[#0f4ed8] hover:underline font-bold">S'inscrire</Link>
          </p>

        </form>
      </div>
    </main>
  );
}
