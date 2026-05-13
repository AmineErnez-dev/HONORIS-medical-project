export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-8 flex flex-col">
        
        <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6 text-xs text-gray-500 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
             <img src="/logo.svg" alt="HONORIS Logo" className="h-7 object-contain grayscale opacity-80" />
             <p>© 2026 HONORIS Medical AI. Disclaimer: This tool is for clinical assistance and does not replace<br className="hidden md:block" />professional medical diagnosis.</p>
          </div>
          
          <div className="flex gap-4 font-medium">
            <a href="#" className="hover:text-gray-800 transition-colors">Documentation</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-gray-800 transition-colors">Confidentialité</a>
          </div>
        </div>
        
        <div className="text-[10px] text-blue-500 uppercase tracking-wide text-center">
          HONORIS - Projet Hackathon - Usage éducatif uniquement - pas un outil médical réel
        </div>
      </div>
    </footer>
  );
}
