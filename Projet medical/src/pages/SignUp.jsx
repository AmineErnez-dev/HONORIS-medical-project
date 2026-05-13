import { 
  ShieldPlus, 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  BadgeInfo
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SignUp() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center bg-[#f4f7fe] py-12 px-4 w-full">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="bg-[#0f4ed8] w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
          <ShieldPlus className="text-white" size={28} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
        <p className="text-gray-500 text-sm">Rejoignez la plateforme d'aide au diagnostic par IA.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full max-w-md relative z-10">
        <form className="space-y-5">
          
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Nom complet</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="text-gray-400" size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Dr. Jean Dupont" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Numéro RPPS (Professional ID)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <BadgeInfo className="text-gray-400" size={18} />
              </div>
              <input 
                type="text" 
                placeholder="10100000000" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="text-gray-400" size={18} />
              </div>
              <input 
                type="email" 
                placeholder="nom@hopital.fr" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide">Mot de passe</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="text-gray-400" size={18} />
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <div className="flex items-center h-5">
              <input id="terms" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 accent-[#0f4ed8]" />
            </div>
            <label htmlFor="terms" className="text-xs text-gray-500 leading-tight">
              J'accepte les conditions d'utilisation et la politique de confidentialité
            </label>
          </div>

          <button type="submit" className="w-full text-white bg-[#0f4ed8] hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-semibold rounded-lg text-sm px-5 py-3.5 text-center flex items-center justify-center gap-2 transition-colors mt-4">
            S'inscrire <ArrowRight size={18} />
          </button>

          <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-gray-100"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Sécurisé par IA</span>
              <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <p className="text-sm font-medium text-gray-600 text-center">
            Déjà inscrit ? <Link to="/login" className="text-[#0f4ed8] hover:underline font-bold">Se connecter</Link>
          </p>

        </form>
      </div>

      {/* Badges */}
      <div className="flex gap-4 mt-8">
        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold border border-green-100 shadow-sm">
          <ShieldCheck size={14} /> Données Chiffrées
        </div>
        <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-bold border border-orange-100 shadow-sm">
          <CheckCircle2 size={14} /> Conformité RGPD
        </div>
      </div>
    </main>
  );
}
