import React from 'react';

interface MenuSalesStatsProps {
  token: string;
}

export const MenuSalesStats: React.FC<MenuSalesStatsProps> = ({ token }) => {
  if (!token) return null;

  // Mock statistics data
  const stats = {
    totalRevenue: 2450.75,
    ordersCompleted: 184,
    averageOrderValue: 13.32,
    topItems: [
      { name: 'Margherita Pizza', count: 72, revenue: 935.28, percentage: 85 },
      { name: 'Truffle Parmesan Fries', count: 64, revenue: 543.36, percentage: 70 },
      { name: 'Chocolate Lava Cake', count: 32, revenue: 223.68, percentage: 40 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">
              Total Revenue
            </span>
            <span className="text-2xl font-black text-gray-800">
              ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-xs text-green-500 font-bold flex items-center gap-1 mt-2">
            <span>📈</span> +12.5% this week
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">
              Orders Completed
            </span>
            <span className="text-2xl font-black text-gray-800">
              {stats.ordersCompleted}
            </span>
          </div>
          <span className="text-xs text-green-500 font-bold flex items-center gap-1 mt-2">
            <span>📈</span> +8.2% this week
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-1 uppercase tracking-wider">
              Avg. Order Value
            </span>
            <span className="text-2xl font-black text-gray-800">
              ${stats.averageOrderValue.toFixed(2)}
            </span>
          </div>
          <span className="text-xs text-red-500 font-bold flex items-center gap-1 mt-2">
            <span>📉</span> -1.5% this week
          </span>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Popular items list */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
            <span>🔥</span> Top Selling Items
          </h4>
          <div className="space-y-4">
            {stats.topItems.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-700">
                  <span>{item.name}</span>
                  <span className="text-gray-400 font-medium">
                    {item.count} sold (${item.revenue.toFixed(2)})
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-500 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly sales trend chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-gray-800 mb-1 flex items-center gap-2">
              <span>📊</span> Weekly Sales Trend
            </h4>
            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
              Visual daily revenue breakdown
            </p>
          </div>

          <div className="flex items-end justify-between h-32 gap-2 mt-4 px-2">
            {[40, 60, 45, 90, 75, 110, 85].map((val, idx) => {
              const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                  <div className="w-full relative flex justify-center">
                    <span className="absolute -top-7 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none z-10">
                      ${val * 5}
                    </span>
                    <div
                      className="bg-red-100 group-hover:bg-red-500 w-full rounded-t-lg transition duration-200"
                      style={{ height: `${(val / 120) * 100}%`, minHeight: '4px' }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">{days[idx]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
