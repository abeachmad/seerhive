'use client';
import { useState } from 'react';
import { Button } from './ui/button';
import { useStore } from '@/lib/store';
import { X } from 'lucide-react';

interface CreateMarketDialogProps {
  onClose: () => void;
}

export function CreateMarketDialog({ onClose }: CreateMarketDialogProps) {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('DeFi');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const addMarket = useStore((state) => state.addMarket);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate AI verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newMarket = {
      id: Date.now().toString(),
      question,
      description,
      category,
      totalVolume: 0,
      yesPrice: 0.5,
      noPrice: 0.5,
      endDate,
      status: 'active',
      sparkline: [{ value: 0.5 }, { value: 0.5 }, { value: 0.5 }],
      aiVerified: true,
      aiConfidence: 0.85 + Math.random() * 0.15,
    };

    addMarket(newMarket);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold gradient-text">Create Prediction Market</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Question
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Will BTC reach $100k by end of 2024?"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context and resolution criteria..."
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none h-24"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none"
              >
                <option>DeFi</option>
                <option>NFT</option>
                <option>Gaming</option>
                <option>Politics</option>
                <option>Sports</option>
                <option>Technology</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-sm text-blue-400">
              🤖 AI will verify this market against news sources and social media to ensure accuracy
            </p>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'AI Verifying...' : 'Create Market'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}