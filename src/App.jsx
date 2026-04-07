import React, { useState } from 'react';

// ==========================================
// 🔴 老師請注意：請在這裡填入您的 GAS 網址
// ==========================================
const GAS_URL = "https://script.google.com/macros/s/AKfycbwkbQ0rK5D8FcqNMid8SM6ux9z9fkT4Vzf5gQIp90GSfnVNqzir-ByEF8mipv_Hyl6t_w/exec";

// ==========================================
// 🔴 老師請注意：請在這裡設定所有題目的正確答案 (1, 2, 3, 4)
// ==========================================
const correctAnswers = {
  "1-1": 3, "1-2": 1, "1-3": 2, "1-4": 2, "1-5": 1,
  "2-1": 2, "2-2": 1, "2-3": 3, "2-4": 4, "2-5": 3,
  "2-6": 1, "2-7": 2, "2-8": 1, "2-9": 3, "2-10": 2,
  "3-1": 4, "3-2": 3, "3-3": 2, "3-4": 2, "3-5": 4,
  "3-6": 2, "3-7": 1, "3-8": 3, "3-9": 4, "3-10": 1,
};

// 測驗資料結構
const testData = [
  {
    sectionId: 1,
    title: "セクション 1",
    questions: [
      { id: "1-1", image: "1.png" }, { id: "1-2", image: "2.png" },
      { id: "1-3", image: "3.png" }, { id: "1-4", image: "4.png" },
      { id: "1-5", image: "5.png" },
    ]
  },
  {
    sectionId: 2,
    title: "セクション 2",
    questions: [
      { id: "2-1", image: "1 截圖 2026-04-07 下午3.44.53.png" }, { id: "2-2", image: "2 截圖 2026-04-07 下午3.44.58.png" },
      { id: "2-3", image: "3 截圖 2026-04-07 下午3.45.04.png" }, { id: "2-4", image: "4 截圖 2026-04-07 下午3.45.09.png" },
      { id: "2-5", image: "5 截圖 2026-04-07 下午3.45.13.png" }, { id: "2-6", image: "6 截圖 2026-04-07 下午3.45.18.png" },
      { id: "2-7", image: "7 截圖 2026-04-07 下午3.45.23.png" }, { id: "2-8", image: "8 截圖 2026-04-07 下午3.45.26.png" },
      { id: "2-9", image: "9 截圖 2026-04-07 下午3.45.30.png" }, { id: "2-10", image: "10 截圖 2026-04-07 下午3.45.34.png" },
    ]
  },
  {
    sectionId: 3,
    title: "セクション 3",
    questions: [
      { id: "3-1", image: "1 截圖 2026-04-07 下午3.47.59.png" }, { id: "3-2", image: "2 截圖 2026-04-07 下午3.48.03.png" },
      { id: "3-3", image: "3 截圖 2026-04-07 下午3.48.07.png" }, { id: "3-4", image: "4 截圖 2026-04-07 下午3.48.12.png" },
      { id: "3-5", image: "5 截圖 2026-04-07 下午3.48.16.png" }, { id: "3-6", image: "6 截圖 2026-04-07 下午3.48.21.png" },
      { id: "3-7", image: "7 截圖 2026-04-07 下午3.48.27.png" }, { id: "3-8", image: "8 截圖 2026-04-07 下午3.48.31.png" },
      { id: "3-9", image: "9 截圖 2026-04-07 下午3.48.35.png" }, { id: "3-10", image: "10 截圖 2026-04-07 下午3.48.40.png" },
    ]
  }
];

export default function App() {
  const [step, setStep] = useState('login'); // 'login', 'transition', 'question', 'submitting', 'completed'
  const [studentInfo, setStudentInfo] = useState({ id: '', name: '' });
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleStartTest = (e) => {
    e.preventDefault();
    if (!studentInfo.id.trim() || !studentInfo.name.trim()) {
      alert("請輸入學號與姓名！");
      return;
    }
    setStep('transition');
  };

  const handleStartSection = () => {
    setStep('question');
  };

  // 傳送資料到 GAS
  const submitResultsToGAS = async (finalAnswers) => {
    setStep('submitting');

    let correctCount = 0;
    const details = {};
    
    // 計算分數與作答明細
    Object.keys(finalAnswers).forEach(qId => {
      const studentAns = finalAnswers[qId];
      const correctAns = correctAnswers[qId];
      const isCorrect = studentAns === correctAns;
      
      if (isCorrect) correctCount++;
      details[qId] = {
        studentAnswer: studentAns,
        isCorrect: isCorrect
      };
    });

    // 總分 100 分 (共 25 題，一題 4 分)
    const score = correctCount * 4;

    const payload = {
      studentId: studentInfo.id,
      studentName: studentInfo.name,
      score: score,
      details: JSON.stringify(details)
    };

    try {
      // 避免 CORS 錯誤，使用 text/plain 傳送 JSON
      await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload)
      });
      setStep('completed');
    } catch (error) {
      console.error('上傳失敗:', error);
      alert('成績上傳時發生錯誤，但您的作答已完成。');
      setStep('completed');
    }
  };

  const handleAnswer = (choice) => {
    const currentSection = testData[currentSectionIndex];
    const currentQuestion = currentSection.questions[currentQuestionIndex];
    
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: choice
    };
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < currentSection.questions.length - 1) {
      // 進入下一題
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // 進入下一大題或結束
      if (currentSectionIndex < testData.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
        setCurrentQuestionIndex(0);
        setStep('transition');
      } else {
        // 全部結束，開始傳送資料
        submitResultsToGAS(updatedAnswers);
      }
    }
  };

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-[600px] p-10 md:p-14">
          <h1 className="text-4xl md:text-5xl font-black text-center text-[#2d3748] mb-12 tracking-wider">
            讀解練習
          </h1>
          <form onSubmit={handleStartTest}>
            <div className="mb-8">
              <label className="block text-gray-700 text-lg font-bold mb-3">學號 <span className="text-red-500">*</span></label>
              <input type="text" name="id" value={studentInfo.id} onChange={handleInputChange} placeholder="請輸入您的學號" className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400" />
            </div>
            <div className="mb-12">
              <label className="block text-gray-700 text-lg font-bold mb-3">姓名 <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={studentInfo.name} onChange={handleInputChange} placeholder="請輸入您的姓名" className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400" />
            </div>
            <button type="submit" className="w-full bg-[#3b68e6] hover:bg-[#2f55c1] text-white font-bold text-xl py-5 rounded-2xl transition-colors duration-200 shadow-md shadow-blue-200">開始測驗</button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'transition') {
    return (
      <div className="min-h-screen bg-[#3b68e6] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-2xl transform transition-all">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{testData[currentSectionIndex].title}</h2>
          <p className="text-gray-500 mb-10 text-lg">準備好後，請點擊下方按鈕開始本大題測驗。</p>
          <button onClick={handleStartSection} className="bg-[#3b68e6] hover:bg-[#2f55c1] text-white font-bold text-2xl py-4 px-12 rounded-2xl transition-colors w-full">開始</button>
        </div>
      </div>
    );
  }

  if (step === 'question') {
    const currentSection = testData[currentSectionIndex];
    const currentQuestion = currentSection.questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col p-4 md:p-8">
        <div className="flex justify-between items-center mb-6 px-4">
          <div className="text-lg font-semibold text-gray-600">{studentInfo.name} ({studentInfo.id})</div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-bold">
            {currentSection.title} - 第 {currentQuestionIndex + 1} 題 / 共 {currentSection.questions.length} 題
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl shadow-sm mb-6 flex items-center justify-center p-4 overflow-hidden min-h-[40vh]">
          {currentQuestion.image ? (
            <img 
              src={`/${currentQuestion.image}`} 
              alt="測驗圖片" 
              className="max-w-full max-h-full object-contain rounded-xl"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600/e2e8f0/475569?text=圖片載入失敗'; }}
            />
          ) : <div className="text-gray-400 text-xl">無圖片</div>}
        </div>

        <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto w-full">
          {[1, 2, 3, 4].map((num) => (
            <button key={num} onClick={() => handleAnswer(num)} className="bg-white border-4 border-gray-200 hover:border-[#3b68e6] hover:bg-blue-50 text-gray-800 text-4xl md:text-5xl font-bold py-8 rounded-3xl shadow-sm transition-all duration-200 flex items-center justify-center cursor-pointer">{num}</button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#3b68e6] mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-700">正在傳送您的答案至雲端，請稍候...</h2>
      </div>
    );
  }

  if (step === 'completed') {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 max-w-lg w-full text-center shadow-xl">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">測驗結束！</h2>
          <p className="text-gray-600 mb-8 text-lg">辛苦了，{studentInfo.name} 同學。您的答案已成功繳交！</p>
        </div>
      </div>
    );
  }

  return null;
}