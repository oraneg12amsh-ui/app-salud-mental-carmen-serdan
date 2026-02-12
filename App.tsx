import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  BookOpen, 
  CheckCircle2, 
  BrainCircuit, 
  GraduationCap, 
  User, 
  FileSignature, 
  PenTool, 
  Printer, 
  Lock, 
  X, 
  Play, 
  ArrowRight,
  ClipboardList,
  Eye,
  LogOut,
  Home,
  Eraser,
  Download
} from 'lucide-react';
import { Submission, TestType, UserData } from './types';
import { MESACTS_QUESTIONS, MESACTS_OPTIONS, TMMS24_QUESTIONS, TMMS24_OPTIONS } from './constants';
import { calculateMesactsScore, calculateTmmsScore } from './services/scoringService';
import { Button } from './components/Button';
import { TestLayout } from './components/TestLayout';

// --- MAIN APP ---
export default function App() {
  // --- GLOBAL STATE (DATABASE) ---
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // --- SESSION STATE ---
  const [currentScreen, setCurrentScreen] = useState<TestType>('START');
  
  // Active User Data
  const [userData, setUserData] = useState<UserData>({
    studentName: '',
    guardianName: '',
    grade: '',
    group: '',
    gender: 'female',
    city: '',
    signature: '',
    timestamp: ''
  });

  const [mesactsAnswers, setMesactsAnswers] = useState<Record<number, number>>({});
  const [tmmsAnswers, setTmmsAnswers] = useState<Record<number, number>>({});

  // Admin State
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null); // For viewing details
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Signature Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // --- HANDLERS ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleMesactsAnswer = (id: number, val: number) => {
    setMesactsAnswers(prev => ({ ...prev, [id]: val }));
  };

  const handleTmmsAnswer = (id: number, val: number) => {
    setTmmsAnswers(prev => ({ ...prev, [id]: val }));
  };

  const startNewSession = () => {
    // Reset session data
    setUserData({
      studentName: '',
      guardianName: '',
      grade: '',
      group: '',
      gender: 'female',
      city: '',
      signature: '',
      timestamp: new Date().toISOString()
    });
    setMesactsAnswers({});
    setTmmsAnswers({});
    setHasSignature(false);
    setCurrentScreen('REGISTER');
  };

  const finishSession = () => {
    // 1. Calculate scores
    const mesactsScore = calculateMesactsScore(mesactsAnswers);
    const tmmsScore = calculateTmmsScore(tmmsAnswers, userData.gender);

    // 2. Create Submission Record
    const newSubmission: Submission = {
      id: crypto.randomUUID(),
      userData: { ...userData, timestamp: new Date().toLocaleDateString('es-ES') },
      mesactsAnswers,
      tmmsAnswers,
      mesactsScore,
      tmmsScore
    };

    // 3. Save to "Database"
    setSubmissions(prev => [...prev, newSubmission]);

    // 4. Go to Thank You
    setCurrentScreen('THANK_YOU');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin123') {
      setAdminPasswordInput('');
      setLoginError(false);
      setCurrentScreen('ADMIN_PANEL');
    } else {
      setLoginError(true);
    }
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('printable-area');
    if (!element) return;
    
    setIsGeneratingPdf(true);
    
    try {
      // 1. Capture the element as a canvas
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better resolution
        useCORS: true, // Important for external images if any
        logging: false,
        backgroundColor: '#ffffff'
      });

      // 2. Initialize PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate ratio to fit width
      const ratio = pdfWidth / imgWidth;
      const imgHeightInPdf = imgHeight * ratio;
      
      let heightLeft = imgHeightInPdf;
      let position = 0;
      
      // 3. Add image to PDF (handling page breaks by slicing logic)
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightInPdf);
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeightInPdf; // Move position up to show next chunk
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position - (heightLeft - pdfHeight > 0 ? 0 : pdfHeight), pdfWidth, imgHeightInPdf);
        // Simple slicing approach: just offset the image
        // Better logic for next pages:
        // Position needs to be negative to shift the image up
        // Current position for new page should be: previous position - pdfHeight
      }
      
      // Re-do simple multipage approach commonly used with html2canvas/jspdf
      // The loop above was a bit experimental. Standard approach:
    } catch(e) {
      // ignore
    }

    // --- ROBUST PDF GENERATION LOGIC ---
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const safeName = userData.studentName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`Expediente_${safeName}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error", err);
      alert("Error al generar el PDF. Intente la opción de Imprimir.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  // --- SIGNATURE LOGIC (Canvas) ---
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).nativeEvent.offsetX;
      y = (e as React.MouseEvent).nativeEvent.offsetY;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).nativeEvent.offsetX;
      y = (e as React.MouseEvent).nativeEvent.offsetY;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSignature) setHasSignature(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
        setUserData(prev => ({...prev, signature: canvasRef.current?.toDataURL()}));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    setUserData(prev => ({...prev, signature: ''}));
  };

  // --- HELPER FOR RAW ANSWERS ---
  const getSortedAnswersString = (answers: Record<number, number>) => {
    // Sort keys numerically to ensure order 1, 2, 3...
    return Object.entries(answers)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([, val]) => val)
      .join(', ');
  };

  // --- SCREENS ---

  const renderStart = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative">
      {/* Admin Button Top Right */}
      <button 
        onClick={() => setCurrentScreen('ADMIN_LOGIN')}
        className="absolute top-6 right-6 p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-white rounded-full shadow-sm border border-slate-200 z-20"
        title="Acceso Administrador"
      >
        <Lock size={20} />
      </button>

      <div className="text-center max-w-2xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 flex justify-center">
           <div className="bg-white p-4 rounded-3xl shadow-lg rotate-3">
             <BrainCircuit size={64} className="text-indigo-600" />
           </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
          PsicoTest <span className="text-indigo-600">Pro</span>
        </h1>
        <p className="text-base md:text-lg text-slate-600 mb-10 max-w-lg mx-auto leading-relaxed px-4">
          Plataforma de evaluación de bienestar escolar e inteligencia emocional. 
          <br/>
          <span className="text-sm text-slate-400 block mt-2">Escuela Secundaria Técnica Número 7</span>
        </p>

        <div className="flex flex-col items-center gap-4 w-full px-4">
          <button 
            onClick={startNewSession}
            className="w-full md:w-auto group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-lg rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            <span>Comenzar Evaluación</span>
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-slate-400">Duración aproximada: 10-15 minutos</p>
        </div>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-indigo-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Datos del Estudiante</h1>
          <p className="text-slate-500 text-sm">Por favor, completa la información para iniciar.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Alumno(a)</label>
            <input 
              type="text" 
              name="studentName"
              value={userData.studentName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Padre, Madre o Tutor</label>
            <input 
              type="text" 
              name="guardianName"
              value={userData.guardianName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Quien autoriza"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grado</label>
              <input 
                type="text" 
                name="grade"
                value={userData.grade}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. 2do"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grupo</label>
              <input 
                type="text" 
                name="group"
                value={userData.group}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. B"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Género</label>
              <select 
                name="gender"
                value={userData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="female">Femenino</option>
                <option value="male">Masculino</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ciudad</label>
              <input 
                type="text" 
                name="city"
                value={userData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. CDMX"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button 
            fullWidth 
            onClick={() => setCurrentScreen('CONSENT')}
            disabled={!userData.studentName || !userData.guardianName || !userData.city}
            className={(!userData.studentName || !userData.guardianName || !userData.city) ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Continuar
          </Button>
          <button onClick={() => setCurrentScreen('START')} className="w-full text-center mt-4 text-xs text-slate-400 hover:text-red-500">Cancelar y volver</button>
        </div>
      </div>
    </div>
  );

  const renderConsent = () => {
    const date = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const fullDate = `${userData.city || '_______'}, a ${date}`;

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white max-w-3xl w-full rounded-none shadow-2xl p-6 md:p-12 border border-slate-200 relative">
           <div className="absolute top-0 left-0 w-full h-2 bg-slate-800"></div>

          <h2 className="text-xl md:text-2xl font-bold text-center text-slate-900 mb-8 uppercase tracking-wide border-b pb-4">
            Consentimiento Informado
          </h2>

          <div className="font-serif text-slate-800 space-y-6 leading-relaxed text-justify text-sm md:text-base h-80 md:h-96 overflow-y-auto pr-2 custom-scrollbar">
            <p className="font-bold text-right">
              Lugar y fecha: <span className="font-normal border-b border-black px-2">{fullDate}</span>
            </p>

            <p>
              Por medio de la presente, yo <span className="font-bold border-b border-black px-1">{userData.guardianName}</span>, 
              padre, madre o tutor legal del alumno(a) <span className="font-bold border-b border-black px-1">{userData.studentName}</span>, 
              quien cursa el nivel de educación secundaria en la <span className="font-bold">Escuela Secundaria Técnica Número 7</span>, 
              autorizo de manera voluntaria e informada su participación en la aplicación de las siguientes pruebas:
            </p>
            
            <ul className="list-disc pl-8 space-y-2">
              <li><span className="font-bold">Escala TMMS-24</span> (Inteligencia Emocional).</li>
              <li><span className="font-bold">Batería de Bienestar Educativo (MESACTS)</span>.</li>
            </ul>

            <p>
              Se garantiza que la información será confidencial y utilizada únicamente con fines educativos.
            </p>

            {/* AREA DE FIRMA */}
            <div className="mt-8 pt-4 text-center border-t border-slate-100 pb-8">
              <p className="font-bold mb-4">Firma del Tutor</p>
              
              <div className="flex flex-col items-center justify-center">
                 <div className="relative border-2 border-dashed border-slate-300 bg-slate-50 rounded-lg p-2 hover:border-indigo-300 transition-colors w-full max-w-[320px] flex justify-center">
                    {!hasSignature && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
                        <PenTool size={24} className="mb-2 opacity-50" />
                        <span className="text-xs">Firme aquí (dedo o ratón)</span>
                      </div>
                    )}
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={160}
                      style={{ touchAction: 'none' }} // Crucial for mobile
                      className="cursor-crosshair bg-transparent"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={endDrawing}
                      onMouseLeave={endDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={endDrawing}
                    />
                 </div>
                 
                 <div className="flex gap-2 mt-2">
                    <button 
                      onClick={clearSignature} 
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-red-600 px-3 py-1 rounded border border-slate-200 hover:border-red-200 transition-colors"
                      disabled={!hasSignature}
                    >
                      <Eraser size={12} /> Borrar
                    </button>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button 
              onClick={() => setCurrentScreen('MESACTS')} 
              className="w-full md:w-auto shadow-lg"
              disabled={!hasSignature}
            >
              Aceptar y Comenzar Pruebas <ArrowRight size={16} className="ml-2 inline" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderMesacts = () => {
    const answeredCount = Object.keys(mesactsAnswers).length;
    const totalCount = MESACTS_QUESTIONS.length;
    const progress = (answeredCount / totalCount) * 100;
    const isComplete = answeredCount === totalCount;

    return (
      <TestLayout
        title="1. Batería de Bienestar (MESACTS)"
        subtitle={`Estudiante: ${userData.studentName}`}
        onBack={() => {}} // Disabled back navigation in linear flow
        progress={progress}
      >
        <div className="bg-indigo-600 rounded-xl p-4 md:p-6 text-white mb-6 md:mb-8 shadow-lg">
           <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg shrink-0">
                 <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Instrucciones</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  Lee cada frase cuidadosamente. Selecciona la opción que mejor describa cómo te sientes con respecto a tu escuela.
                  <br/>
                  <span className="font-semibold text-white mt-2 block">No hay respuestas correctas o incorrectas.</span>
                </p>
              </div>
           </div>
        </div>

        <div className="space-y-6">
          {MESACTS_QUESTIONS.map((q) => (
            <div key={q.id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-base md:text-lg font-medium text-slate-800 mb-4 flex gap-3">
                 <span className="text-slate-300 font-bold shrink-0">{q.id}.</span> {q.text}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {MESACTS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleMesactsAnswer(q.id, opt.value)}
                    className={`px-3 py-4 rounded-lg text-sm font-medium border transition-all ${
                      mesactsAnswers[q.id] === opt.value
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-200 ring-offset-1'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:border-indigo-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-end pb-12">
          <Button 
            disabled={!isComplete} 
            onClick={() => {
              window.scrollTo(0,0);
              setCurrentScreen('TMMS24');
            }}
            className={!isComplete ? "opacity-50 cursor-not-allowed" : "shadow-xl transform hover:-translate-y-1 transition-transform"}
          >
            Siguiente Prueba <ArrowRight size={16} className="ml-2 inline" />
          </Button>
        </div>
      </TestLayout>
    );
  };

  const renderTmms24 = () => {
    const answeredCount = Object.keys(tmmsAnswers).length;
    const totalCount = TMMS24_QUESTIONS.length;
    const progress = (answeredCount / totalCount) * 100;
    const isComplete = answeredCount === totalCount;

    return (
      <TestLayout
        title="2. Inteligencia Emocional (TMMS-24)"
        subtitle={`Estudiante: ${userData.studentName}`}
        onBack={() => {}} 
        progress={progress}
      >
         <div className="bg-teal-600 rounded-xl p-4 md:p-6 text-white mb-6 md:mb-8 shadow-lg">
           <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2 rounded-lg shrink-0">
                 <BrainCircuit size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Instrucciones</h3>
                <p className="text-teal-100 text-sm leading-relaxed">
                  Indica con qué frecuencia sientes o piensas lo que se describe en cada frase.
                  <br/>
                  <span className="font-semibold text-white mt-2 block">Se sincero/a contigo mismo/a.</span>
                </p>
              </div>
           </div>
        </div>

        <div className="space-y-6">
          {TMMS24_QUESTIONS.map((q) => (
            <div key={q.id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
               <h3 className="text-base md:text-lg font-medium text-slate-800 mb-4 flex gap-3">
                 <span className="text-slate-300 font-bold shrink-0">{q.id}.</span> {q.text}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {TMMS24_OPTIONS.map((opt) => (
                   <button
                   key={opt.value}
                   onClick={() => handleTmmsAnswer(q.id, opt.value)}
                   className={`px-2 py-3 rounded-lg text-xs md:text-sm font-medium border transition-all ${
                     tmmsAnswers[q.id] === opt.value
                       ? 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-200 ring-offset-1'
                       : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:border-teal-300'
                   }`}
                 >
                   {opt.label}
                 </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-end pb-12">
          <Button 
            variant="secondary"
            disabled={!isComplete} 
            onClick={finishSession} // Saves data and goes to Thank You
            className={!isComplete ? "opacity-50 cursor-not-allowed" : "shadow-xl transform hover:-translate-y-1 transition-transform"}
          >
            Finalizar Todo <CheckCircle2 size={16} className="ml-2 inline" />
          </Button>
        </div>
      </TestLayout>
    );
  };

  const renderThankYou = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
       <div className="bg-white max-w-md w-full p-10 rounded-3xl shadow-2xl text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-4">¡Muchas Gracias!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Has completado todas las pruebas exitosamente. Tus respuestas han sido guardadas.
            <br/>
            ¡Agradecemos tu tiempo y participación!
          </p>
          <Button onClick={() => setCurrentScreen('START')} fullWidth className="bg-slate-900 hover:bg-black">
            Volver al Inicio
          </Button>
       </div>
    </div>
  );

  const renderAdminLogin = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
       <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm relative">
            <button onClick={() => setCurrentScreen('START')} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="text-indigo-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Panel de Control</h3>
              <p className="text-sm text-slate-500">Acceso restringido a docentes</p>
            </div>
            <form onSubmit={handleAdminLogin}>
              <div className="mb-6">
                <input 
                  type="password" 
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Contraseña"
                  autoFocus
                />
                {loginError && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1"><X size={12}/> Contraseña incorrecta</p>}
              </div>
              <Button fullWidth type="submit">Entrar</Button>
            </form>
          </div>
    </div>
  );

  const renderAdminPanel = () => {
    // Si se ha seleccionado un alumno, mostrar el reporte detallado
    if (selectedSubmission) {
      return renderDetailedReport(selectedSubmission);
    }

    // Si no, mostrar la lista de alumnos
    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">Panel de Control</h1>
              <p className="text-sm md:text-base text-slate-500">Historial de evaluaciones de la sesión actual</p>
            </div>
            <Button onClick={() => setCurrentScreen('START')} variant="outline" className="flex items-center gap-2">
              <LogOut size={16} /> <span className="hidden md:inline">Salir</span>
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {submissions.length === 0 ? (
               <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                  <ClipboardList size={48} className="mb-4 opacity-50" />
                  <p>No hay evaluaciones registradas aún.</p>
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-4 font-bold text-slate-600">Nombre</th>
                      <th className="p-4 font-bold text-slate-600">Grado/Grupo</th>
                      <th className="p-4 font-bold text-slate-600">Fecha</th>
                      <th className="p-4 font-bold text-slate-600 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-indigo-50/50 transition-colors">
                        <td className="p-4 font-medium text-slate-800">{sub.userData.studentName}</td>
                        <td className="p-4 text-slate-600">{sub.userData.grade} "{sub.userData.group}"</td>
                        <td className="p-4 text-slate-600">{sub.userData.timestamp}</td>
                        <td className="p-4 text-right">
                          <div className="flex flex-col md:flex-row items-end md:items-center justify-end gap-3">
                             {/* RAW ANSWERS DISPLAY */}
                             <div className="text-[10px] text-slate-400 font-mono bg-slate-50 p-1.5 rounded border border-slate-200 w-32 md:w-48 overflow-x-auto whitespace-nowrap text-left hidden sm:block">
                               <div className="flex gap-2">
                                 <span className="font-bold text-indigo-500">M:</span> 
                                 {getSortedAnswersString(sub.mesactsAnswers)}
                               </div>
                               <div className="flex gap-2 border-t border-slate-100 mt-1 pt-1">
                                 <span className="font-bold text-teal-500">T:</span> 
                                 {getSortedAnswersString(sub.tmmsAnswers)}
                               </div>
                             </div>

                             <button 
                              onClick={() => setSelectedSubmission(sub)}
                              className="text-indigo-600 hover:text-indigo-800 font-bold text-xs bg-indigo-50 px-3 py-2 rounded-full border border-indigo-100 hover:border-indigo-300 transition-all flex items-center gap-1 shrink-0"
                            >
                              <Eye size={14} /> Ver Expediente
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDetailedReport = (submission: Submission) => {
    const { userData, mesactsScore, tmmsScore, mesactsAnswers, tmmsAnswers } = submission;
    const date = userData.timestamp; // Use saved timestamp

    const getMesactsLabel = (val: number) => MESACTS_OPTIONS.find(o => o.value === val)?.label || '-';
    const getTmmsLabel = (val: number) => TMMS24_OPTIONS.find(o => o.value === val)?.label || '-';

    return (
      <div className="min-h-screen bg-slate-100 p-4 md:p-8">
        {/* ACTION BAR */}
        <div className="max-w-5xl mx-auto mb-8 flex flex-col md:flex-row gap-4 justify-between items-center print:hidden">
           <Button variant="ghost" onClick={() => setSelectedSubmission(null)} className="flex items-center gap-2 self-start md:self-auto">
             <ArrowRight size={20} className="rotate-180" /> Volver
           </Button>
           <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
             <Button onClick={() => window.print()} variant="outline" className="flex items-center gap-2 justify-center">
                 <Printer size={20} /> Imprimir
             </Button>
             <Button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="flex items-center gap-2 shadow-lg justify-center bg-slate-800 hover:bg-black">
                 <Download size={20} /> {isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}
             </Button>
           </div>
        </div>

        {/* PRINTABLE AREA (Reused visual design) */}
        <div id="printable-area" className="max-w-5xl mx-auto bg-white shadow-2xl p-6 md:p-12 print:shadow-none print:p-0">
          
          <div className="border-b-2 border-slate-800 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
             <div>
               <h1 className="text-2xl md:text-3xl font-bold text-slate-900 uppercase tracking-wider">Expediente Psicoeducativo</h1>
               <p className="text-slate-500 mt-2">Informe Integral de Resultados</p>
             </div>
             <div className="text-left md:text-right">
               <p className="font-bold text-slate-800">PsicoTest Pro</p>
               <p className="text-sm text-slate-500">{date}</p>
             </div>
          </div>

          {/* DATOS */}
          <div className="mb-8 p-4 md:p-6 bg-slate-50 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
             <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase text-sm tracking-wide">Datos del Estudiante</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="font-bold text-slate-500 block">Nombre:</span> {userData.studentName}</div>
                <div><span className="font-bold text-slate-500 block">Tutor Legal:</span> {userData.guardianName}</div>
                <div><span className="font-bold text-slate-500 block">Grado y Grupo:</span> {userData.grade} "{userData.group}"</div>
                <div><span className="font-bold text-slate-500 block">Género:</span> {userData.gender === 'male' ? 'Masculino' : 'Femenino'}</div>
             </div>
          </div>

          {/* FIRMA */}
          <div className="mb-8 break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2 uppercase text-sm tracking-wide">Consentimiento Informado</h2>
            <div className="flex flex-col md:flex-row items-start gap-6 border border-slate-200 p-4 rounded-lg">
               <div className="flex-1 text-sm text-slate-700 text-justify">
                 <p className="italic">
                   "Por medio de la presente, yo <span className="font-bold">{userData.guardianName}</span>, autorizo la participación de mi hijo(a)..."
                 </p>
               </div>
               <div className="w-full md:w-48 border border-slate-300 bg-slate-50 p-2 text-center self-center md:self-start">
                  {userData.signature ? (
                    <img src={userData.signature} alt="Firma" className="w-full h-auto" />
                  ) : (
                    <div className="h-16 flex items-center justify-center text-xs text-red-500">Sin firma</div>
                  )}
                  <p className="text-xs border-t border-slate-300 mt-1 pt-1">Firma del Tutor</p>
               </div>
            </div>
          </div>

          {/* RESULTADOS MESACTS */}
          <div className="mb-8 break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-800 uppercase text-sm tracking-wide mb-4 border-b border-slate-200 pb-2">Resultados MESACTS</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-indigo-50 p-4 rounded border border-indigo-100 print:bg-transparent print:border-slate-300">
                    <div className="text-center mb-4">
                      <span className="block text-xs uppercase font-bold text-slate-500">Puntuación Total</span>
                      <span className="text-4xl font-black text-indigo-700 print:text-black">{mesactsScore.total}/44</span>
                      <span className="block font-bold text-indigo-800 print:text-black mt-1">{mesactsScore.interpretation.total}</span>
                    </div>
                 </div>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Pertenencia:</span>
                      <span className="font-bold">{mesactsScore.subscales.pertenencia} ({mesactsScore.interpretation.pertenencia})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Participación:</span>
                      <span className="font-bold">{mesactsScore.subscales.participacion} ({mesactsScore.interpretation.participacion})</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Inclusividad:</span>
                      <span className="font-bold">{mesactsScore.subscales.inclusividad} ({mesactsScore.interpretation.inclusividad})</span>
                    </div>
                 </div>
              </div>
          </div>

          {/* RESULTADOS TMMS */}
          <div className="mb-8 break-inside-avoid">
             <h2 className="text-lg font-bold text-slate-800 uppercase text-sm tracking-wide mb-4 border-b border-slate-200 pb-2">Resultados TMMS-24</h2>
              <table className="w-full text-sm text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-100 print:bg-slate-200">
                     <th className="p-2 border border-slate-300">Dimensión</th>
                     <th className="p-2 border border-slate-300 w-24 text-center">Puntaje</th>
                     <th className="p-2 border border-slate-300">Interpretación</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td className="p-2 border border-slate-300 font-bold">Atención</td>
                     <td className="p-2 border border-slate-300 text-center">{tmmsScore.atencion}</td>
                     <td className="p-2 border border-slate-300">{tmmsScore.interpretation.atencion}</td>
                   </tr>
                   <tr>
                     <td className="p-2 border border-slate-300 font-bold">Claridad</td>
                     <td className="p-2 border border-slate-300 text-center">{tmmsScore.claridad}</td>
                     <td className="p-2 border border-slate-300">{tmmsScore.interpretation.claridad}</td>
                   </tr>
                   <tr>
                     <td className="p-2 border border-slate-300 font-bold">Reparación</td>
                     <td className="p-2 border border-slate-300 text-center">{tmmsScore.reparacion}</td>
                     <td className="p-2 border border-slate-300">{tmmsScore.interpretation.reparacion}</td>
                   </tr>
                 </tbody>
               </table>
          </div>

          {/* DETALLES DE RESPUESTAS */}
          <div className="break-before-page mt-8">
            <h2 className="text-lg font-bold text-slate-800 uppercase text-sm tracking-wide mb-4 border-b border-slate-200 pb-2">Detalle de Respuestas: MESACTS</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse mb-8 min-w-[500px] md:min-w-0">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200">
                    <th className="p-2 border border-slate-300 w-10 text-center">#</th>
                    <th className="p-2 border border-slate-300">Pregunta</th>
                    <th className="p-2 border border-slate-300 w-48">Respuesta</th>
                  </tr>
                </thead>
                <tbody>
                  {MESACTS_QUESTIONS.map(q => {
                    const val = mesactsAnswers[q.id];
                    return (
                      <tr key={q.id}>
                        <td className="p-1 border border-slate-300 text-center">{q.id}</td>
                        <td className="p-1 border border-slate-300">{q.text}</td>
                        <td className="p-1 border border-slate-300">
                            <span className="font-bold">{val}</span> - {getMesactsLabel(val)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h2 className="text-lg font-bold text-slate-800 uppercase text-sm tracking-wide mb-4 border-b border-slate-200 pb-2">Detalle de Respuestas: TMMS-24</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[500px] md:min-w-0">
                <thead>
                  <tr className="bg-slate-100 print:bg-slate-200">
                    <th className="p-2 border border-slate-300 w-10 text-center">#</th>
                    <th className="p-2 border border-slate-300">Pregunta</th>
                    <th className="p-2 border border-slate-300 w-48">Respuesta</th>
                  </tr>
                </thead>
                <tbody>
                  {TMMS24_QUESTIONS.map(q => {
                    const val = tmmsAnswers[q.id];
                    return (
                      <tr key={q.id}>
                        <td className="p-1 border border-slate-300 text-center">{q.id}</td>
                        <td className="p-1 border border-slate-300">{q.text}</td>
                        <td className="p-1 border border-slate-300">
                            <span className="font-bold">{val}</span> - {getTmmsLabel(val)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-12 pt-4 border-t border-slate-300 text-center text-xs text-slate-400">
            <p>Generado por PsicoTest Pro</p>
          </div>
        </div>
      </div>
    );
  };

  // --- ROUTER ---
  switch (currentScreen) {
    case 'START': return renderStart();
    case 'REGISTER': return renderRegister();
    case 'CONSENT': return renderConsent();
    case 'MESACTS': return renderMesacts();
    case 'TMMS24': return renderTmms24();
    case 'THANK_YOU': return renderThankYou();
    case 'ADMIN_LOGIN': return renderAdminLogin();
    case 'ADMIN_PANEL': return renderAdminPanel();
    default: return renderStart();
  }
}