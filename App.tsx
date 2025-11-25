
import React, { useState, useEffect, useCallback } from 'react';
import { LocationPoint, IterationStep, SimulationState, Character, CalculationDetails } from './types';
import { initializeCenter, runIterationStep } from './services/mathUtils';
import { fetchCharacterCommentary } from './services/geminiService';
import { CharacterAvatar } from './components/CharacterAvatar';
import { Controls } from './components/Controls';
import { Visualization } from './components/Visualization';
import { BackgroundDecorations } from './components/Decorations';
import { SlideLayout } from './components/SlideLayout';
import { ChevronRight, ChevronLeft, Map, Database, TrendingUp, CheckCircle, Info, Calculator, X } from 'lucide-react';

// Initial Data - 4 Demand Points (Markets)
const INITIAL_POINTS: LocationPoint[] = [
  { id: '1', name: '深圳平湖 (D1)', x: 85, y: 15, volume: 800, rate: 1.2, weight: 960, type: 'market' }, // High volume, far SE
  { id: '2', name: '佛山三山 (D2)', x: 25, y: 65, volume: 500, rate: 0.8, weight: 400, type: 'market' }, // Med volume, West
  { id: '3', name: '东莞常平 (D3)', x: 70, y: 55, volume: 600, rate: 1.0, weight: 600, type: 'market' }, // Med volume, Center-East
  { id: '4', name: '中山三角 (D4)', x: 20, y: 25, volume: 400, rate: 1.5, weight: 600, type: 'market' }, // Low volume, High rate, SW
];

// Helper Component for Math Display
const MathExplanation: React.FC<{ step: IterationStep }> = ({ step }) => {
  const calc = step.calculation;
  if (!calc) return <div className="text-gray-400 text-sm">暂无计算数据</div>;

  const isInitial = calc.stepType === 'initial';

  return (
    <div className="bg-slate-800 text-white p-3 md:p-4 rounded-lg shadow-inner font-mono text-sm border border-slate-600 h-full overflow-y-auto">
      <h5 className="text-orange-400 font-bold mb-3 flex items-center gap-2 sticky top-0 bg-slate-800 pb-2 border-b border-slate-700">
        <Calculator size={16} />
        {isInitial ? "第0步: 初始重心法公式" : `第${step.step}步: 迭代重心法公式`}
      </h5>
      
      {/* Formula Description */}
      <div className="mb-4 text-xs text-slate-300 italic">
        {isInitial 
          ? "初始坐标 = (权重×坐标)之和 ÷ 总权重" 
          : "新坐标 = (权重×坐标/距离)之和 ÷ (权重/距离)之和"}
      </div>

      {/* X Calculation */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg md:text-xl font-bold text-blue-300">X = </span>
          <div className="flex flex-col items-center">
            <span className="border-b border-white px-2 mb-1">{calc.numeratorX.toFixed(2)}</span>
            <span>{calc.denominatorX.toFixed(2)}</span>
          </div>
          <span className="text-lg md:text-xl font-bold text-green-400">= {step.x.toFixed(2)}</span>
        </div>
      </div>

      {/* Y Calculation */}
      <div>
        <div className="flex items-center gap-3">
          <span className="text-lg md:text-xl font-bold text-blue-300">Y = </span>
          <div className="flex flex-col items-center">
            <span className="border-b border-white px-2 mb-1">{calc.numeratorY.toFixed(2)}</span>
            <span>{calc.denominatorY.toFixed(2)}</span>
          </div>
          <span className="text-lg md:text-xl font-bold text-green-400">= {step.y.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Slide State
  const [currentSlide, setCurrentSlide] = useState(0);
  const TOTAL_SLIDES = 4;

  // Simulation State
  const [simulation, setSimulation] = useState<SimulationState>({
    points: INITIAL_POINTS,
    currentIteration: 0,
    history: [],
    converged: false,
    threshold: 0.1
  });

  const [commentary, setCommentary] = useState<string>("同学们好！我是铁头，今天我们来帮这四个客户找一个最佳的配送中心！");
  const [activeCharacter, setActiveCharacter] = useState<Character>(Character.LOCOMOTIVE);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [showMath, setShowMath] = useState(false); // Controls Math Panel visibility

  // Initialize Simulation
  useEffect(() => {
    const { result, calculation } = initializeCenter(INITIAL_POINTS);
    const initialStep: IterationStep = {
      step: 0,
      x: result.x,
      y: result.y,
      distanceCost: 0,
      calculation
    };
    
    setSimulation(prev => ({
      ...prev,
      history: [initialStep]
    }));
  }, []);

  // Logic to process next step
  const handleNextStep = useCallback(async () => {
    if (simulation.converged) return;

    setSimulation(prev => {
      const currentStep = prev.history[prev.currentIteration];
      const nextResult = runIterationStep(currentStep.x, currentStep.y, prev.points, prev.currentIteration + 1);
      
      const dx = Math.abs(nextResult.x - currentStep.x);
      const dy = Math.abs(nextResult.y - currentStep.y);
      const isConverged = dx < prev.threshold && dy < prev.threshold;

      return {
        ...prev,
        history: [...prev.history, nextResult],
        currentIteration: prev.currentIteration + 1,
        converged: isConverged
      };
    });
    // Auto show math when manually stepping for educational purpose
    setShowMath(true); 
  }, [simulation.converged]);

  // Commentary Effect
  useEffect(() => {
    if (simulation.currentIteration > 0) {
      const current = simulation.history[simulation.currentIteration];
      const prev = simulation.history[simulation.currentIteration - 1];
      
      const chars = [Character.LOCOMOTIVE, Character.CONTAINER];
      const char = chars[simulation.currentIteration % 2];
      setActiveCharacter(char);

      fetchCharacterCommentary(char, current, prev).then(setCommentary);
    }
  }, [simulation.currentIteration, simulation.history]);

  // Auto Run Effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoRunning && !simulation.converged) {
      interval = setInterval(() => {
        handleNextStep();
      }, 1500);
    } else {
      setIsAutoRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRunning, simulation.converged, handleNextStep]);

  const handleReset = () => {
    const { result, calculation } = initializeCenter(INITIAL_POINTS);
    setSimulation({
      points: INITIAL_POINTS,
      currentIteration: 0,
      history: [{
        step: 0,
        x: result.x,
        y: result.y,
        distanceCost: 0,
        calculation
      }],
      converged: false,
      threshold: 0.1
    });
    setCommentary("系统重置完成。准备重新计算选址。");
    setActiveCharacter(Character.LOCOMOTIVE);
    setIsAutoRunning(false);
    setShowMath(false);
  };

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, TOTAL_SLIDES - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  // --- Slide Renderers ---

  const renderTitleSlide = () => (
    <div className="flex flex-col items-center justify-center h-full text-center relative p-4">
       <div className="flex space-x-12 items-end mb-4 md:mb-8 animate-fade-in-up transform scale-75 md:scale-100 origin-bottom">
          <CharacterAvatar character={Character.LOCOMOTIVE} size="xl" />
          <CharacterAvatar character={Character.CONTAINER} size="lg" />
       </div>
       <div className="z-10 bg-white/80 p-6 md:p-12 rounded-lg border border-blue-100 shadow-xl backdrop-blur-sm max-w-2xl">
         <h1 className="text-3xl md:text-6xl font-cute text-blue-900 mb-2 md:mb-4 tracking-wider">物流中心选址</h1>
         <div className="h-1 w-20 md:w-32 bg-orange-500 mx-auto mb-4 md:mb-6"></div>
         <h2 className="text-xl md:text-3xl text-gray-600 font-bold mb-2">重心法迭代模型演示</h2>
         <p className="text-blue-500 font-mono mt-2 md:mt-4 text-sm md:text-lg">Optimal Location Selection Simulation</p>
       </div>
       <div className="absolute bottom-4 md:bottom-10 text-gray-400 font-mono text-xs md:text-sm">
         Guangzhou Railway Polytechnic © 2025
       </div>
    </div>
  );

  const renderConceptSlide = () => (
    <SlideLayout title="原理概述 (Theoretical Basis)">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 h-full items-center px-2 md:px-4">
        <div className="bg-white p-4 md:p-8 rounded-lg border-l-4 border-blue-600 shadow-sm flex flex-col justify-center space-y-4 md:space-y-8">
          <div className="flex items-start gap-3 md:gap-4">
             <div className="bg-blue-100 p-2 md:p-4 rounded-md text-blue-800 shrink-0">
               <Database size={24} className="md:w-7 md:h-7" />
             </div>
             <div>
               <h3 className="text-base md:text-xl font-bold text-gray-800 mb-1">单一设施选址 (Single Facility)</h3>
               <p className="text-gray-600 text-xs md:text-sm leading-relaxed">目标：在区域内寻找一个最佳位置建立配送中心，负责向周边固定需求的客户点供货。</p>
             </div>
          </div>
          <div className="flex items-start gap-3 md:gap-4">
             <div className="bg-orange-100 p-2 md:p-4 rounded-md text-orange-700 shrink-0">
               <TrendingUp size={24} className="md:w-7 md:h-7" />
             </div>
             <div>
               <h3 className="text-base md:text-xl font-bold text-gray-800 mb-1">成本最小化 (Minimizing Cost)</h3>
               <p className="text-gray-600 text-xs md:text-sm leading-relaxed">总运费 = Σ (距离 × 供货量 × 运费率)。通过迭代，寻找使总运费最小的坐标点。</p>
             </div>
          </div>
          <div className="flex items-start gap-3 md:gap-4">
             <div className="bg-gray-100 p-2 md:p-4 rounded-md text-gray-700 shrink-0">
               <Map size={24} className="md:w-7 md:h-7" />
             </div>
             <div>
               <h3 className="text-base md:text-xl font-bold text-gray-800 mb-1">迭代逻辑 (Iterative Logic)</h3>
               <p className="text-gray-600 text-xs md:text-sm leading-relaxed">由于距离计算包含平方根，无法直接求解析解。我们利用导数为0的条件构造迭代公式，逐步逼近最优解。</p>
             </div>
          </div>
        </div>
        
        <div className="hidden md:flex flex-col items-center justify-center relative">
          <div className="bg-blue-900/5 p-10 rounded-full">
            <CharacterAvatar character={Character.CONTAINER} size="xl" />
          </div>
          <div className="bg-white p-6 rounded-lg mt-8 shadow-md border border-gray-200 max-w-sm text-center relative">
             <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rotate-45 border-t border-l border-gray-200"></div>
             <p className="font-cute text-xl text-blue-900">“需求量大或者运费贵的地方，会把中心点‘拉’过去哦！”</p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );

  const renderSimulationSlide = () => (
    <SlideLayout title="仿真演示 (Simulation)" className="pb-2">
      {/* 
        Layout: Stacked on Mobile/Tablets (lg breakpoint), Side-by-Side on Desktop.
        This ensures chart is big enough on small screens.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6 h-full">
        
        {/* Left (or Top): Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col relative overflow-hidden order-2 lg:order-1 h-[450px] lg:h-full flex-shrink-0">
          
          {/* Scenario Description Header */}
          <div className="p-2 md:p-4 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100 flex-shrink-0">
             <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-700 mt-1 hidden md:block">
                   <Info size={20} />
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-blue-900 text-sm md:text-lg">选址任务：为4个需求点寻找最佳仓储中心</h3>
                   <div className="mt-2 space-y-2 text-xs md:text-sm text-gray-600 bg-white/50 p-2 rounded border border-blue-50">
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                         <span className="flex items-center gap-1 font-bold text-orange-700 whitespace-nowrap">
                            <div className="w-2 h-2 bg-orange-500 inline-block"></div> 需求点:
                         </span>
                         <span>代表客户位置。圆点越大，权重(货量×费率)越大，对中心的"拉力"越强。</span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                         <span className="flex items-center gap-1 font-bold text-red-700 whitespace-nowrap">
                            <div className="w-2 h-2 bg-red-600 rounded-full inline-block"></div> 迭代中心:
                         </span>
                         <span>当前计算的选址位置。它会像被弹簧拉动一样，逐步向运费成本最低点移动。</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Chart */}
          <div className="flex-1 min-h-0 w-full relative p-2">
             <Visualization 
                points={simulation.points} 
                history={simulation.history} 
                currentIteration={simulation.currentIteration} 
              />
          </div>

          {/* Controls */}
          <div className="mt-auto p-2 md:p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center flex-shrink-0 overflow-x-auto">
             <div className="flex items-center gap-2 md:gap-3 px-2 md:px-4 shrink-0">
                <span className="text-gray-500 font-bold text-xs md:text-sm uppercase tracking-wider hidden sm:inline">Step</span>
                <span className="text-xl md:text-3xl font-bold text-blue-600 font-mono">{simulation.currentIteration}</span>
             </div>
             <Controls 
                onNextStep={handleNextStep}
                onReset={handleReset}
                onAutoRun={() => setIsAutoRunning(!isAutoRunning)}
                isAutoRunning={isAutoRunning}
                canNext={!simulation.converged}
              />
          </div>
        </div>

        {/* Right (or Bottom): Info Column */}
        <div className="flex flex-col gap-2 md:gap-4 h-auto lg:h-full order-1 lg:order-2 flex-shrink-0">
          
          {/* Commentary with Mascot Interaction */}
          <div className="bg-blue-600 text-white p-3 md:p-5 rounded-lg shadow-md relative mt-0 md:mt-6 flex-shrink-0 transition-all flex items-center md:block min-h-[60px] md:min-h-0">
             <div className="md:absolute md:-top-8 md:right-4 mr-3 md:mr-0 shrink-0" onClick={() => setShowMath(!showMath)}>
                <div className="group relative">
                  <CharacterAvatar character={activeCharacter} size="sm" className="md:hidden" />
                  <CharacterAvatar character={activeCharacter} size="md" className="hidden md:block" />
                  <div className="absolute -top-6 right-0 bg-white text-blue-900 text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hidden md:block">
                     点我查看公式!
                  </div>
                </div>
             </div>
             <div>
               <h4 className="font-bold mb-1 md:mb-2 text-[10px] md:text-xs uppercase tracking-widest text-blue-200 opacity-80">System Message</h4>
               <p className="font-medium leading-snug text-xs md:text-base line-clamp-2 md:line-clamp-none">{commentary}</p>
             </div>
          </div>

          {/* Stats / Math Panel Toggle */}
          {/* 
            Desktop: flex-1 to fill height, overflow-hidden to scroll inside.
            Mobile: h-auto to fit content (scrolled by SlideLayout).
          */}
          <div className={`bg-white p-2 md:p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col relative
            lg:flex-1 lg:min-h-0 lg:overflow-hidden h-auto overflow-visible
          `}>
             <div className="flex justify-between items-center border-b pb-2 mb-2 flex-shrink-0">
                <h4 className="font-bold text-gray-700 flex items-center gap-2 text-xs md:text-base">
                  {showMath ? <Calculator size={16} className="text-purple-500" /> : <Map size={16} className="text-orange-500" />} 
                  {showMath ? "计算过程 (Math)" : "实时数据 (Data)"}
                </h4>
                {showMath && (
                  <button onClick={() => setShowMath(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
                )}
             </div>
             
             {/* Content Switching */}
             {showMath ? (
               <div className="flex-1 overflow-y-auto min-h-[200px] lg:min-h-0">
                  <MathExplanation step={simulation.history[simulation.currentIteration]} />
               </div>
             ) : (
               <>
                 {/* Existing Stats View */}
                 {simulation.history[simulation.currentIteration] && (
                    <div className="bg-blue-50 p-2 md:p-3 rounded-md border border-blue-100 mb-2 flex-shrink-0">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[10px] md:text-xs font-bold text-blue-600 uppercase">Iteration</span>
                         <span className="text-[10px] md:text-xs font-mono bg-white px-2 rounded text-blue-800">{simulation.currentIteration}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 md:gap-x-4 text-xs md:text-sm font-mono text-gray-700">
                         <div className="flex justify-between"><span>X:</span> <span className="font-bold">{simulation.history[simulation.currentIteration].x.toFixed(2)}</span></div>
                         <div className="flex justify-between"><span>Y:</span> <span className="font-bold">{simulation.history[simulation.currentIteration].y.toFixed(2)}</span></div>
                         <div className="col-span-2 flex justify-between border-t border-blue-200 mt-1 pt-1">
                            <span>Cost:</span>
                            <span className="font-bold text-orange-600">{simulation.history[simulation.currentIteration].distanceCost.toFixed(0)}</span>
                         </div>
                      </div>
                    </div>
                 )}

                 {/* Scrollable History Log */}
                 <div className="flex-1 overflow-y-auto pr-1 space-y-2 border-t pt-2 border-gray-100 relative custom-scrollbar min-h-[200px] lg:min-h-0">
                    {simulation.history.slice().reverse().map((step) => (
                       <div key={step.step} className={`p-2 rounded border text-xs font-mono flex justify-between items-center transition-colors
                          ${step.step === simulation.currentIteration ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-100' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}
                       `}>
                          <div className="flex flex-col">
                            <span className={`font-bold ${step.step === simulation.currentIteration ? 'text-orange-700' : 'text-gray-600'}`}>S{step.step}</span>
                            <span className="text-gray-400">({step.x.toFixed(1)}, {step.y.toFixed(1)})</span>
                          </div>
                          <div className="text-right">
                             <div className="font-bold text-gray-700">{step.distanceCost.toFixed(0)}</div>
                          </div>
                       </div>
                    ))}
                 </div>
               </>
             )}
          </div>
        </div>
      </div>
    </SlideLayout>
  );

  const renderSummarySlide = () => (
    <SlideLayout title="选址报告 (Final Report)">
      <div className="flex flex-col items-center justify-center h-full gap-4 md:gap-8 overflow-y-auto">
        <div className="flex gap-4 md:gap-8 items-end mb-2 md:mb-4 shrink-0">
          <CharacterAvatar character={Character.LOCOMOTIVE} size="md" className="drop-shadow-2xl hidden md:block" />
          <CharacterAvatar character={Character.CONTAINER} size="md" className="drop-shadow-2xl" />
        </div>
        
        <div className="bg-white p-4 md:p-10 rounded-lg shadow-xl border-t-4 border-blue-600 w-full max-w-3xl">
          <div className="flex justify-between items-center mb-4 md:mb-8">
             <h3 className="text-lg md:text-2xl font-bold text-gray-800">计算结果汇总</h3>
             <span className="bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold">Done</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="p-2 md:p-4">
               <p className="text-gray-400 text-xs uppercase tracking-wide mb-1 md:mb-2">Iterations</p>
               <p className="text-2xl md:text-4xl font-bold text-gray-700 font-mono">{simulation.currentIteration}</p>
            </div>
            <div className="p-2 md:p-4">
               <p className="text-gray-400 text-xs uppercase tracking-wide mb-1 md:mb-2">Final Cost</p>
               <p className="text-2xl md:text-4xl font-bold text-orange-500 font-mono">
                 {simulation.history[simulation.currentIteration]?.distanceCost.toFixed(0)}
               </p>
            </div>
            <div className="p-2 md:p-4">
               <p className="text-gray-400 text-xs uppercase tracking-wide mb-1 md:mb-2">Optimal Location</p>
               <p className="text-xl md:text-2xl font-bold text-blue-600 font-mono">
                 ({simulation.history[simulation.currentIteration]?.x.toFixed(2)}, {simulation.history[simulation.currentIteration]?.y.toFixed(2)})
               </p>
            </div>
          </div>

          <div className="mt-4 md:mt-8 bg-gray-50 p-4 md:p-6 rounded text-left border border-gray-100">
             <h4 className="font-bold text-gray-700 mb-2 text-sm md:text-base">决策建议 (Recommendation)</h4>
             <p className="text-gray-600 text-xs md:text-sm">
               根据重心法迭代计算，建议物流配送中心建立在坐标 <span className="font-mono font-bold">({simulation.history[simulation.currentIteration]?.x.toFixed(1)}, {simulation.history[simulation.currentIteration]?.y.toFixed(1)})</span> 附近。
               该位置综合考虑了4个需求点的供货量与运费率，能够使系统总运费成本最低。
             </p>
          </div>
        </div>
      </div>
    </SlideLayout>
  );

  return (
    <div className="fixed inset-0 bg-[#F0F4F8] flex items-center justify-center md:p-8">
      
      {/* PPT Container (Responsive) */}
      <div className="w-full h-full md:max-w-6xl md:aspect-video md:h-auto bg-white md:rounded-xl shadow-2xl relative overflow-hidden flex flex-col slide-shadow ring-1 ring-black/5">
        
        {/* Decorative Background inside slide */}
        <BackgroundDecorations />
        
        {/* Content Area */}
        <div className="flex-1 relative z-10 h-full overflow-hidden">
          {currentSlide === 0 && renderTitleSlide()}
          {currentSlide === 1 && renderConceptSlide()}
          {currentSlide === 2 && renderSimulationSlide()}
          {currentSlide === 3 && renderSummarySlide()}
        </div>

        {/* Navigation Bar (Absolute within container) */}
        <div className="absolute bottom-3 right-4 md:bottom-6 md:right-8 z-50 flex gap-2 md:gap-4 pointer-events-auto">
          <button 
            onClick={prevSlide} 
            disabled={currentSlide === 0}
            className={`p-2 md:p-3 rounded-full shadow-lg transition-all border ${currentSlide === 0 ? 'bg-gray-100 text-gray-300 border-transparent opacity-0' : 'bg-white text-blue-600 border-gray-200 hover:bg-blue-50'}`}
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          
          <div className="px-3 md:px-5 py-2 md:py-3 bg-white/90 backdrop-blur rounded-full font-mono text-blue-900 font-bold shadow-lg border border-gray-200 flex items-center min-w-[60px] md:min-w-[100px] justify-center tracking-widest text-sm md:text-base">
             {currentSlide + 1} / {TOTAL_SLIDES}
          </div>

          <button 
            onClick={nextSlide} 
            disabled={currentSlide === TOTAL_SLIDES - 1}
            className={`p-2 md:p-3 rounded-full shadow-lg transition-all border ${currentSlide === TOTAL_SLIDES - 1 ? 'bg-gray-100 text-gray-300 border-transparent' : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 hover:shadow-xl'}`}
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default App;
