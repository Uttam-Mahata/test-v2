
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality } from '@google/genai';
import { User, Account, AssistantStatus, ChatMessage, PendingToolCall, Transaction, FinancialInfo } from '../types/types';
import { bankingApi } from '../services/mockBankingApi';
import {
  SYSTEM_INSTRUCTION,
  getAccountBalanceDeclaration,
  getFinancialProductsInfoDeclaration,
  getTransactionHistoryDeclaration,
  transferFundsDeclaration,
} from '../config/constants';
import { LogoIcon, MicIcon, PowerIcon, UserIcon, BackspaceIcon, ArrowDownCircleIcon, ArrowUpCircleIcon, BanknotesIcon, CreditCardIcon, ReceiptPercentIcon } from './icons';

// Audio Encoding/Decoding functions
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// FIX: Added a more efficient createBlob helper function as per Gemini API guidelines.
function createBlob(data: Float32Array) {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


const AssistantUI: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [status, setStatus] = useState<AssistantStatus>(AssistantStatus.IDLE);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  const [isPinModalOpen, setPinModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingTransfer, setPendingTransfer] = useState<PendingToolCall | null>(null);
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[] | null>(null);
  const [pendingFinancialInfo, setPendingFinancialInfo] = useState<FinancialInfo | null>(null);

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const fetchAccounts = useCallback(async () => {
    const userAccounts = await bankingApi.getAccounts(user.id);
    setAccounts(userAccounts);
  }, [user.id]);
  
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);


  const stopConversation = useCallback(() => {
    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => session.close());
        sessionPromiseRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    if(outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
    }
    audioSourcesRef.current.forEach(source => source.stop());
    audioSourcesRef.current.clear();
    setStatus(AssistantStatus.IDLE);
    console.log("Conversation stopped and resources cleaned up.");
  }, []);

  const startConversation = async () => {
    if (status !== AssistantStatus.IDLE) return;
    
    setStatus(AssistantStatus.LISTENING);
    
    // Cleanup any previous instances
    stopConversation();
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        // FIX: Use a local sessionPromise constant to avoid stale closures in callbacks.
        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' }}},
                systemInstruction: SYSTEM_INSTRUCTION,
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                tools: [{functionDeclarations: [getAccountBalanceDeclaration, getTransactionHistoryDeclaration, transferFundsDeclaration, getFinancialProductsInfoDeclaration]}]
            },
            callbacks: {
                onopen: () => {
                    console.log('Session opened.');
                    const source = audioContextRef.current!.createMediaStreamSource(stream);
                    const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = processor;

                    processor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        // FIX: Use the createBlob helper and the local sessionPromise.
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(processor);
                    processor.connect(audioContextRef.current!.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    handleServerMessage(message);
                },
                onerror: (e: any) => {
                    console.error('Session error:', e);
                    setStatus(AssistantStatus.ERROR);
                    stopConversation();
                },
                onclose: () => {
                    console.log('Session closed.');
                    stopConversation();
                }
            }
        });

        sessionPromiseRef.current = sessionPromise;

    } catch (error) {
        console.error("Failed to start conversation:", error);
        setStatus(AssistantStatus.ERROR);
    }
  };

  const handleServerMessage = async (message: LiveServerMessage) => {
    if (message.serverContent?.outputTranscription) {
      currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
    }
    if (message.serverContent?.inputTranscription) {
      currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
    }
    if (message.serverContent?.turnComplete) {
      if(currentInputTranscriptionRef.current.trim()){
         setTranscript(prev => [...prev, { speaker: 'user', text: currentInputTranscriptionRef.current.trim(), timestamp: new Date().toISOString() }]);
      }
      if(currentOutputTranscriptionRef.current.trim()){
        const assistantMessage: ChatMessage = {
            speaker: 'assistant', 
            text: currentOutputTranscriptionRef.current.trim(), 
            timestamp: new Date().toISOString()
        };
        if (pendingTransactions) {
            assistantMessage.transactions = pendingTransactions;
            setPendingTransactions(null);
        }
        if (pendingFinancialInfo) {
          assistantMessage.financialInfo = pendingFinancialInfo;
          setPendingFinancialInfo(null);
        }
        setTranscript(prev => [...prev, assistantMessage]);
      }
      currentInputTranscriptionRef.current = '';
      currentOutputTranscriptionRef.current = '';
    }

    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio) {
      setStatus(AssistantStatus.SPEAKING);
      const audioContext = outputAudioContextRef.current!;
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContext.currentTime);
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.addEventListener('ended', () => {
          audioSourcesRef.current.delete(source);
          if (audioSourcesRef.current.size === 0) {
              setStatus(AssistantStatus.LISTENING);
          }
      });
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      audioSourcesRef.current.add(source);
    }

    if(message.toolCall?.functionCalls) {
        for (const fc of message.toolCall.functionCalls) {
            let result;
            if (fc.name === 'getAccountBalance') {
                const account = accounts.find(a => a.type === fc.args.accountType);
                result = account ? { balance: account.balance, currency: account.currency } : { error: `Account ${fc.args.accountType} not found.` };
            } else if (fc.name === 'getTransactionHistory') {
                const transactions = await bankingApi.getTransactions(user.id, fc.args.accountType);
                if (Array.isArray(transactions)) {
                    setPendingTransactions(transactions);
                }
                result = transactions;
            } else if (fc.name === 'getFinancialProductsInfo') {
                const info = await bankingApi.getFinancialProductsInfo(user.id, fc.args.productType);
                const financialInfo: FinancialInfo = {};
                if (fc.args.productType === 'loans') financialInfo.loans = info;
                else if (fc.args.productType === 'credit_limit') financialInfo.creditAccounts = info;
                else if (fc.args.productType === 'interest_rates') financialInfo.interestRates = info;
                setPendingFinancialInfo(financialInfo);
                result = info;
            } else if (fc.name === 'transferFunds') {
                setPendingTransfer({ id: fc.id, name: fc.name, args: fc.args });
                setPinModalOpen(true);
                return; // Wait for PIN
            }

            if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then(session => {
                    session.sendToolResponse({
                        functionResponses: { id: fc.id, name: fc.name, response: { result } }
                    });
                });
            }
        }
    }
  };

  const handlePinSubmit = useCallback(async () => {
    if (!pendingTransfer) return;
    setPinError('');
    const { fromAccount, toAccount, amount } = pendingTransfer.args;
    const result = await bankingApi.transferFunds(user.id, fromAccount, toAccount, amount, pin);

    if (result.success) {
      if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            session.sendToolResponse({
                functionResponses: { id: pendingTransfer.id, name: pendingTransfer.name, response: { result } }
            });
        });
      }
      setPinModalOpen(false);
      setPin('');
      setPendingTransfer(null);
      await fetchAccounts();
    } else {
      setPinError(result.message);
    }
  }, [pendingTransfer, pin, user.id, fetchAccounts]);
  
  const handlePinKeyPress = useCallback((key: string) => {
    setPinError('');
    if (key === 'backspace') {
        setPin(p => p.slice(0, -1));
    } else if (pin.length < 4 && /^\d$/.test(key)) {
        setPin(p => p + key);
    }
  }, [pin.length]);
  
  useEffect(() => {
    if (!isPinModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        if (e.key === 'Backspace') {
            handlePinKeyPress('backspace');
        } else if (/^\d$/.test(e.key)) {
            handlePinKeyPress(e.key);
        } else if (e.key === 'Enter' && pin.length === 4) {
            handlePinSubmit();
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPinModalOpen, pin.length, handlePinKeyPress, handlePinSubmit]);

  useEffect(() => {
    return () => stopConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusIndicator = () => {
    switch(status) {
        case AssistantStatus.LISTENING: return "border-cyan-400 animate-pulse";
        case AssistantStatus.SPEAKING: return "border-purple-400 animate-pulse";
        case AssistantStatus.THINKING: return "border-yellow-400 animate-spin";
        case AssistantStatus.ERROR: return "border-red-500";
        default: return "border-stone-600";
    }
  };


  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-stone-900/80 backdrop-blur-sm border-b border-stone-800 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-8 h-8 text-cyan-400" />
          <h1 className="text-xl font-bold">Financial Assistant</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-semibold text-stone-100">{user.name}</p>
            <p className="text-xs text-stone-400">{user.id}</p>
          </div>
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-stone-700 transition-colors">
            <PowerIcon className="w-6 h-6 text-stone-400" />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
        {/* Left Panel: Accounts */}
        <div className="md:w-1/3 lg:w-1/4 bg-stone-900 p-4 rounded-xl border border-stone-800 overflow-y-auto">
          <h2 className="text-lg font-bold mb-4 text-stone-100">Your Accounts</h2>
          <div className="space-y-3">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-stone-800 p-4 rounded-lg border border-stone-700">
                <p className="capitalize font-semibold text-stone-300">{acc.type} Account</p>
                <p className="text-2xl font-mono font-bold text-cyan-300">
                  ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {acc.limit && <p className="text-xs text-stone-400">Limit: ${acc.limit.toLocaleString()}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Conversation */}
        <div className="flex-grow flex flex-col bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
          {/* Transcript */}
          <div className="flex-grow p-4 space-y-4 overflow-y-auto">
             {transcript.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-stone-500">
                    <p>Press the microphone to start.</p>
                </div>
            )}
            {transcript.map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.speaker === 'user' ? 'justify-end' : ''}`}>
                {msg.speaker === 'assistant' && <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0"><LogoIcon className="w-5 h-5 text-white" /></div>}
                <div className={`p-3 rounded-lg max-w-lg ${msg.speaker === 'user' ? 'bg-stone-700' : 'bg-stone-800'}`}>
                  <p className="text-stone-200">{msg.text}</p>
                  
                  {msg.transactions && (
                    <div className="mt-3 pt-3 border-t border-stone-700/50">
                      <h3 className="font-bold text-sm mb-2 text-stone-300">Transaction History</h3>
                      <ul className="space-y-2">
                        {msg.transactions.map(tx => (
                          <li key={tx.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                {tx.type === 'credit' ? <ArrowUpCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" /> : <ArrowDownCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />}
                                <div>
                                    <p className="font-medium text-stone-200">{tx.description}</p>
                                    <p className="text-xs text-stone-400">{new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <p className={`font-mono font-medium ${tx.type === 'credit' ? 'text-green-400' : 'text-stone-200'}`}>
                                {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {msg.financialInfo && (
                    <div className="mt-3 pt-3 border-t border-stone-700/50 space-y-4">
                      {msg.financialInfo.loans && (
                        <div>
                          <h3 className="font-bold text-sm mb-2 text-stone-300 flex items-center gap-2"><BanknotesIcon className="w-5 h-5" />Loan Details</h3>
                          <ul className="space-y-3">
                            {msg.financialInfo.loans.map(loan => (
                              <li key={loan.id} className="text-sm bg-stone-700/50 p-3 rounded-md">
                                <p className="font-bold capitalize text-stone-200">{loan.type} Loan</p>
                                <div className="flex justify-between items-end mt-1">
                                  <span className="text-stone-400">Balance:</span>
                                  <span className="font-mono text-stone-100">${loan.remainingBalance.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                  <span className="text-stone-400">Interest Rate:</span>
                                  <span className="font-mono text-stone-100">{loan.interestRate}%</span>
                                </div>
                                <div className="flex justify-between items-end mt-2 pt-2 border-t border-stone-600/50">
                                  <span className="text-stone-400">Next Payment:</span>
                                  <span className="font-mono text-stone-100">${loan.nextPaymentAmount.toFixed(2)} on {new Date(loan.nextPaymentDate).toLocaleDateString()}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {msg.financialInfo.creditAccounts && (
                        <div>
                           <h3 className="font-bold text-sm mb-2 text-stone-300 flex items-center gap-2"><CreditCardIcon className="w-5 h-5" />Credit Accounts</h3>
                           <ul className="space-y-2">
                             {msg.financialInfo.creditAccounts.map(acc => (
                               <li key={acc.id} className="text-sm flex justify-between">
                                 <span className="capitalize text-stone-300">{acc.type} Limit:</span>
                                 <span className="font-mono text-stone-100">${acc.limit?.toLocaleString()}</span>
                               </li>
                             ))}
                           </ul>
                        </div>
                      )}
                      {msg.financialInfo.interestRates && (
                        <div>
                           <h3 className="font-bold text-sm mb-2 text-stone-300 flex items-center gap-2"><ReceiptPercentIcon className="w-5 h-5" />Current Interest Rates</h3>
                           <ul className="space-y-2">
                             {Object.entries(msg.financialInfo.interestRates).map(([key, value]) => (
                               <li key={key} className="text-sm flex justify-between">
                                 <span className="capitalize text-stone-300">{key.replace('-', ' ')}:</span>
                                 <span className="font-mono text-stone-100">{value}</span>
                               </li>
                             ))}
                           </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {msg.speaker === 'user' && <div className="w-8 h-8 rounded-full bg-stone-600 flex items-center justify-center flex-shrink-0"><UserIcon className="w-5 h-5 text-white" /></div>}
              </div>
            ))}
          </div>
          
          {/* Controls */}
          <div className="p-4 border-t border-stone-800 flex items-center justify-center">
            <button 
                onClick={status === AssistantStatus.IDLE ? startConversation : stopConversation}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 border-4 ${getStatusIndicator()} ${status === AssistantStatus.IDLE ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-red-600 hover:bg-red-500'}`}
            >
              <MicIcon className="w-10 h-10 text-white" />
            </button>
          </div>
        </div>
      </main>

      {/* PIN Modal */}
      {isPinModalOpen && pendingTransfer && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-stone-800 p-8 rounded-2xl shadow-lg border border-stone-700 w-full max-w-sm text-center">
            <h2 className="text-2xl font-bold text-stone-100 mb-2">Confirm Transfer</h2>
            
            <div className="bg-stone-900 rounded-lg p-4 my-6 text-left">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-stone-400">Amount:</span>
                <span className="text-2xl font-bold text-cyan-300">
                  ${pendingTransfer.args.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-stone-700 pt-2">
                <span className="text-stone-400">From:</span>
                <span className="font-semibold capitalize text-stone-200">{pendingTransfer.args.fromAccount}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-stone-400">To:</span>
                <span className="font-semibold capitalize text-stone-200">{pendingTransfer.args.toAccount}</span>
              </div>
            </div>

            <p className="text-stone-400 text-sm mb-4">Enter your PIN to authorize this transaction.</p>
            <div className="flex justify-center gap-2 mb-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className={`w-12 h-14 border-2 rounded-md flex items-center justify-center text-3xl font-mono ${pin.length > i ? 'border-cyan-400 text-cyan-400' : 'border-stone-600 text-stone-600'}`}>
                        {pin[i] ? '•' : '·'}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4 my-6">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                  <button 
                      key={digit} 
                      onClick={() => handlePinKeyPress(digit)}
                      className="p-4 bg-stone-700 rounded-full text-2xl font-bold hover:bg-stone-600 transition h-16 w-16 mx-auto"
                  >
                      {digit}
                  </button>
              ))}
              <div />
              <button 
                  onClick={() => handlePinKeyPress('0')}
                  className="p-4 bg-stone-700 rounded-full text-2xl font-bold hover:bg-stone-600 transition h-16 w-16 mx-auto"
              >
                  0
              </button>
              <button 
                  onClick={() => handlePinKeyPress('backspace')}
                  className="p-4 flex items-center justify-center bg-stone-700 rounded-full hover:bg-stone-600 transition h-16 w-16 mx-auto"
              >
                  <BackspaceIcon className="w-8 h-8"/>
              </button>
            </div>
            
            {pinError && <p className="text-red-400 text-center text-sm -mt-2 mb-4">{pinError}</p>}
            
            <div className="mt-4 flex gap-4">
                <button 
                    onClick={() => { setPinModalOpen(false); setPin(''); setPinError(''); setPendingTransfer(null); }} 
                    className="flex-1 bg-stone-700 hover:bg-stone-600 text-white font-bold py-3 rounded-lg transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={handlePinSubmit} 
                    disabled={pin.length !== 4}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition disabled:bg-stone-600 disabled:cursor-not-allowed"
                >
                    Confirm
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantUI;