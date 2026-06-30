import React, { useState } from 'react';
import { Phone, FileText, Heart, CheckCircle, Compass, Smile, Coffee, Wind, Eye } from 'lucide-react';

interface EmergencyServicesProps {
  isDark?: boolean;
}

export default function EmergencyServices({ isDark = true }: EmergencyServicesProps) {
  const [selectedResourceType, setSelectedResourceType] = useState<'hotlines' | 'extensions' | 'grounding'>('hotlines');
  
  // Extension generator state
  const [extType, setExtType] = useState<'Academic' | 'Work'>('Academic');
  const [recipient, setRecipient] = useState('');
  const [courseName, setCourseName] = useState('');
  const [reason, setReason] = useState('sudden emergency/illness');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [copied, setCopied] = useState(false);

  // Grounding exercise active step
  const [groundingStep, setGroundingStep] = useState(0);

  const hotlines = [
    { name: "National Support Network", phone: "988", description: "Free, confidential, and warm support for any level of mental distress, available 24/7." },
    { name: "Emergency Services", phone: "911", description: "For immediate safety, physical security, or medical assistance." },
    { name: "Crisis Text Line", text: "HOME to 741741", description: "Connect with a compassionate, trained counselor over text 24/7." },
    { name: "Student Well-being Hub", phone: "Dean of Students", description: "Your university department for academic emergency accommodations." },
    { name: "Support Services & Care", description: "Immediate access to university counselor on-call or student health desk." }
  ];

  const groundingSteps = [
    { title: "Look around your space", instruction: "Gently look around and name 5 beautiful or comforting things you can see (e.g., your warm coffee mug, a plant, sunlight on the desk, a favorite picture, your laptop screen)." },
    { title: "Touch your immediate surroundings", instruction: "Acknowledge 4 things you can physically feel (e.g., the texture of your keys, the warmth of your hands, the solid support of your chair, the fabric of your sleeve)." },
    { title: "Listen with soft attention", instruction: "Identify 3 calming or steady things you can hear (e.g., the quiet hum of your room, wind rustling outside, the gentle rhythm of your breathing)." },
    { title: "Breathe in & notice scents", instruction: "Take a deep, slow breath and notice 2 things you can smell (e.g., warm tea, fresh paper, or just the crisp, comforting flow of air)." },
    { title: "Savor & taste the moment", instruction: "Acknowledge 1 pleasant thing you can taste (or take a refreshing sip of cool water and feel how replenishing it is)." }
  ];

  const handleGenerateExtension = () => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    let draft = "";
    
    if (extType === 'Academic') {
      draft = `Subject: Extension Request & Academic Accommodation - ${courseName || "[Course Name]"} - [Your Name]

Dear Professor ${recipient || "[Professor's Last Name]"},

I am writing to respectfully request a short extension on the upcoming deadline for ${courseName || "our course assignment"}. 

Due to an unexpected personal circumstance, I am currently attending to an urgent situation that has temporarily taken me away from my academic work. I want to ensure I submit high-quality work that accurately reflects my learning, and I estimate I will be ready to complete and submit this within the next 48 to 72 hours.

I would be incredibly grateful for your understanding, flexibility, and support. Please let me know if this adjustment is acceptable, or if we can establish a modified timeline that fits our course schedule.

Thank you very much for your time and kind consideration.

Warm regards,

[Your Name]
Student ID: [Your ID Number]`;
    } else {
      draft = `Subject: Urgent Update: Temporary Emergency Leave Notice - [Your Name]

Dear ${recipient || "[Manager/Supervisor Name]"},

Please accept this message as a notification that I must request a short-term personal leave starting today to address an unexpected personal urgency. 

I apologize for the short notice, but this matter requires my immediate attention. During this brief window, I may have limited access to my email, but I am actively coordinating to ensure our current team objectives remain covered. I anticipate being back on ${today} or tomorrow morning to provide a complete update.

Thank you so much for your understanding, flexibility, and supportive leadership.

Best regards,

[Your Name]
[Your Role]`;
    }
    
    setGeneratedDraft(draft);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="emergency-services-container" className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md transition-all duration-300 ${
      isDark ? 'bg-[#121f35]/50 border-teal-500/10' : 'bg-white border-slate-200'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-teal-500/10 pb-5 mb-6 gap-4">
        <div>
          <h2 className={`text-lg font-bold flex items-center gap-2 font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <Compass className="w-5 h-5 text-teal-400" />
            Comfort Canopy & ResQ Space
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
            Gentle utilities and calming exercises designed to reduce academic stress and restore peace of mind.
          </p>
        </div>
        
        {/* Subtabs selector */}
        <div className={`flex p-1 rounded-xl gap-1 border self-start md:self-auto shrink-0 ${
          isDark ? 'bg-[#0a111e]/80 border-teal-500/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            id="tab-hotlines"
            onClick={() => setSelectedResourceType('hotlines')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              selectedResourceType === 'hotlines' 
                ? isDark 
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20 shadow-sm' 
                  : 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm'
                : isDark 
                ? 'text-slate-400 hover:text-white' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Support Helplines
          </button>
          <button
            id="tab-extensions"
            onClick={() => setSelectedResourceType('extensions')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              selectedResourceType === 'extensions' 
                ? isDark 
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20 shadow-sm' 
                  : 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm'
                : isDark 
                ? 'text-slate-400 hover:text-white' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Extension Drafter
          </button>
          <button
            id="tab-grounding"
            onClick={() => setSelectedResourceType('grounding')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              selectedResourceType === 'grounding' 
                ? isDark 
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/20 shadow-sm' 
                  : 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm'
                : isDark 
                ? 'text-slate-400 hover:text-white' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sensory Grounding
          </button>
        </div>
      </div>

      {/* Render selected tool */}
      {selectedResourceType === 'hotlines' && (
        <div id="hotlines-panel" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotlines.map((h, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex items-start gap-3 transition ${
              isDark 
                ? 'bg-[#0b1220]/60 border-teal-500/5 hover:border-teal-500/10 hover:bg-[#0c1626]' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100 shadow-sm'
            }`}>
              <div className="bg-teal-500/10 p-2 rounded-lg text-teal-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-semibold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {h.name}
                  {h.phone && <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${isDark ? 'bg-teal-500/15 text-teal-300' : 'bg-teal-100 text-teal-800 border border-teal-200'}`}>{h.phone}</span>}
                </h3>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{h.description}</p>
                {h.text && (
                  <p className={`text-xs font-mono mt-2 px-2.5 py-1 rounded-md inline-block border ${isDark ? 'text-teal-300 bg-teal-500/10 border-teal-500/15' : 'text-teal-750 bg-teal-50 border-teal-200'}`}>
                    Text: {h.text}
                  </p>
                )}
              </div>
            </div>
          ))}
          <div className={`md:col-span-2 p-4 rounded-xl border flex items-center gap-3 ${isDark ? 'bg-indigo-500/10 border-indigo-500/15 text-slate-300' : 'bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs'}`}>
            <Smile className="w-5 h-5 text-indigo-400 shrink-0 animate-bounce" />
            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <strong>A Friendly Reminder:</strong> Teachers, bosses, and professors are real people who appreciate proactive honesty. Sending a respectful draft notice can alleviate 90% of your current anxiety immediately. Use our <strong>Extension Drafter</strong> on the next tab to write it in seconds!
            </p>
          </div>
        </div>
      )}

      {selectedResourceType === 'extensions' && (
        <div id="extensions-panel" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className={`text-sm font-bold flex items-center gap-1.5 uppercase tracking-wider font-display ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
              <Coffee className="w-4 h-4" />
              Supportive Extension Builder
            </h3>
            
            <div className="space-y-1">
              <label className={`block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Accommodation Type</label>
              <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-100 border-slate-200'}`}>
                <button
                  type="button"
                  onClick={() => setExtType('Academic')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                    extType === 'Academic' 
                      ? isDark 
                        ? 'bg-[#152238] text-white border border-teal-500/10 shadow-sm' 
                        : 'bg-white text-slate-800 border border-slate-300 shadow-xs'
                      : isDark 
                      ? 'text-slate-400' 
                      : 'text-slate-500'
                  }`}
                >
                  Academic (Professor)
                </button>
                <button
                  type="button"
                  onClick={() => setExtType('Work')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition ${
                    extType === 'Work' 
                      ? isDark 
                        ? 'bg-[#152238] text-white border border-teal-500/10 shadow-sm' 
                        : 'bg-white text-slate-800 border border-slate-300 shadow-xs'
                      : isDark 
                      ? 'text-slate-400' 
                      : 'text-slate-500'
                  }`}
                >
                  Workplace (Manager)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className={`block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {extType === 'Academic' ? "Professor's Last Name" : "Manager's Name"}
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={extType === 'Academic' ? "e.g., Peterson" : "e.g., Jennifer"}
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 transition ${
                  isDark 
                    ? 'bg-[#09111e] border-teal-500/10 text-white focus:ring-teal-500/50' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-teal-500/30'
                }`}
              />
            </div>

            {extType === 'Academic' && (
              <div className="space-y-1">
                <label className={`block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Class / Subject Name</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g., History 101 or Java CS"
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 transition ${
                    isDark 
                      ? 'bg-[#09111e] border-teal-500/10 text-white focus:ring-teal-500/50' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:ring-teal-500/30'
                  }`}
                />
              </div>
            )}

            <button
              id="btn-generate-extension"
              type="button"
              onClick={handleGenerateExtension}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 transition shadow-md cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Draft Mindful Message
            </button>
          </div>

          <div className="lg:col-span-3 flex flex-col h-full min-h-[250px]">
            <span className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Your Polished Draft</span>
            {generatedDraft ? (
              <div className={`rounded-xl border p-4 flex-1 flex flex-col justify-between ${isDark ? 'bg-[#09111e] border-teal-500/10' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
                <pre className={`text-xs font-mono overflow-y-auto whitespace-pre-wrap max-h-[300px] flex-1 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                  {generatedDraft}
                </pre>
                <div className="flex justify-end gap-2 pt-3 border-t border-teal-500/5 mt-3">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer ${copied ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'bg-teal-700 hover:bg-teal-650 text-white shadow-xs'}`}
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                    {copied ? "Copied to clipboard!" : "Copy Draft Text"}
                  </button>
                </div>
              </div>
            ) : (
              <div className={`rounded-xl border p-6 flex-1 flex flex-col items-center justify-center text-center ${isDark ? 'bg-[#09111e]/40 border-teal-500/5 text-slate-500' : 'bg-slate-50/50 border-slate-200 text-slate-500'}`}>
                <FileText className="w-8 h-8 mb-2 opacity-30 text-teal-400" />
                <p className="text-xs max-w-xs leading-relaxed">
                  Input recipient and subject names on the left, then click draft. We'll compose a respectful, respectful emergency message to give you breathing room.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedResourceType === 'grounding' && (
        <div id="grounding-panel" className={`p-6 rounded-xl border text-center max-w-xl mx-auto transition-colors duration-300 ${
          isDark ? 'bg-[#09111e]/80 border-teal-500/10' : 'bg-slate-50 border-slate-200 shadow-sm'
        }`}>
          <Wind className="w-8 h-8 text-teal-400 mx-auto mb-3 animate-soothe-pulse" />
          <h3 className={`text-base font-bold mb-2 font-display ${isDark ? 'text-white' : 'text-slate-800'}`}>5-4-3-2-1 Mindful Sensory Grounding</h3>
          <p className={`text-xs mb-6 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            When deadlines feel overwhelming, your thoughts may spin into the future. This classic cognitive centering exercise brings you safely back to the present moment.
          </p>

          <div className={`p-5 rounded-xl border min-h-[140px] flex flex-col justify-between mb-4 transition-colors ${
            isDark ? 'bg-[#121f35]/80 border-teal-500/5' : 'bg-white border-slate-200 shadow-inner'
          }`}>
            <div className="space-y-1">
              <span className={`text-[10px] font-bold uppercase tracking-widest block font-mono ${isDark ? 'text-teal-300' : 'text-teal-600'}`}>
                Step {groundingStep + 1} of 5
              </span>
              <h4 className={`text-base font-bold font-display flex items-center justify-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {groundingStep === 0 && <Eye className="w-4 h-4 text-teal-400" />}
                {groundingStep === 1 && <Compass className="w-4 h-4 text-teal-400" />}
                {groundingStep === 2 && <Wind className="w-4 h-4 text-teal-400" />}
                {groundingStep === 3 && <Coffee className="w-4 h-4 text-teal-400" />}
                {groundingStep === 4 && <Smile className="w-4 h-4 text-teal-400" />}
                {groundingSteps[groundingStep].title}
              </h4>
              <p className={`text-xs leading-relaxed max-w-md mx-auto pt-1 ${isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>{groundingSteps[groundingStep].instruction}</p>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              {groundingSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGroundingStep(i)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === groundingStep ? 'bg-teal-400 w-4' : isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-300 hover:bg-slate-400'}`}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setGroundingStep(prev => Math.max(0, prev - 1))}
              disabled={groundingStep === 0}
              className={`px-3 py-1.5 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Previous Step
            </button>
            <button
              onClick={() => {
                if (groundingStep === 4) {
                  setGroundingStep(0);
                } else {
                  setGroundingStep(prev => Math.min(4, prev + 1));
                }
              }}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow cursor-pointer"
            >
              {groundingStep === 4 ? "Restart Practice" : "Next Sensory Step"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
