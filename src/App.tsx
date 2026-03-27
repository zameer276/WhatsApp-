/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useRef } from 'react';
import { 
  Send, 
  Trash2, 
  Plus, 
  Copy, 
  Check, 
  MessageSquare, 
  Phone,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [message, setMessage] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(Array(50).fill(''));
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  const handlePhoneChange = (index: number, value: string) => {
    // Only allow digits and limit to 10
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    const newPhones = [...phoneNumbers];
    newPhones[index] = cleaned;
    setPhoneNumbers(newPhones);

    // Clear error if valid
    if (cleaned.length === 10 || cleaned === '') {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const validateNumbers = () => {
    const newErrors: Record<number, string> = {};
    let isValid = true;

    phoneNumbers.forEach((phone, index) => {
      if (phone !== '' && phone.length !== 10) {
        newErrors[index] = 'Must be 10 digits';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSendMessage = async () => {
    if (!validateNumbers()) return;

    const validNumbers = phoneNumbers
      .map((num, idx) => ({ num, idx }))
      .filter(({ num }) => num.length === 10);

    if (validNumbers.length === 0) {
      alert('Please enter at least one valid 10-digit phone number.');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message.');
      return;
    }

    setIsSending(true);
    setProgress({ current: 0, total: validNumbers.length });

    const encodedMessage = encodeURIComponent(message);

    for (let i = 0; i < validNumbers.length; i++) {
      const { num } = validNumbers[i];
      const url = `https://wa.me/91${num}?text=${encodedMessage}`;
      
      // Open in new tab
      window.open(url, '_blank');
      
      setProgress(prev => ({ ...prev, current: i + 1 }));

      // Delay to avoid spam filters and browser blocks
      if (i < validNumbers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    setIsSending(false);
    setTimeout(() => setProgress({ current: 0, total: 0 }), 3000);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all fields?')) {
      setMessage('');
      setPhoneNumbers(Array(50).fill(''));
      setErrors({});
    }
  };

  const handleAddFields = () => {
    setPhoneNumbers([...phoneNumbers, ...Array(10).fill('')]);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
              <MessageSquare size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">WhatsApp Bulk</h1>
              <p className="text-xs text-black/40 font-medium uppercase tracking-wider">Freelancer Tool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleClearAll}
              className="p-2.5 text-black/40 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
              title="Clear All"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={handleSendMessage}
              disabled={isSending}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                isSending 
                ? 'bg-black/10 text-black/40 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-black/80 shadow-lg shadow-black/10 active:scale-95'
              }`}
            >
              {isSending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending {progress.current}/{progress.total}
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Messages
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-12" ref={containerRef}>
        {/* Message Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-black/60">
              <MessageSquare size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest">Message Content</h2>
            </div>
            <button 
              onClick={handleCopyMessage}
              className="flex items-center gap-1.5 text-xs font-semibold text-black/40 hover:text-black transition-colors"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy Message'}
            </button>
          </div>
          <div className="relative group">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full min-h-[200px] p-6 bg-white border border-black/5 rounded-3xl shadow-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all duration-300 text-lg leading-relaxed resize-none"
            />
            <div className="absolute bottom-4 right-6 text-[10px] font-mono text-black/20 uppercase tracking-tighter">
              {message.length} Characters
            </div>
          </div>
        </section>

        {/* Phone Numbers Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-black/60">
              <Phone size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest">Phone Numbers (India +91)</h2>
            </div>
            <div className="text-[10px] font-mono text-black/40 uppercase">
              {phoneNumbers.filter(n => n.length === 10).length} Valid Numbers
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence initial={false}>
              {phoneNumbers.map((phone, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.01, 0.5) }}
                  className="relative"
                >
                  <label className="absolute -top-2 left-4 px-1 bg-[#F5F5F5] text-[10px] font-bold text-black/30 uppercase tracking-tighter z-10">
                    #{index + 1}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-4 text-black/20 font-mono text-sm">+91</span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      placeholder="9876543210"
                      className={`w-full pl-12 pr-4 py-3 bg-white border rounded-2xl text-sm font-mono focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all duration-200 ${
                        errors[index] ? 'border-red-300 bg-red-50/30' : 'border-black/5'
                      }`}
                    />
                    {errors[index] && (
                      <div className="absolute -bottom-4 left-2 flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase">
                        <AlertCircle size={10} />
                        {errors[index]}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex justify-center pt-8">
            <button
              onClick={handleAddFields}
              className="flex items-center gap-2 px-8 py-4 bg-white border border-black/5 rounded-full text-sm font-bold text-black/60 hover:text-black hover:border-black/20 hover:shadow-md transition-all duration-300 active:scale-95"
            >
              <Plus size={18} />
              Add 10 More Fields
            </button>
          </div>
        </section>
      </main>

      {/* Footer / Status Bar */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-black/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-black/30">
          <div className="text-xs font-medium">
            &copy; {new Date().getFullYear()} WhatsApp Bulk Sender. Built for Productivity.
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Secure
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Direct Link
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Anti-Spam Delay
            </span>
          </div>
        </div>
      </footer>

      {/* Progress Overlay */}
      <AnimatePresence>
        {isSending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-black/5 max-w-sm w-full space-y-6 text-center">
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="8" 
                  />
                  <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="black" strokeWidth="8" 
                    strokeDasharray="283"
                    animate={{ strokeDashoffset: 283 - (283 * (progress.current / progress.total)) }}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xl">
                  {Math.round((progress.current / progress.total) * 100)}%
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">Opening Chats...</h3>
                <p className="text-sm text-black/40 font-medium">
                  Processing number {progress.current} of {progress.total}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start gap-3 text-left">
                <AlertCircle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-orange-700 uppercase leading-relaxed">
                  Please allow pop-ups in your browser if chats aren't opening automatically.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
