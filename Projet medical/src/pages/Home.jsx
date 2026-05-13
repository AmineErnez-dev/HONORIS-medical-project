import { useRef, useState, useCallback } from "react";
import { 
  FileUp, 
  BrainCircuit, 
  Tag, 
  AlertTriangle, 
  CheckCircle2, 
  Image as ImageIcon,
  Loader2,
  X,
  ShieldCheck,
  Activity
} from "lucide-react";

const API_URL = "http://localhost:5000";

export default function Home() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  }, []);

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem("medical_ai_stats_final_v4");
    return saved ? JSON.parse(saved) : { total: 0, normal: 0, toVerify: 0 };
  });

  const updateStats = (prediction) => {
    const newStats = {
      total: stats.total + 1,
      normal: stats.normal + (prediction === "NORMAL" ? 1 : 0),
      toVerify: stats.toVerify + (prediction === "PNEUMONIA" ? 1 : 0)
    };
    setStats(newStats);
    localStorage.setItem("medical_ai_stats_final_v4", JSON.stringify(newStats));
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        updateStats(data.prediction);
      } else {
        setError(data.error || "Erreur inconnue");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur IA. Vérifiez que le serveur Flask est lancé sur le port 5000.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isNormal = result?.prediction === "NORMAL";
  const confidencePercent = result?.confidence || 0;

  const handleResetStats = () => {
    const zeroStats = { total: 0, normal: 0, toVerify: 0 };
    setStats(zeroStats);
    localStorage.setItem("medical_ai_stats_final_v4", JSON.stringify(zeroStats));
  };

  return (
    <main className="flex-grow flex flex-col items-center pt-12 pb-16 px-4">
      
      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] font-bold mb-4 text-gray-900 tracking-tight">
          Diagnostic Assisté par IA
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
          Analyse instantanée de radiographies pulmonaires par réseaux de neurones<br />
          convolutifs (CNN). Uploadez une image et cliquez sur analyser.
        </p>
      </div>

      {/* UPLOAD AREA */}
      <div 
        className={`w-full max-w-4xl border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center mb-8 cursor-pointer transition-all duration-300 ${
          isDragging 
            ? "border-blue-500 bg-blue-50 scale-[1.01] shadow-lg" 
            : selectedFile 
              ? "border-green-300 bg-green-50/50" 
              : "border-blue-200 bg-[#f4f7fe] hover:bg-blue-50 hover:border-blue-300"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/png, image/jpeg"
          onChange={handleFileChange}
        />
        
        {selectedFile ? (
          <>
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold mb-1 text-green-800 text-center">
              {selectedFile.name}
            </h3>
            <p className="text-gray-500 text-sm mb-4 text-center">
              {(selectedFile.size / 1024).toFixed(0)} KB • Cliquez pour changer d'image
            </p>
          </>
        ) : (
          <>
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <FileUp size={28} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-center">
              Glissez votre radiographie ici
            </h3>
            <p className="text-gray-500 text-sm mb-6 text-center">
              ou cliquez pour sélectionner un fichier sur votre ordinateur
            </p>
          </>
        )}
        
        <div className="flex gap-3 text-xs font-bold text-gray-600">
          <span className="bg-gray-200/80 px-4 py-1.5 rounded-full">PNG</span>
          <span className="bg-gray-200/80 px-4 py-1.5 rounded-full">JPG</span>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="w-full max-w-4xl bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <AlertTriangle className="text-red-500 shrink-0" size={20} />
          <p className="text-red-700 text-sm font-medium">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto">
            <X size={16} className="text-red-400 hover:text-red-600" />
          </button>
        </div>
      )}

      {/* RESULT CARD - only show when file is selected */}
      {selectedFile && (
        <div className="w-full max-w-4xl bg-white rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-8 transition-all duration-500 animate-[fadeIn_0.4s_ease-out]">
          
          {/* Image Preview */}
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="X-ray preview" 
              className="w-48 h-48 rounded-xl object-cover bg-gray-100 shadow-sm"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Loader2 size={32} className="text-blue-600 animate-spin" />
              </div>
            )}
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[11px] font-bold text-gray-500 tracking-wider mb-1 uppercase">
                  {result ? "RÉSULTAT DE L'ANALYSE" : isLoading ? "ANALYSE EN COURS..." : "IMAGE PRÊTE"}
                </p>
                <h2 className="text-2xl font-bold text-gray-900 truncate max-w-[250px] md:max-w-[400px]">
                  {selectedFile.name}
                </h2>
              </div>
              
              {/* Status Badge */}
              {result ? (
                isNormal ? (
                  <div className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-green-200">
                    <CheckCircle2 size={14} />
                    NORMAL
                  </div>
                ) : (
                  <div className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-red-200">
                    <AlertTriangle size={14} />
                    PNEUMONIE
                  </div>
                )
              ) : isLoading ? (
                <div className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-blue-200">
                  <Loader2 size={14} className="animate-spin" />
                  ANALYSE...
                </div>
              ) : (
                <div className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-orange-100">
                  <AlertTriangle size={14} />
                  EN ATTENTE
                </div>
              )}
            </div>
            
            {/* Confidence Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-500">Confiance du modèle</span>
                <span className={`font-bold ${result ? (isNormal ? "text-green-600" : "text-red-600") : "text-gray-400"}`}>
                  {result ? `${confidencePercent}%` : "—"}
                </span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${
                    result 
                      ? isNormal ? "bg-green-500" : "bg-red-500" 
                      : "bg-gray-300"
                  }`}
                  style={{ width: result ? `${confidencePercent}%` : "0%" }}
                />
              </div>
            </div>

            {/* Detail Bars (show after result) */}
            {result && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-gray-500 font-medium">Normal</span>
                  <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-400 h-full rounded-full transition-all duration-1000" style={{ width: `${result.details.NORMAL}%` }} />
                  </div>
                  <span className="w-12 text-right font-bold text-gray-600">{result.details.NORMAL}%</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="w-24 text-gray-500 font-medium">Pneumonie</span>
                  <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-400 h-full rounded-full transition-all duration-1000" style={{ width: `${result.details.PNEUMONIA}%` }} />
                  </div>
                  <span className="w-12 text-right font-bold text-gray-600">{result.details.PNEUMONIA}%</span>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button 
                className={`text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                  isLoading 
                    ? "bg-blue-400 cursor-not-allowed" 
                    : "bg-[#0f4ed8] hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-500/20"
                }`}
                onClick={(e) => { e.stopPropagation(); analyzeImage(); }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Analyse en cours...
                  </>
                ) : result ? (
                  <>
                    <Activity size={16} />
                    Ré-analyser
                  </>
                ) : (
                  <>
                    <BrainCircuit size={16} />
                    Voir le rapport complet
                  </>
                )}
              </button>
              <button 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
                onClick={(e) => { e.stopPropagation(); resetAll(); }}
              >
                Analyser une autre image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEPS */}
      <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6 mb-12">
        <Card 
          icon={<FileUp className="text-orange-500" size={20} />}
          title="1. Uploader"
          text="Importez vos fichiers radiographiques de manière sécurisée et anonymisée."
        />
        <Card 
          icon={<BrainCircuit className="text-pink-500" size={20} />}
          title="2. Analyse CNN"
          text="Notre intelligence artificielle analyse les structures pulmonaires couche par couche."
        />
        <Card 
          icon={<Tag className="text-yellow-500" size={20} />}
          title="3. Résultat"
          text="Recevez un rapport détaillé identifiant les anomalies potentielles en quelques secondes."
        />
      </div>

      {/* STATS */}
      <div className="flex flex-col items-center mt-4 pt-6 border-t border-gray-100 w-full max-w-4xl">
        <div className="flex justify-center gap-20 mb-6">
          <Stat 
            icon={<ImageIcon className="text-blue-500" size={16} />} 
            title="Images analysées" 
            value={stats.total.toLocaleString()} 
          />
          <Stat 
            icon={<CheckCircle2 className="text-green-500" size={16} />} 
            title="Cas normaux" 
            value={stats.normal.toLocaleString()} 
            color="text-green-600" 
          />
          <Stat 
            icon={<AlertTriangle className="text-orange-500" size={16} />} 
            title="À vérifier" 
            value={stats.toVerify.toLocaleString()} 
            color="text-orange-500" 
          />
        </div>
        <button 
          onClick={handleResetStats}
          className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
        >
          <X size={12} />
          Réinitialiser les statistiques
        </button>
      </div>
      
    </main>
  );
}

function Card({ icon, title, text }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 bg-gray-50 w-8 h-8 rounded flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-sm font-semibold mb-2 text-gray-900">
        {title}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function Stat({ icon, title, value, color = "text-gray-900" }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-1.5 mb-1.5">
        {icon}
        <span className="text-[11px] text-gray-500 font-bold">{title}</span>
      </div>
      <span className={`text-[2rem] leading-none font-bold ${color}`}>
        {value}
      </span>
    </div>
  );
}
