'use client';

import { useState } from 'react';
import { Holding } from '@/types';
import { Plus, X, RefreshCw, Upload } from '@/components/icons/Icons';
import { fetchPriceWithFallback } from '@/lib/calculations';
import Papa from 'papaparse';

interface HoldingsInputProps {
  currentHoldings: Holding[];
  setCurrentHoldings: (holdings: Holding[]) => void;
  isFetchingPrices: boolean;
  setIsFetchingPrices: (value: boolean) => void;
  lastPriceUpdate: Date | null;
  setLastPriceUpdate: (date: Date | null) => void;
}

export default function HoldingsInput({
  currentHoldings,
  setCurrentHoldings,
  isFetchingPrices,
  setIsFetchingPrices,
  lastPriceUpdate,
  setLastPriceUpdate
}: HoldingsInputProps) {
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const totalValue = currentHoldings.reduce((sum, h) => sum + (h.amount || 0), 0);

  const addHolding = () => {
    setCurrentHoldings([
      ...currentHoldings,
      { ticker: '', shares: 0, price: 0, amount: 0, type: 'etf', purchaseDate: '' }
    ]);
  };

  const removeHolding = (index: number) => {
    if (currentHoldings.length > 1) {
      setCurrentHoldings(currentHoldings.filter((_, i) => i !== index));
    }
  };

  const updateHolding = (index: number, field: keyof Holding, value: string | number) => {
    const newHoldings = [...currentHoldings];
    newHoldings[index] = {
      ...newHoldings[index],
      [field]: value
    };
    // Recalculate amount when shares or price change
    if (field === 'shares' || field === 'price') {
      newHoldings[index].amount = newHoldings[index].shares * newHoldings[index].price;
    }
    setCurrentHoldings(newHoldings);
  };

  const fetchSingleTickerPrice = async (ticker: string, index: number) => {
    if (!ticker || ticker.length < 1) return;

    const result = await fetchPriceWithFallback(ticker);

    if (result.success && result.price) {
      const newHoldings = [...currentHoldings];
      newHoldings[index].price = result.price;
      newHoldings[index].amount = newHoldings[index].shares * result.price;
      setCurrentHoldings(newHoldings);
    }
  };

  const fetchAllPrices = async () => {
    if (currentHoldings.length === 0) return;

    setIsFetchingPrices(true);

    try {
      const updatedHoldings = await Promise.all(
        currentHoldings.map(async (holding) => {
          if (!holding.ticker) return holding;
          const result = await fetchPriceWithFallback(holding.ticker);

          if (result.success && result.price) {
            return {
              ...holding,
              price: result.price,
              amount: holding.shares * result.price
            };
          }
          return holding;
        })
      );

      setCurrentHoldings(updatedHoldings);
      setLastPriceUpdate(new Date());
    } catch (error) {
      console.error('Error fetching prices:', error);
      alert('Error updating prices. Please try again or enter prices manually.');
    }

    setIsFetchingPrices(false);
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedHoldings: Holding[] = (results.data as Record<string, string>[]).map((row) => {
            const ticker = (row.Ticker || row.Symbol || row.ticker || row.symbol || '').trim().toUpperCase();
            const shares = parseFloat(row.Shares || row.Quantity || row.shares || row.quantity || '0');
            const price = parseFloat(row.Price || row['Current Price'] || row.price || row['current price'] || '0');
            const type = (row.Type || row.type || 'stock').toLowerCase();
            const purchaseDate = row['Purchase Date'] || row['PurchaseDate'] || row.Date || row.date || '';

            return {
              ticker,
              shares,
              price,
              amount: shares * price,
              type: type === 'etf' ? 'etf' : 'stock',
              purchaseDate
            } as Holding;
          }).filter((h) => h.ticker && h.shares > 0);

          if (parsedHoldings.length > 0) {
            setCurrentHoldings(parsedHoldings);
            fetchAllPrices();
          } else {
            alert('No valid holdings found in CSV. Please ensure your CSV has columns: Ticker, Shares, Price');
          }
        } catch (error) {
          console.error('CSV parsing error:', error);
          alert('Error parsing CSV file. Please check the format and try again.');
        }
        setIsUploadingFile(false);
      },
      error: (error) => {
        console.error('CSV upload error:', error);
        alert('Error reading CSV file');
        setIsUploadingFile(false);
      }
    });

    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Header with actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-medium text-gray-700">Current Holdings</h3>
        <div className="flex gap-2">
          <label className="cursor-pointer px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-1.5">
            <Upload className="w-3 h-3" />
            {isUploadingFile ? 'Uploading...' : 'Upload CSV'}
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
              disabled={isUploadingFile}
            />
          </label>
          <button
            onClick={fetchAllPrices}
            disabled={isFetchingPrices}
            className="px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isFetchingPrices ? 'animate-spin' : ''}`} />
            {isFetchingPrices ? 'Fetching...' : 'Refresh Prices'}
          </button>
        </div>
      </div>

      {lastPriceUpdate && (
        <p className="text-xs text-gray-500">
          Last updated: {lastPriceUpdate.toLocaleTimeString()}
        </p>
      )}

      {/* Empty state */}
      {currentHoldings.length === 1 && !currentHoldings[0].ticker && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
          <p className="text-blue-800 font-medium mb-2">Ready to analyze your portfolio?</p>
          <p className="text-sm text-blue-600">
            Add your first holding below, or upload a CSV file to import your entire portfolio at once.
          </p>
        </div>
      )}

      {/* Holdings table */}
      <div className="border rounded-xl overflow-hidden">
        {/* Mobile card view */}
        <div className="block sm:hidden divide-y divide-gray-200">
          {currentHoldings.map((holding, index) => (
            <div key={index} className="p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={holding.ticker}
                  onChange={(e) => updateHolding(index, 'ticker', e.target.value.toUpperCase())}
                  onBlur={() => fetchSingleTickerPrice(holding.ticker, index)}
                  className="w-24 px-3 py-2 border rounded-lg text-sm font-medium"
                  placeholder="Ticker"
                />
                <button
                  onClick={() => removeHolding(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                  disabled={currentHoldings.length === 1}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Shares</label>
                  <input
                    type="number"
                    value={holding.shares}
                    onChange={(e) => updateHolding(index, 'shares', Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    min="0"
                    step="0.001"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Price</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                    <input
                      type="number"
                      value={holding.price}
                      onChange={(e) => updateHolding(index, 'price', Number(e.target.value))}
                      className="w-full pl-5 pr-2 py-2 border rounded-lg text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <select
                  value={holding.type}
                  onChange={(e) => updateHolding(index, 'type', e.target.value as 'etf' | 'stock')}
                  className="px-3 py-1.5 border rounded-lg text-xs"
                >
                  <option value="etf">ETF</option>
                  <option value="stock">Stock</option>
                </select>
                <span className="text-sm font-bold text-gray-800">
                  ${holding.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
          <div className="p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total Value:</span>
              <span className="text-lg font-bold text-gray-900">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500">Ticker</th>
                <th className="px-2 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                <th className="px-2 py-3 text-right text-xs font-medium text-gray-500">Shares</th>
                <th className="px-2 py-3 text-right text-xs font-medium text-gray-500">Price</th>
                <th className="px-2 py-3 text-right text-xs font-medium text-gray-500">Value</th>
                <th className="px-1 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentHoldings.map((holding, index) => (
                <tr key={index}>
                  <td className="px-2 py-2">
                    <input
                      type="text"
                      value={holding.ticker}
                      onChange={(e) => updateHolding(index, 'ticker', e.target.value.toUpperCase())}
                      onBlur={() => fetchSingleTickerPrice(holding.ticker, index)}
                      className="w-16 px-2 py-1.5 border rounded-lg text-xs"
                      placeholder="VOO"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <select
                      value={holding.type}
                      onChange={(e) => updateHolding(index, 'type', e.target.value as 'etf' | 'stock')}
                      className="w-16 px-1 py-1.5 border rounded-lg text-xs"
                    >
                      <option value="etf">ETF</option>
                      <option value="stock">Stock</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      value={holding.shares}
                      onChange={(e) => updateHolding(index, 'shares', Number(e.target.value))}
                      className="w-16 px-2 py-1.5 border rounded-lg text-xs text-right"
                      min="0"
                      step="0.001"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <div className="relative">
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                      <input
                        type="number"
                        value={holding.price}
                        onChange={(e) => updateHolding(index, 'price', Number(e.target.value))}
                        className="w-20 pl-4 pr-1 py-1.5 border rounded-lg text-xs text-right"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right text-xs font-medium whitespace-nowrap">
                    ${holding.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-1 py-2">
                    <button
                      onClick={() => removeHolding(index)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      disabled={currentHoldings.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-2 py-3 text-right text-xs font-medium text-gray-500">
                  Total Portfolio Value:
                </td>
                <td className="px-2 py-3 text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add holding button */}
      <button
        onClick={addHolding}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2 text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Holding
      </button>
    </div>
  );
}
