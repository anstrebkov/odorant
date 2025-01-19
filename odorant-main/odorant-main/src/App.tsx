import React, { useState, KeyboardEvent } from 'react';
import { MessageCircle, Send } from 'lucide-react';

interface CalculationResult {
  odorantAmount: number;
  drops: number;
  dropsPerMinute: number;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

function App() {
  // Odorant calculation states
  const [gasConsumption, setGasConsumption] = useState<string>('');
  const [result, setResult] = useState<CalculationResult>({
    odorantAmount: 0,
    drops: 0,
    dropsPerMinute: 0,
  });

  // Chatbot states
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Odorant calculation functions
  const calculateOdorant = (consumption: number) => (consumption / 1000) * 16;
  const calculateDrops = (odorantWeight: number) => odorantWeight / 0.02;
  const calculateDropsPerMinute = (drops: number) => drops / 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gasConsumption) {
      setResult({
        odorantAmount: 0,
        drops: 0,
        dropsPerMinute: 0,
      });
      return;
    }
    const odorantAmount = calculateOdorant(parseFloat(gasConsumption));
    const drops = calculateDrops(odorantAmount);
    const dropsPerMinute = calculateDropsPerMinute(drops);

    setResult({
      odorantAmount,
      drops,
      dropsPerMinute,
    });
  };

  // Chatbot functions
  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('https://api.vectorshift.ai/api/chatbots/run', {
        method: 'POST',
        headers: {
          'Api-Key': 'sk_1O',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: userMessage.text,
          chatbot_name: 'sto',
          username: 'alexsey',
          conversation_id: null,
        }),
      });

      const data = await response.json();
      const botMessage: Message = { text: data.output, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending request:', error);
      const errorMessage: Message = {
        text: 'Ошибка при получении ответа от бота.',
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto p-4 pt-6 md:p-6 lg:p-12 bg-white rounded-xl shadow-md w-full max-w-md relative">
        {/* Chat toggle button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold p-3 rounded-full shadow-lg transition-colors duration-200"
          aria-label="Toggle chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Main odorant calculator interface */}
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Расчет количества одоранта
        </h1>
        
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-4">
            <label
              htmlFor="gas-consumption"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Расход природного газа (м³)
            </label>
            <input
              type="number"
              value={gasConsumption}
              onChange={(e) => setGasConsumption(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-blue-500 border-gray-300"
              id="gas-consumption"
              placeholder="Введите расход газа"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-200"
          >
            Рассчитать
          </button>
        </form>

        {result.odorantAmount > 0 && (
          <div className="text-lg mt-6 p-4 bg-gray-50 rounded-lg shadow-inner">
            <div className="space-y-3">
              <p className="flex justify-between">
                <span className="font-semibold">Количество одоранта:</span>
                <span>{result.odorantAmount.toFixed(2)} г</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Количество капель:</span>
                <span>{result.drops.toFixed(2)}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Капель в минуту:</span>
                <span>{result.dropsPerMinute.toFixed(2)}</span>
              </p>
            </div>
          </div>
        )}

        {/* Chatbot interface */}
        {isChatOpen && (
          <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-lg flex flex-col">
            <div className="p-4 bg-blue-500 text-white font-bold rounded-t-lg flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              ГРС бот
            </div>
            
            <div className="p-4 h-64 overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 p-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-100 ml-auto w-3/4'
                      : 'bg-gray-100 mr-auto w-3/4'
                  }`}
                >
                  <p className="text-sm text-gray-800">{msg.text}</p>
                </div>
              ))}
              {isLoading && (
                <div className="text-center text-gray-500">
                  <div className="animate-pulse">Генерация ответа...</div>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите сообщение..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-lg transition-colors duration-200 flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
