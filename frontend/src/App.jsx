import { useState } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import PublishSection from './components/PublishSection';
import Sidebar from './components/Sidebar';
import { simplifyText } from './services/api';

function App() {
  const [text, setText] = useState('');
  const [audience, setAudience] = useState('All Employees');
  const [language, setLanguage] = useState('English');
  const [tone, setTone] = useState('Professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const handleSimplify = async () => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const data = await simplifyText(text, audience, language, tone);
      setResult(data);
    } catch (error) {
      console.error('Error simplifying text:', error);
      setResult({
        final_output: "We've experienced an issue connecting to the AI service. Please ensure the backend server is running and try again.",
        audience: audience,
        validation_passed: false
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 ml-64 relative overflow-y-auto h-screen">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[50%] h-[50%] bg-brand-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 px-8 py-10 max-w-[1440px] mx-auto">
          <Header />
          
          {/* 3 Column Desktop Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-8">
            {/* Input Column */}
            <div className="xl:col-span-4">
              <InputSection 
                text={text}
                setText={setText}
                audience={audience}
                setAudience={setAudience}
                language={language}
                setLanguage={setLanguage}
                tone={tone}
                setTone={setTone}
                onSimplify={handleSimplify}
                isProcessing={isProcessing}
              />
            </div>

            {/* AI Output Column */}
            <div className="xl:col-span-5">
              <OutputSection result={result} isProcessing={isProcessing} />
            </div>

            {/* Publishing Column */}
            <div className="xl:col-span-3">
              <PublishSection result={result} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
