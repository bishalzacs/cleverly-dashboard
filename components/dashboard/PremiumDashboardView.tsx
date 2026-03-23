"use client";

export const PremiumDashboardView = () => {
  return (
    <div className="flex flex-col gap-6 p-8 h-full overflow-y-auto custom-scrollbar animate-fade-in slide-in-from-bottom-4">
      
      {/* Top Section: Total Holding & Mini Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Total Holding Card */}
        <div className="md:col-span-4 bg-[#111116] rounded-2xl p-6 border border-white/5 relative overflow-hidden group hover-float">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl group-hover:bg-brand-primary/20 transition-all duration-700"></div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <span className="text-text-secondary text-sm font-medium">Total Holding</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-text-secondary bg-white/5 px-3 py-1 rounded-full border border-white/5">6M</span>
              <button className="text-text-secondary hover:text-white bg-white/5 w-6 h-6 rounded-full flex items-center justify-center border border-white/5">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">$ 12,304.11</h1>
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-text-secondary">Return</span>
              <span className="text-[#10B981] flex items-center bg-[#10B981]/10 px-2 py-0.5 rounded text-xs font-semibold">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                +3.5% ($ 532)
              </span>
            </div>
          </div>
        </div>

        {/* My Portfolio List */}
        <div className="md:col-span-8 bg-[#111116] rounded-2xl p-6 border border-white/5 flex flex-col hover-float">
          <div className="flex justify-between items-center mb-6">
            <span className="text-text-secondary text-sm font-medium">My Portfolio</span>
            <div className="flex space-x-2">
              <button className="text-xs text-white bg-white/5 px-4 py-1.5 rounded-full border border-white/5 hover:bg-white/10 transition-colors">See all</button>
              <button className="text-white bg-white/5 w-8 h-8 rounded-full flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
          
          {/* Portfolio Cards Row */}
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar flex-1 items-stretch">
            {/* Card 1 */}
            <div className="min-w-[140px] bg-[#1A1A22] rounded-xl p-4 border border-white/5 flex flex-col justify-between group cursor-pointer hover:bg-[#20202A] transition-colors relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#10B981]/10 rounded-full blur-xl group-hover:bg-[#10B981]/20 transition-all"></div>
                <div className="mb-4 relative z-10">
                    <p className="text-lg font-semibold text-white tracking-tight">$ 1,721.3</p>
                    <p className="text-[10px] text-[#10B981] font-medium">+0.3% ($17k)</p>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-white/5 text-xs text-text-secondary group-hover:text-white transition-colors">AAPL</div>
                    <span className="text-[10px] text-text-secondary">Units <strong className="text-white">104</strong></span>
                </div>
            </div>
            {/* Card 2 */}
            <div className="min-w-[140px] bg-[#1A1A22] rounded-xl p-4 border border-white/5 flex flex-col justify-between group cursor-pointer hover:bg-[#20202A] transition-colors relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#10B981]/10 rounded-full blur-xl group-hover:bg-[#10B981]/20 transition-all"></div>
                <div className="mb-4 relative z-10">
                    <p className="text-lg font-semibold text-white tracking-tight">$ 1,521.3</p>
                    <p className="text-[10px] text-[#10B981] font-medium">+0.3% ($17k)</p>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-white/5 text-xs text-text-secondary group-hover:text-white transition-colors">TSLA</div>
                    <span className="text-[10px] text-text-secondary">Units <strong className="text-white">124</strong></span>
                </div>
            </div>
            {/* Card 3 */}
            <div className="min-w-[140px] bg-[#1A1A22] rounded-xl p-4 border border-white/5 flex flex-col justify-between group cursor-pointer hover:bg-[#20202A] transition-colors relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#F43F5E]/10 rounded-full blur-xl group-hover:bg-[#F43F5E]/20 transition-all"></div>
                <div className="mb-4 relative z-10">
                    <p className="text-lg font-semibold text-white tracking-tight">$ 1,721.3</p>
                    <p className="text-[10px] text-[#F43F5E] font-medium">-0.3% (-$17k)</p>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-white/5 text-xs text-text-secondary group-hover:text-white transition-colors">MSFT</div>
                    <span className="text-[10px] text-text-secondary">Units <strong className="text-white">10</strong></span>
                </div>
            </div>
            {/* Card 4 */}
            <div className="min-w-[140px] bg-[#1A1A22] rounded-xl p-4 border border-white/5 flex flex-col justify-between group cursor-pointer hover:bg-[#20202A] transition-colors relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#10B981]/10 rounded-full blur-xl group-hover:bg-[#10B981]/20 transition-all"></div>
                <div className="mb-4 relative z-10">
                    <p className="text-lg font-semibold text-white tracking-tight">$ 1,721.3</p>
                    <p className="text-[10px] text-[#10B981] font-medium">+0.3% ($17k)</p>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-white/5 text-xs text-text-secondary group-hover:text-white transition-colors">GOOG</div>
                    <span className="text-[10px] text-text-secondary">Units <strong className="text-white">110</strong></span>
                </div>
            </div>
             {/* Card 5 */}
             <div className="min-w-[140px] bg-[#1A1A22] rounded-xl p-4 border border-white/5 flex flex-col justify-between group cursor-pointer hover:bg-[#20202A] transition-colors relative overflow-hidden">
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#F43F5E]/10 rounded-full blur-xl group-hover:bg-[#F43F5E]/20 transition-all"></div>
                <div className="mb-4 relative z-10">
                    <p className="text-lg font-semibold text-white tracking-tight">$ 1,721.3</p>
                    <p className="text-[10px] text-[#F43F5E] font-medium">-0.3% (-$17k)</p>
                </div>
                <div className="flex justify-between items-end relative z-10">
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-white/5 text-xs text-text-secondary group-hover:text-white transition-colors">NVDA</div>
                    <span className="text-[10px] text-text-secondary">Units <strong className="text-white">104</strong></span>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Performance Chart */}
      <div className="bg-[#111116] rounded-2xl p-6 border border-white/5 hover-float cursor-default">
        <div className="flex justify-between items-center mb-8">
            <span className="text-text-secondary text-sm font-medium">Portfolio Performance</span>
            <div className="flex space-x-2">
                {['1D', '1W', '1M', '6M', '1Y'].map(time => (
                    <button key={time} className={`w-10 h-10 rounded-full text-xs font-medium transition-all ${time === '6M' ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(0,102,255,0.4)]' : 'bg-transparent text-text-secondary border border-white/10 hover:text-white hover:bg-white/5'}`}>
                        {time}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Placeholder for SVG Line Chart with Grid & Tooltip matched perfectly to screenshot */}
        <div className="h-64 w-full relative group">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                {/* Defs for gradients */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0066FF" stopOpacity="0.3"></stop>
                        <stop offset="100%" stopColor="#0066FF" stopOpacity="0.0"></stop>
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#0066FF"></stop>
                        <stop offset="50%" stopColor="#4D94FF"></stop>
                        <stop offset="100%" stopColor="#0066FF"></stop>
                    </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                <path d="M0,40 L1000,40" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                <path d="M0,80 L1000,80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                <path d="M0,120 L1000,120" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                <path d="M0,160 L1000,160" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none" />
                
                {/* Area Fill */}
                <path d="M0,50 C100,50 150,120 200,120 C250,120 300,90 350,90 C400,90 420,110 450,110 C500,110 520,70 580,70 C650,70 700,50 780,50 C850,50 900,100 950,100 L1000,120 L1000,200 L0,200 Z" fill="url(#chartGradient)" />
                
                {/* Line */}
                <path d="M0,50 C100,50 150,120 200,120 C250,120 300,90 350,90 C400,90 420,110 450,110 C500,110 520,70 580,70 C650,70 700,50 780,50 C850,50 900,100 950,100 L1000,120" fill="none" stroke="url(#lineGradient)" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(0,102,255,0.5)]" />
                
                {/* Tooltip dot */}
                <circle cx="450" cy="110" r="5" fill="#0066FF" className="drop-shadow-[0_0_10px_rgba(0,102,255,1)] opacity-0 group-hover:opacity-100 transition-opacity" />
                {/* Vertical dash line for tooltip */}
                <path d="M450,110 L450,200" stroke="#0066FF" strokeWidth="1" strokeDasharray="4 4" className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </svg>

            {/* CSS Tooltip positioned absolutely for visual match */}
            <div className="absolute top-[10%] left-[45%] -translate-x-1/2 -translate-y-[120%] bg-[#1A1A22] border border-white/10 rounded-xl p-3 shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20 w-48 point-events-none">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-text-secondary">1st Mar 2024</span>
                    <span className="text-[10px] text-text-secondary tracking-widest">...</span>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-white text-lg font-bold tracking-tight">$ 16,500</span>
                    <span className="bg-[#10B981]/10 text-[#10B981] text-[10px] px-1.5 py-0.5 rounded flex items-center">
                        <svg className="w-2.5 h-2.5 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        3.5%
                    </span>
                </div>
                {/* Tooltip arrow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#1A1A22]"></div>
            </div>

            {/* Y axis labels */}
            <div className="absolute left-0 top-0 h-[200px] flex flex-col justify-between text-[9px] text-text-secondary py-1 pointer-events-none">
                <span>200k</span>
                <span>150k</span>
                <span>100k</span>
                <span>50k</span>
                <span>10k</span>
            </div>

            {/* X axis labels */}
            <div className="flex justify-between w-[95%] mx-auto mt-4 text-[9px] text-text-secondary px-2">
                <span>1st Jan</span>
                <span>15th Jan</span>
                <span>1st Feb</span>
                <span>15th Feb</span>
                <span>1st Mar</span>
                <span>15th Mar</span>
                <span>1st Apr</span>
                <span>15th Apr</span>
                <span>1st May</span>
                <span>15th May</span>
                <span>1st Jun</span>
                <span>15th Jun</span>
                <span>1st Jul</span>
            </div>
        </div>
      </div>

      {/* Bottom Section: Table & Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Portfolio Overview Table */}
        <div className="lg:col-span-8 bg-[#111116] rounded-2xl p-6 border border-white/5 hover-float">
            <div className="flex justify-between items-center mb-6">
                <span className="text-text-secondary text-sm font-medium">Portfolio Overview</span>
                <div className="flex space-x-1 bg-[#1A1A22] border border-white/5 p-1 rounded-full">
                    {['All', 'Gainers', 'Losers'].map(filter => (
                        <button key={filter} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === 'All' ? 'bg-brand-primary text-white shadow-md' : 'text-text-secondary hover:text-white'}`}>
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-white/5 text-xs text-text-secondary pb-4">
                            <th className="pb-4 font-normal">Stock</th>
                            <th className="pb-4 font-normal">Last Price <span className="opacity-50 text-[10px]">↑↓</span></th>
                            <th className="pb-4 font-normal">Change <span className="opacity-50 text-[10px]">↑↓</span></th>
                            <th className="pb-4 font-normal">Market Cap <span className="opacity-50 text-[10px]">↑↓</span></th>
                            <th className="pb-4 font-normal">Volume <span className="opacity-50 text-[10px]">↑↓</span></th>
                            <th className="pb-4 font-normal text-right">Last 7 days <span className="opacity-50 text-[10px]">↑↓</span></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {/* Row 1 */}
                        <tr className="border-b border-white/5 group transition-colors hover:bg-white/5">
                            <td className="py-4 flex items-center space-x-3">
                                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs text-text-secondary">T</div>
                                <span className="font-semibold text-white">TSLA</span>
                            </td>
                            <td className="py-4 text-white">$26,000.21</td>
                            <td className="py-4 text-[#10B981]">+3.4%</td>
                            <td className="py-4 text-text-secondary">$ 564.06 B</td>
                            <td className="py-4 text-text-secondary">$ 379B</td>
                            <td className="py-4 text-right">
                                <svg className="w-12 h-4 inline-block drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]" viewBox="0 0 50 20" preserveAspectRatio="none">
                                    <path d="M0,15 Q10,20 20,10 T40,5 L50,0" fill="none" stroke="#10B981" strokeWidth="2" />
                                    <circle cx="50" cy="0" r="2" fill="#10B981" />
                                </svg>
                            </td>
                        </tr>
                        {/* Row 2 */}
                        <tr className="group transition-colors hover:bg-white/5">
                            <td className="py-4 flex items-center space-x-3">
                                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-xs text-text-secondary">A</div>
                                <span className="font-semibold text-white">AAPL</span>
                            </td>
                            <td className="py-4 text-white">$32,000.21</td>
                            <td className="py-4 text-[#F43F5E]">-3.4%</td>
                            <td className="py-4 text-text-secondary">$ 564.06 B</td>
                            <td className="py-4 text-text-secondary">$ 379B</td>
                            <td className="py-4 text-right">
                                <svg className="w-12 h-4 inline-block drop-shadow-[0_0_4px_rgba(244,63,94,0.5)]" viewBox="0 0 50 20" preserveAspectRatio="none">
                                    <path d="M0,5 Q10,0 20,10 T40,15 L50,20" fill="none" stroke="#F43F5E" strokeWidth="2" />
                                    <circle cx="50" cy="20" r="2" fill="#F43F5E" />
                                </svg>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* Watchlist */}
        <div className="lg:col-span-4 bg-[#111116] rounded-2xl p-6 border border-white/5 hover-float">
            <div className="flex justify-between items-center mb-6">
                <span className="text-text-secondary text-sm font-medium">Watchlist</span>
            </div>
            {/* Filter Pills */}
            <div className="flex space-x-1 mb-6">
                {['Most Viewed', 'Gainers', 'Losers'].map(filter => (
                    <button key={filter} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors border ${filter === 'Most Viewed' ? 'bg-brand-primary text-white border-brand-primary' : 'bg-transparent border-white/10 text-text-secondary hover:text-white hover:bg-white/5'}`}>
                        {filter}
                    </button>
                ))}
            </div>

            <div className="flex flex-col space-y-4">
                {/* Watchlist Item 1 */}
                <div className="flex justify-between items-center group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-text-secondary group-hover:bg-brand-primary/20 transition-colors group-hover:text-brand-primary">S</div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">Spotify</span>
                            <span className="text-[10px] text-text-secondary">NYSE: SPOT</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-white">$ 2,310.5</span>
                        <span className="text-[10px] text-[#10B981] font-medium">+2.34%</span>
                    </div>
                </div>
                {/* Watchlist Item 2 */}
                <div className="flex justify-between items-center group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs text-text-secondary group-hover:bg-brand-primary/20 transition-colors group-hover:text-brand-primary">a</div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white">Amazon</span>
                            <span className="text-[10px] text-text-secondary">NYSE: AMZN</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-white">$ 2,310.5</span>
                        <span className="text-[10px] text-[#10B981] font-medium">+2.34%</span>
                    </div>
                </div>
            </div>
        </div>

      </div>

    </div>
  );
};
