import React, { useState, useEffect, useCallback } from 'react';

// --- DATA & HELPERS ---

// Hardcoded key events data. In a real-world scenario, this might come from a dedicated API.
const keyEvents = {
    "2025-07-21": "SEC Chair states Ethereum is 'not a security', boosting market confidence.",
    "2025-07-18": "President Trump signs the GENIUS Act, the first major US crypto regulation.",
    "2025-07-15": "US CPI data comes in lower than expected, signaling reduced inflation.",
    "2025-06-22": "Market drops on US-Iran geopolitical tensions, causing over $1B in liquidations.",
    "2025-06-23": "Markets rebound quickly as traders 'buy the dip' following geopolitical panic.",
    "2025-06-17": "US Senate passes the GENIUS Act, providing regulatory clarity for stablecoins.",
    "2025-06-05": "Circle's successful IPO on the NYSE signals strong institutional interest in crypto.",
    "2025-05-27": "Data shows large, long-term Bitcoin holders begin taking profits, signaling a potential top.",
    "2025-05-14": "CoinDesk's Consensus, a major industry conference, kicks off in Toronto.",
};

// Helper function to get color based on the index value
const getSentimentStyle = (value) => {
    if (value === null || value === undefined) return { color: 'text-gray-400', bgColor: 'bg-gray-700', borderColor: 'border-gray-600', textColor: 'text-gray-400' };
    if (value <= 24) return { color: 'text-red-400', bgColor: 'bg-red-900/50', borderColor: 'border-red-400', textColor: 'text-red-400' };
    if (value <= 49) return { color: 'text-yellow-400', bgColor: 'bg-yellow-900/50', borderColor: 'border-yellow-400', textColor: 'text-yellow-400' };
    if (value <= 74) return { color: 'text-green-400', bgColor: 'bg-green-900/50', borderColor: 'border-green-400', textColor: 'text-green-400' };
    return { color: 'text-teal-300', bgColor: 'bg-teal-900/50', borderColor: 'border-teal-300', textColor: 'text-teal-300' };
};


// --- UI COMPONENTS ---

// SVG Icon for the refresh button
const RefreshIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l4.663-4.663m-4.663 0l-3.181 3.183" />
    </svg>
);

// Component for the main gauge display
const Gauge = ({ value }) => {
    const style = getSentimentStyle(value);
    const circumference = 2 * Math.PI * 90; // 90 is the radius
    const offset = value === null ? circumference : circumference - (value / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle className="text-gray-700/50" strokeWidth="10" stroke="currentColor" fill="transparent" r="90" cx="100" cy="100" />
                <circle className={`${style.color} transition-all duration-1000 ease-out`} strokeWidth="10" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="90" cx="100" cy="100" />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-6xl sm:text-7xl font-bold ${style.color}`}>{value ?? '--'}</span>
            </div>
        </div>
    );
};

// Component for displaying historical data points
const InfoCard = ({ title, value, classification }) => {
    if (value === null || value === undefined) {
        return (
            <div className="flex-1 p-4 bg-gray-800/50 rounded-lg border border-gray-700 text-center animate-pulse">
                 <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
                 <div className="h-8 bg-gray-700 rounded w-1/2 mx-auto"></div>
            </div>
        );
    }
    const style = getSentimentStyle(value);
    return (
        <div className={`flex-1 p-4 ${style.bgColor} rounded-lg border ${style.borderColor} text-center transition-colors duration-500`}>
            <p className="text-sm text-gray-300">{title}</p>
            <p className={`text-2xl font-bold ${style.color}`}>{value}</p>
            <p className="text-xs text-gray-400">{classification}</p>
        </div>
    );
};

// Countdown Timer Component
const CountdownTimer = ({ seconds, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(seconds);

    useEffect(() => { setTimeLeft(seconds); }, [seconds]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) {
            if (timeLeft === 0) onComplete();
            return;
        }
        const intervalId = setInterval(() => { setTimeLeft(timeLeft - 1); }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, onComplete]);

    if (timeLeft === null || timeLeft < 0) return <div className="text-sm text-gray-400">Checking for update...</div>;

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const secs = timeLeft % 60;

    return (
        <div className="text-sm text-gray-400">
            Next update in: <span className="font-mono text-gray-200">{String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
        </div>
    );
};

// Component for the historical data table
const HistoricalTable = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="mt-8 w-full">
                <h3 className="text-xl font-semibold mb-4 text-center">Historical Data</h3>
                <p className="text-center text-gray-400">Loading historical data...</p>
            </div>
        );
    }

    return (
        <div className="mt-8 w-full">
            <h3 className="text-xl font-semibold mb-4 text-center">Past 3 Months</h3>
            <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800/50">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-800/80 sticky top-0 backdrop-blur-sm">
                        <tr>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3 text-center">Value</th>
                            <th scope="col" className="px-4 py-3 text-center">Sentiment</th>
                            <th scope="col" className="px-4 py-3 text-right">BTC Price (USD)</th>
                            <th scope="col" className="px-4 py-3">Key Event</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => {
                            const date = new Date(parseInt(item.timestamp) * 1000);
                            const dateString = date.toLocaleDateString('en-AU');
                            const isoDateString = date.toISOString().split('T')[0];
                            const style = getSentimentStyle(item.value);
                            const event = keyEvents[isoDateString];

                            return (
                                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-4 font-medium whitespace-nowrap">{dateString}</td>
                                    <td className={`px-4 py-4 text-center font-bold ${style.textColor}`}>{item.value}</td>
                                    <td className={`px-4 py-4 text-center ${style.textColor}`}>{item.value_classification}</td>
                                    <td className="px-4 py-4 text-right font-mono text-gray-400">
                                        {item.btcPrice ? `$${item.btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}
                                    </td>
                                    <td className="px-4 py-4 text-gray-400 text-xs">{event || ''}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
    const [indexData, setIndexData] = useState({ now: null, yesterday: null, lastWeek: null, lastMonth: null, threeMonthsAgo: null });
    const [historicalData, setHistoricalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [timeUntilUpdate, setTimeUntilUpdate] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [fngResponse, btcResponse] = await Promise.all([
                fetch('https://api.alternative.me/fng/?limit=91&format=json'),
                fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=90&interval=daily')
            ]);

            if (!fngResponse.ok) throw new Error(`F&G API error! status: ${fngResponse.status}`);
            if (!btcResponse.ok) throw new Error(`CoinGecko API error! status: ${btcResponse.status}`);

            const fngJson = await fngResponse.json();
            const btcJson = await btcResponse.json();

            if (fngJson && fngJson.data && btcJson && btcJson.prices) {
                const priceMap = new Map();
                btcJson.prices.forEach(([timestamp, price]) => {
                    priceMap.set(new Date(timestamp).toISOString().split('T')[0], price);
                });

                const combinedData = fngJson.data.map(fngItem => ({
                    ...fngItem,
                    btcPrice: priceMap.get(new Date(parseInt(fngItem.timestamp) * 1000).toISOString().split('T')[0])
                }));

                setHistoricalData(combinedData);
                setIndexData({ 
                    now: combinedData[0], 
                    yesterday: combinedData[1], 
                    lastWeek: combinedData[7], 
                    lastMonth: combinedData[30], 
                    threeMonthsAgo: combinedData[90] 
                });
                
                const updateTimestamp = parseInt(combinedData[0].timestamp) * 1000;
                setLastUpdated(new Date(updateTimestamp).toLocaleString('en-AU'));
                setTimeUntilUpdate(parseInt(combinedData[0].time_until_update));

            } else {
                throw new Error('Incomplete data received from APIs.');
            }
        } catch (e) {
            console.error("Failed to fetch data:", e);
            setError(e.message || 'Failed to load data. An API might be temporarily down.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-4xl mx-auto bg-gray-800/30 rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-700/50">
                <header className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Crypto Fear & Greed Index</h1>
                        {lastUpdated && <p className="text-xs text-gray-400 mt-1">Last updated: {lastUpdated}</p>}
                    </div>
                    <button onClick={fetchData} disabled={loading} className="p-2 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Refresh Data">
                        <RefreshIcon className={`w-6 h-6 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </header>

                <main className="flex flex-col items-center">
                    {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg mb-4">{error}</p>}
                    <Gauge value={loading ? null : indexData.now?.value} />
                    <h2 className="text-3xl sm:text-4xl font-semibold mt-4">{loading ? 'Loading...' : indexData.now?.value_classification || 'N/A'}</h2>
                    <div className="mt-2 mb-8">
                         <CountdownTimer seconds={timeUntilUpdate} onComplete={fetchData} />
                    </div>
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <InfoCard title="Yesterday" value={indexData.yesterday?.value} classification={indexData.yesterday?.value_classification} />
                        <InfoCard title="Last Week" value={indexData.lastWeek?.value} classification={indexData.lastWeek?.value_classification} />
                        <InfoCard title="Last Month" value={indexData.lastMonth?.value} classification={indexData.lastMonth?.value_classification} />
                        <InfoCard title="3 Months Ago" value={indexData.threeMonthsAgo?.value} classification={indexData.threeMonthsAgo?.value_classification} />
                    </div>
                    <HistoricalTable data={historicalData} />
                </main>
                
                <footer className="text-center mt-8 pt-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500">Data provided by <a href="https://alternative.me/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">alternative.me</a> and <a href="https://www.coingecko.com/en/api" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">CoinGecko</a></p>
                </footer>
            </div>
        </div>
    );
}
